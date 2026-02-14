'use client';

import LogoHistory from '@/components/logo/LogoHistory';
import UnifiedAdminGuard from '@/components/auth/UnifiedAdminGuard';

export default function AdminLogoHistoryPage() {
  return (
    <UnifiedAdminGuard requireSuperAdmin={true}>
      <LogoHistory />
    </UnifiedAdminGuard>
  );
}


