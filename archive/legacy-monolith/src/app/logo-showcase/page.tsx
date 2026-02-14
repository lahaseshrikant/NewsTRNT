'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoShowcaseRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/logo-gallery');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Logo Gallery...</p>
    </div>
  );
}
