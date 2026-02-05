// src/app/admin/access/audit/page.tsx - Audit Logs
// Complete audit trail for all admin actions
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SuperAdminRoute } from '@/components/admin/RouteGuard';
import { ROLE_DEFINITIONS, UserRole } from '@/config/rbac';
import AuditLogger, { AuditLogEntry, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { getEmailString } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Local interface for display purposes
interface DisplayLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userEmail: string;
  userRole: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: string;
}

function AuditLogsContent() {
  const [logs, setLogs] = useState<DisplayLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DisplayLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const activityLogs = data.activity || [];
        
        // Convert activity logs to DisplayLog format
        const convertedLogs: DisplayLog[] = activityLogs.map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp || log.createdAt,
          action: log.action,
          userId: log.userId || 'system',
          userEmail: log.userEmail || log.user?.email || 'Unknown',
          userRole: log.userRole || 'ADMIN',
          resource: log.entityType || log.resource || '',
          resourceId: log.entityId || log.resourceId,
          details: typeof log.details === 'object' ? JSON.stringify(log.details) : log.details,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          severity: log.severity || 'INFO'
        }));
        
        setLogs(convertedLogs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    filterLogs();
  }, [logs, dateRange, severityFilter, actionFilter, searchTerm]);

  const filterLogs = () => {
    let filtered = [...logs];
    
    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(log => new Date(log.timestamp) >= today);
    } else if (dateRange === '7days') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo);
    } else if (dateRange === '30days') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo);
    }
    
    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }
    
    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }
    
    // Search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.userEmail?.toLowerCase().includes(search) ||
        log.details?.toLowerCase().includes(search) ||
        log.resource?.toLowerCase().includes(search) ||
        log.action?.toLowerCase().includes(search)
      );
    }
    
    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, string> = {
      INFO: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      WARNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return badges[severity] || badges.INFO;
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      LOGIN_SUCCESS: '🔑',
      LOGIN_FAILED: '🚫',
      LOGOUT: '🚪',
      SESSION_EXPIRED: '⏰',
      PASSWORD_CHANGE: '🔐',
      MFA_ENABLED: '✅',
      MFA_DISABLED: '⚠️',
      USER_CREATE: '👤',
      USER_UPDATE: '✏️',
      USER_DELETE: '❌',
      USER_BAN: '🚷',
      USER_UNBAN: '✅',
      ROLE_ASSIGN: '🎭',
      ROLE_REVOKE: '🎭',
      PERMISSION_GRANT: '🔐',
      PERMISSION_REVOKE: '🔐',
      ARTICLE_CREATE: '📝',
      ARTICLE_UPDATE: '✏️',
      ARTICLE_DELETE: '🗑️',
      ARTICLE_PUBLISH: '📢',
      ARTICLE_UNPUBLISH: '📥',
      ARTICLE_RESTORE: '♻️',
      CATEGORY_CREATE: '📁',
      CATEGORY_UPDATE: '📁',
      CATEGORY_DELETE: '🗑️',
      CONFIG_UPDATE: '⚙️',
      SYSTEM_BACKUP: '💾',
      SYSTEM_RESTORE: '♻️',
      API_ACCESS: '🔌',
      UNAUTHORIZED_ACCESS: '🚨',
      RATE_LIMIT_EXCEEDED: '⏱️'
    };
    return icons[action] || '📋';
  };

  const allActions: string[] = [
    'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'SESSION_EXPIRED', 'PASSWORD_CHANGE',
    'MFA_ENABLED', 'MFA_DISABLED', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
    'USER_BAN', 'USER_UNBAN', 'ROLE_ASSIGN', 'ROLE_REVOKE', 'PERMISSION_GRANT',
    'PERMISSION_REVOKE', 'ARTICLE_CREATE', 'ARTICLE_UPDATE', 'ARTICLE_DELETE',
    'ARTICLE_PUBLISH', 'ARTICLE_UNPUBLISH', 'ARTICLE_RESTORE', 'CONFIG_UPDATE',
    'SYSTEM_BACKUP', 'SYSTEM_RESTORE', 'API_ACCESS', 'UNAUTHORIZED_ACCESS',
    'RATE_LIMIT_EXCEEDED'
  ];

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Action', 'User', 'Role', 'Resource', 'Details', 'Severity', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.action,
        log.userEmail || 'N/A',
        log.userRole || 'N/A',
        log.resource || 'N/A',
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.severity,
        log.ipAddress || 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin/access" className="hover:text-foreground">Access Control</Link>
            <span>/</span>
            <span className="text-foreground">Audit Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            📋 Audit Logs
          </h1>
          <p className="text-muted-foreground">
            Complete audit trail for all admin actions
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>📥</span> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Logs</p>
          <p className="text-2xl font-bold text-foreground">{logs.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Critical Events</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.severity === 'CRITICAL').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">High Priority</p>
          <p className="text-2xl font-bold text-orange-600">
            {logs.filter(l => l.severity === 'HIGH').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Filtered Results</p>
          <p className="text-2xl font-bold text-blue-600">{filteredLogs.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-card border border-border rounded-xl p-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
        </div>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
          className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
        
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
          className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as typeof actionFilter)}
          className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Actions</option>
          {allActions.map(action => (
            <option key={action} value={action}>
              {getActionIcon(action)} {action.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => {
            setSearchTerm('');
            setDateRange('7days');
            setSeverityFilter('all');
            setActionFilter('all');
          }}
          className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Timestamp</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Action</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">User</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Resource</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Details</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedLogs.map((log) => {
                const roleConfig = log.userRole ? ROLE_DEFINITIONS[log.userRole as UserRole] : null;
                return (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="text-sm text-foreground">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getActionIcon(log.action)}</span>
                        <span className="text-sm font-medium text-foreground">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">{getEmailString(log.userEmail) || 'System'}</div>
                      {roleConfig && (
                        <div className={`inline-flex items-center gap-1 text-xs ${roleConfig.color}`}>
                          {roleConfig.icon} {roleConfig.displayName}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">{log.resource || '-'}</div>
                      {log.resourceId && (
                        <div className="text-xs text-muted-foreground">ID: {log.resourceId}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground max-w-[300px] truncate" title={log.details}>
                        {log.details || '-'}
                      </div>
                      {log.ipAddress && (
                        <div className="text-xs text-muted-foreground">IP: {log.ipAddress}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No logs found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-border hover:bg-muted'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <SuperAdminRoute>
      <AuditLogsContent />
    </SuperAdminRoute>
  );
}
