// services/admin-backend/src/routes/admin-auth.ts
// Admin authentication routes with proper RBAC.
// Super Admin: env-based, never stored in DB.
// All other admins: DB-backed with role + permissions from admin_accounts.

import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authenticateToken, requireSuperAdmin, isSuperAdminEnv, AuthRequest } from '../middleware/auth';

const router = Router();

// ── Validation ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Admin password must be at least 12 characters'),
  fullName: z.string().min(2).max(100),
  roleId: z.string().uuid('Invalid role ID'),
  department: z.string().optional(),
  canCreateAdmins: z.boolean().optional().default(false),
  canAssignRoles: z.boolean().optional().default(false),
});

const updateAdminSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'suspended', 'deactivated']).optional(),
  roleId: z.string().uuid().optional(),
  canCreateAdmins: z.boolean().optional(),
  canAssignRoles: z.boolean().optional(),
});

// ── JWT helpers ──────────────────────────────────────────────────────────────

function generateAdminToken(payload: {
  id: string;
  email: string;
  role: string;
  isSuperAdmin?: boolean;
}) {
  return jwt.sign(
    { ...payload, isAdmin: true },
    process.env.JWT_SECRET!,
    { expiresIn: payload.isSuperAdmin ? '4h' : '8h' }
  );
}

// ── Rate limiting (in-memory) ────────────────────────────────────────────────

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };
  if (record.count >= MAX_ATTEMPTS && Date.now() - record.lastAttempt < LOCKOUT_MS) {
    return { allowed: false, retryAfter: Math.ceil((LOCKOUT_MS - (Date.now() - record.lastAttempt)) / 1000) };
  }
  if (Date.now() - record.lastAttempt >= LOCKOUT_MS) { loginAttempts.delete(ip); return { allowed: true }; }
  return { allowed: true };
}

function recordAttempt(ip: string, success: boolean) {
  if (success) { loginAttempts.delete(ip); return; }
  const r = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  r.count++;
  r.lastAttempt = Date.now();
  loginAttempts.set(ip, r);
}

// =============================================================================
// POST /api/auth/admin/login
// =============================================================================

router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      res.status(429).json({ error: 'Too many login attempts.', retryAfter: rateCheck.retryAfter });
      return;
    }

    const { email, password } = loginSchema.parse(req.body);

    // ── Super Admin (env-based) ──────────────────────────────────────
    if (isSuperAdminEnv(email, password)) {
      console.warn(`🔑 [SUPER_ADMIN] Login from IP: ${ip}`);

      try {
        await prisma.adminLog.create({
          data: {
            action: 'SUPER_ADMIN_LOGIN',
            details: { ip, userAgent: req.headers['user-agent'] || '' },
            ipAddress: ip,
          },
        });
      } catch { /* best-effort */ }

      const token = generateAdminToken({
        id: 'super-admin',
        email,
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
      });

      recordAttempt(ip, true);
      res.json({
        message: 'Super Admin login successful',
        token,
        user: {
          id: 'super-admin',
          email,
          fullName: 'Super Admin',
          role: 'SUPER_ADMIN',
          isAdmin: true,
          isSuperAdmin: true,
          permissions: ['*'],
        },
      });
      return;
    }

    // ── DB-backed admin login ────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, email: true, username: true, fullName: true,
        passwordHash: true, isAdmin: true, avatarUrl: true,
      },
    });

    if (!user || !user.passwordHash) {
      recordAttempt(ip, false);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isAdmin) {
      recordAttempt(ip, false);
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      recordAttempt(ip, false);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Fetch admin account + role
    const adminAccount = await prisma.adminAccount.findUnique({
      where: { userId: user.id },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!adminAccount || adminAccount.status !== 'active') {
      recordAttempt(ip, false);
      res.status(403).json({ error: 'Admin account is not active. Contact Super Admin.' });
      return;
    }

    // Update last login + last active
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await prisma.adminAccount.update({ where: { id: adminAccount.id }, data: { lastActiveAt: new Date() } });

    const token = generateAdminToken({
      id: user.id,
      email: user.email,
      role: adminAccount.role.name,
    });

    recordAttempt(ip, true);

    try {
      await prisma.adminLog.create({
        data: {
          action: 'ADMIN_LOGIN',
          details: { ip, role: adminAccount.role.name },
          adminId: user.id,
          adminAccountId: adminAccount.id,
          ipAddress: ip,
        },
      });
    } catch { /* best-effort */ }

    const permissions = adminAccount.role.permissions.map((rp) => rp.permission.name);

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: adminAccount.role.name,
        roleLevel: adminAccount.role.level,
        isAdmin: true,
        isSuperAdmin: false,
        permissions,
        canCreateAdmins: adminAccount.canCreateAdmins,
        canAssignRoles: adminAccount.canAssignRoles,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('[Admin Auth] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =============================================================================
// GET /api/auth/admin/me — Current admin profile
// =============================================================================

router.get('/admin/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    if (req.user.isSuperAdmin) {
      res.json({
        id: 'super-admin',
        email: req.user.email,
        fullName: 'Super Admin',
        role: 'SUPER_ADMIN',
        roleLevel: 100,
        isAdmin: true,
        isSuperAdmin: true,
        permissions: ['*'],
        canCreateAdmins: true,
        canAssignRoles: true,
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, username: true, fullName: true,
        avatarUrl: true, isAdmin: true, createdAt: true, lastLoginAt: true,
      },
    });

    if (!user || !user.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    res.json({
      ...user,
      role: req.user.role,
      roleLevel: req.user.roleLevel,
      permissions: req.user.permissions,
      isSuperAdmin: false,
      canCreateAdmins: req.user.canCreateAdmins,
      canAssignRoles: req.user.canAssignRoles,
    });
  } catch (error) {
    console.error('[Admin Auth] Me error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// =============================================================================
// POST /api/auth/admin/verify — Verify token
// =============================================================================

router.post('/admin/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(401).json({ valid: false });
    return;
  }
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      isSuperAdmin: req.user.isSuperAdmin,
      permissions: req.user.permissions,
    },
  });
});

