// src/lib/unified-admin-auth.ts - Single Admin Authentication System
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
  
  // Default admin users (in production, these should be in a secure database)
  private static adminUsers: AdminUser[] = [
    {
      id: 'super-admin-1',
      email: 'superadmin@newstrnt.com',
      username: 'SuperAdmin',
      passwordHash: this.hashPassword('NewsTRNT!SuperAdmin#2025'),
      role: 'SUPER_ADMIN',
      permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'admin-1',
      email: 'admin@newstrnt.com',
      username: 'Admin',
      passwordHash: this.hashPassword('NewsTRNT!Admin#2025'),
      role: 'ADMIN',
      permissions: ROLE_PERMISSIONS.ADMIN,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString()
    }
  ];

  /**
   * Secure password hashing
   */
  private static hashPassword(password: string): string {
    // Simple but secure hash for demo (in production, use bcrypt)
    let hash = 0;
    const salt = 'newstrnt_salt_2025';
    const combined = password + salt;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36) + '_secure';
  }

  /**
   * Generate session ID
   */
  private static generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Admin login
   */
  static login(email: string, password: string): AuthResult {
    try {
      const user = this.adminUsers.find(u => u.email === email && u.isActive);
      
      if (!user) {
        return { success: false, error: 'Invalid admin credentials' };
      }
      
      const passwordHash = this.hashPassword(password);
      if (passwordHash !== user.passwordHash) {
        return { success: false, error: 'Invalid admin credentials' };
      }
      
      // Create session
      const session: AdminSession = {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        loginTime: Date.now(),
        expiresAt: Date.now() + this.SESSION_DURATION,
        sessionId: this.generateSessionId()
      };
      
      // Store session
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      return { success: true, session };
    } catch (error) {
      return { success: false, error: 'Login failed' };
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
      
      // Verify user still exists and is active
      const user = this.adminUsers.find(u => u.id === session.userId && u.isActive);
      if (!user) {
        this.logout();
        return { isAuthenticated: false };
      }
      
      return { isAuthenticated: true, session };
    } catch (error) {
      this.logout();
      return { isAuthenticated: false };
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
      expiresAt: Date.now() + this.SESSION_DURATION
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(newSession));
    }
    
    return true;
  }

  /**
   * Get all admin users (Super Admin only)
   */
  static getAdminUsers(): AdminUser[] {
    if (!this.isSuperAdmin()) {
      throw new Error('Unauthorized: Super Admin access required');
    }
    
    return this.adminUsers.map(user => ({
      ...user,
      passwordHash: '[HIDDEN]' // Don't expose password hashes
    }));
  }

  /**
   * Create new admin user (Super Admin only)
   */
  static createAdmin(userData: {
    email: string;
    username: string;
    password: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
  }): { success: boolean; error?: string; user?: AdminUser } {
    if (!this.isSuperAdmin()) {
      return { success: false, error: 'Unauthorized: Super Admin access required' };
    }

    if (this.adminUsers.find(u => u.email === userData.email)) {
      return { success: false, error: 'Admin with this email already exists' };
    }

    const newUser: AdminUser = {
      id: `admin-${Date.now()}`,
      email: userData.email,
      username: userData.username,
      passwordHash: this.hashPassword(userData.password),
      role: userData.role,
      permissions: ROLE_PERMISSIONS[userData.role],
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString()
    };

    this.adminUsers.push(newUser);
    
    return { 
      success: true, 
      user: { ...newUser, passwordHash: '[HIDDEN]' }
    };
  }
}

export default UnifiedAdminAuth;