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
   * Secure password hashing using PBKDF2
   * Uses 100,000 iterations with SHA-512 for production-grade security
   */
  private static hashPassword(password: string): string {
    const salt = process.env.ADMIN_PASSWORD_SALT;
    if (!salt && process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_PASSWORD_SALT must be set in production!');
    }
    const effectiveSalt = salt || 'dev-only-salt-not-for-production';
    const iterations = 100000;
    const keyLength = 64;
    const digest = 'sha512';
    
    const hash = crypto.pbkdf2Sync(password, effectiveSalt, iterations, keyLength, digest);
    return hash.toString('hex');
  }

  /**
   * Verify password against hash
   */
  private static verifyPassword(password: string, hash: string): boolean {
    const computedHash = this.hashPassword(password);
    // Timing-safe comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
    } catch {
      return false;
    }
  }

  /**
   * Get admin users from environment variables
   * Format: ADMIN_USERS='[{"email":"admin@example.com","password":"secure_password","role":"ADMIN"}]'
   */
  private static getAdminUsersFromEnv(): AdminUser[] {
    const users: AdminUser[] = [];
    
    // Super Admin from env
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    
    if (superAdminEmail && superAdminPassword) {
      users.push({
        id: 'super-admin-env',
        email: superAdminEmail,
        username: 'SuperAdmin',
        passwordHash: this.hashPassword(superAdminPassword),
        role: 'SUPER_ADMIN',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
        isActive: true,
        lastLogin: null,
        createdAt: new Date().toISOString()
      });
    }
    
    // Regular Admin from env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      users.push({
        id: 'admin-env',
        email: adminEmail,
        username: 'Admin',
        passwordHash: this.hashPassword(adminPassword),
        role: 'ADMIN',
        permissions: ROLE_PERMISSIONS.ADMIN,
        isActive: true,
        lastLogin: null,
        createdAt: new Date().toISOString()
      });
    }
    
    // Fallback for development only (when no env vars set)
    if (users.length === 0 && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ WARNING: Using development fallback admin credentials. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in production!');
      users.push({
        id: 'dev-super-admin',
        email: 'admin@localhost',
        username: 'DevAdmin',
        passwordHash: this.hashPassword('devadmin123'),
        role: 'SUPER_ADMIN',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
        isActive: true,
        lastLogin: null,
        createdAt: new Date().toISOString()
      });
    }
    
    return users;
  }

  /**
   * Generate cryptographically secure session ID
   */
  private static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Admin login with secure password verification
   */
  static login(email: string, password: string): AuthResult {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();
      
      // Get admin users
      const adminUsers = this.getAdminUsersFromEnv();
      const user = adminUsers.find(u => u.email.toLowerCase() === normalizedEmail && u.isActive);
      
      if (!user) {
        // Use constant time comparison even for non-existent users to prevent timing attacks
        this.hashPassword('dummy_password_for_timing');
        return { success: false, error: 'Invalid admin credentials' };
      }
      
      // Verify password
      if (!this.verifyPassword(password, user.passwordHash)) {
        return { success: false, error: 'Invalid admin credentials' };
      }
      
      // Create session
      const now = Date.now();
      const session: AdminSession = {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        loginTime: now,
        expiresAt: now + this.SESSION_DURATION,
        sessionId: this.generateSessionId(),
        timestamp: now
      };
      
      // Store session (client-side)
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }
      
      return { success: true, session };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed' };
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
   * Get all admin users (Super Admin only, returns sanitized data)
   */
  static getAdminUsers(): Omit<AdminUser, 'passwordHash'>[] {
    if (!this.isSuperAdmin()) {
      throw new Error('Unauthorized: Super Admin access required');
    }
    
    return this.getAdminUsersFromEnv().map(({ passwordHash, ...user }) => user);
  }
}

export default UnifiedAdminAuth;
