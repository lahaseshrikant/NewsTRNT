"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import UnifiedAdminGuard from '@/components/auth/UnifiedAdminGuard';
import AdminLayoutContent from '@/components/layout/AdminLayoutContent';
import { showToast } from '@/lib/toast';

export default function AdminClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Global alert override for all admin pages
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname.startsWith('/') && pathname !== '/login') {
      const originalAlert = window.alert;

      window.alert = (message: string) => {
        console.warn('🚫 Admin layout: Default alert intercepted:', message);
        console.trace('Alert source:');
        showToast(message, 'warning');
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, [pathname]);

  // Don't protect the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Protect all other admin pages with unified authentication and layout
  return (
    <UnifiedAdminGuard>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </UnifiedAdminGuard>
  );
}

