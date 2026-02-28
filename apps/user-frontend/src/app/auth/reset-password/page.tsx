/**
 * Reset Password Page
 *
 * Accepts a token from URL params (?token=...) and allows the user
 * to set a new password.
 *
 * @route /auth/reset-password
 */
"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.resetPassword(token, newPassword);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Failed to reset password. The link may have expired.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-[#F5EDE3] dark:bg-[#1A1510]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FBF7F1] via-[#F0E4D4] to-[#DED0BC] dark:from-[#1A1510] dark:via-[#201810] dark:to-[#0D0B08]" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-vermillion/5 dark:bg-vermillion/8 rounded-full filter blur-[130px]" />
        <div className="absolute bottom-1/3 left-0 w-[350px] h-[350px] bg-gold/10 dark:bg-gold/5 rounded-full filter blur-[100px]" />
        <div className="absolute inset-0 opacity-0 dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vermillion flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h1 className="font-serif text-xl text-foreground tracking-tight">NewsTRNT</h1>
              <p className="text-[10px] text-foreground/50 font-mono tracking-widest">THE ROAD NOT TAKEN</p>
            </div>
          </Link>

          <div className="max-w-md">
            <div className="w-12 h-0.5 bg-vermillion/50 mb-8" />
            <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-vermillion/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
            </div>
            <h2 className="font-serif text-3xl xl:text-4xl text-foreground leading-tight mb-4">
              Create a new password
            </h2>
            <p className="text-foreground/60 text-sm leading-relaxed max-w-sm">
              Choose a strong password that you haven&apos;t used before. A good password is at least 8 characters long and includes a mix of letters, numbers, and symbols.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-foreground/50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              <span className="text-[10px] font-mono uppercase tracking-wider">Secure reset</span>
            </div>
            <div className="w-px h-4 bg-foreground/15" />
            <div className="flex items-center gap-2 text-foreground/50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
              <span className="text-[10px] font-mono uppercase tracking-wider">Link expires in 1h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 relative overflow-hidden">
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-vermillion/5 dark:bg-vermillion/3 rounded-full filter blur-[60px]" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-vermillion flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span className="font-serif text-lg text-foreground">NewsTRNT</span>
            </Link>
          </div>

          {!token ? (
            /* No Token State */
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">Invalid Reset Link</h2>
              <p className="text-sm text-muted-foreground mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/auth/forgot-password" className="hover-magnetic inline-flex items-center justify-center gap-2 py-3 px-8 bg-vermillion text-white font-semibold rounded-xl text-sm">
                Request New Link
              </Link>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">Password Reset!</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link href="/auth/signin" className="hover-magnetic inline-flex items-center justify-center gap-2 py-3 px-8 bg-vermillion text-white font-semibold rounded-xl text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                Sign In
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Account Recovery</p>
                <h2 className="font-serif text-3xl text-foreground mb-2">Set new password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your new password below. Must be at least 8 characters.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold text-foreground/80 mb-1.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      name="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="auth-field block w-full px-4 py-3 pr-11 rounded-xl bg-card text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold text-foreground/80 mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-field block w-full px-4 py-3 rounded-xl bg-card text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                    placeholder="Re-enter your new password"
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="hover-magnetic w-full py-3.5 px-6 bg-vermillion text-white font-semibold rounded-xl text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-vermillion/20"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                      Resetting...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/auth/signin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-vermillion transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 bg-muted rounded-xl mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-mono">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
