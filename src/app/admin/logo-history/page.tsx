'use client';

import LogoHistory from '@/components/LogoHistory';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';

export default function AdminLogoHistoryPage() {
  return (
    <UnifiedAdminGuard requireSuperAdmin={true}>
      <LogoHistory />
    </UnifiedAdminGuard>
  );
}
