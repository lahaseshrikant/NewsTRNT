// Auth barrel – re-exports all authentication modules
export { default as adminAuth, AdminAuthService, UnifiedAdminAuth } from './admin-auth';
export type { AdminUser, AuthResult, AdminSession } from './admin-auth';
export { default as AdminJWTBridge } from './jwt-auth';
export { default as RBACAuth } from './rbac-auth';
export type { EnhancedAdminSession, EnhancedAuthResult } from './rbac-auth';
export { default as SecurityManager } from './security';
