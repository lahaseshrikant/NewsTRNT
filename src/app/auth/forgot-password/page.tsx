"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate password reset request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 dark:bg-green-800/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-800/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-200 dark:bg-pink-800/50 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse-custom"></div>
        </div>

        <div className="max-w-md w-full space-y-8 text-center relative z-10">
          <div className="animate-fade-in">
            <Link href="/" className="inline-block group">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 animate-gradient">
                ✨ NewsNerve
              </h1>
            </Link>
            <div className="mt-8 bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 animate-slide-in">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg animate-bounce-gentle">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 animate-bounce-gentle">
                Check Your Email! 📧
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                We've sent a magical reset link to <br />
                <strong className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold text-xl">{email}</strong> ✨
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Didn't receive the email? Check your spam folder or try again! 🔍
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold text-lg transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 animate-gradient"
                >
                  🔄 Try Again
                </button>
                <Link
                  href="/auth/signin"
                  className="block w-full text-center py-4 px-6 border-2 border-purple-200 rounded-2xl text-purple-700 hover:bg-purple-50 transition-all duration-300 font-bold text-lg transform hover:scale-105 hover:border-purple-300"
                >
                  🔐 Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse-custom"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <Link href="/" className="inline-block group">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 animate-gradient">
              ✨ NewsNerve
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-800 animate-bounce-gentle">
            Forgot Password? 🤔
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            No worries! We'll send you a magical reset link faster than breaking news! 📰⚡
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 hover:shadow-purple-200/50 transition-all duration-500 animate-slide-in" onSubmit={handleSubmit}>
          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-purple-600 transition-colors duration-300">
              📧 Your Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-4 border border-gray-200 rounded-2xl shadow-sm bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 hover:border-purple-300 transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm text-lg"
              placeholder="your.awesome.email@example.com 🚀"
            />
            <p className="mt-2 text-sm text-gray-500 italic">
              ✨ We'll send the reset link here faster than you can say "breaking news"!
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 animate-gradient"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                {isLoading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="text-2xl group-hover:animate-bounce-gentle">🪄</span>
                )}
              </span>
              {isLoading ? 'Sending magic link... ✨' : 'Send Reset Magic! 🎉'}
            </button>
          </div>
        </form>

        {/* Additional Links */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-sm">
            <Link href="/auth/signin" className="inline-flex items-center font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300 underline decoration-wavy hover:scale-105 group text-lg">
              <span className="group-hover:animate-bounce-gentle mr-2">🔐</span>
              Remember now? Back to Sign In!
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            New to our amazing platform? 🌟{' '}
            <Link href="/auth/signup" className="font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hover:from-teal-600 hover:to-green-600 transition-all duration-300 underline decoration-wavy hover:scale-105 inline-block">
              Join the NewsNerve family! 🎉
            </Link>
          </div>
          <div className="text-sm">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-all duration-300 underline hover:scale-105 group">
              <span className="group-hover:animate-bounce-gentle mr-2">🏠</span>
              Back to NewsNerve Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
