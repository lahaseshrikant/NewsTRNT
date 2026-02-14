"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DivergenceMark } from '@/components/DivergenceMark';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/signin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
      <div className="text-center">
        <DivergenceMark size={48} animated className="mx-auto mb-6" />
        <p className="font-mono text-sm tracking-wider uppercase text-stone">
          Entering the newsroom...
        </p>
      </div>
    </div>
  );
}
