'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Root error boundary — catches unhandled errors in any page/layout under app/.
 * Styled to match the editorial design system.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        {/* Vermillion accent bar */}
        <div className="w-12 h-[3px] bg-vermillion mx-auto mb-6" />

        <h1 className="font-serif text-headline-2 text-foreground mb-3 tracking-tight">
          Something Went Wrong
        </h1>

        <p className="text-body text-muted-foreground mb-2 leading-relaxed">
          We encountered an unexpected error while loading this page.
          Our team has been notified.
        </p>

        {error.digest && (
          <p className="font-mono text-micro text-muted-foreground/60 mb-8">
            Error ID: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-8" />}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-vermillion text-white px-8 py-3 text-body-sm font-semibold tracking-wide hover:bg-vermillion-dark transition-colors rounded-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-3 text-body-sm font-semibold tracking-wide hover:bg-muted transition-colors rounded-sm"
          >
            Back to Headlines
          </Link>
        </div>
      </div>
    </div>
  );
}
