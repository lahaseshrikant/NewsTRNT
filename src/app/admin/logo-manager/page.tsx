'use client';

import AdminGuard from '@/components/AdminGuard';
import LogoManager from '@/components/LogoManager';

export default function AdminLogoManagerPage() {
  return (
    <AdminGuard>
      <LogoManager />
    </AdminGuard>
  );
}
