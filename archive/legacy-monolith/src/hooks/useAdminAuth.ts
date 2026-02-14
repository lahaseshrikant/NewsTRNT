"use client";

import { useState, useEffect } from 'react';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';

interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  loading: boolean;
}

export const useAdminAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    loading: true,
  });

  const verifyAdminAuth = () => {
    try {
      const { isAuthenticated, session } = UnifiedAdminAuth.isAuthenticated();
      
      if (isAuthenticated && session) {
        setAuthState({
          isAuthenticated: true,
          isAdmin: session.role === 'ADMIN' || session.role === 'SUPER_ADMIN',
          user: {
            id: session.userId,
            email: session.email,
            name: session.email.split('@')[0],
            fullName: session.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin',
            isAdmin: session.role === 'ADMIN' || session.role === 'SUPER_ADMIN',
            isSuperAdmin: session.role === 'SUPER_ADMIN'
          },
          loading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    verifyAdminAuth();
  }, []);

  const logout = () => {
    UnifiedAdminAuth.logout();
    setAuthState({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      loading: false,
    });
    window.location.href = '/admin/login';
  };

  return {
    ...authState,
    logout,
    verifyAuth: verifyAdminAuth,
  };
};
