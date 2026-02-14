// services/admin-backend/src/routes/admin/rbac.ts
// RBAC management: roles CRUD, permissions CRUD, role-permission mapping.
// Only Super Admin and admins with 'roles.*' / 'admins.*' permissions can access.

import { Router, Response } from 'express';
import prisma from '../../config/database';
import { z } from 'zod';
import { authenticateToken, requireSuperAdmin, requirePermission, AuthRequest } from '../../middleware/auth';

const router = Router();

// ── Validation schemas ───────────────────────────────────────────────────────

const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z][a-z0-9_-]*$/),
  description: z.string().max(500).optional(),
  level: z.number().int().min(1).max(99),
  isSystem: z.boolean().optional().default(false),
  permissionIds: z.array(z.string().uuid()).optional().default([]),
});

const updateRoleSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  level: z.number().int().min(1).max(99).optional(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});

// =============================================================================
// ROLES
// =============================================================================

// GET /api/admin/roles — List all roles
router.get('/roles', authenticateToken, requirePermission('roles.read'), async (req: AuthRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { admins: true } },
      },
      orderBy: { level: 'desc' },
    });

    res.json({
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        level: r.level,
        isSystem: r.isSystem,
        isActive: r.isActive,
        adminCount: r._count.admins,
        permissions: r.permissions.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          slug: rp.permission.slug,
          resource: rp.permission.resource,
          action: rp.permission.action,
        })),
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('[RBAC] List roles error:', error);
    res.status(500).json({ error: 'Failed to list roles' });
  }
});

// GET /api/admin/roles/:id — Get single role
router.get('/roles/:id', authenticateToken, requirePermission('roles.read'), async (req: AuthRequest, res: Response) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
      include: {
        permissions: { include: { permission: true } },
        admins: {
          include: { user: { select: { id: true, email: true, fullName: true } } },
        },
      },
    });

    if (!role) { res.status(404).json({ error: 'Role not found' }); return; }

    res.json({
      ...role,
      permissions: role.permissions.map((rp: any) => rp.permission),
      admins: role.admins.map((a: any) => ({
        id: a.id,
        userId: a.user.id,
        email: a.user.email,
        fullName: a.user.fullName,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error('[RBAC] Get role error:', error);
    res.status(500).json({ error: 'Failed to get role' });
  }
});

// POST /api/admin/roles — Create role (Super Admin only)
router.post('/roles', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = createRoleSchema.parse(req.body);

    const existing = await prisma.role.findUnique({ where: { slug: data.slug } });
    if (existing) { res.status(400).json({ error: `Role slug "${data.slug}" already exists.` }); return; }

    const role = await prisma.$transaction(async (tx) => {
      const newRole = await tx.role.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          level: data.level,
          isSystem: data.isSystem,
        },
      });

      if (data.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: data.permissionIds.map((pid) => ({
            roleId: newRole.id,
            permissionId: pid,
            grantedBy: req.user!.id,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: newRole.id },
        include: { permissions: { include: { permission: true } } },
      });
    });

    await prisma.adminLog.create({
      data: {
        action: 'ROLE_CREATED',
        details: { roleName: data.name, level: data.level },
        targetType: 'Role',
        targetId: role!.id,
        ipAddress: req.ip || '',
      },
    }).catch(() => {});

    res.status(201).json({
      message: 'Role created',
      role: {
        ...role,
        permissions: role!.permissions.map((rp) => rp.permission),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('[RBAC] Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// PATCH /api/admin/roles/:id — Update role (Super Admin only)
router.patch('/roles/:id', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateRoleSchema.parse(req.body);
    const { id } = req.params;

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Role not found' }); return; }

    // Prevent modifying system roles name/slug
    if (existing.isSystem && data.name) {
      res.status(400).json({ error: 'Cannot rename system roles.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          level: data.level,
          isActive: data.isActive,
        },
      });

      // Replace permissions if provided
      if (data.permissionIds !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (data.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: data.permissionIds.map((pid) => ({
              roleId: id,
              permissionId: pid,
              grantedBy: req.user!.id,
            })),
          });
        }
      }
    });

    const updated = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });

    await prisma.adminLog.create({
      data: {
        action: 'ROLE_UPDATED',
        details: { changes: data, updatedBy: req.user!.email },
        targetType: 'Role',
        targetId: id,
        ipAddress: req.ip || '',
      },
    }).catch(() => {});

    res.json({
      message: 'Role updated',
      role: {
        ...updated,
        permissions: updated!.permissions.map((rp) => rp.permission),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('[RBAC] Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE /api/admin/roles/:id — Delete role (Super Admin only)
router.delete('/roles/:id', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { admins: true } } },
    });

    if (!role) { res.status(404).json({ error: 'Role not found' }); return; }
    if (role.isSystem) { res.status(400).json({ error: 'Cannot delete system roles.' }); return; }
    if (role._count.admins > 0) {
      res.status(400).json({ error: `Cannot delete role with ${role._count.admins} active admin(s). Reassign them first.` });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.role.delete({ where: { id } });
    });

    await prisma.adminLog.create({
      data: {
        action: 'ROLE_DELETED',
        details: { roleName: role.name },
        targetType: 'Role',
        targetId: id,
        ipAddress: req.ip || '',
      },
    }).catch(() => {});

    res.json({ message: 'Role deleted' });
  } catch (error) {
    console.error('[RBAC] Delete role error:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// POST /api/admin/roles/:id/permissions — Assign permissions to role
router.post('/roles/:id/permissions', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { permissionIds } = assignPermissionsSchema.parse(req.body);

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) { res.status(404).json({ error: 'Role not found' }); return; }

    // Validate all permissionIds exist
    const validPerms = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (validPerms.length !== permissionIds.length) {
      res.status(400).json({ error: 'One or more permission IDs are invalid.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Remove existing
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      // Add new
      await tx.rolePermission.createMany({
        data: permissionIds.map((pid) => ({
          roleId: id,
          permissionId: pid,
          grantedBy: req.user!.id,
        })),
      });
    });

    res.json({ message: 'Permissions updated', count: permissionIds.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('[RBAC] Assign perms error:', error);
    res.status(500).json({ error: 'Failed to assign permissions' });
  }
});

// =============================================================================
// PERMISSIONS
// =============================================================================

// GET /api/admin/permissions — List all permissions
router.get('/permissions', authenticateToken, requirePermission('roles.read'), async (_req: AuthRequest, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    // Group by resource for easier UI consumption
    const grouped: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      (grouped[p.resource] ??= []).push(p);
    }

    res.json({ permissions, grouped });
  } catch (error) {
    console.error('[RBAC] List permissions error:', error);
    res.status(500).json({ error: 'Failed to list permissions' });
  }
});

// GET /api/admin/permissions/:id
router.get('/permissions/:id', authenticateToken, requirePermission('roles.read'), async (req: AuthRequest, res: Response) => {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id: req.params.id },
      include: {
        roles: {
          include: { role: { select: { id: true, name: true, slug: true, level: true } } },
        },
      },
    });

    if (!permission) { res.status(404).json({ error: 'Permission not found' }); return; }

    res.json({
      ...permission,
      roles: permission.roles.map((rp) => rp.role),
    });
  } catch (error) {
    console.error('[RBAC] Get permission error:', error);
    res.status(500).json({ error: 'Failed to get permission' });
  }
});

export default router;
