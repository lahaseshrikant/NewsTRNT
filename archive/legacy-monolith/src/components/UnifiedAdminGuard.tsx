// src/components/UnifiedAdminGuard.tsx - Single Admin Protection Component
'use client';

import { ReactNode, useEffect, useState } from 'react';

// Client-side only: session storage keys
const SESSION_STORAGE_KEY = 'admin_session';
const SESSION_ID_KEY = 'admin_session_id';

interface AdminSession {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  loginTime: number;
  expiresAt: number;
}

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
  const [adminInfo, setAdminInfo] = useState<AdminSession | null>(null);

  useEffect(() => {
    checkAuth();
  }, [requiredPermission, requireSuperAdmin]);

  const checkAuth = () => {
    // Check client-side session storage (also check localStorage for consistency)
    try {
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY) || 
                          localStorage.getItem('newstrnt_admin_session');
      const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
      
      if (sessionData) {
        const session: AdminSession = JSON.parse(sessionData);
        
        // Check if session is expired
        if (session.expiresAt > Date.now()) {
          setIsAuthenticated(true);
          setAdminInfo(session);
          
          // Ensure admin token is available for API calls
          if (!localStorage.getItem('adminToken') && !localStorage.getItem('token')) {
            const tokenPayload = {
              userId: session.userId,
              email: session.email,
              role: session.role,
              isAdmin: true,
              sessionId: (session as any).sessionId || sessionId || '',
              timestamp: (session as any).timestamp || session.loginTime || Date.now(),
              permissions: session.permissions || []
            };
            const token = btoa(JSON.stringify(tokenPayload));
            localStorage.setItem('adminToken', token);
            localStorage.setItem('token', token);
          }
          
          // Sync to sessionStorage if only found in localStorage
          if (!sessionStorage.getItem(SESSION_STORAGE_KEY)) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, sessionData);
            // sessionId is not part of AdminSession, so don't try to access it here
            // Optionally, you can remove this line or handle sessionId differently if needed
            sessionStorage.setItem(SESSION_ID_KEY, '');
          }
          
          // Check permissions
          if (requireSuperAdmin) {
            setHasPermission(session.role === 'SUPER_ADMIN');
          } else if (requiredPermission) {
            setHasPermission(session.permissions.includes(requiredPermission));
          } else {
            setHasPermission(true);
          }
        } else {
          // Session expired, clear it
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(SESSION_ID_KEY);
          localStorage.removeItem('newstrnt_admin_session');
          setIsAuthenticated(false);
          setHasPermission(false);
          setAdminInfo(null);
        }
      } else {
        setIsAuthenticated(false);
        setHasPermission(false);
        setAdminInfo(null);
      }
    } catch {
      setIsAuthenticated(false);
      setHasPermission(false);
      setAdminInfo(null);
    }
    
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call server-side API for login (where env vars are available)
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();
      
      if (result.success && result.session) {
        // Store session in sessionStorage (client-side only)
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.session));
        sessionStorage.setItem(SESSION_ID_KEY, result.sessionId);
        // Also store in localStorage for consistency with UnifiedAdminAuth
        localStorage.setItem('newstrnt_admin_session', JSON.stringify(result.session));
        checkAuth(); // Refresh auth state
      } else {
        setError(result.error || 'Login failed');
        setLoginData(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoginData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem('newstrnt_admin_session');
    setIsAuthenticated(false);
    setHasPermission(false);
    setAdminInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                NewsTRNT Admin
              </h1>
              <p className="text-gray-600 dark:text-slate-400">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@newstrnt.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Development hint - no credentials shown */}
            {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-slate-400 text-center">
                💡 Use credentials from your <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">.env.local</code> file
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500 text-center mt-2">
                See SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD or ADMIN_EMAIL / ADMIN_PASSWORD
              </p>
            </div>
            )}

            {/* Back link */}
            <div className="mt-6 text-center">
              <a 
                href="/" 
                className="text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🚫</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Insufficient Permissions
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                {requireSuperAdmin 
                  ? 'This area requires Super Admin access.'
                  : `You need the "${requiredPermission}" permission to access this area.`
                }
              </p>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Current role: <span className="font-semibold text-gray-700 dark:text-slate-300">
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

