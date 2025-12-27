// src/lib/simple-admin-auth.ts - Compatibility layer for UnifiedAdminAuth
import UnifiedAdminAuth, { AdminSession, AuthResult } from './unified-admin-auth';

// Legacy session format for backward compatibility  
interface LegacySession {
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loginTime: number;
}

class SimpleAdminAuth {
  private static readonly LEGACY_SESSION_KEY = 'NewsTRNT_admin_session';
  
  /**
   * Login admin user
   */
  static login(email: string, password: string): { success: boolean; error?: string; session?: LegacySession } {
    const result = UnifiedAdminAuth.login(email, password);
    
    if (result.success && result.session) {
      // Store both new and legacy session formats for compatibility
      const legacySession: LegacySession = {
        email: result.session.email,
        isAdmin: result.session.role === 'ADMIN' || result.session.role === 'SUPER_ADMIN',
        isSuperAdmin: result.session.role === 'SUPER_ADMIN',
        loginTime: result.session.loginTime
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.LEGACY_SESSION_KEY, JSON.stringify(legacySession));
      }
      
      return { success: true, session: legacySession };
    }
    
    return { success: false, error: result.error };
  }
  
  /**
   * Check if admin is authenticated
   */
  static isAuthenticated(): { isAuthenticated: boolean; session?: LegacySession } {
    const authResult = UnifiedAdminAuth.isAuthenticated();
    
    if (authResult.isAuthenticated && authResult.session) {
      const legacySession: LegacySession = {
        email: authResult.session.email,
        isAdmin: authResult.session.role === 'ADMIN' || authResult.session.role === 'SUPER_ADMIN',
        isSuperAdmin: authResult.session.role === 'SUPER_ADMIN',
        loginTime: authResult.session.loginTime
      };
      
      return { isAuthenticated: true, session: legacySession };
    }
    
    return { isAuthenticated: false };
  }
  
  /**
   * Logout admin
   */
  static logout(): void {
    UnifiedAdminAuth.logout();
    
    // Also remove legacy session
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.LEGACY_SESSION_KEY);
    }
  }
  
  /**
   * Check if user has admin privileges
   */
  static isAdmin(): boolean {
    return UnifiedAdminAuth.isAdmin();
  }
  
  /**
   * Check if user is super admin
   */
  static isSuperAdmin(): boolean {
    return UnifiedAdminAuth.isSuperAdmin();
  }
  
  /**
   * Get session token for API calls
   */
  static getSessionToken(): string | null {
    const { isAuthenticated, session } = this.isAuthenticated();
    
    if (!isAuthenticated || !session) return null;
    
    // Create a simple token for API authentication
    const tokenData = {
      email: session.email,
      isAdmin: session.isAdmin,
      isSuperAdmin: session.isSuperAdmin,
      loginTime: session.loginTime,
      timestamp: Date.now()
    };
    
    // Simple base64 encoding for token (in production, use proper JWT)
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }
}

export default SimpleAdminAuth;