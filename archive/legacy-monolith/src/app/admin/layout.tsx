"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';
import AdminLayoutContent from '@/components/AdminLayoutContent';
import { showToast } from '@/lib/toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Global alert override for all admin pages
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname.startsWith('/admin') && pathname !== '/admin/login') {
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
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // Protect all other admin pages with unified authentication and layout
  return (
    <UnifiedAdminGuard>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </UnifiedAdminGuard>
  );
}

