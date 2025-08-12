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
      // Simulate password reset request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Something went wrong. Please try again!');
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
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-800/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-1000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 dark:bg-purple-800/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-500"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center animate-fade-in">
            <Link href="/" className="inline-block group">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 animate-gradient">
                ✨ NewsTRNT
              </h1>
            </Link>
            <div className="mt-8 space-y-6">
              <div className="text-6xl animate-bounce-gentle">📧</div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 animate-bounce-gentle">
                Email Sent! 🎉
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  We've sent a magical password reset link to your email! ✨
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    🔍 <strong>Don't see it?</strong> Check your spam folder - sometimes magic gets lost! 🧙‍♂️
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="text-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Background Elements - More Playful */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-16 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 rounded-full opacity-30 dark:opacity-40 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 dark:from-pink-500 dark:to-red-500 rounded-full opacity-30 dark:opacity-40 animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-8 w-20 h-20 bg-gradient-to-br from-green-400 to-teal-400 dark:from-green-500 dark:to-teal-500 rounded-full opacity-30 dark:opacity-40 animate-float delay-700"></div>
        <div className="absolute bottom-20 right-32 w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-400 dark:from-purple-500 dark:to-indigo-500 rounded-full opacity-30 dark:opacity-40 animate-bounce delay-1000"></div>
        
        {/* Fun Memory Icons */}
        <div className="absolute top-24 left-1/4 text-2xl animate-bounce delay-500">🧠</div>
        <div className="absolute top-32 right-1/4 text-xl animate-pulse delay-1000">💭</div>
        <div className="absolute bottom-40 left-1/3 text-3xl animate-float delay-700">🔑</div>
        <div className="absolute bottom-28 right-1/3 text-2xl animate-bounce delay-200">💡</div>
      </div>

      <div className="max-w-md w-full space-y-4 relative z-10">
        {/* Compact Header */}
        <div className="text-center animate-fade-in">
          <Link href="/" className="inline-block group">
            <div className="relative">
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 animate-gradient">
                ✨ NewsTRNT
              </h1>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping"></div>
            </div>
          </Link>
          
          <div className="mt-4 space-y-2">
            {/* Compact Memory Loss Animation */}
            <div className="flex justify-center items-center space-x-2 mb-2">
              <span className="text-4xl animate-bounce">🤔</span>
              <span className="text-3xl animate-pulse delay-300">💭</span>
              <span className="text-4xl animate-bounce delay-500">❓</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight animate-bounce-gentle">
              Memory.exe stopped working! 🧠💥
            </h2>
            
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
              Don't worry! Even superheroes forget passwords! 🦸‍♂️✨
            </p>
          </div>
        </div>

        {/* Compact Form - Action First */}
        <div className="mt-4 animate-slide-in-bottom">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl p-6 space-y-4">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="inline-flex items-center space-x-2">
                    <span>📧 Your Email Address</span>
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-white/90 dark:bg-gray-700/90 border-2 border-gray-300 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300"
                    placeholder="your.awesome.email@domain.com 💌"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <span className="text-xl">📬</span>
                  </div>
                </div>
              </div>

              {/* Main Action Button - Immediately visible */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:transform-none overflow-hidden"
              >
                <span className="relative flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending Magic... 🪄✨</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🚀</span>
                      <span>Send Reset Link!</span>
                      <span className="text-xl group-hover:animate-bounce">📧</span>
                    </>
                  )}
                </span>
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-2xl p-3 animate-shake">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">😱</span>
                    <p className="text-red-600 dark:text-red-400 font-medium text-sm">
                      Oops! {error} Try again, hero! 🦸‍♀️
                    </p>
                  </div>
                </div>
              )}

              {isSubmitted && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-4 animate-bounce-gentle">
                  <div className="text-center space-y-2">
                    <div className="flex justify-center space-x-2">
                      <span className="text-2xl animate-bounce">🎉</span>
                      <span className="text-2xl animate-pulse delay-200">📨</span>
                      <span className="text-2xl animate-bounce delay-400">✅</span>
                    </div>
                    <p className="text-green-600 dark:text-green-400 font-semibold">
                      Mission Accomplished! 🚀
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      Check your inbox for the magical reset link! 🪄✨
                    </p>
                  </div>
                </div>
              )}
            </form>

            {/* Compact Pro Tip */}
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-700">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  💡 <strong>Pro tip:</strong> Use a password manager next time! 🔐✨
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Additional Links */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="text-sm">
            <Link href="/auth/signin" className="inline-flex items-center font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300 underline decoration-wavy hover:scale-105 group">
              <span className="mr-2 group-hover:animate-bounce">🔐</span>
              Remember your password? Sign in here!
              <span className="ml-2 group-hover:animate-bounce delay-100">✨</span>
            </Link>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🤝</span>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                <strong>Need help?</strong> Our support ninjas are standing by 24/7! 🥷💨
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
