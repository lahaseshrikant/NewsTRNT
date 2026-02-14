'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestMarketAPIRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin market data page
    router.replace('/admin/market-data');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl p-8 max-w-md border border-border text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">
          This page has been moved to the admin panel.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          You will be redirected automatically in a moment.
        </p>
      </div>
    </div>
  );
}
