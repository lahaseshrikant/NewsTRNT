"use client";

import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLayoutContent from './AdminLayoutContent';

interface AdminProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdminProtected: React.FC<AdminProtectedProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isAdmin, loading } = useAdminAuth();

  // Show loading spinner with better design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin with better design
  if (!isAuthenticated || !isAdmin) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🚫</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
              <p className="text-gray-600 dark:text-gray-400">
                You need admin credentials to access this area.
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Go to Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content with admin layout
  return (
    <AdminLayoutContent>
      {children}
    </AdminLayoutContent>
  );
};

export default AdminProtected;
