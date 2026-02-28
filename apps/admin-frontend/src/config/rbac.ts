// src/config/rbac.ts - Comprehensive Role-Based Access Control Configuration
// Industry-ready, scalable permission system for NewsTRNT

/**
 * Role Hierarchy (from highest to lowest privilege):
 * 
 * SUPER_ADMIN - Owner/CTO level. Full system control, can manage everything.
 * ADMIN       - Senior manager. Full content + user management, no system settings.
 * EDITOR      - Senior content role. Can publish, edit all content, moderate.
 * AUTHOR      - Content creator. Can create drafts, submit for review.
 * MODERATOR   - Community manager. Comment/report moderation only.
 * VIEWER      - Analyst/stakeholder. Read-only access to analytics.
 */

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'ADMIN' 
  | 'EDITOR' 
  | 'AUTHOR' 
  | 'MODERATOR' 
  | 'VIEWER';

// Alias for UserRole for backward compatibility
export type RoleName = UserRole;

// Role hierarchy array (highest to lowest privilege)
export const ROLE_HIERARCHY: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'AUTHOR',
  'MODERATOR',
  'VIEWER'
];

// Permission categories for granular access control
export type Permission =
  // Dashboard
  | 'dashboard.view'
  | 'dashboard.advanced'
  
  // Content Management
  | 'content.view'
  | 'content.create'
  | 'content.edit'
  | 'content.edit_own'
  | 'content.delete'
  | 'content.delete_own'
  | 'content.publish'
  | 'content.unpublish'
  | 'content.schedule'
  | 'content.feature'
  | 'content.restore'
  
  // Categories & Tags
  | 'categories.view'
  | 'categories.manage'
  | 'tags.view'
  | 'tags.manage'
  
  // Media
  | 'media.view'
  | 'media.upload'
  | 'media.delete'
  
  // Users
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.ban'
  | 'users.manage_roles'
  
  // Analytics
  | 'analytics.view'
  | 'analytics.export'
  | 'analytics.advanced'
  
  // Comments & Moderation
  | 'comments.view'
  | 'comments.moderate'
  | 'comments.delete'
  | 'reports.view'
  | 'reports.resolve'
  
  // Newsletter
  | 'newsletter.view'
  | 'newsletter.send'
  | 'newsletter.manage_templates'
  
  // Advertising
  | 'advertising.view'
  | 'advertising.manage'
  
  // System (Super Admin only)
  | 'system.view'
  | 'system.settings'
  | 'system.security'
  | 'system.integrations'
  | 'system.backup'
  | 'system.logs'
  
  // Admin Management
  | 'admins.view'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.delete'
  
  // Configuration
  | 'config.view'
  | 'config.edit'
  | 'config.branding'
  | 'config.market_data'
  
  // Wildcard (Super Admin)
  | '*';

// Role configuration with permissions, descriptions, and UI settings
export interface RoleConfig {
  name: string;
  displayName: string;
  description: string;
  level: number; // Higher = more privilege
  color: string;
  bgColor: string;
  icon: string;
  permissions: Permission[];
  dashboardPath: string; // Role-specific dashboard
  canManageRoles: UserRole[]; // Which roles this role can manage
}

