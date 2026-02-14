// src/lib/unified-admin-auth.ts - Secure Admin Authentication System
// NOTE: In production, admin users should be stored in the database, not environment variables

import * as crypto from 'crypto';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  permissions: readonly string[];
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminSession {
  userId: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  permissions: readonly string[];
  loginTime: number;
  expiresAt: number;
  sessionId: string;
  timestamp: number;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  session?: AdminSession;
  requiresMFA?: boolean;
}

// Permission definitions
export const ADMIN_PERMISSIONS = {
  // Content Management
  'content.read': 'View articles and content',
  'content.write': 'Create and edit content',
  'content.delete': 'Delete content',
  'content.publish': 'Publish/unpublish content',
  
  // User Management
  'users.read': 'View user data',
  'users.manage': 'Manage user accounts',
  'users.ban': 'Ban/unban users',
  
  // Analytics
  'analytics.read': 'View analytics and reports',
  'analytics.export': 'Export analytics data',
  
  // System Management (Super Admin only)
  'system.settings': 'Change system settings',
  'system.logo': 'Change logos and branding',
  'system.database': 'Database management',
  'system.security': 'Security configuration',
  'system.admin': 'Manage admin accounts',
  
  // Categories and Tags
  'categories.manage': 'Manage news categories',
  'tags.manage': 'Manage content tags',
  
  // Comments and Moderation
  'comments.moderate': 'Moderate user comments',
  'comments.delete': 'Delete comments',
} as const;

// Role-based permissions
const ROLE_PERMISSIONS = {
  ADMIN: [
    'content.read', 'content.write', 'content.delete', 'content.publish',
    'users.read', 'users.manage', 'users.ban',
    'analytics.read', 'analytics.export',
    'categories.manage', 'tags.manage',
    'comments.moderate', 'comments.delete'
  ],
  SUPER_ADMIN: [
    // All admin permissions plus system permissions
    ...Object.keys(ADMIN_PERMISSIONS)
  ]
} as const;

class UnifiedAdminAuth {
  private static readonly SESSION_KEY = 'newstrnt_admin_session';
  private static readonly SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  /**
   * Generate cryptographically secure session ID
   */
  private static generateSessionId(): string {
    // Use crypto API on server, fallback on client
    if (typeof window === 'undefined') {
      return crypto.randomBytes(32).toString('hex');
    }
    // Client-side fallback using Web Crypto API
    const array = new Uint8Array(32);
    globalThis.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Admin login with secure password verification
   * Always uses server-side API for authentication (env vars are not accessible client-side)
   * This method should ONLY be called from the client-side (browser)
   */
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // This should only be called from client-side
      if (typeof window === 'undefined') {
        console.error('UnifiedAdminAuth.login() called on server side - this is not supported');
        return { success: false, error: 'Authentication must be done client-side' };
      }

      // Use the server-side API for authentication
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      console.log('🔐 Login API response:', { success: result.success, hasSession: !!result.session, hasToken: !!result.token });
      
      if (result.success && result.session) {
        // Store session in localStorage
        console.log('💾 Storing session with keys:', Object.keys(result.session));
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(result.session));
        
        // Also store the token if provided by the API
        if (result.token) {
          localStorage.setItem('adminToken', result.token);
          localStorage.setItem('token', result.token);
        }
        
        // Verify storage
        const stored = localStorage.getItem(this.SESSION_KEY);
        console.log('✅ Session stored successfully:', stored ? 'Yes' : 'No');
        
        return { success: true, session: result.session };
      }
      
      return { success: false, error: result.error || 'Authentication failed' };
    } catch (error) {
      console.error('API auth error:', error);
      return { success: false, error: 'Authentication service unavailable' };
    }
  }

  /**
   * Check authentication status
   */
  static isAuthenticated(): { isAuthenticated: boolean; session?: AdminSession } {
    try {
      if (typeof window === 'undefined') {
        return { isAuthenticated: false };
      }
      
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return { isAuthenticated: false };
      }
      
      const session: AdminSession = JSON.parse(sessionData);
      
      // Check expiration
      if (Date.now() > session.expiresAt) {
        this.logout();
        return { isAuthenticated: false };
      }
      
      // Verify session structure
      if (!session.userId || !session.email || !session.sessionId) {
        this.logout();
        return { isAuthenticated: false };
      }
      
      return { isAuthenticated: true, session };
    } catch {
      this.logout();
      return { isAuthenticated: false };
    }
  }

  /**
   * Validate session from token (for API routes)
   */
  static validateSession(token: string): { valid: boolean; session?: AdminSession; error?: string } {
    try {
      if (!token) {
        return { valid: false, error: 'No token provided' };
      }

      // Decode base64 token
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const session: AdminSession = JSON.parse(decoded);

      // Validate session structure
      if (!session.userId || !session.email || !session.sessionId || !session.timestamp) {
        return { valid: false, error: 'Invalid token structure' };
      }

      // Check expiration
      const maxAge = 2 * 60 * 60 * 1000; // 2 hours
      if (Date.now() - session.timestamp > maxAge) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, session };
    } catch {
      return { valid: false, error: 'Invalid token' };
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    const { isAuthenticated, session } = this.isAuthenticated();
    if (!isAuthenticated || !session) return false;
    
    // Check for wildcard permission (super admin has all permissions)
    if (session.permissions.includes('*')) return true;
    
    return session.permissions.includes(permission);
  }

  /**
   * Check if user is Super Admin
   */
  static isSuperAdmin(): boolean {
    const { isAuthenticated, session } = this.isAuthenticated();
    return isAuthenticated && session?.role === 'SUPER_ADMIN';
  }

  /**
   * Check if user is Admin (any level)
   */
  static isAdmin(): boolean {
    const { isAuthenticated, session } = this.isAuthenticated();
    return isAuthenticated && (session?.role === 'ADMIN' || session?.role === 'SUPER_ADMIN');
  }

  /**
   * Get current admin user info
   */
  static getCurrentAdmin(): AdminSession | null {
    const { isAuthenticated, session } = this.isAuthenticated();
    return isAuthenticated ? session || null : null;
  }

  /**
   * Logout admin
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
      // Also clear any other auth-related storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_auth');
    }
  }

  /**
   * Refresh session (extend expiration)
   */
  static refreshSession(): boolean {
    const { isAuthenticated, session } = this.isAuthenticated();
    
    if (!isAuthenticated || !session) return false;
    
    const newSession: AdminSession = {
      ...session,
      expiresAt: Date.now() + this.SESSION_DURATION,
      timestamp: Date.now()
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(newSession));
    }
    
    return true;
  }

  /**
   * Get all admin users (Super Admin only)
   * NOTE: In production, this should call an API endpoint to fetch users
   */
  static getAdminUsers(): Omit<AdminUser, 'passwordHash'>[] {
    if (!this.isSuperAdmin()) {
      throw new Error('Unauthorized: Super Admin access required');
    }
    
    // Return empty array - admin users should be fetched via API
    // This is a placeholder for frontend type compatibility
    return [];
  }
}

export default UnifiedAdminAuth;
