// services/admin-backend/prisma/seed-rbac.ts
// Seeds the RBAC system: roles, permissions, role-permission mappings

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Permission Definitions ───────────────────────────────────────────────────
const PERMISSIONS = [
  // Articles
  { resource: 'articles', action: 'create', description: 'Create new articles' },
  { resource: 'articles', action: 'read', description: 'View articles' },
  { resource: 'articles', action: 'update', description: 'Edit articles' },
  { resource: 'articles', action: 'delete', description: 'Delete articles' },
  { resource: 'articles', action: 'publish', description: 'Publish/unpublish articles' },
  { resource: 'articles', action: 'manage', description: 'Full article management' },

  // Categories
  { resource: 'categories', action: 'create', description: 'Create categories' },
  { resource: 'categories', action: 'read', description: 'View categories' },
  { resource: 'categories', action: 'update', description: 'Edit categories' },
  { resource: 'categories', action: 'delete', description: 'Delete categories' },

  // Web Stories
  { resource: 'webstories', action: 'create', description: 'Create web stories' },
  { resource: 'webstories', action: 'read', description: 'View web stories' },
  { resource: 'webstories', action: 'update', description: 'Edit web stories' },
  { resource: 'webstories', action: 'delete', description: 'Delete web stories' },
  { resource: 'webstories', action: 'publish', description: 'Publish web stories' },

  // Users (public reader users)
  { resource: 'users', action: 'read', description: 'View user accounts' },
  { resource: 'users', action: 'update', description: 'Edit user accounts' },
  { resource: 'users', action: 'delete', description: 'Delete user accounts' },
  { resource: 'users', action: 'manage', description: 'Full user management' },

  // Comments / Moderation
  { resource: 'comments', action: 'read', description: 'View comments' },
  { resource: 'comments', action: 'moderate', description: 'Approve/reject comments' },
  { resource: 'comments', action: 'delete', description: 'Delete comments' },

  // Media
  { resource: 'media', action: 'upload', description: 'Upload media files' },
  { resource: 'media', action: 'read', description: 'View media library' },
  { resource: 'media', action: 'delete', description: 'Delete media files' },

  // Analytics
  { resource: 'analytics', action: 'read', description: 'View analytics dashboards' },
  { resource: 'analytics', action: 'export', description: 'Export analytics data' },

  // Market Data
  { resource: 'market', action: 'read', description: 'View market data' },
  { resource: 'market', action: 'manage', description: 'Manage market configs' },

  // Admin Management (delegation)
  { resource: 'admins', action: 'create', description: 'Create admin accounts' },
  { resource: 'admins', action: 'read', description: 'View admin accounts' },
  { resource: 'admins', action: 'update', description: 'Edit admin accounts' },
  { resource: 'admins', action: 'delete', description: 'Delete admin accounts' },

  // Roles & Permissions
  { resource: 'roles', action: 'create', description: 'Create roles' },
  { resource: 'roles', action: 'read', description: 'View roles' },
  { resource: 'roles', action: 'update', description: 'Edit roles' },
  { resource: 'roles', action: 'delete', description: 'Delete roles' },
  { resource: 'roles', action: 'assign', description: 'Assign roles to admins' },

  // System
  { resource: 'system', action: 'settings', description: 'Manage system settings' },
  { resource: 'system', action: 'backups', description: 'Manage system backups' },
  { resource: 'system', action: 'integrations', description: 'Manage integrations' },
  { resource: 'system', action: 'logs', description: 'View audit logs' },

  // Newsletter
  { resource: 'newsletter', action: 'manage', description: 'Manage newsletters and templates' },

  // Advertising
  { resource: 'advertising', action: 'read', description: 'View ad campaigns' },
  { resource: 'advertising', action: 'manage', description: 'Manage advertising' },

  // Site Config
  { resource: 'site', action: 'read', description: 'View site configuration' },
  { resource: 'site', action: 'manage', description: 'Manage site configuration' },
];

