// src/lib/rbac-auth.ts - Enhanced Role-Based Authentication System
// Integrates with RBAC config for granular permission control

import { UserRole, Permission, ROLES, RBACUtils, ADMIN_NAVIGATION, NavItem } from '@/config/rbac';

export interface EnhancedAdminSession {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  displayName: string;
  avatarUrl?: string;
  loginTime: number;
  expiresAt: number;
  sessionId: string;
  timestamp: number;
  lastActivity: number;
}

export interface EnhancedAuthResult {
  success: boolean;
  error?: string;
  session?: EnhancedAdminSession;
  redirectTo?: string;
}

class RBACAuth {
  private static readonly SESSION_KEY = 'newstrnt_admin_session';
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours for productivity
  private static readonly IDLE_TIMEOUT = 30 * 60 * 1000; // 30 min idle timeout

  /**
   * Generate secure session ID
   */
  private static generateSessionId(): string {
    if (typeof window === 'undefined') {
      const crypto = require('crypto');
      return crypto.randomBytes(32).toString('hex');
    }
    const array = new Uint8Array(32);
    globalThis.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Login with role-based session creation
   */
  static async login(email: string, password: string): Promise<EnhancedAuthResult> {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (typeof window === 'undefined') {
        return { success: false, error: 'Client-side only' };
      }

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success && result.session) {
        // Enhance session with RBAC data
        const role = result.session.role as UserRole;
        const roleConfig = ROLES[role];
        
        const enhancedSession: EnhancedAdminSession = {
          userId: result.session.userId,
          email: result.session.email,
          username: result.session.username || result.session.email.split('@')[0],
          role: role,
          permissions: roleConfig?.permissions || [],
          displayName: result.session.username || 'Admin User',
          loginTime: result.session.loginTime || Date.now(),
          expiresAt: result.session.expiresAt || Date.now() + this.SESSION_DURATION,
          sessionId: result.session.sessionId,
          timestamp: result.session.timestamp || Date.now(),
          lastActivity: Date.now()
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(enhancedSession));

        // Return role-specific redirect
        const redirectTo = roleConfig?.dashboardPath || '/admin';

        return { success: true, session: enhancedSession, redirectTo };
      }

      return { success: false, error: result.error || 'Authentication failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication service unavailable' };
    }
  }

  /**
   * Get current session with activity tracking
   */
  static getSession(): EnhancedAdminSession | null {
    try {
      if (typeof window === 'undefined') return null;

      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: EnhancedAdminSession = JSON.parse(sessionData);

      // Check expiration
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      // Check idle timeout
      if (Date.now() - session.lastActivity > this.IDLE_TIMEOUT) {
        this.logout();
        return null;
      }

      // Update last activity
      session.lastActivity = Date.now();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      return session;
    } catch {
      this.logout();
      return null;
    }
  }

  /**
   * Check if authenticated
   */
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Check specific permission
   */
  static hasPermission(permission: Permission): boolean {
    const session = this.getSession();
    if (!session) return false;
    return RBACUtils.hasPermission(session.role, permission);
  }

  /**
   * Check any of multiple permissions
   */
  static hasAnyPermission(permissions: Permission[]): boolean {
    const session = this.getSession();
    if (!session) return false;
    return RBACUtils.hasAnyPermission(session.role, permissions);
  }

  /**
   * Check all permissions
   */
  static hasAllPermissions(permissions: Permission[]): boolean {
    const session = this.getSession();
    if (!session) return false;
    return RBACUtils.hasAllPermissions(session.role, permissions);
  }

  /**
   * Check minimum role level
   */
  static hasMinRoleLevel(minLevel: number): boolean {
    const session = this.getSession();
    if (!session) return false;
    return RBACUtils.hasMinRoleLevel(session.role, minLevel);
  }

  /**
   * Check specific role
   */
  static hasRole(role: UserRole): boolean {
    const session = this.getSession();
    if (!session) return false;
    return session.role === role || RBACUtils.hasMinRoleLevel(session.role, ROLES[role].level);
  }

  /**
   * Get filtered navigation for current user
   */
  static getNavigation(): NavItem[] {
    const session = this.getSession();
    if (!session) return [];
    return RBACUtils.filterNavigation(session.role, ADMIN_NAVIGATION);
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(path: string): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Find navigation item for path
    const findNavItem = (items: NavItem[], targetPath: string): NavItem | null => {
      for (const item of items) {
        if (item.href === targetPath) return item;
        if (item.children) {
          const found = findNavItem(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const navItem = findNavItem(ADMIN_NAVIGATION, path);
    if (!navItem) return true; // Allow if not in nav (might be dynamic route)

    return RBACUtils.canAccessNavItem(session.role, navItem);
  }

  /**
   * Get role display info
   */
  static getRoleInfo(): { icon: string; color: string; bgColor: string; displayName: string; level: number } | null {
    const session = this.getSession();
    if (!session) return null;

    const badge = RBACUtils.getRoleBadge(session.role);
    const config = ROLES[session.role];

    return {
      ...badge,
      level: config?.level || 0
    };
  }

  /**
   * Check if current user can manage target role
   */
  static canManageRole(targetRole: UserRole): boolean {
    const session = this.getSession();
    if (!session) return false;
    return RBACUtils.canManageRole(session.role, targetRole);
  }

  /**
   * Get roles that current user can assign
   */
  static getAssignableRoles(): UserRole[] {
    const session = this.getSession();
    if (!session) return [];
    return RBACUtils.getManageableRoles(session.role);
  }

  /**
   * Logout and clear session
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('newstrnt_admin_jwt_token');
      localStorage.removeItem('client_jwt_key');
    }
  }

  /**
   * Refresh session
   */
  static refreshSession(): boolean {
    const session = this.getSession();
    if (!session) return false;

    session.expiresAt = Date.now() + this.SESSION_DURATION;
    session.lastActivity = Date.now();

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return true;
  }

  /**
   * Get auth token for API requests
   */
  static getAuthToken(): string | null {
    const session = this.getSession();
    if (!session) return null;

    const tokenData = {
      email: session.email,
      role: session.role,
      userId: session.userId,
      sessionId: session.sessionId,
      timestamp: session.timestamp,
      permissions: session.permissions
    };

    try {
      const jsonString = JSON.stringify(tokenData);
      return btoa(unescape(encodeURIComponent(jsonString)));
    } catch {
      return null;
    }
  }
}

export default RBACAuth;
