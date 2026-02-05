// src/lib/audit-logger.ts - Comprehensive Audit Logging System
// Tracks all admin actions with full context for security and compliance

export type AuditAction = 
  // Authentication
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'PASSWORD_CHANGE'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  // User Management
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'USER_BAN'
  | 'USER_UNBAN'
  | 'USER_STATUS_CHANGE'
  | 'USER_BULK_ACTION'
  | 'ROLE_ASSIGN'
  | 'ROLE_REVOKE'
  | 'ROLE_CHANGE'
  | 'PERMISSION_GRANT'
  | 'PERMISSION_REVOKE'
  // Content Management
  | 'ARTICLE_CREATE'
  | 'ARTICLE_UPDATE'
  | 'ARTICLE_DELETE'
  | 'ARTICLE_PUBLISH'
  | 'ARTICLE_UNPUBLISH'
  | 'ARTICLE_RESTORE'
  | 'CATEGORY_CREATE'
  | 'CATEGORY_UPDATE'
  | 'CATEGORY_DELETE'
  // System
  | 'CONFIG_UPDATE'
  | 'CONFIG_CHANGE'
  | 'SYSTEM_BACKUP'
  | 'SYSTEM_RESTORE'
  | 'API_ACCESS'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  userEmail: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

// Determine severity based on action
const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
  LOGIN_SUCCESS: 'INFO',
  LOGIN_FAILED: 'WARNING',
  LOGOUT: 'INFO',
  SESSION_EXPIRED: 'INFO',
  PASSWORD_CHANGE: 'WARNING',
  MFA_ENABLED: 'INFO',
  MFA_DISABLED: 'WARNING',
  USER_CREATE: 'INFO',
  USER_UPDATE: 'INFO',
  USER_DELETE: 'CRITICAL',
  USER_BAN: 'WARNING',
  USER_UNBAN: 'INFO',
  ROLE_ASSIGN: 'WARNING',
  ROLE_REVOKE: 'WARNING',
  PERMISSION_GRANT: 'CRITICAL',
  PERMISSION_REVOKE: 'CRITICAL',
  ARTICLE_CREATE: 'INFO',
  ARTICLE_UPDATE: 'INFO',
  ARTICLE_DELETE: 'WARNING',
  ARTICLE_PUBLISH: 'INFO',
  ARTICLE_UNPUBLISH: 'INFO',
  ARTICLE_RESTORE: 'INFO',
  CATEGORY_CREATE: 'INFO',
  CATEGORY_UPDATE: 'INFO',
  CATEGORY_DELETE: 'WARNING',
  CONFIG_UPDATE: 'CRITICAL',
  SYSTEM_BACKUP: 'INFO',
  SYSTEM_RESTORE: 'CRITICAL',
  API_ACCESS: 'INFO',
  UNAUTHORIZED_ACCESS: 'CRITICAL',
  RATE_LIMIT_EXCEEDED: 'WARNING'
};

class AuditLogger {
  private static readonly STORAGE_KEY = 'newstrnt_audit_logs';
  private static readonly MAX_ENTRIES = 10000;
  private static logs: AuditLogEntry[] = [];
  private static initialized = false;

  /**
   * Initialize logger (load from localStorage)
   */
  private static init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch {
      this.logs = [];
    }
    this.initialized = true;
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save logs to localStorage
   */
  private static save(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only recent entries
      if (this.logs.length > this.MAX_ENTRIES) {
        this.logs = this.logs.slice(-this.MAX_ENTRIES);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }

  /**
   * Log an audit event
   */
  static log(params: {
    action: AuditAction;
    userId: string;
    userEmail: string;
    userRole: string;
    resource?: string;
    resourceId?: string;
    details?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    success?: boolean;
    errorMessage?: string;
  }): AuditLogEntry {
    this.init();

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      action: params.action,
      severity: ACTION_SEVERITY[params.action],
      userId: params.userId,
      userEmail: params.userEmail,
      userRole: params.userRole,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      oldValues: params.oldValues,
      newValues: params.newValues,
      success: params.success !== false,
      errorMessage: params.errorMessage,
      ipAddress: typeof window !== 'undefined' ? 'client' : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
    };

    this.logs.push(entry);
    this.save();

    // Console log for development
    const emoji = entry.success ? '✅' : '❌';
    const severityColor = {
      INFO: '\x1b[34m',
      WARNING: '\x1b[33m',
      CRITICAL: '\x1b[31m'
    };
    console.log(
      `${emoji} [AUDIT ${entry.severity}] ${entry.action} by ${entry.userEmail} (${entry.userRole})`,
      entry.details || ''
    );

    return entry;
  }

