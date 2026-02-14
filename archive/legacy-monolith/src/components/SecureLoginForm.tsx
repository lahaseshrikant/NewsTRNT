// src/components/SecureLoginForm.tsx - Ultra-secure login form
'use client';

import { useState, useEffect, useRef } from 'react';
import useSecureAuth from '@/hooks/useSecureAuth';

interface SecureLoginFormProps {
  onAttempt: () => void;
  attemptsRemaining: number;
  isLocked: boolean;
}

const SecureLoginForm = ({ onAttempt, attemptsRemaining, isLocked }: SecureLoginFormProps) => {
  const { login, loading, error } = useSecureAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: ''
  });
  const [showMFA, setShowMFA] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Security monitoring
  useEffect(() => {
    const warnings: string[] = [];

    // Check for dev tools
    if (process.env.NODE_ENV === 'production') {
      const devToolsCheck = () => {
        const threshold = 160;
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          warnings.push('Developer tools detected');
        }
      };
      
      devToolsCheck();
    }

    // Check for suspicious browser extensions
    if (typeof window !== 'undefined' && (window as any).chrome?.runtime) {
      warnings.push('Browser extensions may compromise security');
    }

    setSecurityWarnings(warnings);
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const remaining = lockoutTime - Date.now();
        if (remaining <= 0) {
          setLockoutTime(null);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;

    onAttempt();

    const result = await login({
      email: formData.email,
      password: formData.password,
      mfaCode: formData.mfaCode || undefined
    });

    if (result.requiresMFA) {
      setShowMFA(true);
    } else if (!result.success) {
      if (result.lockedUntil) {
        setLockoutTime(result.lockedUntil);
      }
      
      // Clear sensitive data on failure
      setFormData(prev => ({ ...prev, password: '', mfaCode: '' }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Prevent form autofill/autocomplete attacks
  const preventAutofill = {
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
    spellCheck: false
  };

  const lockoutSeconds = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 1000) : 0;

  if (isLocked || lockoutSeconds > 0) {
    return (
      <div className="min-h-screen bg-[#1a1917] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Security Lockout Active
            </h2>
            <p className="text-ash mb-4">
              Too many failed authentication attempts.
            </p>
            {lockoutSeconds > 0 && (
              <div className="text-xl text-red-400 font-mono">
                {Math.floor(lockoutSeconds / 60)}:{(lockoutSeconds % 60).toString().padStart(2, '0')}
              </div>
            )}
            <p className="text-stone text-sm mt-4">
              Please wait before attempting to log in again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1917] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Security warnings */}
        {securityWarnings.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
            <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Security Warnings</h3>
            <ul className="text-yellow-300 text-sm space-y-1">
              {securityWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main login form */}
        <div className="bg-[#2a2926] rounded-xl border border-[#3a3835] p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-vermillion rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Secure Admin Access
            </h1>
            <p className="text-stone">
              Military-grade authentication required
            </p>
          </div>

          {/* Attempts warning */}
          {attemptsRemaining <= 2 && (
            <div className="mb-6 p-3 bg-orange-900/20 border border-orange-500 rounded-lg">
              <div className="flex items-center text-orange-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm">
                  Warning: {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                </span>
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
                <div className="flex items-center text-red-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ash mb-2">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#2a2926] border border-[#3a3835] rounded-lg text-white placeholder-stone focus:ring-2 focus:ring-vermillion focus:border-transparent transition-colors"
                placeholder="admin@newstrnt.com"
                required
                disabled={loading}
                {...preventAutofill}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ash mb-2">
                Secure Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#2a2926] border border-[#3a3835] rounded-lg text-white placeholder-stone focus:ring-2 focus:ring-vermillion focus:border-transparent transition-colors"
                placeholder="Enter secure password"
                required
                disabled={loading}
                {...preventAutofill}
              />
            </div>

            {showMFA && (
              <div>
                <label className="block text-sm font-medium text-ash mb-2">
                  2FA Authentication Code
                </label>
                <input
                  type="text"
                  name="mfaCode"
                  value={formData.mfaCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#2a2926] border border-[#3a3835] rounded-lg text-white placeholder-stone focus:ring-2 focus:ring-vermillion focus:border-transparent transition-colors"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  {...preventAutofill}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.email.trim() || !formData.password.trim()}
              className="w-full py-3 px-4 bg-vermillion text-white rounded-lg font-medium hover:bg-vermillion/90 focus:ring-2 focus:ring-vermillion focus:ring-offset-2 focus:ring-offset-[#2a2926] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Secure Access
                </div>
              )}
            </button>
          </form>

          {/* Security info - development only */}
          {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 pt-6 border-t border-[#3a3835]">
            <div className="text-center">
              <p className="text-sm text-stone mb-3">
                🔐 Use credentials from your .env.local file:
              </p>
              <div className="space-y-1 text-xs bg-[#1a1917] p-3 rounded">
                <div className="text-vermillion">SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD</div>
                <div className="text-gold mt-2">ADMIN_EMAIL / ADMIN_PASSWORD</div>
              </div>
            </div>
          </div>
          )}

          {/* Security features */}
          <div className="mt-6 text-center">
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                CSRF Protected
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-vermillion rounded-full mr-1"></div>
                Rate Limited
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-gold rounded-full mr-1"></div>
                Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-sm text-stone hover:text-vermillion transition-colors"
          >
            ← Return to NewsTRNT
          </a>
        </div>
      </div>
    </div>
  );
};

export default SecureLoginForm;
