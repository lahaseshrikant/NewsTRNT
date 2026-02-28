/**
 * Email Verification Page
 *
 * Accepts a token from URL params (?token=...) and verifies the user's email.
 * Shows success or error state after verification attempt.
 *
 * @route /auth/verify-email
 */
"use client";

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verify = async () => {
      try {
        const result = await authService.verifyEmail(token);
        if (result.success) {
          setStatus('success');
          // Refresh user data so isVerified updates
          await authService.getCurrentUser();
        } else {
          setStatus('error');
          setErrorMessage(result.error || 'Verification failed. The link may have expired.');
        }
      } catch {
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-16 left-16 w-64 h-64 bg-vermillion/3 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-16 right-16 w-48 h-48 bg-gold/5 rounded-full filter blur-[80px]" />

      <div className="w-full max-w-md text-center relative z-10">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-vermillion flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="text-left">
            <h1 className="font-serif text-xl text-foreground tracking-tight">NewsTRNT</h1>
            <p className="text-[10px] text-foreground/50 font-mono tracking-widest">THE ROAD NOT TAKEN</p>
          </div>
        </Link>

        {status === 'loading' && (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-vermillion/10 border border-vermillion/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-vermillion animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">Verifying your email...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">Email Verified!</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Your email address has been successfully verified. You now have full access to all features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/profile" className="hover-magnetic inline-flex items-center justify-center gap-2 py-3 px-6 bg-vermillion text-white font-semibold rounded-xl text-sm">
                Go to Profile
              </Link>
              <Link href="/" className="inline-flex items-center justify-center gap-2 py-3 px-6 border border-border text-foreground font-semibold rounded-xl text-sm hover:bg-muted transition-colors">
                Browse News
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">Verification Failed</h2>
            <p className="text-sm text-muted-foreground mb-2">{errorMessage}</p>
            <p className="text-xs text-muted-foreground mb-8">
              If this issue persists, please request a new verification email from your profile settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/profile" className="hover-magnetic inline-flex items-center justify-center gap-2 py-3 px-6 bg-vermillion text-white font-semibold rounded-xl text-sm">
                Go to Profile
              </Link>
              <Link href="/" className="inline-flex items-center justify-center gap-2 py-3 px-6 border border-border text-foreground font-semibold rounded-xl text-sm hover:bg-muted transition-colors">
                Go Home
              </Link>
            </div>
          </div>
        )}

        {status === 'no-token' && (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">Missing Verification Link</h2>
            <p className="text-sm text-muted-foreground mb-8">
              No verification token was found. Please use the link from your verification email, or request a new one from your profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/profile" className="hover-magnetic inline-flex items-center justify-center gap-2 py-3 px-6 bg-vermillion text-white font-semibold rounded-xl text-sm">
                Go to Profile
              </Link>
              <Link href="/auth/signin" className="inline-flex items-center justify-center gap-2 py-3 px-6 border border-border text-foreground font-semibold rounded-xl text-sm hover:bg-muted transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-12 text-xs text-muted-foreground">
          Need help?{' '}
          <Link href="/support" className="text-vermillion hover:underline underline-offset-2">Contact support</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 bg-muted rounded-xl mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-mono">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
