'use client';

import React from 'react';
import Link from 'next/link';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="w-12 h-[3px] bg-vermillion mx-auto mb-6" />
        <h1 className="font-serif text-headline-2 text-foreground mb-3 tracking-tight">
          Profile Unavailable
        </h1>
        <p className="text-body text-muted-foreground mb-8 leading-relaxed">
          We couldn&apos;t load your profile. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center bg-vermillion text-white px-8 py-3 text-body-sm font-semibold tracking-wide hover:bg-vermillion-dark transition-colors rounded-sm"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-border text-foreground px-8 py-3 text-body-sm font-semibold tracking-wide hover:bg-muted transition-colors rounded-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
