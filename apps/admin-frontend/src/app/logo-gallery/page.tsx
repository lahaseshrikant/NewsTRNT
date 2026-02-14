'use client';

import LogoGallery from '@/components/logo/LogoGallery';
import UnifiedAdminGuard from '@/components/auth/UnifiedAdminGuard';

export default function AdminLogoGalleryPage() {
  return (
    <UnifiedAdminGuard requireSuperAdmin={true}>
      <LogoGallery />
    </UnifiedAdminGuard>
  );
}


