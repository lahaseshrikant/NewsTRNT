// src/app/admin/system/activity/page.tsx - Activity Monitoring Dashboard
'use client';

import React, { useState, useEffect } from 'react';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import AuditLogger, { AuditLogEntry } from '@/lib/audit-logger';
import { getEmailString } from '@/lib/utils';

function ActivityMonitoringContent() {
  const [stats, setStats] = useState<ReturnType<typeof AuditLogger.getStats> | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLogEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadData = () => {
    setLoading(true);
    setStats(AuditLogger.getStats(selectedPeriod));
    setRecentActivity(AuditLogger.getLogs({ limit: 20 }));
    setLoading(false);
  };

  const getActivityColor = (action: string) => {
    if (action.includes('FAILED') || action.includes('UNAUTHORIZED')) return 'text-red-500';
    if (action.includes('DELETE') || action.includes('BAN')) return 'text-orange-500';
    if (action.includes('CREATE') || action.includes('SUCCESS')) return 'text-green-500';
    return 'text-blue-500';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Monitor</h1>
          <p className="text-muted-foreground">Real-time monitoring of admin actions and security events</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value) as 7 | 14 | 30)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-foreground"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : stats ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalActions}</p>
                </div>
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last {selectedPeriod} days</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className={`text-3xl font-bold ${stats.successRate >= 95 ? 'text-green-600' : stats.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {stats.successRate.toFixed(1)}%
                  </p>
                </div>
                <span className="text-3xl">✓</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Successful operations</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Alerts</p>
                  <p className={`text-3xl font-bold ${stats.severityBreakdown.CRITICAL > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.severityBreakdown.CRITICAL}
                  </p>
                </div>
                <span className="text-3xl">🚨</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Critical events</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-foreground">{Object.keys(stats.userBreakdown).length}</p>
                </div>
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Unique users</p>
            </div>
          </div>

          {/* Activity Chart (Simple Bar) */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Daily Activity</h3>
            <div className="flex items-end gap-2 h-40">
              {stats.dailyActivity.length > 0 ? (
                stats.dailyActivity.map((day, idx) => {
                  const maxCount = Math.max(...stats.dailyActivity.map(d => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${day.date}: ${day.count} actions`}
                      />
                      <span className="text-xs text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  No activity data available
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Actions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Actions</h3>
              <div className="space-y-3">
                {Object.entries(stats.actionBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between">
                      <span className={`text-sm ${getActivityColor(action)}`}>{action}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 rounded-full h-2"
                            style={{ width: `${(count / stats.totalActions) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Most Active Users</h3>
              <div className="space-y-3">
                {Object.entries(stats.userBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([email, count], idx) => (
                    <div key={email} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-medium">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-foreground">{email}</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{count} actions</span>
                    </div>
                  ))}
                {Object.keys(stats.userBreakdown).length === 0 && (
                  <p className="text-sm text-muted-foreground">No user activity recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Live Activity Feed</h3>
              <span className="flex items-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((log) => (
                  <div 
                    key={log.id} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      log.severity === 'CRITICAL' ? 'bg-red-50 dark:bg-red-900/20' :
                      log.severity === 'WARNING' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                      'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xl ${getActivityColor(log.action)}`}>
                        {log.success ? '✓' : '✗'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {getEmailString(log.userEmail)} • {log.userRole}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(log.timestamp)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity</p>
                  <p className="text-sm">Actions will appear here as they occur</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Alerts */}
          {stats.recentCritical.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚨</span>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Security Alerts</h3>
              </div>
              <div className="space-y-3">
                {stats.recentCritical.map((log) => (
                  <div key={log.id} className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-300">{log.action}</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {getEmailString(log.userEmail)} • {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                      Investigate →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No activity data available
        </div>
      )}
    </div>
  );
}

export default function ActivityMonitoringPage() {
  return (
    <SuperAdminRoute>
      <ActivityMonitoringContent />
    </SuperAdminRoute>
  );
}