export const ROLES: Record<UserRole, RoleConfig> = {
  SUPER_ADMIN: {
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'Full system access. Can manage all settings, users, and content.',
    level: 100,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '👑',
    permissions: ['*'],
    dashboardPath: '/',
    canManageRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'VIEWER']
  },
  
  ADMIN: {
    name: 'ADMIN',
    displayName: 'Administrator',
    description: 'Full content and user management. Cannot access system settings.',
    level: 80,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '🛡️',
    permissions: [
      'dashboard.view', 'dashboard.advanced',
      'content.view', 'content.create', 'content.edit', 'content.delete',
      'content.publish', 'content.unpublish', 'content.schedule', 'content.feature', 'content.restore',
      'categories.view', 'categories.manage',
      'tags.view', 'tags.manage',
      'media.view', 'media.upload', 'media.delete',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.ban',
      'analytics.view', 'analytics.export', 'analytics.advanced',
      'comments.view', 'comments.moderate', 'comments.delete',
      'reports.view', 'reports.resolve',
      'newsletter.view', 'newsletter.send', 'newsletter.manage_templates',
      'advertising.view', 'advertising.manage',
      'config.view', 'config.edit', 'config.market_data'
    ],
    dashboardPath: '/',
    canManageRoles: ['EDITOR', 'AUTHOR', 'MODERATOR', 'VIEWER']
  },
  
  EDITOR: {
    name: 'EDITOR',
    displayName: 'Editor',
    description: 'Senior content manager. Can publish and edit all content.',
    level: 60,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '✍️',
    permissions: [
      'dashboard.view',
      'content.view', 'content.create', 'content.edit', 'content.delete',
      'content.publish', 'content.unpublish', 'content.schedule', 'content.feature', 'content.restore',
      'categories.view', 'categories.manage',
      'tags.view', 'tags.manage',
      'media.view', 'media.upload', 'media.delete',
      'analytics.view',
      'comments.view', 'comments.moderate', 'comments.delete',
      'reports.view', 'reports.resolve'
    ],
    dashboardPath: '/content',
    canManageRoles: ['AUTHOR']
  },
  
  AUTHOR: {
    name: 'AUTHOR',
    displayName: 'Author',
    description: 'Content creator. Can create drafts and edit own content.',
    level: 40,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '📝',
    permissions: [
      'dashboard.view',
      'content.view', 'content.create', 'content.edit_own', 'content.delete_own',
      'categories.view',
      'tags.view',
      'media.view', 'media.upload',
      'analytics.view'
    ],
    dashboardPath: '/content/drafts',
    canManageRoles: []
  },
  
  MODERATOR: {
    name: 'MODERATOR',
    displayName: 'Moderator',
    description: 'Community manager. Handles comments and user reports.',
    level: 30,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '🛡️',
    permissions: [
      'dashboard.view',
      'content.view',
      'comments.view', 'comments.moderate', 'comments.delete',
      'reports.view', 'reports.resolve',
      'users.view', 'users.ban'
    ],
    dashboardPath: '/moderation',
    canManageRoles: []
  },
  
  VIEWER: {
    name: 'VIEWER',
    displayName: 'Viewer',
    description: 'Read-only access to content and analytics.',
    level: 10,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '👁️',
    permissions: [
      'dashboard.view',
      'analytics.view'
    ],
    dashboardPath: '/analytics',
    canManageRoles: []
  }
};

// Alias for ROLES for backward compatibility
export const ROLE_DEFINITIONS = ROLES;

// Navigation structure with permission requirements
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  minRoleLevel?: number;
  children?: NavItem[];
  description?: string;
}

