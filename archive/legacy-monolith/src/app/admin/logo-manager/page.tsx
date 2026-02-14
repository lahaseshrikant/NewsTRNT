'use client';

import LogoManager from '@/components/LogoManager';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';

export default function AdminLogoManagerPage() {
  return (
    <UnifiedAdminGuard requireSuperAdmin={true}>
      <LogoManager />
    </UnifiedAdminGuard>
  );
}

