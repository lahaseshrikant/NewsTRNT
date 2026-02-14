// apps/admin-frontend/src/lib/rbac-auth.ts
// Compatibility layer for old RBACAuth references.
// Delegates all calls to the single admin-auth service.

import adminAuth, { AdminUser } from './admin-auth';

// Re-export AdminUser as EnhancedAdminSession for backwards compat
export type EnhancedAdminSession = AdminUser;
export type EnhancedAuthResult = { success: boolean; message: string; session?: AdminUser };

const RBACAuth = {
  // Auth
  login: (email: string, password: string) => adminAuth.login(email, password),
  logout: () => adminAuth.logout(),
  isAuthenticated: () => adminAuth.isAuthenticated(),

  // Session
  getSession: (): AdminUser | null => adminAuth.getUser(),
  getCurrentUser: () => adminAuth.getUser(),
  getAuthToken: () => adminAuth.getToken(),

  // Permissions
  hasPermission: (perm: string) => adminAuth.hasPermission(perm),
  hasAnyPermission: (perms: string[]) => adminAuth.hasAnyPermission(perms),
  hasAllPermissions: (perms: string[]) => perms.every((p) => adminAuth.hasPermission(p)),

  // Roles
  hasRole: (role: string) => {
    const user = adminAuth.getUser();
    if (!user) return false;
    return user.role === role || user.isSuperAdmin;
  },
  hasMinRoleLevel: (minLevel: number) => {
    const user = adminAuth.getUser();
    if (!user) return false;
    return user.isSuperAdmin || user.roleLevel >= minLevel;
  },
  getRoleInfo: () => {
    const user = adminAuth.getUser();
    if (!user) return null;
    return {
      role: user.role,
      level: user.roleLevel,
      isSuperAdmin: user.isSuperAdmin,
      permissions: user.permissions,
    };
  },

  // Navigation — frontend can compute from permissions
  getNavigation: () => {
    // This was previously hard-coded in the frontend.
    // Now permissions come from the backend. Components should use
    // hasPermission() checks to conditionally render nav items.
    return [];
  },
};

export default RBACAuth;

