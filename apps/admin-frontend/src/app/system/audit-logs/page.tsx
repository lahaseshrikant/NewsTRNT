// src/app/admin/system/audit-logs/page.tsx - Audit Logs Dashboard
'use client';

import React, { useState, useEffect } from 'react';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import AuditLogger, { AuditLogEntry, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { getEmailString } from '@/lib/utils';

function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof AuditLogger.getStats> | null>(null);
  const [filters, setFilters] = useState({
    action: '' as AuditAction | '',
    severity: '' as AuditSeverity | '',
    userEmail: '',
    success: '' as 'true' | 'false' | ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = () => {
    setLoading(true);
    
    const filterOptions: any = { limit: 200 };
    if (filters.action) filterOptions.action = filters.action;
    if (filters.severity) filterOptions.severity = filters.severity;
    if (filters.userEmail) filterOptions.userEmail = filters.userEmail;
    if (filters.success) filterOptions.success = filters.success === 'true';
    
    setLogs(AuditLogger.getLogs(filterOptions));
    setStats(AuditLogger.getStats(7));
    setLoading(false);
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    const styles = {
      INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      WARNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[severity]}`}>
        {severity}
      </span>
    );
  };

  const getActionIcon = (action: AuditAction) => {
    if (action.startsWith('LOGIN')) return '🔐';
    if (action.startsWith('USER')) return '👤';
    if (action.startsWith('ARTICLE')) return '📝';
    if (action.startsWith('ROLE') || action.startsWith('PERMISSION')) return '🛡️';
    if (action.startsWith('CONFIG') || action.startsWith('SYSTEM')) return '⚙️';
    if (action === 'UNAUTHORIZED_ACCESS') return '🚨';
    return '📋';
  };

  const exportLogs = () => {
    const data = AuditLogger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground">Track all administrative actions and security events</p>
        </div>
        <button
          onClick={exportLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📥 Export Logs
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total Actions (7d)</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalActions}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-3xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Critical Events</p>
            <p className="text-3xl font-bold text-red-600">{stats.severityBreakdown.CRITICAL}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.severityBreakdown.WARNING}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value as AuditAction })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">All Actions</option>
              <optgroup label="Authentication">
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_FAILED">Login Failed</option>
                <option value="LOGOUT">Logout</option>
              </optgroup>
              <optgroup label="User Management">
                <option value="USER_CREATE">User Create</option>
                <option value="USER_UPDATE">User Update</option>
                <option value="USER_DELETE">User Delete</option>
                <option value="ROLE_ASSIGN">Role Assign</option>
              </optgroup>
              <optgroup label="Content">
                <option value="ARTICLE_CREATE">Article Create</option>
                <option value="ARTICLE_UPDATE">Article Update</option>
                <option value="ARTICLE_DELETE">Article Delete</option>
                <option value="ARTICLE_PUBLISH">Article Publish</option>
              </optgroup>
              <optgroup label="Security">
                <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
                <option value="PERMISSION_GRANT">Permission Grant</option>
                <option value="CONFIG_UPDATE">Config Update</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value as AuditSeverity })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">All Severities</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">User Email</label>
            <input
              type="text"
              value={filters.userEmail}
              onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
              placeholder="Search by email..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={filters.success}
              onChange={(e) => setFilters({ ...filters, success: e.target.value as 'true' | 'false' | '' })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">All</option>
              <option value="true">Success</option>
              <option value="false">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Timestamp</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Action</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Role</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Severity</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No audit logs found. Actions will appear here as they occur.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{getActionIcon(log.action)}</span>
                        <span className="text-sm font-medium text-foreground">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{getEmailString(log.userEmail)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs bg-muted text-foreground">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getSeverityBadge(log.severity)}</td>
                    <td className="px-4 py-3">
                      {log.success ? (
                        <span className="text-green-600">✓ Success</span>
                      ) : (
                        <span className="text-red-600">✗ Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                      {log.resource && <span className="font-medium">{log.resource}</span>}
                      {log.errorMessage && <span className="text-red-500 ml-1">{log.errorMessage}</span>}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <span title={JSON.stringify(log.details)}> • {Object.keys(log.details).join(', ')}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Critical Events */}
      {stats && stats.recentCritical.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">⚠️ Recent Critical Events</h3>
          <div className="space-y-2">
            {stats.recentCritical.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{getActionIcon(log.action)}</span>
                  <span className="font-medium text-red-800 dark:text-red-300">{log.action}</span>
                  <span className="text-red-600 dark:text-red-400">by {getEmailString(log.userEmail)}</span>
                </div>
                <span className="text-red-500">{log.timestamp.toLocaleString()}</span>
              </div>
            ))}
          </div>
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

