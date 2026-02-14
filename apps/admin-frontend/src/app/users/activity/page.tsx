// src/app/admin/users/activity/page.tsx - User Activity Dashboard
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminRoute } from '@/components/auth/RouteGuard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

interface ActivityStats {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  totalSessions: number;
  avgSessionDuration: string;
  bounceRate: number;
}

function UserActivityContent() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    totalSessions: 0,
    avgSessionDuration: '0m 0s',
    bounceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  const fetchActivityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Fetch activity logs
      const activityResponse = await fetch(`${API_BASE_URL}/api/admin/activity?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (activityResponse.ok) {
        const data = await activityResponse.json();
        const mappedActivities: UserActivity[] = (data.logs || []).map((log: any) => ({
          id: log.id,
          userId: log.userId || 'unknown',
          userName: log.user?.name || log.user?.email?.split('@')[0] || 'Unknown',
          userEmail: log.user?.email || 'unknown@example.com',
          action: log.action?.toLowerCase().replace(/_/g, '_') || 'unknown',
          details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {}),
          timestamp: log.timestamp || log.createdAt,
          ipAddress: log.ipAddress || 'Unknown',
          userAgent: log.userAgent || 'Unknown',
          location: log.location
        }));
        setActivities(mappedActivities);
      }

      // Fetch analytics for stats
      const analyticsResponse = await fetch(`${API_BASE_URL}/api/admin/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setStats({
          dailyActiveUsers: analyticsData.uniqueVisitors || 0,
          weeklyActiveUsers: Math.round((analyticsData.uniqueVisitors || 0) * 5),
          monthlyActiveUsers: Math.round((analyticsData.uniqueVisitors || 0) * 20),
          totalSessions: analyticsData.totalPageViews || 0,
          avgSessionDuration: analyticsData.avgTimeOnPage || '0m 0s',
          bounceRate: analyticsData.bounceRate || 0
        });
      }
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setError('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData, dateRange]);

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      login: '🔑',
      logout: '🚪',
      page_view: '👁️',
      comment: '💬',
      subscription: '📧',
      share: '📤',
      save: '📌',
      search: '🔍',
      download: '⬇️'
    };
    return icons[action] || '📋';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      login: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      logout: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      page_view: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      comment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      subscription: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      share: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const filteredActivities = activities.filter(activity => {
    const matchesAction = filterAction === 'all' || activity.action === filterAction;
    const matchesSearch = 
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Activity</h1>
          <p className="text-muted-foreground">Monitor user engagement and behavior</p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Daily Active</p>
          <p className="text-2xl font-bold text-foreground">{stats.dailyActiveUsers.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Weekly Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.weeklyActiveUsers.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Monthly Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.monthlyActiveUsers.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Sessions</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalSessions.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Avg Duration</p>
          <p className="text-2xl font-bold text-orange-600">{stats.avgSessionDuration}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Bounce Rate</p>
          <p className="text-2xl font-bold text-red-600">{stats.bounceRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by user or activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="page_view">Page View</option>
            <option value="comment">Comment</option>
            <option value="subscription">Subscription</option>
            <option value="share">Share</option>
          </select>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Live Activity Feed</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredActivities.map(activity => (
              <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{activity.userName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getActionColor(activity.action)}`}>
                        {activity.action.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>📍 {activity.location}</span>
                      <span>🌐 {activity.ipAddress}</span>
                      <span>💻 {activity.userAgent}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserActivityPage() {
  return (
    <AdminRoute>
      <UserActivityContent />
    </AdminRoute>
  );
}

