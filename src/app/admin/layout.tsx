"use client";

import { usePathname } from 'next/navigation';
import AdminProtected from '@/components/AdminProtected';

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
  
  // Protect all other admin pages
  return (
    <AdminProtected>
      {children}
    </AdminProtected>
  );
}
