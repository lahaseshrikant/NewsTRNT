"use client";

import { useEffect, useState } from 'react';
import UnifiedAdminGuard from '@/components/auth/UnifiedAdminGuard';
import adminAuth from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';

interface AdminStats {
  totalArticles: { count: number; growth: number; growthType: string };
  activeUsers: { count: number; growth: number; growthType: string };
  pageViews: { count: number; growth: number; growthType: string };
  revenue: { count: number; growth: number; growthType: string };
  recentArticles: Array<{
    id: number;
    title: string;
    status: string;
    publishedAt: string | null;
    views: number;
    author: string;
  }>;
  systemStatus: {
    server: { status: string; uptime: string };
    database: { status: string; responseTime: string };
    cdn: { status: string; cacheHitRate: string };
    backup: { status: string; lastBackup: string };
  };
  recentActivity: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
    icon: string;
    color: string;
  }>;
  performanceMetrics: {
    siteSpeed: number;
    userEngagement: number;
    contentQuality: number;
    seoScore: number;
  };
}

function AdminPageContent() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const data = await adminClient.getStats();
      setStats(data as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined | null) => {
    const n = typeof num === 'number' ? num : 0;
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'k';
    }
    return n.toLocaleString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // Ensure safe defaults for system status (backend may not provide these fields)
  const systemStatus = (stats && stats.systemStatus) ? stats.systemStatus : {
    server: { status: 'unknown', uptime: '—' },
    database: { status: 'unknown', responseTime: '—' },
    cdn: { status: 'unknown', cacheHitRate: '—' },
    backup: { status: 'unknown', lastBackup: new Date().toISOString() }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
  <div className="text-slate-500 dark:text-slate-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to NewsTRNT Admin Panel - Your complete news management center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.overview?.totalArticles ?? 0)}</p>
              <p className={`text-xs mt-1 ${stats?.totalArticles?.growthType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats?.totalArticles?.growthType === 'increase' ? '+' : '-'}{stats?.totalArticles?.growth ?? 0}% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-full">
              <span className="text-xl">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.overview?.totalUsers ?? 0)}</p>
              <p className={`text-xs mt-1 ${stats?.activeUsers?.growthType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats?.activeUsers?.growthType === 'increase' ? '+' : '-'}{stats?.activeUsers?.growth ?? 0}% from last month
              </p>
            </div>
            <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-full">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Page Views</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.overview?.totalViews ?? 0)}</p>
              <p className={`text-xs mt-1 ${stats?.pageViews?.growthType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats?.pageViews?.growthType === 'increase' ? '+' : '-'}{stats?.pageViews?.growth ?? 0}% from last month
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-full">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-foreground">${formatNumber(stats?.revenue?.count ?? 0)}</p>
              <p className={`text-xs mt-1 text-muted-foreground`}>
                Subscribers: {formatNumber(stats?.overview?.totalSubscribers ?? 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Articles */}
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Articles</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {(stats.recentArticles || []).map((article) => (
                <div key={article.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg hover:bg-card transition-colors">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📄</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{article.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        article.status === 'Published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        article.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {article.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {article.publishedAt ? formatTimeAgo(article.publishedAt) : 'Not published'}
                      </span>
                      <span className="text-xs text-muted-foreground">👁 {formatNumber(article.views)}</span>
                      <span className="text-xs text-muted-foreground">by {article.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/content/new" className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg hover:from-blue-700 hover:to-blue-800 text-left transition-all">
                <div className="flex items-center space-x-3">
                  <span>✨</span>
                  <div>
                    <h3 className="font-semibold">Create Article</h3>
                    <p className="text-sm opacity-90">Write a new news article</p>
                  </div>
                </div>
              </a>
              <a href="/analytics" className="block w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg hover:from-green-700 hover:to-green-800 text-left transition-all">
                <div className="flex items-center space-x-3">
                  <span>📊</span>
                  <div>
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm opacity-90">Check site performance</p>
                  </div>
                </div>
              </a>
              <a href="/content" className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 rounded-lg hover:from-purple-700 hover:to-purple-800 text-left transition-all">
                <div className="flex items-center space-x-3">
                  <span>📝</span>
                  <div>
                    <h3 className="font-semibold">Manage Content</h3>
                    <p className="text-sm opacity-90">Articles & categories</p>
                  </div>
                </div>
              </a>
              <a href="/content/trash" className="block w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-lg hover:from-red-700 hover:to-red-800 text-left transition-all">
                <div className="flex items-center space-x-3">
                  <span>🗑️</span>
                  <div>
                    <h3 className="font-semibold">View Trash</h3>
                    <p className="text-sm opacity-90">Recover deleted content</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">System Status</h2>
            <div className="space-y-4">
              { /* System status may be absent from backend response — use safe defaults */ }
              { /* Use the top-level `systemStatus` (safe defaults applied above) */
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  systemStatus.server.status === 'online' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      systemStatus.server.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-foreground">Server Status</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      systemStatus.server.status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {systemStatus.server.status}
                    </span>
                    <p className="text-xs text-muted-foreground">Uptime: {systemStatus.server.uptime}</p>
                  </div>
                </div>}
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                systemStatus.database.status === 'connected' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    systemStatus.database.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-foreground">Database</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    systemStatus.database.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {systemStatus.database.status}
                  </span>
                  <p className="text-xs text-muted-foreground">Response: {systemStatus.database.responseTime}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">CDN</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{systemStatus.cdn.status}</span>
                  <p className="text-xs text-muted-foreground">Hit Rate: {systemStatus.cdn.cacheHitRate}</p>
                </div>
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                systemStatus.backup.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    systemStatus.backup.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-foreground">Backup</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    systemStatus.backup.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {systemStatus.backup.status}
                  </span>
                  <p className="text-xs text-muted-foreground">Last: {formatTimeAgo(systemStatus.backup.lastBackup)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {(stats.recentActivity || []).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1">
                  <span className="text-sm text-foreground">{activity.message}</span>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Site Speed</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${(stats.performanceMetrics?.siteSpeed ?? 0)}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium text-foreground">{stats.performanceMetrics?.siteSpeed ?? 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User Engagement</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${(stats.performanceMetrics?.userEngagement ?? 0)}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium text-foreground">{stats.performanceMetrics?.userEngagement ?? 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Content Quality</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${(stats.performanceMetrics?.contentQuality ?? 0)}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium text-foreground">{stats.performanceMetrics?.contentQuality ?? 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">SEO Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${(stats.performanceMetrics?.seoScore ?? 0)}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium text-foreground">{stats.performanceMetrics?.seoScore ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <UnifiedAdminGuard>
      <AdminPageContent />
    </UnifiedAdminGuard>
  );
}



