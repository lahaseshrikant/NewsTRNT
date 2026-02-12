"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#151310] to-[#0D0D0D]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-gold/6 rounded-full filter blur-[130px]" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-vermillion/5 rounded-full filter blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vermillion flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h1 className="font-serif text-xl text-ivory tracking-tight">NewsTRNT</h1>
              <p className="text-[10px] text-ivory/30 font-mono tracking-widest">THE ROAD NOT TAKEN</p>
            </div>
          </Link>

          <div className="max-w-md">
            <div className="w-12 h-0.5 bg-vermillion/50 mb-8" />

            {/* Lock icon decorative */}
            <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-ivory/5 border border-ivory/10 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>

            <h2 className="font-serif text-3xl xl:text-4xl text-ivory/90 leading-tight mb-4">
              We all forget sometimes. That&apos;s okay.
            </h2>
            <p className="text-ivory/40 text-sm leading-relaxed max-w-sm">
              Your account is safe. We&apos;ll send you a secure link to reset your password and get back to the stories that matter.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-ivory/30">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              <span className="text-[10px] font-mono uppercase tracking-wider">256-bit encrypted</span>
            </div>
            <div className="w-px h-4 bg-ivory/10" />
            <div className="flex items-center gap-2 text-ivory/30">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.58.926.834 2.19.166 3.4-1.092 1.98-3.15 3.542-5.572 4.49a.75.75 0 01-.428.019c-2.397-.889-4.44-2.357-5.578-4.295A3.8 3.8 0 016 6a3.8 3.8 0 01.166-1.001z" clipRule="evenodd"/></svg>
              <span className="text-[10px] font-mono uppercase tracking-wider">GDPR compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-paper dark:bg-ink px-6 py-12 relative overflow-hidden">
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gold/5 dark:bg-gold/3 rounded-full filter blur-[60px]" />

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

          {isSubmitted ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">Check your email</h2>
              <p className="text-sm text-muted-foreground mb-2">
                We&apos;ve sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-foreground mb-6">
                {email}
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button onClick={() => setIsSubmitted(false)} className="text-vermillion hover:text-vermillion/80 underline underline-offset-2">try again</button>
              </p>
              <Link
                href="/auth/signin"
                className="hover-magnetic inline-flex items-center justify-center gap-2 py-3 px-8 bg-vermillion text-white font-semibold rounded-xl text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                Back to sign in
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Account Recovery</p>
                <h2 className="font-serif text-3xl text-foreground mb-2">Reset your password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter the email associated with your account and we&apos;ll send a reset link.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-foreground/80 mb-1.5 uppercase tracking-wider">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-field block w-full px-4 py-3 rounded-xl bg-card text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                    placeholder="you@example.com"
                  />
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
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-vermillion transition-colors"
                >
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
};

export default ForgotPasswordPage;
