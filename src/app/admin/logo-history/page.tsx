'use client';

import AdminGuard from '@/components/AdminGuard';
import LogoHistory from '@/components/LogoHistory';

export default function AdminLogoHistoryPage() {
  return (
    <AdminGuard>
      <LogoHistory />
    </AdminGuard>
  );
}
