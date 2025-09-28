'use client';

import LogoGallery from '@/components/LogoGallery';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';

export default function AdminLogoGalleryPage() {
  return (
    <UnifiedAdminGuard requireSuperAdmin={true}>
      <LogoGallery />
    </UnifiedAdminGuard>
  );
}

