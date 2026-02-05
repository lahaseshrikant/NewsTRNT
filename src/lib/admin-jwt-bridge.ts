// JWT Token Bridge for Admin Authentication
import UnifiedAdminAuth from './unified-admin-auth';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export class AdminJWTBridge {
  // Client-side JWT signing key - this is for local session tracking only
  // The actual server-side JWT verification uses the server's JWT_SECRET
  private static JWT_SECRET = typeof window !== 'undefined' 
    ? (localStorage.getItem('client_jwt_key') || (() => {
        const key = 'client-jwt-' + Math.random().toString(36).slice(2);
        localStorage.setItem('client_jwt_key', key);
        return key;
      })())
    : 'server-side-placeholder';
  private static TOKEN_KEY = 'newstrnt_admin_jwt_token';

  /**
   * Generate JWT token for authenticated admin
   */
  static generateJWTToken(): string | null {
    const authStatus = UnifiedAdminAuth.isAuthenticated();
    if (!authStatus.isAuthenticated || !authStatus.session) {
      return null;
    }

    const { session } = authStatus;
    const payload: JWTPayload = {
      id: session.userId,
      email: session.email,
      role: session.role,
      isAdmin: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(session.expiresAt / 1000)
    };

    // Simple JWT implementation (in production, use proper JWT library)
    const token = this.createJWT(payload);
    
    // Store the token
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    
    return token;
  }

  /**
   * Get current JWT token (generate if needed)
   */
  static getJWTToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Check if we have a valid admin session
    const authStatus = UnifiedAdminAuth.isAuthenticated();
    if (!authStatus.isAuthenticated) {
      this.clearJWTToken();
      return null;
    }

    // Check if we have a stored token
    let token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      // Generate new token
      token = this.generateJWTToken();
    } else {
      // Validate existing token
      if (!this.isTokenValid(token)) {
        // Regenerate token
        token = this.generateJWTToken();
      }
    }

    return token;
  }

  /**
   * Clear JWT token
   */
  static clearJWTToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Login with JWT token generation
   */
  static async login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const result = await UnifiedAdminAuth.login(email, password);
    
    if (result.success) {
      const token = this.generateJWTToken();
      if (token) {
        return { success: true, token };
      } else {
        return { success: false, error: 'Failed to generate authentication token' };
      }
    }
    
    return { success: false, error: result.error };
  }

  /**
   * Logout and clear tokens
   */
  static logout(): void {
    UnifiedAdminAuth.logout();
    this.clearJWTToken();
  }

  /**
   * Simple JWT creation (use proper JWT library in production)
   */
  private static createJWT(payload: JWTPayload): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.createSignature(encodedHeader + '.' + encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Validate JWT token
   */
  private static isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Check expiration
      if (payload.exp < now) return false;

      // Verify signature
      const expectedSignature = this.createSignature(parts[0] + '.' + parts[1]);
      return expectedSignature === parts[2];
    } catch (error) {
      return false;
    }
  }

  /**
   * Create signature for JWT
   */
  private static createSignature(data: string): string {
    // Simple HMAC-like signature (use proper HMAC in production)
    let hash = 0;
    const combined = data + this.JWT_SECRET;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return this.base64UrlEncode(hash.toString());
  }

  /**
   * Base64 URL encode
   */
  private static base64UrlEncode(str: string): string {
    if (typeof window !== 'undefined') {
      return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
    return Buffer.from(str).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64 URL decode
   */
  private static base64UrlDecode(str: string): string {
    str += new Array(5 - str.length % 4).join('=');
    str = str.replace(/\-/g, '+').replace(/_/g, '/');
    
    if (typeof window !== 'undefined') {
      return atob(str);
    }
    return Buffer.from(str, 'base64').toString();
  }

  /**
   * Check if user is admin and authenticated
   */
  static isAdminAuthenticated(): boolean {
    const token = this.getJWTToken();
    if (!token) return false;

    return this.isTokenValid(token) && UnifiedAdminAuth.isAuthenticated().isAuthenticated;
  }

  /**
   * Get current admin user info from token
   */
  static getCurrentAdminUser(): JWTPayload | null {
    const token = this.getJWTToken();
    if (!token || !this.isTokenValid(token)) return null;

    try {
      const parts = token.split('.');
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }
}

export default AdminJWTBridge;