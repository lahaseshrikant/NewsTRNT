// apps/admin-frontend/src/lib/jwt-auth.ts
// Compatibility wrapper — the backend now issues real JWTs.
// This file exists only so existing imports don't break.

import adminAuth from './admin-auth';

export class AdminJWTBridge {
  static getJWTToken(): string | null {
    return adminAuth.getToken();
  }

  static generateJWTToken(): string | null {
    // No-op — tokens come from the backend now
    return adminAuth.getToken();
  }

  static login(email: string, password: string) {
    return adminAuth.login(email, password);
  }

  static isAdminAuthenticated(): boolean {
    return adminAuth.isAuthenticated();
  }

  static getCurrentAdminUser() {
    return adminAuth.getUser();
  }

  static logout() {
    return adminAuth.logout();
  }
}

export default AdminJWTBridge;

