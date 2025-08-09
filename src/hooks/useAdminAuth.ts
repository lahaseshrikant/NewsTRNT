"use client";

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  isAdmin: boolean;
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

  const verifyAdminAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          loading: false,
        });
        return;
      }

      // Verify token with backend
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        // Check if user is admin
        if (user && user.isAdmin) {
          setAuthState({
            isAuthenticated: true,
            isAdmin: true,
            user,
            loading: false,
          });
        } else {
          // User is authenticated but not admin
          setAuthState({
            isAuthenticated: true,
            isAdmin: false,
            user,
            loading: false,
          });
          // Clear admin-related storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } else {
        // Token is invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
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