export const ADMIN_NAVIGATION: NavItem[] = [
  /* ── Core ──────────────────────────────────────────── */
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: 'home',
    requiredPermissions: ['dashboard.view'],
    description: 'Overview and quick stats',
  },

  /* ── Content ───────────────────────────────────────── */
  {
    id: 'content',
    label: 'Content',
    href: '/content',
    icon: 'document',
    requiredPermissions: ['content.view'],
    description: 'Manage articles, stories, and media',
    children: [
      { id: 'content-hub',      label: 'Content Hub',      href: '/content',            icon: 'document',  requiredPermissions: ['content.view'] },
      { id: 'articles',         label: 'Articles',         href: '/content/articles',   icon: 'document',  requiredPermissions: ['content.view'] },
      { id: 'new-article',      label: 'New Article',      href: '/content/new',        icon: 'plus',      requiredPermissions: ['content.create'] },
      { id: 'web-stories',      label: 'Web Stories',      href: '/content/web-stories',icon: 'sparkles',  requiredPermissions: ['content.view'] },
      { id: 'content-calendar', label: 'Calendar',         href: '/content/calendar',   icon: 'clock',     requiredPermissions: ['content.view'] },
      { id: 'content-workflow', label: 'Workflow',          href: '/content/workflow',   icon: 'bolt',      requiredPermissions: ['content.view'] },
      { id: 'categories',       label: 'Categories',       href: '/content/categories', icon: 'document',  requiredPermissions: ['categories.view'] },
      { id: 'navigation',       label: 'Navigation',       href: '/content/navigation', icon: 'globe',     requiredPermissions: ['categories.manage'] },
      { id: 'tags',             label: 'Tags',             href: '/content/tags',       icon: 'document',  requiredPermissions: ['tags.view'] },
      { id: 'drafts',           label: 'My Drafts',        href: '/content/drafts',     icon: 'document',  requiredPermissions: ['content.create'] },
      { id: 'trash',            label: 'Trash',            href: '/content/trash',      icon: 'document',  requiredPermissions: ['content.restore'] },
    ],
  },

  /* ── Users & Community ─────────────────────────────── */
  {
    id: 'users',
    label: 'Users & Community',
    href: '/users',
    icon: 'users',
    minRoleLevel: 30, // Moderator+
    requiredPermissions: ['users.view'],
    description: 'Members, moderation, and community',
    children: [
      { id: 'all-users',       label: 'All Users',       href: '/users',              icon: 'users',    requiredPermissions: ['users.view'] },
      { id: 'subscribers',     label: 'Subscribers',     href: '/users/subscribers',  icon: 'envelope',  requiredPermissions: ['users.view'] },
      { id: 'user-activity',   label: 'Activity',        href: '/users/activity',     icon: 'chart',     requiredPermissions: ['users.view'] },
      { id: 'user-team',       label: 'Team Members',    href: '/users/team',         icon: 'users',    requiredRole: 'SUPER_ADMIN' },
      { id: 'comments',        label: 'Comments',        href: '/moderation',         icon: 'chat',      requiredPermissions: ['comments.view'] },
      { id: 'reports',         label: 'Reports',         href: '/moderation/reports', icon: 'shield',    requiredPermissions: ['reports.view'] },
      { id: 'spam',            label: 'Spam Filter',     href: '/moderation/spam',    icon: 'shield',    requiredPermissions: ['comments.moderate'] },
    ],
  },

  /* ── Analytics ─────────────────────────────────────── */
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: 'chart',
    requiredPermissions: ['analytics.view'],
    description: 'Performance insights and reports',
    children: [
      { id: 'analytics-overview',  label: 'Overview',           href: '/analytics',            icon: 'chart',   requiredPermissions: ['analytics.view'] },
      { id: 'realtime',            label: 'Real-Time',          href: '/analytics/realtime',   icon: 'bolt',    requiredPermissions: ['analytics.view'] },
      { id: 'traffic',             label: 'Traffic',            href: '/analytics/traffic',    icon: 'globe',   requiredPermissions: ['analytics.view'] },
      { id: 'content-performance', label: 'Content',            href: '/analytics/content',    icon: 'chart',   requiredPermissions: ['analytics.view'] },
      { id: 'user-engagement',     label: 'Engagement',         href: '/analytics/engagement', icon: 'eye',     requiredPermissions: ['analytics.view'] },
      { id: 'export',              label: 'Export Reports',     href: '/analytics/export',     icon: 'document',requiredPermissions: ['analytics.export'] },
    ],
  },

  /* ── Marketing ─────────────────────────────────────── */
  {
    id: 'marketing',
    label: 'Marketing',
    href: '/newsletter',
    icon: 'megaphone',
    minRoleLevel: 60,
    requiredPermissions: ['newsletter.view'],
    description: 'Newsletters and advertising',
    children: [
      { id: 'newsletter-campaigns',  label: 'Email Campaigns',   href: '/newsletter',               icon: 'envelope', requiredPermissions: ['newsletter.view'] },
      { id: 'newsletter-templates',  label: 'Email Templates',   href: '/newsletter/templates',     icon: 'document', requiredPermissions: ['newsletter.manage_templates'] },
      { id: 'newsletter-subscribers', label: 'Subscribers',      href: '/newsletter/subscribers',   icon: 'users',    requiredPermissions: ['users.view'] },
      { id: 'ad-campaigns',          label: 'Ad Campaigns',      href: '/advertising',              icon: 'megaphone',requiredPermissions: ['advertising.view'] },
      { id: 'ad-requests',           label: 'Ad Requests',       href: '/advertising/requests',     icon: 'document', requiredPermissions: ['advertising.view'] },
      { id: 'ad-performance',        label: 'Ad Performance',    href: '/advertising/performance',  icon: 'chart',    requiredPermissions: ['analytics.view'] },
    ],
  },

  /* ── Market Data ───────────────────────────────────── */
  {
    id: 'market-data',
    label: 'Market Data',
    href: '/market-data',
    icon: 'currency',
    minRoleLevel: 60,
    requiredPermissions: ['config.market_data'],
    description: 'Financial markets and tickers',
    children: [
      { id: 'market-view',    label: 'Live Data',        href: '/market-data',                 icon: 'trendUp',  requiredPermissions: ['config.market_data'] },
      { id: 'market-indices',  label: 'Indices',          href: '/market-config/indices',       icon: 'chart',    requiredPermissions: ['config.market_data'] },
      { id: 'market-currencies', label: 'Currencies',     href: '/market-config/currencies',    icon: 'currency', requiredPermissions: ['config.market_data'] },
      { id: 'market-crypto',   label: 'Crypto',           href: '/market-config/crypto',        icon: 'bolt',     requiredPermissions: ['config.market_data'] },
      { id: 'market-commodities', label: 'Commodities',   href: '/market-config/commodities',   icon: 'currency', requiredPermissions: ['config.market_data'] },
    ],
  },

  /* ── Media ─────────────────────────────────────────── */
  {
    id: 'media',
    label: 'Media Library',
    href: '/media',
    icon: 'photo',
    requiredPermissions: ['media.view'],
    description: 'Images, videos, and files',
  },

  /* ── Content Engine (AI) ───────────────────────────── */
  {
    id: 'content-engine',
    label: 'Content Engine',
    href: '/content-engine',
    icon: 'cpu',
    requiredRole: 'SUPER_ADMIN',
    description: 'AI pipeline, scraping, and scheduling',
    children: [
      { id: 'engine-dashboard', label: 'Engine Overview', href: '/content-engine',           icon: 'cpu',      requiredRole: 'SUPER_ADMIN' },
      { id: 'engine-pipeline',  label: 'Pipeline',        href: '/content-engine/pipeline',  icon: 'bolt',     requiredRole: 'SUPER_ADMIN' },
      { id: 'engine-scheduler', label: 'Scheduler',       href: '/content-engine/scheduler', icon: 'clock',    requiredRole: 'SUPER_ADMIN' },
      { id: 'engine-sources',   label: 'Sources',         href: '/content-engine/sources',   icon: 'globe',    requiredRole: 'SUPER_ADMIN' },
      { id: 'engine-ai',        label: 'AI Processing',   href: '/content-engine/ai',        icon: 'sparkles', requiredRole: 'SUPER_ADMIN' },
    ],
  },

  /* ── Settings (consolidates config + system + access + branding) */
  {
    id: 'settings',
    label: 'Settings',
    href: '/config',
    icon: 'cog',
    minRoleLevel: 60,
    requiredPermissions: ['config.view'],
    description: 'Site, security, team, and integrations',
    children: [
      { id: 'site-config',       label: 'Site Config',       href: '/config',               icon: 'cog',    requiredPermissions: ['config.view'] },
      { id: 'branding',          label: 'Branding & Logos',  href: '/logo-manager',         icon: 'photo',  requiredPermissions: ['config.branding'] },
      { id: 'external-apis',     label: 'External APIs',     href: '/external-apis',        icon: 'code',   requiredPermissions: ['config.edit'] },
      { id: 'access-hub',        label: 'Access Control',    href: '/access',               icon: 'shield', requiredRole: 'SUPER_ADMIN' },
      { id: 'access-roles',      label: 'Roles',             href: '/access/roles',         icon: 'shield', requiredRole: 'SUPER_ADMIN' },
      { id: 'access-team',       label: 'Admin Team',        href: '/access/team',          icon: 'users',  requiredRole: 'SUPER_ADMIN' },
      { id: 'security',          label: 'Security',          href: '/system/security',      icon: 'shield', requiredRole: 'SUPER_ADMIN' },
      { id: 'integrations',      label: 'Integrations',      href: '/system/integrations',  icon: 'code',   requiredRole: 'SUPER_ADMIN' },
      { id: 'backup',            label: 'Backup & Restore',  href: '/system/backup',        icon: 'server', requiredRole: 'SUPER_ADMIN' },
      { id: 'audit-logs',        label: 'Audit Logs',        href: '/system/audit-logs',    icon: 'document', requiredRole: 'SUPER_ADMIN' },
    ],
  },

  /* ── Developer Tools ───────────────────────────────── */
  {
    id: 'developer',
    label: 'Developer',
    href: '/dev-tools/debug',
    icon: 'code',
    requiredRole: 'SUPER_ADMIN',
    description: 'Debug, API testing, and docs',
    children: [
      { id: 'debug',      label: 'Debug Console', href: '/dev-tools/debug',      icon: 'code',     requiredRole: 'SUPER_ADMIN' },
      { id: 'api-tester', label: 'API Tester',    href: '/dev-tools/api-tester', icon: 'bolt',     requiredRole: 'SUPER_ADMIN' },
      { id: 'help',       label: 'Help & Docs',   href: '/help',                 icon: 'document', requiredPermissions: ['dashboard.view'] },
    ],
  },
];