// ── Role Definitions ─────────────────────────────────────────────────────────
const ROLES = [
  {
    name: 'ADMIN',
    slug: 'admin',
    description: 'Full administrative access (below Super Admin)',
    level: 80,
    isSystem: true,
    permissions: [
      'articles.*', 'categories.*', 'webstories.*', 'users.*',
      'comments.*', 'media.*', 'analytics.*', 'market.*',
      'admins.read', 'admins.update',
      'roles.read', 'newsletter.*', 'advertising.*', 'site.*',
      'system.settings', 'system.logs',
    ],
  },
  {
    name: 'EDITOR',
    slug: 'editor',
    description: 'Content management — create, edit, publish articles and stories',
    level: 60,
    isSystem: true,
    permissions: [
      'articles.create', 'articles.read', 'articles.update', 'articles.publish',
      'categories.read', 'categories.update',
      'webstories.create', 'webstories.read', 'webstories.update', 'webstories.publish',
      'comments.read', 'comments.moderate',
      'media.upload', 'media.read',
      'analytics.read',
    ],
  },
  {
    name: 'AUTHOR',
    slug: 'author',
    description: 'Create and edit own content, cannot publish',
    level: 40,
    isSystem: true,
    permissions: [
      'articles.create', 'articles.read', 'articles.update',
      'webstories.create', 'webstories.read', 'webstories.update',
      'categories.read',
      'media.upload', 'media.read',
    ],
  },
  {
    name: 'MODERATOR',
    slug: 'moderator',
    description: 'Moderate content and comments',
    level: 30,
    isSystem: true,
    permissions: [
      'articles.read',
      'comments.read', 'comments.moderate', 'comments.delete',
      'users.read',
      'media.read',
      'analytics.read',
    ],
  },
  {
    name: 'ANALYST',
    slug: 'analyst',
    description: 'View analytics, reports, and market data',
    level: 20,
    isSystem: true,
    permissions: [
      'analytics.read', 'analytics.export',
      'articles.read',
      'market.read',
      'users.read',
    ],
  },
  {
    name: 'VIEWER',
    slug: 'viewer',
    description: 'Read-only access to admin dashboard',
    level: 10,
    isSystem: true,
    permissions: [
      'articles.read',
      'categories.read',
      'webstories.read',
      'analytics.read',
      'market.read',
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildPermissionName(resource: string, action: string) {
  return `${resource}.${action}`;
}

function matchesWildcard(pattern: string, permName: string): boolean {
  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2);
    return permName.startsWith(`${prefix}.`);
  }
  return pattern === permName;
}

// ── Main Seed ────────────────────────────────────────────────────────────────

export async function seedRBAC() {
  console.log('🔐 Seeding RBAC system...');

  // 1. Upsert all permissions
  const permissionMap = new Map<string, string>(); // name -> id

  for (const perm of PERMISSIONS) {
    const name = buildPermissionName(perm.resource, perm.action);
    const slug = name.replace(/\./g, '-');
    const result = await prisma.permission.upsert({
      where: { name },
      update: { description: perm.description, resource: perm.resource, action: perm.action },
      create: {
        name,
        slug,
        description: perm.description,
        resource: perm.resource,
        action: perm.action,
        isSystem: true,
      },
    });
    permissionMap.set(name, result.id);
  }
  console.log(`  ✅ ${permissionMap.size} permissions seeded`);

  // 2. Upsert all roles and their permission assignments
  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        description: roleDef.description,
        level: roleDef.level,
        isSystem: roleDef.isSystem,
      },
      create: {
        name: roleDef.name,
        slug: roleDef.slug,
        description: roleDef.description,
        level: roleDef.level,
        isSystem: roleDef.isSystem,
      },
    });

    // Resolve which permissions this role gets
    const permIds: string[] = [];
    for (const pattern of roleDef.permissions) {
      for (const [permName, permId] of permissionMap) {
        if (matchesWildcard(pattern, permName)) {
          permIds.push(permId);
        }
      }
    }

    // Delete existing and re-create (idempotent)
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (permIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permIds.map((pid) => ({
          roleId: role.id,
          permissionId: pid,
        })),
      });
    }
    console.log(`  ✅ Role "${roleDef.name}" (level ${roleDef.level}): ${permIds.length} permissions`);
  }

  console.log('🔐 RBAC seeding complete');
}

// Run standalone
if (require.main === module) {
  seedRBAC()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error('RBAC seed failed:', e);
      prisma.$disconnect();
      process.exit(1);
    });
}
