"use client";

import { usePathname } from 'next/navigation';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';
import AdminLayoutContent from '@/components/AdminLayoutContent';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
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

