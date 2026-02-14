// apps/admin-frontend/src/lib/admin-auth.ts
// Single source of truth for admin authentication.
// Talks to admin-backend (5001). Stores real JWT in localStorage.
// NO frontend token generation. NO client-side permission definitions.

import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  avatarUrl?: string;
  role: string;
  roleLevel: number;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  canCreateAdmins?: boolean;
  canAssignRoles?: boolean;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: AdminUser;
  token?: string;
  error?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

// ── Auth Service ─────────────────────────────────────────────────────────────

class AdminAuthService {
  private baseUrl = API_CONFIG.baseURL;

  // ── Login ────────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const res = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Login failed',
          error: data.error,
        };
      }

      // Store real backend JWT + user profile
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      return {
        success: true,
        message: data.message || 'Login successful',
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('[AdminAuth] Login error:', error);
      return {
        success: false,
        message: 'Network error. Is the admin backend running?',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // ── Logout ───────────────────────────────────────────────────────
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // best-effort
      }
    }
    this.clearSession();
  }

  // ── Check auth state ─────────────────────────────────────────────
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    // Quick client-side JWT expiry check (no crypto verification — that's the backend's job)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.clearSession();
        return false;
      }
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  // ── Validate with backend ────────────────────────────────────────
  async validate(): Promise<AdminUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.ME}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) this.clearSession();
        return null;
      }

      const user: AdminUser = await res.json();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  }

  // ── Refresh token ────────────────────────────────────────────────
  async refresh(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch(`${this.baseUrl}/auth/admin/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      return true;
    } catch {
      return false;
    }
  }

  // ── Token & user getters ─────────────────────────────────────────
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ── Permission checks ───────────────────────────────────────────
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    if (user.isSuperAdmin || user.permissions.includes('*')) return true;

    if (user.permissions.includes(permission)) return true;

    // Check resource-level manage
    const resource = permission.split('.')[0];
    return user.permissions.includes(`${resource}.manage`);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  isSuperAdmin(): boolean {
    return this.getUser()?.isSuperAdmin ?? false;
  }

  getRole(): string {
    return this.getUser()?.role ?? '';
  }

  getRoleLevel(): number {
    return this.getUser()?.roleLevel ?? 0;
  }

  // ── Auth header for fetch calls ──────────────────────────────────
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ── Internal ─────────────────────────────────────────────────────
  private clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Clean up legacy keys
    localStorage.removeItem('newstrnt_admin_session');
    localStorage.removeItem('newstrnt_admin_jwt');
    localStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session');
  }
}

// Singleton
const adminAuth = new AdminAuthService();
export default adminAuth;

// Named export for compatibility
export { adminAuth, AdminAuthService };

// Legacy compat types
export type AdminSession = AdminUser;

// Legacy alias — old code imported from this as "UnifiedAdminAuth"
export const UnifiedAdminAuth = {
  login: (email: string, password: string) => adminAuth.login(email, password),
  logout: () => adminAuth.logout(),
  isAuthenticated: () => adminAuth.isAuthenticated(),
  getSession: () => adminAuth.getUser(),
  getCurrentUser: () => adminAuth.getUser(),
  isSuperAdmin: () => adminAuth.isSuperAdmin(),
  hasPermission: (p: string) => adminAuth.hasPermission(p),
  hasAnyPermission: (p: string[]) => adminAuth.hasAnyPermission(p),
  getAuthToken: () => adminAuth.getToken(),
};

