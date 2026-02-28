/**
 * Sign Up Page
 *
 * Split-panel layout: dark brand panel (left) with value propositions
 * and registration form (right) with name, email, password fields.
 *
 * @route /auth/signup
 */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      });
      if (result.success) {
        router.push('/interests');
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const handleGoogleResponse = useCallback(async (response: any) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await authService.googleLogin(response.credential);
      if (result.success && result.user && result.token) {
        window.dispatchEvent(new CustomEvent('authStatusChanged'));
        router.push('/interests');
      } else {
        setError(result.error || 'Google sign-up failed');
      }
    } catch {
      setError('Google sign-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [handleGoogleResponse]);

  const pwStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand Story */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-[#F5EDE3] dark:bg-[#1A1510]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FBF7F1] via-[#F0E4D4] to-[#DED0BC] dark:from-[#1A1510] dark:via-[#201810] dark:to-[#0D0B08]" />
        <div className="absolute top-1/4 left-0 w-[450px] h-[450px] bg-gold/10 dark:bg-gold/5 rounded-full filter blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-vermillion/5 dark:bg-vermillion/8 rounded-full filter blur-[120px]" />
        <div className="absolute inset-0 opacity-0 dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-vermillion flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h1 className="font-serif text-xl text-foreground tracking-tight">NewsTRNT</h1>
              <p className="text-[10px] text-foreground/50 font-mono tracking-widest">THE ROAD NOT TAKEN</p>
            </div>
          </Link>

          {/* Value Props */}
          <div className="max-w-md space-y-8">
            <div className="w-12 h-0.5 bg-gold mb-8" />
            <h2 className="font-serif text-3xl xl:text-4xl text-foreground leading-tight">
              Join the revolution in independent journalism
            </h2>
            <div className="space-y-5">
              {[
                { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>, title: 'Curated News Feed', desc: 'Personalized stories that matter to you' },
                { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>, title: 'Multiple Perspectives', desc: 'Diverse viewpoints on every major story' },
                { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>, title: '60-Second Shorts', desc: 'Stay informed in minutes, not hours' },
                { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>, title: 'Deep Dive Analysis', desc: 'Fact-checked, long-form investigative pieces' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 group">
                  <div className="w-9 h-9 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center text-gold flex-shrink-0 group-hover:bg-foreground/10 transition-colors">{item.icon}</div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-foreground/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission quote */}
          <div className="pt-6 border-t border-foreground/10">
            <p className="text-foreground/70 text-sm italic leading-relaxed mb-3">
              &ldquo;I shall be telling this with a sigh<br />
              Somewhere ages and ages hence<br />
              Two roads diverged in a wood, and I&mdash;<br />
              I took the one less traveled by,<br />
              And that has made all the difference.&rdquo;
            </p>
            <p className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">Robert Frost &mdash; The Road Not Taken</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-start justify-center bg-background px-6 py-6 relative overflow-y-auto">
        <div className="absolute top-10 right-10 w-48 h-48 bg-vermillion/5 dark:bg-vermillion/3 rounded-full filter blur-[60px]" />

        <div className="w-full max-w-[460px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-vermillion flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span className="font-serif text-lg text-foreground">NewsTRNT</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Get Started</p>
            <h2 className="font-serif text-3xl text-foreground mb-2">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              Already a member?{' '}
              <Link href="/auth/signin" className="text-vermillion font-medium hover-underline-expand">Sign in</Link>
            </p>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button type="button" onClick={() => {
              if (GOOGLE_CLIENT_ID && window.google) {
                window.google.accounts.id.prompt();
              } else {
                setError('Google sign-in is not configured.');
              }
            }} disabled={isLoading} className="hover-lift flex items-center justify-center gap-2.5 py-2.5 px-4 border border-border rounded-xl bg-card text-sm font-medium text-foreground disabled:opacity-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" className="hover-lift flex items-center justify-center gap-2.5 py-2.5 px-4 border border-border rounded-xl bg-card text-sm font-medium text-foreground">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-semibold text-foreground/80 mb-1.5 uppercase tracking-wider">First name</label>
                <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange}
                  className="auth-field block w-full px-4 py-2.5 rounded-xl bg-card text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                  placeholder="First name" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-foreground/80 mb-1.5 uppercase tracking-wider">Last name</label>
                <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange}
                  className="auth-field block w-full px-4 py-2.5 rounded-xl bg-card text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                  placeholder="Last name" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-foreground/80 mb-1.5 uppercase tracking-wider">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange}
                className="auth-field block w-full px-4 py-2.5 rounded-xl bg-card text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-foreground/80 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange}
                  className="auth-field block w-full px-4 py-2.5 pr-11 rounded-xl bg-card text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                  placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </button>
              </div>
              {/* Password strength */}
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.level ? pwStrength.color : 'bg-border'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{pwStrength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground/80 mb-1.5 uppercase tracking-wider">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange}
                className="auth-field block w-full px-4 py-2.5 rounded-xl bg-card text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                placeholder="Re-enter password" />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {error}
              </div>
            )}

            <div className="flex items-start">
              <input id="accept-terms" type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-vermillion focus:ring-vermillion/30" />
              <label htmlFor="accept-terms" className="ml-2 text-sm text-muted-foreground leading-tight">
                I agree to the{' '}
                <Link href="/terms" className="text-vermillion hover:text-vermillion/80 underline underline-offset-2">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-vermillion hover:text-vermillion/80 underline underline-offset-2">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={isLoading}
              className="hover-magnetic w-full py-3.5 px-6 bg-vermillion text-white font-semibold rounded-xl text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-vermillion/20">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-foreground/70 hover:text-vermillion transition-colors underline underline-offset-2">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-foreground/70 hover:text-vermillion transition-colors underline underline-offset-2">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
