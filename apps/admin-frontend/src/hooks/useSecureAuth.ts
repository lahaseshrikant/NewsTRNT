// src/hooks/useSecureAuth.ts - Unified secure authentication hook
"use client";

import { useState, useEffect, useCallback } from 'react';
import { SecurityManager } from '@/lib/security';

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  lastLogin?: Date;
}

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  csrfToken: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    isSuperAdmin: false,
    user: null,
    loading: true,
    error: null,
    csrfToken: null
  });

  const [fingerprint, setFingerprint] = useState<string>('');

  // Generate device fingerprint
  useEffect(() => {
    const generateFingerprint = () => {
      const userAgent = navigator.userAgent;
      const screen = `${window.screen.width}x${window.screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      
      const data = `${userAgent}:${screen}:${timezone}:${language}`;
      return SecurityManager.generateFingerprint(data, 'client-side');
    };

    setFingerprint(generateFingerprint());
  }, []);

  // Verify existing authentication on mount
  useEffect(() => {
    verifyExistingAuth();
  }, []);

  /**
   * Verify existing authentication
   */
  const verifyExistingAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('newstrnt_secure_token');
      const sessionId = localStorage.getItem('newstrnt_session_id');
      const csrfToken = localStorage.getItem('newstrnt_csrf_token');

      if (!token || !sessionId) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
          'X-Fingerprint': fingerprint
        },
        body: JSON.stringify({ token, sessionId, csrfToken })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Update CSRF token
          if (data.csrfToken) {
            localStorage.setItem('newstrnt_csrf_token', data.csrfToken);
          }

          setAuthState({
            isAuthenticated: true,
            isAdmin: data.user.isAdmin,
            isSuperAdmin: data.user.isSuperAdmin,
            user: data.user,
            loading: false,
            error: null,
            csrfToken: data.csrfToken
          });
        } else {
          throw new Error(data.error);
        }
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem('newstrnt_secure_token');
      localStorage.removeItem('newstrnt_session_id');
      localStorage.removeItem('newstrnt_csrf_token');
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication verification failed'
      }));
    }
  }, [fingerprint]);

  /**
   * Login with enhanced security
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<{
    success: boolean;
    error?: string;
    requiresMFA?: boolean;
    remainingAttempts?: number;
    lockedUntil?: number;
  }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fingerprint': fingerprint
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        // Store secure tokens
        localStorage.setItem('newstrnt_secure_token', data.token);
        localStorage.setItem('newstrnt_session_id', data.sessionId);
        localStorage.setItem('newstrnt_csrf_token', data.csrfToken);

        setAuthState({
          isAuthenticated: true,
          isAdmin: data.user.isAdmin,
          isSuperAdmin: data.user.isSuperAdmin,
          user: data.user,
          loading: false,
          error: null,
          csrfToken: data.csrfToken
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, loading: false, error: data.error }));
        return {
          success: false,
          error: data.error,
          requiresMFA: data.requiresMFA,
          remainingAttempts: data.remainingAttempts,
          lockedUntil: data.lockedUntil
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [fingerprint]);

  /**
   * Logout and destroy session
   */
  const logout = useCallback(async () => {
    try {
      const sessionId = localStorage.getItem('newstrnt_session_id');
      const csrfToken = localStorage.getItem('newstrnt_csrf_token');

      if (sessionId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || '',
            'X-Fingerprint': fingerprint
          },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('newstrnt_secure_token');
      localStorage.removeItem('newstrnt_session_id');
      localStorage.removeItem('newstrnt_csrf_token');

      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false,
        user: null,
        loading: false,
        error: null,
        csrfToken: null
      });
    }
  }, [fingerprint]);

  /**
   * Change password
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const csrfToken = localStorage.getItem('newstrnt_csrf_token');

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
          'X-Fingerprint': fingerprint
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password change failed'
      };
    }
  }, [fingerprint]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    if (authState.user.isSuperAdmin) return true;
    if (authState.user.permissions.includes('*')) return true;
    return authState.user.permissions.includes(permission);
  }, [authState.user]);

  /**
   * Get secure headers for API requests
   */
  const getSecureHeaders = useCallback(() => {
    const csrfToken = localStorage.getItem('newstrnt_csrf_token');
    return {
      'X-CSRF-Token': csrfToken || '',
      'X-Fingerprint': fingerprint,
      'Authorization': `Bearer ${localStorage.getItem('newstrnt_secure_token')}`
    };
  }, [fingerprint]);

  return {
    ...authState,
    login,
    logout,
    changePassword,
    hasPermission,
    getSecureHeaders,
    refreshAuth: verifyExistingAuth
  };
};

export default useSecureAuth;

