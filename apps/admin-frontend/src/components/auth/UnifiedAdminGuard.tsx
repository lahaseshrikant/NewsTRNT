// apps/admin-frontend/src/components/auth/UnifiedAdminGuard.tsx
// Client-side auth guard. Redirects to /login if not authenticated.
// Optionally checks permissions or Super Admin status.
'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import adminAuth, { AdminUser } from '@/lib/admin-auth';

interface UnifiedAdminGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requireSuperAdmin?: boolean;
}

export default function UnifiedAdminGuard({
  children,
  requiredPermission,
  requireSuperAdmin = false,
}: UnifiedAdminGuardProps) {
  const [state, setState] = useState<'loading' | 'authenticated' | 'forbidden'>('loading');
  const [user, setUser] = useState<AdminUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    // Quick client-side check first
    if (!adminAuth.isAuthenticated()) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Get cached user (fast)
    let currentUser = adminAuth.getUser();

    // Validate with backend on first load
    if (!currentUser) {
      currentUser = await adminAuth.validate();
      if (!currentUser) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
    }

    setUser(currentUser);

    // Check Super Admin requirement
    if (requireSuperAdmin && !currentUser.isSuperAdmin) {
      setState('forbidden');
      return;
    }

    // Check permission requirement
    if (requiredPermission && !adminAuth.hasPermission(requiredPermission)) {
      setState('forbidden');
      return;
    }

    setState('authenticated');
  }, [pathname, requiredPermission, requireSuperAdmin, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Periodically revalidate (every 5 minutes)
  useEffect(() => {
    if (state !== 'authenticated') return;
    const interval = setInterval(async () => {
      const validated = await adminAuth.validate();
      if (!validated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state, pathname, router]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="text-slate-500 mt-4 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (state === 'forbidden') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
            {requireSuperAdmin
              ? 'This page requires Super Admin privileges.'
              : `Missing permission: ${requiredPermission}`}
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mb-6">
            Signed in as {user?.email} ({user?.role})
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

