'use client';

import adminAuth from '@/lib/admin-auth';

/**
 * Hook to get the admin authentication token
 * Uses the unified admin-auth module
 */
export function useAdminToken() {
  const getToken = (): string | null => {
    return adminAuth.getToken();
  };
  
  return { getToken };
}

/**
 * Standalone function to get admin token (for use in non-hook contexts)
 */
export function getAdminAuthToken(): string | null {
  return adminAuth.getToken();
}

