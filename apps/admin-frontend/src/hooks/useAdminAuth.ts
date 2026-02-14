"use client";

import { useState, useEffect } from 'react';
import adminAuth from '@/lib/admin-auth';

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
      const authenticated = adminAuth.isAuthenticated();
      const currentUser = adminAuth.getUser();

      if (authenticated && currentUser) {
        setAuthState({
          isAuthenticated: true,
          isAdmin: currentUser.isAdmin,
          user: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.username || currentUser.email.split('@')[0],
            fullName: currentUser.fullName,
            isAdmin: currentUser.isAdmin,
            isSuperAdmin: currentUser.isSuperAdmin,
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

  const logout = async () => {
    await adminAuth.logout();
    setAuthState({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      loading: false,
    });
    window.location.href = '/login';
  };

  return {
    ...authState,
    logout,
    verifyAuth: verifyAdminAuth,
  };
};

