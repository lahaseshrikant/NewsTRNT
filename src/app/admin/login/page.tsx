"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const { isAuthenticated } = UnifiedAdminAuth.isAuthenticated();
      if (isAuthenticated) {
        router.push('/admin');
        return;
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = UnifiedAdminAuth.login(credentials.email, credentials.password);

      if (result.success) {
        router.push('/admin');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NewsTRNT Admin
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Unified Admin System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                value={credentials.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="admin@NewsTRNT.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Admin Portal'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">Admin Types:</p>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">👨‍💼 ADMIN</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Content, Users, Analytics</p>
                <div className="text-sm space-y-1">
                  <div className="text-gray-800 dark:text-gray-200 font-mono">admin@NewsTRNT.com</div>
                  <div className="text-gray-800 dark:text-gray-200 font-mono">NewsTRNT!Admin#2025</div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-semibold text-center">👑 SUPER ADMIN</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">System, Logo, Database</p>
                <div className="text-sm space-y-1 text-center">
                  <div className="text-gray-800 dark:text-gray-200 font-mono">superadmin@NewsTRNT.com</div>
                  <div className="text-gray-800 dark:text-gray-200 font-mono">NewsTRNT!SuperAdmin#2025</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 NewsTRNT. Unified Admin System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
