"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
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
      // Simulate account creation - replace with actual auth logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On successful signup, redirect to interests page
      router.push('/interests');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-full opacity-20 dark:opacity-30 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 rounded-full opacity-20 dark:opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-400 dark:from-emerald-600 dark:to-teal-600 rounded-full opacity-20 dark:opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 dark:from-orange-600 dark:to-red-600 rounded-full opacity-20 dark:opacity-30 animate-bounce delay-500"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <Link href="/" className="inline-block group">
            <div className="relative">
              <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                ✨ NewsNerve
              </h1>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping"></div>
            </div>
          </Link>
          <div className="mt-8 space-y-2">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Join the <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Revolution</span> 🚀
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base">
              Create your account and unlock the future of news! Or{' '}
              <Link href="/auth/signin" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors underline decoration-wavy underline-offset-4">
                sign in to existing account 🔐
              </Link>
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="mt-10 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 hover:shadow-purple-500/20 dark:hover:shadow-blue-500/20 transition-all duration-500 animate-slide-in" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                  👤 First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500"
                  placeholder="John ✨"
                />
              </div>
              <div className="group">
                <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                  👤 Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500"
                  placeholder="Doe 🎉"
                />
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                📧 Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500"
                placeholder="john@awesome.com 🌟"
              />
            </div>
            
            <div className="group">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                🔐 Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500"
                placeholder="Make it super secure! 🛡️"
              />
            </div>
            
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                🔒 Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30 dark:focus:ring-purple-400/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500"
                placeholder="Confirm that awesome password! ✅"
              />
            </div>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl text-sm shadow-lg animate-shake">
              ❌ {error}
            </div>
          )}

          <div className="flex items-center group">
            <input
              id="accept-terms"
              name="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400 border-gray-300 dark:border-gray-600 rounded transition-all duration-300 hover:scale-110"
            />
            <label htmlFor="accept-terms" className="ml-3 block text-sm text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 cursor-pointer">
              📜 I agree to the{' '}
              <Link href="/terms" className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline decoration-wavy">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline decoration-wavy">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 animate-gradient"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                {isLoading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="text-2xl group-hover:animate-bounce-gentle">🚀</span>
                )}
              </span>
              {isLoading ? 'Creating your account... ✨' : 'Join the Revolution! 🎉'}
            </button>
          </div>

          {/* Social Sign Up */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 font-medium backdrop-blur-sm rounded-full">
                  Or join with 🌟
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="group w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-white/90 dark:bg-gray-700/90 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
              >
                <svg className="w-5 h-5 group-hover:animate-bounce-gentle" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google 🔍</span>
              </button>

              <button
                type="button"
                className="group w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-white/90 dark:bg-gray-700/90 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/30 dark:hover:to-gray-700/30 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
              >
                <svg className="w-5 h-5 group-hover:animate-bounce-gentle" fill="#1f2328 dark:fill-white" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="ml-2">GitHub 🐙</span>
              </button>
            </div>
          </div>
        </form>

        {/* Additional Links */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account? 🌟{' '}
            <Link href="/auth/signin" className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-300 underline decoration-wavy hover:scale-105 inline-block">
              Sign in here! 🔐
            </Link>
          </div>
          <div className="text-sm">
            <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 underline hover:scale-105 group">
              <span className="group-hover:animate-bounce-gentle mr-2">🏠</span>
              Back to NewsNerve Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
