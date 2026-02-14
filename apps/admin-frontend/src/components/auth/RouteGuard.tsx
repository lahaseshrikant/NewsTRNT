// src/components/admin/RouteGuard.tsx - Route protection based on RBAC
'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import adminAuth from '@/lib/admin-auth';
import RBACAuth from '@/lib/rbac-auth';
import { Permission, UserRole, ADMIN_NAVIGATION, RBACUtils, NavItem } from '@/config/rbac';
import { PermissionDenied } from '@/components/rbac';

interface RouteGuardProps {
  children: ReactNode;
  requiredPermission?: Permission | Permission[];
  requiredRole?: UserRole;
  minRoleLevel?: number;
  requireAll?: boolean;
  fallbackPath?: string;
  showDeniedMessage?: boolean;
}

/**
 * Route guard component that protects routes based on RBAC
 * Wraps page content and checks permissions before rendering
 */
export function RouteGuard({
  children,
  requiredPermission,
  requiredRole,
  minRoleLevel,
  requireAll = false,
  fallbackPath = '/',
  showDeniedMessage = true
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if authenticated
      const session = adminAuth.getUser();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Check required role
      if (requiredRole && !RBACAuth.hasRole(requiredRole)) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Check minimum role level
      if (minRoleLevel && !RBACAuth.hasMinRoleLevel(minRoleLevel)) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Check required permissions
      if (requiredPermission) {
        const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
        const hasPermission = requireAll
          ? RBACAuth.hasAllPermissions(permissions)
          : RBACAuth.hasAnyPermission(permissions);
        
        if (!hasPermission) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
      }

      // All checks passed
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, requiredPermission, requiredRole, minRoleLevel, requireAll, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    if (showDeniedMessage) {
      return <PermissionDenied />;
    }
    // Redirect to fallback
    router.push(fallbackPath);
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
export function withRouteGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<RouteGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <WrappedComponent {...props} />
      </RouteGuard>
    );
  };
}

/**
 * Auto-detect route permissions from navigation config
 * Useful for automatic permission checking based on URL
 */
export function AutoRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRoutePermission = () => {
      const session = adminAuth.getUser();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Find the navigation item for current path
      const findNavItem = (items: NavItem[], path: string): NavItem | null => {
        for (const item of items) {
          if (item.href === path) return item;
          if (item.children) {
            const found = findNavItem(item.children, path);
            if (found) return found;
          }
        }
        return null;
      };

      const navItem = findNavItem(ADMIN_NAVIGATION, pathname);
      
      // If no nav item found, allow access (might be dynamic route)
      if (!navItem) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Check access using RBAC utils
      const hasAccess = RBACUtils.canAccessNavItem(session.role as UserRole, navItem);
      setIsAuthorized(hasAccess);
      setIsLoading(false);
    };

    checkRoutePermission();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <PermissionDenied />;
  }

  return <>{children}</>;
}

/**
 * Convenience guards for common permission levels
 */
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRole="SUPER_ADMIN">
      {children}
    </RouteGuard>
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard minRoleLevel={80}>
      {children}
    </RouteGuard>
  );
}

export function EditorRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard minRoleLevel={60}>
      {children}
    </RouteGuard>
  );
}

export function AuthorRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard minRoleLevel={40}>
      {children}
    </RouteGuard>
  );
}

export function ContentRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredPermission="content.view">
      {children}
    </RouteGuard>
  );
}

export function PublishRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredPermission="content.publish">
      {children}
    </RouteGuard>
  );
}

export function UsersRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredPermission="users.view">
      {children}
    </RouteGuard>
  );
}

export function AnalyticsRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredPermission="analytics.view">
      {children}
    </RouteGuard>
  );
}

export function SystemRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRole="SUPER_ADMIN">
      {children}
    </RouteGuard>
  );
}

export default RouteGuard;

