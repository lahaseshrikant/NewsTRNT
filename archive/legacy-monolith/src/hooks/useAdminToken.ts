'use client';

/**
 * Hook to get the admin authentication token
 * Tries multiple sources and can generate from session if needed
 */
export function useAdminToken() {
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try direct token first
    let token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    // If no token, try to generate from session
    if (!token) {
      const sessionData = localStorage.getItem('newstrnt_admin_session');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          // Create a token from session data matching backend expectations
          const tokenPayload = {
            userId: session.userId,
            email: session.email,
            role: session.role,
            isAdmin: true,
            sessionId: session.sessionId,
            timestamp: session.timestamp || Date.now(),
            permissions: session.permissions || []
          };
          token = btoa(JSON.stringify(tokenPayload));
          // Store it for future use
          localStorage.setItem('adminToken', token);
        } catch (e) {
          console.error('Error parsing session:', e);
        }
      }
    }
    
    return token;
  };
  
  return { getToken };
}

/**
 * Standalone function to get admin token (for use in non-hook contexts)
 */
export function getAdminAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try direct token first
  let token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  
  // If no token, try to generate from session
  if (!token) {
    const sessionData = localStorage.getItem('newstrnt_admin_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // Create a token from session data matching backend expectations
        const tokenPayload = {
          userId: session.userId,
          email: session.email,
          role: session.role,
          isAdmin: true,
          sessionId: session.sessionId,
          timestamp: session.timestamp || Date.now(),
          permissions: session.permissions || []
        };
        token = btoa(JSON.stringify(tokenPayload));
        // Store it for future use
        localStorage.setItem('adminToken', token);
      } catch (e) {
        console.error('Error parsing session:', e);
      }
    }
  }
  
  return token;
}
