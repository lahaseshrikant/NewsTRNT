'use client';

import React from 'react';

/**
 * Global error boundary — catches root layout errors.
 * Must render its own <html> and <body> since the root layout may have failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#FAFAF9',
            color: '#0D0D0D',
          }}
        >
          <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
            {/* Vermillion accent bar */}
            <div
              style={{
                width: '3rem',
                height: '3px',
                background: '#C62828',
                margin: '0 auto 1.5rem',
              }}
            />

            <h1
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
                letterSpacing: '-0.01em',
              }}
            >
              Something Went Wrong
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: '#666',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              An unexpected error occurred. We apologize for the inconvenience.
              {error.digest && (
                <span style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '0.5rem', color: '#999' }}>
                  Error ID: {error.digest}
                </span>
              )}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#C62828',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: '0.75rem 2rem',
                  background: 'transparent',
                  color: '#0D0D0D',
                  border: '1px solid #ddd',
                  borderRadius: '2px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                }}
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
