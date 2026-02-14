'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, type User, type AuthResponse, type LoginCredentials, type RegisterData } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextType {
  /** Current authenticated user (null if not logged in) */
  user: User | null;
  /** Whether an auth check is in progress (initial load or validation) */
  loading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Login with email/password */
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  /** Register a new account */
  register: (data: RegisterData) => Promise<AuthResponse>;
  /** Log out the current user */
  logout: () => Promise<void>;
  /** Refresh user profile from backend */
  refreshUser: () => Promise<void>;
  /** Update user profile */
  updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
  /** Change password */
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>;
  /** Get auth headers for API calls */
  getAuthHeaders: () => { [key: string]: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Custom event name for auth state changes ───────────────────────────────

const AUTH_CHANGE_EVENT = 'authStatusChanged';

function dispatchAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage, then validate with backend
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Quick local check first
        const storedUser = authService.getUser();
        const token = authService.getToken();

        if (storedUser && token) {
          setUser(storedUser);
          // Validate token with backend in background
          const result = await authService.getCurrentUser();
          if (result.success && result.user) {
            setUser(result.user);
          } else {
            // Token invalid — clear state
            setUser(null);
          }
        }
      } catch {
        // Network error — keep local state if available
        const storedUser = authService.getUser();
        if (storedUser) setUser(storedUser);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for cross-tab auth changes and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newsnerve_auth_token' || e.key === 'newsnerve_user') {
        const updatedUser = authService.getUser();
        const token = authService.getToken();
        setUser(updatedUser && token ? updatedUser : null);
      }
    };

    const handleAuthChange = () => {
      const updatedUser = authService.getUser();
      const token = authService.getToken();
      setUser(updatedUser && token ? updatedUser : null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const result = await authService.login(credentials);
    if (result.success && result.user) {
      setUser(result.user);
      dispatchAuthChange();
    }
    return result;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    const result = await authService.register(data);
    if (result.success && result.user) {
      setUser(result.user);
      dispatchAuthChange();
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    dispatchAuthChange();
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await authService.getCurrentUser();
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<AuthResponse> => {
    const result = await authService.updateProfile(data);
    if (result.success && result.user) {
      setUser(result.user);
      dispatchAuthChange();
    }
    return result;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    return authService.changePassword(currentPassword, newPassword);
  }, []);

  const getAuthHeaders = useCallback(() => {
    return authService.getAuthHeaders();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
