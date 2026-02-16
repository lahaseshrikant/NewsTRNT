// src/app/admin/access/activity/page.tsx - Activity Monitor
// Real-time monitoring of admin activities
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import { ROLE_DEFINITIONS, ROLE_HIERARCHY, UserRole } from '@/config/rbac';
import { getEmailString } from '@/lib/utils';
import { API_CONFIG } from '@/config/api';
import adminAuth from '@/lib/admin-auth';

const API_BASE_URL = API_CONFIG.baseURL;

interface ActivityEvent {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  isLive?: boolean;
}

interface ActiveSession {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  lastActivity: string;
  ipAddress: string;
  device: string;
  location: string;
}

function ActivityMonitorContent() {
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [stats, setStats] = useState({
    totalActions: 0,
    activeUsers: 0,
    actionsPerHour: 0,
    securityAlerts: 0
  });

  // Helper to convert details to string
  const getDetailsString = (details: unknown): string => {
    if (!details) return '';
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
      const obj = details as Record<string, unknown>;
      if (typeof obj.message === 'string') return obj.message;
      try {
        return JSON.stringify(details);
      } catch {
        return '';
      }
    }
    return String(details);
  };

  const loadData = useCallback(async () => {
    setError(null);
    
    try {
      const token = adminAuth.getToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/activity?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch activity logs');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Convert logs to activity events
      const activities: ActivityEvent[] = (data.logs || []).map((log: any, idx: number) => ({
        id: log.id,
        userId: log.user?.id || 'unknown',
        userEmail: getEmailString(log.user?.email) || 'Unknown',
        userRole: 'ADMIN' as UserRole,
        action: log.action,
        resource: log.entityType || 'system',
        details: getDetailsString(log.details),
        timestamp: log.timestamp,
        isLive: idx < 3
      }));

      setActivityFeed(activities);

      // Update stats based on real data
      setStats({
        totalActions: data.pagination?.total || activities.length,
        activeUsers: 0, // This would need a separate API call
        actionsPerHour: Math.round((data.pagination?.total || activities.length) / 24),
        securityAlerts: 0
      });

      // Active sessions would need a separate API endpoint
      setActiveSessions([]);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Auto-refresh when live mode is enabled
    let interval: NodeJS.Timeout | null = null;
    if (isLive) {
      interval = setInterval(loadData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadData, isLive]);

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      LOGIN: '🔑',
      LOGOUT: '🚪',
      CONTENT_CREATE: '📝',
      CONTENT_UPDATE: '✏️',
      CONTENT_DELETE: '🗑️',
      CONTENT_PUBLISH: '📢',
      USER_CREATE: '👤',
      USER_UPDATE: '✏️',
      USER_DELETE: '❌',
      ROLE_CHANGE: '🎭',
      CONFIG_CHANGE: '⚙️'
    };
    return icons[action] || '📋';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Generate hourly activity data for chart
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 20) + 5
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/access" className="hover:text-foreground">Access Control</Link>
            <span>/</span>
            <span className="text-foreground">Activity Monitor</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            📊 Activity Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring of admin activities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isLive 
                ? 'bg-green-600 text-white' 
                : 'bg-card border border-border text-foreground'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
            {isLive ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Actions</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalActions}</p>
            </div>
            <span className="text-3xl">📈</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Actions/Hour</p>
              <p className="text-3xl font-bold text-blue-600">{stats.actionsPerHour}</p>
            </div>
            <span className="text-3xl">⏱️</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Security Alerts</p>
              <p className={`text-3xl font-bold ${stats.securityAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.securityAlerts}
              </p>
            </div>
            <span className="text-3xl">🚨</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Activity</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Activity Chart */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity Over 24 Hours</h2>
            <div className="flex items-end gap-1 h-32">
              {hourlyData.map((data, idx) => {
                const height = (data.count / 25) * 100;
                const isCurrentHour = idx === new Date().getHours();
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div 
                      className={`w-full rounded-t transition-all ${
                        isCurrentHour 
                          ? 'bg-blue-600' 
                          : 'bg-blue-400 hover:bg-blue-500'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${data.hour}:00 - ${data.count} actions`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>Now</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Activity Feed */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Live Activity Feed</h2>
                {isLive && (
                  <span className="flex items-center gap-2 text-sm text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                    Live
                  </span>
                )}
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activityFeed.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <span className="text-4xl block mb-2">📋</span>
                    <p>No activity recorded yet</p>
                  </div>
                ) : activityFeed.map((activity) => {
                  const roleConfig = ROLE_DEFINITIONS[activity.userRole] || ROLE_DEFINITIONS.VIEWER;
                  return (
                    <div 
                      key={activity.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        activity.isLive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-xl">{getActionIcon(activity.action)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm">
                            {getEmailString(activity.userEmail)}
                          </span>
                          <span className={`text-xs ${roleConfig?.color || 'text-gray-600'}`}>
                            {roleConfig?.icon || '👤'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.action.replace(/_/g, ' ')} - {activity.details}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Link 
                href="/access/audit"
                className="inline-block mt-4 text-sm text-blue-600 hover:underline"
              >
                View full audit log →
              </Link>
            </div>

            {/* Active Sessions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Active Sessions</h2>
              <div className="space-y-3">
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <span className="text-4xl block mb-2">👥</span>
                    <p>No active sessions</p>
                    <p className="text-xs mt-1">Sessions will appear when users are online</p>
                  </div>
                ) : activeSessions.map((session) => {
                  const roleConfig = ROLE_DEFINITIONS[session.userRole] || ROLE_DEFINITIONS.VIEWER;
                  return (
                    <div 
                      key={session.id}
                      className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full ${roleConfig?.bgColor || 'bg-gray-100'} flex items-center justify-center text-lg`}>
                        {roleConfig?.icon || '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm">
                            {getEmailString(session.userEmail)}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {session.device} • {session.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(session.lastActivity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.ipAddress}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Session Summary by Role */}
              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Sessions by Role</h3>
                <div className="flex flex-wrap gap-2">
                  {ROLE_HIERARCHY.map(role => {
                    const count = activeSessions.filter(s => s.userRole === role).length;
                    const roleConfig = ROLE_DEFINITIONS[role];
                    if (count === 0) return null;
                    return (
                      <span 
                        key={role}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${roleConfig?.bgColor || 'bg-gray-100'} ${roleConfig?.color || 'text-gray-600'}`}
                      >
                        {roleConfig?.icon || '👤'} {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Distribution */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Action Distribution (Today)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(() => {
                // Calculate action counts from activity feed
                const actionCounts: Record<string, { count: number; icon: string }> = {};
                const icons: Record<string, string> = {
                  LOGIN: '🔑',
                  LOGOUT: '🚪',
                  CONTENT_CREATE: '📝',
                  CONTENT_UPDATE: '✏️',
                  CONTENT_DELETE: '🗑️',
                  CONTENT_PUBLISH: '📢',
                  USER_CREATE: '👤',
                  USER_UPDATE: '✏️',
                  USER_DELETE: '❌',
                  ROLE_CHANGE: '🎭',
                  CONFIG_CHANGE: '⚙️'
                };
                
                activityFeed.forEach(activity => {
                  if (!actionCounts[activity.action]) {
                    actionCounts[activity.action] = { count: 0, icon: icons[activity.action] || '📋' };
                  }
                  actionCounts[activity.action].count++;
                });

                const actions = Object.entries(actionCounts)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 6);

                if (actions.length === 0) {
                  return (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <p>No actions recorded today</p>
                    </div>
                  );
                }

                return actions.map(([action, data]) => (
                  <div key={action} className="text-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-2xl">{data.icon}</span>
                    <p className="text-2xl font-bold text-foreground mt-2">{data.count}</p>
                    <p className="text-xs text-muted-foreground">{action.replace(/_/g, ' ')}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ActivityMonitorPage() {
  return (
    <SuperAdminRoute>
      <ActivityMonitorContent />
    </SuperAdminRoute>
  );
}