// =============================================================================
// POST /api/auth/admin/logout
// =============================================================================

router.post('/admin/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user && !req.user.isSuperAdmin) {
    await prisma.adminLog.create({
      data: { action: 'ADMIN_LOGOUT', adminId: req.user.id, ipAddress: req.ip || '' },
    }).catch(() => {});
  }
  res.json({ message: 'Logout successful' });
});

// =============================================================================
// PUT /api/auth/admin/profile — Update own profile
// =============================================================================

const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  username: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, 'Password must be at least 12 characters'),
});

router.put('/admin/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }

    // Super Admin profile is env-based, not editable
    if (req.user.isSuperAdmin) {
      res.status(403).json({ error: 'Super Admin profile is managed via environment variables' });
      return;
    }

    const { currentPassword, newPassword, ...profileFields } = req.body;

    // If password change requested
    if (currentPassword && newPassword) {
      const parsed = passwordChangeSchema.safeParse({ currentPassword, newPassword });
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }

      const adminAccount = await prisma.adminAccount.findUnique({
        where: { id: req.user.adminAccountId },
      });
      if (!adminAccount) { res.status(404).json({ error: 'Admin account not found' }); return; }

      const user = await prisma.user.findUnique({ where: { id: adminAccount.userId } });
      if (!user || !user.passwordHash) { res.status(404).json({ error: 'User not found' }); return; }

      const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordValid) { res.status(400).json({ error: 'Current password is incorrect' }); return; }

      const hashedPassword = await bcrypt.hash(newPassword, 14);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });

      await prisma.adminLog.create({
        data: { action: 'ADMIN_PASSWORD_CHANGE', adminId: req.user.id, ipAddress: req.ip || '' },
      }).catch(() => {});
    }

    // Profile field updates
    const profileParsed = profileUpdateSchema.safeParse(profileFields);
    if (!profileParsed.success) {
      res.status(400).json({ error: profileParsed.error.errors[0].message });
      return;
    }

    const updates = profileParsed.data;
    const adminUpdate: Record<string, any> = {};
    const userUpdate: Record<string, any> = {};

    if (updates.fullName) { adminUpdate.fullName = updates.fullName; userUpdate.displayName = updates.fullName; }
    if (updates.username) { userUpdate.username = updates.username; }
    if (updates.phone) { adminUpdate.phone = updates.phone; }
    if (updates.department) { adminUpdate.department = updates.department; }

    if (Object.keys(adminUpdate).length > 0 && req.user.adminAccountId) {
      await prisma.adminAccount.update({ where: { id: req.user.adminAccountId }, data: adminUpdate });
    }

    const adminAccount = await prisma.adminAccount.findUnique({ where: { id: req.user.adminAccountId } });
    if (adminAccount && Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: adminAccount.userId }, data: userUpdate });
    }

    await prisma.adminLog.create({
      data: { action: 'ADMIN_PROFILE_UPDATE', adminId: req.user.id, ipAddress: req.ip || '', details: JSON.stringify(Object.keys(updates)) },
    }).catch(() => {});

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// =============================================================================
// POST /api/auth/admin/create — Create a new admin (requires canCreateAdmins)
// =============================================================================

