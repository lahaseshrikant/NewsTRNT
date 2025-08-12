"use client";

import { useEffect, useState } from 'react';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';

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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString();
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
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to NewsTRNT Admin Panel - Your complete news management center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalArticles.count)}</p>
              <p className={`text-xs mt-1 ${stats.totalArticles.growthType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.totalArticles.growthType === 'increase' ? '+' : '-'}{stats.totalArticles.growth}% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-xl">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.activeUsers.count)}</p>
              <p className={`text-xs mt-1 ${stats.activeUsers.growthType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.activeUsers.growthType === 'increase' ? '+' : '-'}{stats.activeUsers.growth}% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.pageViews.count)}</p>
              <p className={`text-xs mt-1 ${stats.pageViews.growthType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.pageViews.growthType === 'increase' ? '+' : '-'}{stats.pageViews.growth}% from last month
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${formatNumber(stats.revenue.count)}</p>
              <p className={`text-xs mt-1 ${stats.revenue.growthType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.revenue.growthType === 'increase' ? '+' : '-'}{stats.revenue.growth}% from last month
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Articles */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Articles</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {stats.recentArticles.map((article) => (
                <div key={article.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📄</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        article.status === 'Published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        article.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {article.status}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {article.publishedAt ? formatTimeAgo(article.publishedAt) : 'Not published'}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">👁 {formatNumber(article.views)}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">by {article.author}</span>
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg hover:from-blue-700 hover:to-blue-800 text-left transition-all">
                <div className="flex items-center space-x-3">
                  <span>✨</span>
                  <div>
                    <h3 className="font-semibold">Create Article</h3>
                    <p className="text-sm opacity-90">Write a new news article</p>
                  </div>
                </div>
              </button>
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg hover:from-green-700 hover:to-green-800 text-left transition-all">
                <div className="flex items-center space-x-3">
                  <span>📊</span>
                  <div>
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm opacity-90">Check site performance</p>
                  </div>
                </div>
              </button>
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 rounded-lg hover:from-purple-700 hover:to-purple-800 text-left transition-all">
                <div className="flex items-center space-x-3">
                  <span>👥</span>
                  <div>
                    <h3 className="font-semibold">Manage Users</h3>
                    <p className="text-sm opacity-90">User administration</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                stats.systemStatus.server.status === 'online' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    stats.systemStatus.server.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Server Status</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    stats.systemStatus.server.status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.systemStatus.server.status}
                  </span>
                  <p className="text-xs text-gray-500">Uptime: {stats.systemStatus.server.uptime}</p>
                </div>
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                stats.systemStatus.database.status === 'connected' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    stats.systemStatus.database.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Database</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    stats.systemStatus.database.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.systemStatus.database.status}
                  </span>
                  <p className="text-xs text-gray-500">Response: {stats.systemStatus.database.responseTime}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">CDN</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{stats.systemStatus.cdn.status}</span>
                  <p className="text-xs text-gray-500">Hit Rate: {stats.systemStatus.cdn.cacheHitRate}</p>
                </div>
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                stats.systemStatus.backup.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    stats.systemStatus.backup.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Backup</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    stats.systemStatus.backup.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {stats.systemStatus.backup.status}
                  </span>
                  <p className="text-xs text-gray-500">Last: {formatTimeAgo(stats.systemStatus.backup.lastBackup)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1">
                  <span className="text-sm text-gray-900 dark:text-white">{activity.message}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Site Speed</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${stats.performanceMetrics.siteSpeed}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.performanceMetrics.siteSpeed}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">User Engagement</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${stats.performanceMetrics.userEngagement}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.performanceMetrics.userEngagement}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Content Quality</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${stats.performanceMetrics.contentQuality}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.performanceMetrics.contentQuality}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">SEO Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${stats.performanceMetrics.seoScore}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.performanceMetrics.seoScore}%</span>
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
