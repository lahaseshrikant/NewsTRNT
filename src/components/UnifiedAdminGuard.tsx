// src/components/UnifiedAdminGuard.tsx - Single Admin Protection Component
'use client';

import { ReactNode, useEffect, useState } from 'react';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';

interface UnifiedAdminGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requireSuperAdmin?: boolean;
}

const UnifiedAdminGuard = ({ 
  children, 
  requiredPermission,
  requireSuperAdmin = false 
}: UnifiedAdminGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, [requiredPermission, requireSuperAdmin]);

  const checkAuth = () => {
    const { isAuthenticated, session } = UnifiedAdminAuth.isAuthenticated();
    
    if (isAuthenticated && session) {
      setIsAuthenticated(true);
      setAdminInfo(session);
      
      // Check permissions
      if (requireSuperAdmin) {
        setHasPermission(session.role === 'SUPER_ADMIN');
      } else if (requiredPermission) {
        setHasPermission(session.permissions.includes(requiredPermission));
      } else {
        setHasPermission(true); // Just need to be admin
      }
    } else {
      setIsAuthenticated(false);
      setHasPermission(false);
      setAdminInfo(null);
    }
    
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = UnifiedAdminAuth.login(loginData.email, loginData.password);
    
    if (result.success) {
      checkAuth(); // Refresh auth state
    } else {
      setError(result.error || 'Login failed');
      setLoginData(prev => ({ ...prev, password: '' }));
    }
  };

  const handleLogout = () => {
    UnifiedAdminAuth.logout();
    setIsAuthenticated(false);
    setHasPermission(false);
    setAdminInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                NewsTRNT Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {requireSuperAdmin ? 'Super Admin Access Required' : 'Admin Access Required'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@newstrnt.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Access Admin Panel
              </button>
            </form>

            {/* Credentials display */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                Admin Credentials:
              </p>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Regular Admin:</p>
                  <div className="text-sm space-y-1">
                    <div className="text-gray-800 dark:text-gray-200 font-mono">admin@newstrnt.com</div>
                    <div className="text-gray-800 dark:text-gray-200 font-mono">NewsTRNT!Admin#2025</div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Super Admin:</p>
                  <div className="text-sm space-y-1 text-center">
                    <div className="text-gray-800 dark:text-gray-200 font-mono">superadmin@newstrnt.com</div>
                    <div className="text-gray-800 dark:text-gray-200 font-mono">NewsTRNT!SuperAdmin#2025</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back link */}
            <div className="mt-6 text-center">
              <a 
                href="/" 
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                ← Back to NewsTRNT
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🚫</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Insufficient Permissions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {requireSuperAdmin 
                  ? 'This area requires Super Admin access.'
                  : `You need the "${requiredPermission}" permission to access this area.`
                }
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Current role: <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {adminInfo?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium"
            >
              Logout & Login with Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and has permission
  return <>{children}</>;
};

export default UnifiedAdminGuard;
