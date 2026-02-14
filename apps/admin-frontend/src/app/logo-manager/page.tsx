'use client';

import LogoManager from '@/components/logo/LogoManager';
import UnifiedAdminGuard from '@/components/auth/UnifiedAdminGuard';

export default function AdminLogoManagerPage() {
  return (
    <UnifiedAdminGuard requireSuperAdmin={true}>
      <LogoManager />
    </UnifiedAdminGuard>
  );
}


