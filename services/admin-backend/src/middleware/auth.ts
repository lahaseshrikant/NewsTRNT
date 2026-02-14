// services/admin-backend/src/middleware/auth.ts
// JWT authentication + database-driven RBAC enforcement
// Super Admin is env-based. All other admins have DB-backed roles/permissions.

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import prisma from '../config/database';

// ── Token Payload ────────────────────────────────────────────────────────────

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    role: string;
    roleLevel: number;
    permissions: string[];
    adminAccountId?: string;
    canCreateAdmins: boolean;
    canAssignRoles: boolean;
  };
}

// ── Permission resolution from DB ────────────────────────────────────────────

async function getAdminPermissions(userId: string) {
  const adminAccount = await prisma.adminAccount.findUnique({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!adminAccount || adminAccount.status !== 'active') return null;

  return {
    permissions: adminAccount.role.permissions.map((rp) => rp.permission.name),
    level: adminAccount.role.level,
    adminAccountId: adminAccount.id,
    canCreateAdmins: adminAccount.canCreateAdmins,
    canAssignRoles: adminAccount.canAssignRoles,
    roleName: adminAccount.role.name,
  };
}

// ── Super Admin helpers ──────────────────────────────────────────────────────

function isSuperAdminToken(decoded: TokenPayload): boolean {
  return decoded.id === 'super-admin' || decoded.isSuperAdmin === true;
}

export function isSuperAdminEnv(email: string, password?: string): boolean {
  const saEmail = process.env.SUPER_ADMIN_EMAIL;
  const saPass = process.env.SUPER_ADMIN_PASSWORD;
  if (!saEmail || !saPass) return false;
  if (password !== undefined) return email === saEmail && password === saPass;
  return email === saEmail;
}

// ══════════════════════════════════════════════════════════════════════════════
// authenticateToken — main auth middleware
// ══════════════════════════════════════════════════════════════════════════════

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    if (!decoded.id || !decoded.email) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    // ── Super Admin (env-based) ──────────────────────────────────────
    if (isSuperAdminToken(decoded)) {
      req.user = {
        id: 'super-admin',
        email: decoded.email,
        isAdmin: true,
        isSuperAdmin: true,
        role: 'SUPER_ADMIN',
        roleLevel: 100,
        permissions: ['*'],
        canCreateAdmins: true,
        canAssignRoles: true,
      };
      next();
      return;
    }

    // ── DB-backed admin ──────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, isAdmin: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }

    if (!user.isAdmin) {
      res.status(403).json({ error: 'Admin access has been revoked' });
      return;
    }

    const rbac = await getAdminPermissions(user.id);
    if (!rbac) {
      res.status(403).json({ error: 'No active admin account found. Contact Super Admin.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      isAdmin: true,
      isSuperAdmin: false,
      role: rbac.roleName,
      roleLevel: rbac.level,
      permissions: rbac.permissions,
      adminAccountId: rbac.adminAccountId,
      canCreateAdmins: rbac.canCreateAdmins,
      canAssignRoles: rbac.canAssignRoles,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired. Please log in again.' });
      return;
    }
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// ── Optional auth ────────────────────────────────────────────────────────────

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) { next(); return; }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    if (decoded.id && decoded.email) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        isAdmin: true,
        isSuperAdmin: isSuperAdminToken(decoded),
        role: decoded.role || 'VIEWER',
        roleLevel: 0,
        permissions: [],
        canCreateAdmins: false,
        canAssignRoles: false,
      };
    }
  } catch { /* proceed without auth */ }
  next();
};

// ══════════════════════════════════════════════════════════════════════════════
// RBAC guards
// ══════════════════════════════════════════════════════════════════════════════

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: 'Admin privileges required.' });
    return;
  }
  next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isSuperAdmin) {
    res.status(403).json({ error: 'Super Admin privileges required.' });
    return;
  }
  next();
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ error: 'Authentication required.' }); return; }
    if (req.user.isSuperAdmin || req.user.permissions.includes('*')) { next(); return; }
    if (req.user.permissions.includes(permission)) { next(); return; }

    // Check resource-level 'manage' permission
    const resource = permission.split('.')[0];
    if (req.user.permissions.includes(`${resource}.manage`)) { next(); return; }

    res.status(403).json({ error: "Permission denied.", required: permission });
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ error: 'Authentication required.' }); return; }
    if (req.user.isSuperAdmin || req.user.permissions.includes('*')) { next(); return; }

    const hasAny = permissions.some(
      (p) => req.user!.permissions.includes(p) || req.user!.permissions.includes(`${p.split('.')[0]}.manage`)
    );
    if (hasAny) { next(); return; }

    res.status(403).json({ error: "Permission denied.", required: permissions });
  };
};

export const requireRole = (minLevel: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ error: 'Authentication required.' }); return; }
    if (req.user.isSuperAdmin) { next(); return; }
    if (req.user.roleLevel >= minLevel) { next(); return; }
    res.status(403).json({ error: 'Insufficient role level.', required: minLevel });
  };
};

// Convenience
export const requireAdminRole = requireRole(80);
export const requireEditor = requireRole(60);
export const requireAuthor = requireRole(40);