router.post('/admin/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }

    // Must be Super Admin OR have canCreateAdmins delegation
    if (!req.user.isSuperAdmin && !req.user.canCreateAdmins) {
      res.status(403).json({ error: 'You do not have permission to create admin accounts.' });
      return;
    }

    const data = createAdminSchema.parse(req.body);

    // Validate role exists
    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role || !role.isActive) {
      res.status(400).json({ error: 'Invalid or inactive role' });
      return;
    }

    // Non-super admins cannot assign roles higher than their own
    if (!req.user.isSuperAdmin && role.level >= req.user.roleLevel) {
      res.status(403).json({ error: 'Cannot assign a role equal to or higher than your own.' });
      return;
    }

    // Non-super admins cannot grant delegation they don't have
    if (!req.user.isSuperAdmin) {
      if (data.canCreateAdmins && !req.user.canCreateAdmins) {
        res.status(403).json({ error: 'Cannot delegate admin creation permission you do not have.' });
        return;
      }
      if (data.canAssignRoles && !req.user.canAssignRoles) {
        res.status(403).json({ error: 'Cannot delegate role assignment permission you do not have.' });
        return;
      }
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      // Check if already has an admin account
      const existingAdmin = await prisma.adminAccount.findUnique({ where: { userId: existing.id } });
      if (existingAdmin) {
        res.status(400).json({ error: 'This user already has an admin account.' });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 14);

    // Create user + admin account in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let user = existing;
      if (!user) {
        user = await tx.user.create({
          data: {
            email: data.email,
            fullName: data.fullName,
            passwordHash,
            isAdmin: true,
            isVerified: true,
            username: data.email.split('@')[0],
          },
        });
      } else {
        // Upgrade existing user to admin
        user = await tx.user.update({
          where: { id: user.id },
          data: { isAdmin: true, passwordHash, fullName: data.fullName },
        });
      }

      const adminAccount = await tx.adminAccount.create({
        data: {
          userId: user.id,
          roleId: data.roleId,
          displayName: data.fullName,
          department: data.department,
          canCreateAdmins: data.canCreateAdmins,
          canAssignRoles: data.canAssignRoles,
          createdBy: req.user!.id,
          status: 'active',
        },
        include: { role: true },
      });

      return { user, adminAccount };
    });

    // Log
    await prisma.adminLog.create({
      data: {
        action: 'ADMIN_CREATED',
        details: { email: data.email, role: result.adminAccount.role.name, createdBy: req.user.email },
        adminId: req.user.isSuperAdmin ? undefined : req.user.id,
        targetType: 'AdminAccount',
        targetId: result.adminAccount.id,
        ipAddress: req.ip || '',
      },
    }).catch(() => {});

    res.status(201).json({
      message: 'Admin account created',
      admin: {
        id: result.adminAccount.id,
        userId: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.adminAccount.role.name,
        status: result.adminAccount.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('[Admin Auth] Create error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// =============================================================================
// PATCH /api/auth/admin/:adminAccountId — Update admin account
// =============================================================================

router.patch('/admin/:adminAccountId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }

    const { adminAccountId } = req.params;
    const data = updateAdminSchema.parse(req.body);

    const target = await prisma.adminAccount.findUnique({
      where: { id: adminAccountId },
      include: { role: true, user: true },
    });

    if (!target) {
      res.status(404).json({ error: 'Admin account not found' });
      return;
    }

    // Only Super Admin or the admin themselves (limited fields) can update
    const isSelf = req.user.id === target.userId;
    if (!req.user.isSuperAdmin && !isSelf) {
      // Check if current admin can manage other admins
      if (!req.user.permissions.includes('admins.update') && !req.user.permissions.includes('*')) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }
      // Cannot modify someone of equal or higher level
      if (target.role.level >= req.user.roleLevel) {
        res.status(403).json({ error: 'Cannot modify an admin with equal or higher authority.' });
        return;
      }
    }

    // Self-edit: only allow name, department, phone
    if (isSelf && !req.user.isSuperAdmin) {
      if (data.roleId || data.status || data.canCreateAdmins !== undefined || data.canAssignRoles !== undefined) {
        res.status(403).json({ error: 'Cannot change your own role, status, or delegation flags.' });
        return;
      }
    }

    // Role change validation
    if (data.roleId && !req.user.isSuperAdmin) {
      const newRole = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!newRole || newRole.level >= req.user.roleLevel) {
        res.status(403).json({ error: 'Cannot assign a role equal to or higher than your own.' });
        return;
      }
      if (!req.user.canAssignRoles) {
        res.status(403).json({ error: 'You do not have role assignment permission.' });
        return;
      }
    }

    // Build update data
    const updateData: any = {};
    if (data.department !== undefined) updateData.department = data.department;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.status) updateData.status = data.status;
    if (data.roleId) updateData.roleId = data.roleId;
    if (data.canCreateAdmins !== undefined) updateData.canCreateAdmins = data.canCreateAdmins;
    if (data.canAssignRoles !== undefined) updateData.canAssignRoles = data.canAssignRoles;
    if (data.fullName) updateData.displayName = data.fullName;

    const updated = await prisma.adminAccount.update({
      where: { id: adminAccountId },
      data: updateData,
      include: { role: true, user: { select: { email: true, fullName: true } } },
    });

    // If fullName was updated, also update the user record
    if (data.fullName) {
      await prisma.user.update({
        where: { id: target.userId },
        data: { fullName: data.fullName },
      });
    }

    await prisma.adminLog.create({
      data: {
        action: 'ADMIN_UPDATED',
        details: { changes: data, updatedBy: req.user.email },
        adminId: req.user.isSuperAdmin ? undefined : req.user.id,
        targetType: 'AdminAccount',
        targetId: adminAccountId,
        ipAddress: req.ip || '',
      },
    }).catch(() => {});

    res.json({
      message: 'Admin account updated',
      admin: {
        id: updated.id,
        email: updated.user.email,
        fullName: updated.user.fullName || updated.displayName,
        role: updated.role.name,
        status: updated.status,
        canCreateAdmins: updated.canCreateAdmins,
        canAssignRoles: updated.canAssignRoles,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('[Admin Auth] Update error:', error);
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

// =============================================================================
// DELETE /api/auth/admin/:adminAccountId — Deactivate admin
// =============================================================================

router.delete('/admin/:adminAccountId', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminAccountId } = req.params;

    const target = await prisma.adminAccount.findUnique({ where: { id: adminAccountId } });
    if (!target) {
      res.status(404).json({ error: 'Admin account not found' });
      return;
    }

    await prisma.adminAccount.update({
      where: { id: adminAccountId },
      data: { status: 'deactivated' },
    });

    // Revoke admin flag on user
    await prisma.user.update({
      where: { id: target.userId },
      data: { isAdmin: false },
    });

    await prisma.adminLog.create({
      data: {
        action: 'ADMIN_DEACTIVATED',
        details: { deactivatedBy: req.user!.email },
        targetType: 'AdminAccount',
        targetId: adminAccountId,
        ipAddress: req.ip || '',
      },
    }).catch(() => {});

    res.json({ message: 'Admin account deactivated' });
  } catch (error) {
    console.error('[Admin Auth] Delete error:', error);
    res.status(500).json({ error: 'Failed to deactivate admin' });
  }
});

// =============================================================================
// GET /api/auth/admin/list — List all admin accounts (requires admins.read)
// =============================================================================

router.get('/admin/list', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }

    if (!req.user.isSuperAdmin && !req.user.permissions.includes('admins.read') && !req.user.permissions.includes('*')) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    const admins = await prisma.adminAccount.findMany({
      include: {
        role: true,
        user: {
          select: { id: true, email: true, fullName: true, avatarUrl: true, lastLoginAt: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      admins: admins.map((a) => ({
        id: a.id,
        userId: a.user.id,
        email: a.user.email,
        fullName: a.user.fullName || a.displayName,
        avatarUrl: a.user.avatarUrl,
        role: a.role.name,
        roleLevel: a.role.level,
        status: a.status,
        department: a.department,
        canCreateAdmins: a.canCreateAdmins,
        canAssignRoles: a.canAssignRoles,
        lastLoginAt: a.user.lastLoginAt,
        lastActiveAt: a.lastActiveAt,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Admin Auth] List error:', error);
    res.status(500).json({ error: 'Failed to list admins' });
  }
});

// =============================================================================
// POST /api/auth/admin/refresh — Token refresh
// =============================================================================

router.post('/admin/refresh', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }

    if (req.user.isSuperAdmin) {
      const token = generateAdminToken({
        id: 'super-admin',
        email: req.user.email,
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
      });
      res.json({ token, expiresIn: 14400 });
      return;
    }

    // Verify still active
    const adminAccount = await prisma.adminAccount.findUnique({
      where: { userId: req.user.id },
      include: { role: true },
    });

    if (!adminAccount || adminAccount.status !== 'active') {
      res.status(403).json({ error: 'Admin account is no longer active' });
      return;
    }

    const token = generateAdminToken({
      id: req.user.id,
      email: req.user.email,
      role: adminAccount.role.name,
    });

    res.json({ token, expiresIn: 28800 });
  } catch (error) {
    console.error('[Admin Auth] Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
