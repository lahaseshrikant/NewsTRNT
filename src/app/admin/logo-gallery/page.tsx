'use client';

import AdminGuard from '@/components/AdminGuard';
import LogoGallery from '@/components/LogoGallery';

export default function AdminLogoGalleryPage() {
  return (
    <AdminGuard>
      <LogoGallery />
    </AdminGuard>
  );
}