// Utility functions for permission checking
export class RBACUtils {
  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const roleConfig = ROLES[role];
    if (!roleConfig) return false;
    
    // Super admin has all permissions
    if (roleConfig.permissions.includes('*')) return true;
    
    return roleConfig.permissions.includes(permission);
  }

  /**
   * Check if a role has any of the specified permissions
   */
  static hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(role, p));
  }

  /**
   * Check if a role has all of the specified permissions
   */
  static hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(p => this.hasPermission(role, p));
  }

  /**
   * Check if role level is sufficient
   */
  static hasMinRoleLevel(role: UserRole, minLevel: number): boolean {
    const roleConfig = ROLES[role];
    return roleConfig ? roleConfig.level >= minLevel : false;
  }

  /**
   * Check if user can access a navigation item
   */
  static canAccessNavItem(role: UserRole, item: NavItem): boolean {
    // Check required role
    if (item.requiredRole && role !== item.requiredRole) {
      // Allow if current role level is higher
      const requiredLevel = ROLES[item.requiredRole]?.level || 0;
      if (!this.hasMinRoleLevel(role, requiredLevel)) {
        return false;
      }
    }

    // Check minimum role level
    if (item.minRoleLevel && !this.hasMinRoleLevel(role, item.minRoleLevel)) {
      return false;
    }

    // Check required permissions
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      if (!this.hasAnyPermission(role, item.requiredPermissions)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Filter navigation items based on role
   */
  static filterNavigation(role: UserRole, items: NavItem[]): NavItem[] {
    return items
      .filter(item => this.canAccessNavItem(role, item))
      .map(item => ({
        ...item,
        children: item.children 
          ? this.filterNavigation(role, item.children)
          : undefined
      }))
      .filter(item => !item.children || item.children.length > 0);
  }

  /**
   * Get role configuration
   */
  static getRoleConfig(role: UserRole): RoleConfig | undefined {
    return ROLES[role];
  }

  /**
   * Check if one role can manage another
   */
  static canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const config = ROLES[managerRole];
    if (!config) return false;
    return config.canManageRoles.includes(targetRole);
  }

  /**
   * Get all roles that a user can manage
   */
  static getManageableRoles(role: UserRole): UserRole[] {
    return ROLES[role]?.canManageRoles || [];
  }

  /**
   * Get role display badge
   */
  static getRoleBadge(role: UserRole): { icon: string; color: string; bgColor: string; displayName: string } {
    const config = ROLES[role];
    if (!config) {
      return { icon: '👤', color: 'text-gray-700', bgColor: 'bg-gray-100', displayName: role };
    }
    return {
      icon: config.icon,
      color: config.color,
      bgColor: config.bgColor,
      displayName: config.displayName
    };
  }
}

export default RBACUtils;

