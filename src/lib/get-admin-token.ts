// Utility to get admin authentication token
// This consolidates token retrieval across all admin pages

import { AdminJWTBridge } from './admin-jwt-bridge';

/**
 * Get the admin authentication token
 * Tries multiple sources and generates JWT from session if needed
 */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try to get existing tokens first
  const existingToken = 
    localStorage.getItem('adminToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('newstrnt_admin_jwt_token') ||
    localStorage.getItem('newstrnt_secure_token');
  
  if (existingToken) {
    return existingToken;
  }
  
  // Try to generate from session using AdminJWTBridge
  try {
    const jwtToken = AdminJWTBridge.getJWTToken();
    if (jwtToken) {
      // Also store as 'adminToken' for consistency
      localStorage.setItem('adminToken', jwtToken);
      return jwtToken;
    }
  } catch (error) {
    console.error('Error generating JWT token:', error);
  }
  
  return null;
}

/**
 * Get auth headers for API requests
 */
export function getAdminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Check if admin is authenticated
 */
export function isAdminAuthenticated(): boolean {
  return getAdminToken() !== null;
}
