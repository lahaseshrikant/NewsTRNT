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
    dashboardPath: '/admin',
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
    dashboardPath: '/admin',
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
    dashboardPath: '/admin/content',
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
    dashboardPath: '/admin/content/drafts',
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
    dashboardPath: '/admin/moderation',
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
    dashboardPath: '/admin/analytics',
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
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: '🏠',
    requiredPermissions: ['dashboard.view'],
    description: 'Overview and quick stats'
  },
  {
    id: 'site-config',
    label: 'Site Configuration',
    href: '/admin/config',
    icon: '⚙️',
    badge: 'Essential',
    requiredPermissions: ['config.view'],
    description: 'Configure site settings'
  },
  {
    id: 'content',
    label: 'Content Management',
    href: '/admin/content',
    icon: '📝',
    requiredPermissions: ['content.view'],
    description: 'Manage articles and media',
    children: [
      { id: 'content-hub', label: 'Content Hub', href: '/admin/content', icon: '🏠', requiredPermissions: ['content.view'] },
      { id: 'articles', label: 'Articles', href: '/admin/content/articles', icon: '📄', requiredPermissions: ['content.view'] },
      { id: 'web-stories', label: 'Web Stories', href: '/admin/content/web-stories', icon: '📱', requiredPermissions: ['content.view'] },
      { id: 'content-calendar', label: 'Content Calendar', href: '/admin/content/calendar', icon: '📅', requiredPermissions: ['content.view'] },
      { id: 'content-workflow', label: 'Workflow', href: '/admin/content/workflow', icon: '📋', requiredPermissions: ['content.view'] },
      { id: 'categories', label: 'Categories', href: '/admin/content/categories', icon: '🏷️', requiredPermissions: ['categories.view'] },
      { id: 'tags', label: 'Tags', href: '/admin/content/tags', icon: '🔖', requiredPermissions: ['tags.view'] },
      { id: 'drafts', label: 'My Drafts', href: '/admin/content/drafts', icon: '✏️', requiredPermissions: ['content.create'] },
      { id: 'trash', label: 'Trash', href: '/admin/content/trash', icon: '🗑️', requiredPermissions: ['content.restore'] }
    ]
  },
  {
    id: 'users',
    label: 'User Management',
    href: '/admin/users',
    icon: '👥',
    minRoleLevel: 60, // Editor and above
    requiredPermissions: ['users.view'],
    description: 'Manage end-user accounts',
    children: [
      { id: 'all-users', label: 'All Users', href: '/admin/users', icon: '👤', requiredPermissions: ['users.view'] },
      { id: 'subscribers', label: 'Subscribers', href: '/admin/users/subscribers', icon: '📧', requiredPermissions: ['users.view'] },
      { id: 'user-activity', label: 'User Activity', href: '/admin/users/activity', icon: '📊', requiredPermissions: ['users.view'] }
    ]
  },
  {
    id: 'access',
    label: 'Access Control',
    href: '/admin/access',
    icon: '🔐',
    requiredRole: 'SUPER_ADMIN',
    description: 'Admin roles, permissions & team management',
    children: [
      { id: 'access-hub', label: 'Access Control Hub', href: '/admin/access', icon: '🔐', requiredRole: 'SUPER_ADMIN' },
      { id: 'access-team', label: 'Team Management', href: '/admin/access/team', icon: '👥', requiredRole: 'SUPER_ADMIN' },
      { id: 'access-roles', label: 'Roles & Permissions', href: '/admin/access/roles', icon: '🎭', requiredRole: 'SUPER_ADMIN' },
      { id: 'access-audit', label: 'Audit Logs', href: '/admin/access/audit', icon: '📋', requiredRole: 'SUPER_ADMIN' },
      { id: 'access-activity', label: 'Activity Monitor', href: '/admin/access/activity', icon: '📊', requiredRole: 'SUPER_ADMIN' },
      { id: 'access-security', label: 'Security Settings', href: '/admin/access/security', icon: '🛡️', requiredRole: 'SUPER_ADMIN' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    href: '/admin/analytics',
    icon: '📊',
    requiredPermissions: ['analytics.view'],
    description: 'View performance data',
    children: [
      { id: 'analytics-overview', label: 'Overview', href: '/admin/analytics', icon: '📈', requiredPermissions: ['analytics.view'] },
      { id: 'realtime', label: 'Real-Time', href: '/admin/analytics/realtime', icon: '⚡', requiredPermissions: ['analytics.view'] },
      { id: 'traffic', label: 'Traffic', href: '/admin/analytics/traffic', icon: '🌐', requiredPermissions: ['analytics.view'] },
      { id: 'content-performance', label: 'Content Performance', href: '/admin/analytics/content', icon: '📊', requiredPermissions: ['analytics.view'] },
      { id: 'user-engagement', label: 'User Engagement', href: '/admin/analytics/engagement', icon: '🎯', requiredPermissions: ['analytics.view'] },
      { id: 'export', label: 'Export Reports', href: '/admin/analytics/export', icon: '📥', requiredPermissions: ['analytics.export'] }
    ]
  },
  {
    id: 'moderation',
    label: 'Moderation',
    href: '/admin/moderation',
    icon: '💬',
    requiredPermissions: ['comments.view'],
    description: 'Moderate content and comments',
    children: [
      { id: 'comments', label: 'Comments', href: '/admin/moderation', icon: '💬', requiredPermissions: ['comments.view'] },
      { id: 'reports', label: 'Reports', href: '/admin/moderation/reports', icon: '⚠️', requiredPermissions: ['reports.view'] },
      { id: 'spam', label: 'Spam Filter', href: '/admin/moderation/spam', icon: '🚫', requiredPermissions: ['comments.moderate'] }
    ]
  },
  {
    id: 'advertising',
    label: 'Advertising',
    href: '/admin/advertising',
    icon: '💼',
    minRoleLevel: 60,
    requiredPermissions: ['advertising.view'],
    description: 'Manage ad campaigns',
    children: [
      { id: 'campaigns', label: 'Campaigns', href: '/admin/advertising', icon: '📢', requiredPermissions: ['advertising.view'] },
      { id: 'ad-requests', label: 'Ad Requests', href: '/admin/advertising/requests', icon: '📋', requiredPermissions: ['advertising.view'] },
      { id: 'ad-performance', label: 'Performance', href: '/admin/advertising/performance', icon: '📈', requiredPermissions: ['analytics.view'] }
    ]
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    href: '/admin/newsletter',
    icon: '📧',
    minRoleLevel: 60,
    requiredPermissions: ['newsletter.view'],
    description: 'Email campaigns',
    children: [
      { id: 'newsletter-campaigns', label: 'Campaigns', href: '/admin/newsletter', icon: '📨', requiredPermissions: ['newsletter.view'] },
      { id: 'templates', label: 'Templates', href: '/admin/newsletter/templates', icon: '📄', requiredPermissions: ['newsletter.manage_templates'] },
      { id: 'newsletter-subscribers', label: 'Subscribers', href: '/admin/newsletter/subscribers', icon: '👥', requiredPermissions: ['users.view'] }
    ]
  },
  {
    id: 'media',
    label: 'Media Library',
    href: '/admin/media',
    icon: '🎬',
    requiredPermissions: ['media.view'],
    description: 'Images, videos, and files'
  },
  {
    id: 'configuration',
    label: 'Configuration',
    href: '/admin/configuration',
    icon: '⚙️',
    minRoleLevel: 60,
    requiredPermissions: ['config.view'],
    description: 'System configuration',
    children: [
      { id: 'market-config', label: 'Market Data', href: '/admin/market-config', icon: '📊', requiredPermissions: ['config.market_data'] },
      { id: 'logo-manager', label: 'Branding', href: '/admin/logo-manager', icon: '🎨', requiredPermissions: ['config.branding'] },
      { id: 'external-apis', label: 'External APIs', href: '/admin/external-apis', icon: '🔌', requiredPermissions: ['config.edit'] }
    ]
  },
  {
    id: 'system',
    label: 'System Settings',
    href: '/admin/system',
    icon: '🔒',
    requiredRole: 'SUPER_ADMIN',
    description: 'System administration',
    children: [
      { id: 'system-general', label: 'General', href: '/admin/system', icon: '⚙️', requiredRole: 'SUPER_ADMIN' },
      { id: 'system-settings', label: 'Settings', href: '/admin/system/settings', icon: '🔧', requiredRole: 'SUPER_ADMIN' },
      { id: 'security', label: 'Security', href: '/admin/system/security', icon: '🛡️', requiredRole: 'SUPER_ADMIN' },
      { id: 'integrations', label: 'Integrations', href: '/admin/system/integrations', icon: '🔗', requiredRole: 'SUPER_ADMIN' },
      { id: 'backup', label: 'Backup & Restore', href: '/admin/system/backup', icon: '💾', requiredRole: 'SUPER_ADMIN' }
    ]
  }
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