  /**
   * Log from current session
   */
  static logFromSession(action: AuditAction, options?: {
    resource?: string;
    resourceId?: string;
    details?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    success?: boolean;
    errorMessage?: string;
  }): AuditLogEntry | null {
    // Get session from RBAC auth
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem('newstrnt_admin_session');
      if (!sessionData) {
        return this.log({
          action,
          userId: 'anonymous',
          userEmail: 'anonymous',
          userRole: 'NONE',
          ...options
        });
      }

      const session = JSON.parse(sessionData);
      return this.log({
        action,
        userId: session.userId,
        userEmail: session.email,
        userRole: session.role,
        ...options
      });
    } catch {
      return null;
    }
  }

  /**
   * Get all logs with optional filtering
   */
  static getLogs(filters?: {
    action?: AuditAction | AuditAction[];
    severity?: AuditSeverity | AuditSeverity[];
    userId?: string;
    userEmail?: string;
    userRole?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    limit?: number;
  }): AuditLogEntry[] {
    this.init();

    let filtered = [...this.logs];

    if (filters) {
      if (filters.action) {
        const actions = Array.isArray(filters.action) ? filters.action : [filters.action];
        filtered = filtered.filter(log => actions.includes(log.action));
      }
      if (filters.severity) {
        const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
        filtered = filtered.filter(log => severities.includes(log.severity));
      }
      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }
      if (filters.userEmail) {
        filtered = filtered.filter(log => log.userEmail.includes(filters.userEmail));
      }
      if (filters.userRole) {
        filtered = filtered.filter(log => log.userRole === filters.userRole);
      }
      if (filters.resource) {
        filtered = filtered.filter(log => log.resource === filters.resource);
      }
      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.success !== undefined) {
        filtered = filtered.filter(log => log.success === filters.success);
      }
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * Get statistics for dashboard
   */
  static getStats(days: number = 7): {
    totalActions: number;
    successRate: number;
    actionBreakdown: Record<string, number>;
    severityBreakdown: Record<AuditSeverity, number>;
    userBreakdown: Record<string, number>;
    dailyActivity: Array<{ date: string; count: number }>;
    recentCritical: AuditLogEntry[];
  } {
    this.init();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentLogs = this.logs.filter(log => log.timestamp >= cutoff);
    
    const actionBreakdown: Record<string, number> = {};
    const severityBreakdown: Record<AuditSeverity, number> = { INFO: 0, WARNING: 0, CRITICAL: 0 };
    const userBreakdown: Record<string, number> = {};
    const dailyMap: Record<string, number> = {};
    
    let successCount = 0;
    
    recentLogs.forEach(log => {
      // Action breakdown
      actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
      
      // Severity breakdown
      severityBreakdown[log.severity]++;
      
      // User breakdown
      userBreakdown[log.userEmail] = (userBreakdown[log.userEmail] || 0) + 1;
      
      // Daily activity
      const dateKey = log.timestamp.toISOString().split('T')[0];
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1;
      
      if (log.success) successCount++;
    });

    // Convert daily map to array
    const dailyActivity = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalActions: recentLogs.length,
      successRate: recentLogs.length > 0 ? (successCount / recentLogs.length) * 100 : 100,
      actionBreakdown,
      severityBreakdown,
      userBreakdown,
      dailyActivity,
      recentCritical: this.getLogs({ severity: 'CRITICAL', limit: 10 })
    };
  }

  /**
   * Export logs as JSON
   */
  static exportLogs(filters?: Parameters<typeof this.getLogs>[0]): string {
    const logs = this.getLogs(filters);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Clear old logs (keep last N days)
   */
  static clearOldLogs(daysToKeep: number = 30): number {
    this.init();
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    const originalCount = this.logs.length;
    this.logs = this.logs.filter(log => log.timestamp >= cutoff);
    this.save();
    
    return originalCount - this.logs.length;
  }
}

export default AuditLogger;
