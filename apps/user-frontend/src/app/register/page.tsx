"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <DivergenceMark size={48} animated className="mx-auto mb-6" />
        <p className="font-mono text-sm tracking-wider uppercase text-muted-foreground">
          Preparing your press pass...
        </p>
      </div>
    </div>
  );
}
