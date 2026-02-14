// src/components/rbac/index.tsx - RBAC-aware UI components
'use client';

import React, { ReactNode, useMemo, useState, useEffect } from 'react';
import { Permission, UserRole, ROLES, RBACUtils, ADMIN_NAVIGATION } from '@/config/rbac';
import RBACAuth, { EnhancedAdminSession } from '@/lib/rbac-auth';
import { getEmailString } from '@/lib/utils';

interface PermissionGateProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component that only renders children if user has required permission(s)
 */
export function PermissionGate({ 
  permission, 
  requireAll = false, 
  fallback = null, 
  children 
}: PermissionGateProps) {
  const permissions = Array.isArray(permission) ? permission : [permission];
  
  const hasAccess = requireAll
    ? RBACAuth.hasAllPermissions(permissions)
    : RBACAuth.hasAnyPermission(permissions);
  
  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}

interface RoleGateProps {
  role?: UserRole | UserRole[];
  minLevel?: number;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component that only renders children if user has required role
 */
export function RoleGate({ 
  role, 
  minLevel, 
  fallback = null, 
  children 
}: RoleGateProps) {
  const session = RBACAuth.getSession();
  if (!session) return <>{fallback}</>;
  
  // Check minimum level if specified
  if (minLevel !== undefined) {
    if (!RBACAuth.hasMinRoleLevel(minLevel)) {
      return <>{fallback}</>;
    }
    // If only minLevel is specified (no role), and level check passes, render children
    if (!role) {
      return <>{children}</>;
    }
  }
  
  // Check specific role(s) if specified
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const hasRole = roles.some(r => RBACAuth.hasRole(r));
    if (!hasRole) return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface SuperAdminOnlyProps {
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Convenience component for Super Admin only content
 */
export function SuperAdminOnly({ fallback = null, children }: SuperAdminOnlyProps) {
  return (
    <RoleGate role="SUPER_ADMIN" fallback={fallback}>
      {children}
    </RoleGate>
  );
}

interface AdminOnlyProps {
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Convenience component for Admin+ content (Admin, Super Admin)
 */
export function AdminOnly({ fallback = null, children }: AdminOnlyProps) {
  return (
    <RoleGate minLevel={80} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

interface EditorOnlyProps {
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Convenience component for Editor+ content (Editor, Admin, Super Admin)
 */
export function EditorOnly({ fallback = null, children }: EditorOnlyProps) {
  return (
    <RoleGate minLevel={60} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

interface CanPublishProps {
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component for content that requires publish permission
 */
export function CanPublish({ fallback = null, children }: CanPublishProps) {
  return (
    <PermissionGate permission="content.publish" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

interface CanManageUsersProps {
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component for content that requires user management permission
 */
export function CanManageUsers({ fallback = null, children }: CanManageUsersProps) {
  return (
    <PermissionGate permission={['users.edit', 'users.create', 'users.delete']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Role Badge component showing user's role with icon and color
 */
export function RoleBadge({ 
  role, 
  size = 'md',
  showIcon = true,
  className = '' 
}: { 
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}) {
  const displayRole = role || RBACAuth.getSession()?.role;
  if (!displayRole) return null;
  
  const badge = RBACUtils.getRoleBadge(displayRole);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${badge.bgColor} ${badge.color} ${sizeClasses[size]} ${className}`}>
      {showIcon && <span>{badge.icon}</span>}
      <span>{badge.displayName}</span>
    </span>
  );
}

/**
 * Current user role indicator for headers/sidebars
 */
export function CurrentUserRole({ 
  showEmail = false,
  className = '' 
}: { 
  showEmail?: boolean;
  className?: string;
}) {
  const session = RBACAuth.getSession();
  if (!session) return null;
  
  const roleInfo = RBACAuth.getRoleInfo();
  if (!roleInfo) return null;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${roleInfo.bgColor}`}>
        <span className="text-lg">{roleInfo.icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{session.displayName || session.username}</span>
        {showEmail && (
          <span className="text-xs text-muted-foreground">{getEmailString(session.email)}</span>
        )}
        <span className={`text-xs ${roleInfo.color}`}>{roleInfo.displayName}</span>
      </div>
    </div>
  );
}

/**
 * Permission denied message component
 */
export function PermissionDenied({ 
  title = 'Access Denied',
  message = 'You do not have permission to access this resource.',
  showRoleInfo = true
}: {
  title?: string;
  message?: string;
  showRoleInfo?: boolean;
}) {
  const roleInfo = RBACAuth.getRoleInfo();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md mb-4">{message}</p>
      {showRoleInfo && roleInfo && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Your current role:</p>
          <RoleBadge size="lg" />
        </div>
      )}
    </div>
  );
}

/**
 * Role-specific action button that shows/hides based on permissions
 */
export function ActionButton({
  permission,
  role,
  minLevel,
  onClick,
  children,
  className = '',
  disabled = false,
  variant = 'primary'
}: {
  permission?: Permission | Permission[];
  role?: UserRole;
  minLevel?: number;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const session = RBACAuth.getSession();
  if (!session) return null;
  
  // Check permission
  if (permission) {
    const perms = Array.isArray(permission) ? permission : [permission];
    if (!RBACAuth.hasAnyPermission(perms)) return null;
  }
  
  // Check role
  if (role && !RBACAuth.hasRole(role)) return null;
  
  // Check minimum level
  if (minLevel && !RBACAuth.hasMinRoleLevel(minLevel)) return null;
  
  const variantClasses = {
    primary: 'bg-vermillion hover:bg-vermillion/90 text-white',
    secondary: 'bg-ash hover:bg-ash/80 text-ink',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Hook for RBAC checks in components
 */
export function useRBAC() {
  const [session, setSession] = useState<EnhancedAdminSession | null>(null);

  useEffect(() => {
    const updateSession = () => {
      const currentSession = RBACAuth.getSession();
      setSession(currentSession);
    };

    // Initial load
    updateSession();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newstrnt_admin_session') {
        updateSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Check session periodically (every 30 seconds) for expiration
    const interval = setInterval(updateSession, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const role = session?.role;
  const roleLevel = session ? ROLES[session.role]?.level : 0;
  
  return {
    session,
    isAuthenticated: !!session,
    role: session?.role,
    roleLevel,
    
    hasPermission: (permission: Permission) => session ? RBACUtils.hasPermission(session.role, permission) : false,
    hasAnyPermission: (permissions: Permission[]) => session ? RBACUtils.hasAnyPermission(session.role, permissions) : false,
    hasAllPermissions: (permissions: Permission[]) => session ? RBACUtils.hasAllPermissions(session.role, permissions) : false,
    hasRole: (role: UserRole) => session ? (session.role === role || RBACUtils.hasMinRoleLevel(session.role, ROLES[role].level)) : false,
    hasMinRoleLevel: (level: number) => session ? RBACUtils.hasMinRoleLevel(session.role, level) : false,
    
    isSuperAdmin: session?.role === 'SUPER_ADMIN',
    isAdmin: session ? RBACUtils.hasMinRoleLevel(session.role, 80) : false,
    isEditor: session ? RBACUtils.hasMinRoleLevel(session.role, 60) : false,
    isAuthor: session ? RBACUtils.hasMinRoleLevel(session.role, 40) : false,
    
    canPublish: session ? RBACUtils.hasPermission(session.role, 'content.publish') : false,
    canEditAll: session ? RBACUtils.hasPermission(session.role, 'content.edit') : false,
    canEditOwn: session ? RBACUtils.hasPermission(session.role, 'content.edit_own') : false,
    canDelete: session ? RBACUtils.hasPermission(session.role, 'content.delete') : false,
    canManageUsers: session ? RBACUtils.hasPermission(session.role, 'users.edit') : false,
    canAccessSystem: session ? RBACUtils.hasPermission(session.role, 'system.view') : false,
    
    getNavigation: () => session ? RBACUtils.filterNavigation(session.role, ADMIN_NAVIGATION) : [],
    getRoleInfo: () => session ? ROLES[session.role] : null
  };
}

export default {
  PermissionGate,
  RoleGate,
  SuperAdminOnly,
  AdminOnly,
  EditorOnly,
  CanPublish,
  CanManageUsers,
  RoleBadge,
  CurrentUserRole,
  PermissionDenied,
  ActionButton,
  useRBAC
};
