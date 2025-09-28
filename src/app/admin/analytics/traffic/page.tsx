"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface TrafficData {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface SourceData {
  source: string;
  visitors: number;
  percentage: number;
  color: string;
}

interface PageData {
  page: string;
  views: number;
  uniqueViews: number;
  avgTime: string;
  bounceRate: number;
}

const TrafficAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('pageViews');

  // Mock data - in real app, this would come from API
  const trafficData: TrafficData[] = [
    { date: '2024-01-08', pageViews: 2847, uniqueVisitors: 1923, sessions: 2156, bounceRate: 45.2, avgSessionDuration: 342 },
    { date: '2024-01-09', pageViews: 3251, uniqueVisitors: 2108, sessions: 2489, bounceRate: 42.1, avgSessionDuration: 398 },
    { date: '2024-01-10', pageViews: 2956, uniqueVisitors: 1876, sessions: 2234, bounceRate: 48.7, avgSessionDuration: 311 },
    { date: '2024-01-11', pageViews: 3789, uniqueVisitors: 2456, sessions: 2987, bounceRate: 39.8, avgSessionDuration: 456 },
    { date: '2024-01-12', pageViews: 4123, uniqueVisitors: 2634, sessions: 3198, bounceRate: 37.2, avgSessionDuration: 487 },
    { date: '2024-01-13', pageViews: 3567, uniqueVisitors: 2289, sessions: 2756, bounceRate: 41.5, avgSessionDuration: 423 },
    { date: '2024-01-14', pageViews: 3891, uniqueVisitors: 2501, sessions: 2987, bounceRate: 40.3, avgSessionDuration: 445 }
  ];

  const sourceData: SourceData[] = [
    { source: 'Direct', visitors: 8456, percentage: 38.2, color: '#3B82F6' },
    { source: 'Google Search', visitors: 6734, percentage: 30.4, color: '#10B981' },
    { source: 'Social Media', visitors: 3921, percentage: 17.7, color: '#F59E0B' },
    { source: 'Referral Sites', visitors: 2156, percentage: 9.7, color: '#8B5CF6' },
    { source: 'Email', visitors: 889, percentage: 4.0, color: '#EF4444' }
  ];

  const topPages: PageData[] = [
    { page: '/news/tech/ai-breakthrough-2024', views: 15234, uniqueViews: 12456, avgTime: '4:32', bounceRate: 23.4 },
    { page: '/news/business/market-trends', views: 12876, uniqueViews: 10234, avgTime: '3:45', bounceRate: 31.2 },
    { page: '/news/environment/climate-summit', views: 10567, uniqueViews: 8934, avgTime: '5:12', bounceRate: 19.8 },
    { page: '/news/politics/election-update', views: 9234, uniqueViews: 7456, avgTime: '2:56', bounceRate: 45.6 },
    { page: '/news/health/medical-research', views: 8901, uniqueViews: 7123, avgTime: '4:18', bounceRate: 27.3 },
    { page: '/about', views: 6789, uniqueViews: 5234, avgTime: '1:45', bounceRate: 67.8 },
    { page: '/contact', views: 4567, uniqueViews: 3891, avgTime: '1:23', bounceRate: 72.1 }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentStats = () => {
    const totalPageViews = trafficData.reduce((sum, day) => sum + day.pageViews, 0);
    const totalVisitors = trafficData.reduce((sum, day) => sum + day.uniqueVisitors, 0);
    const totalSessions = trafficData.reduce((sum, day) => sum + day.sessions, 0);
    const avgBounceRate = trafficData.reduce((sum, day) => sum + day.bounceRate, 0) / trafficData.length;
    const avgSessionDuration = trafficData.reduce((sum, day) => sum + day.avgSessionDuration, 0) / trafficData.length;

    return {
      pageViews: totalPageViews,
      visitors: totalVisitors,
      sessions: totalSessions,
      bounceRate: avgBounceRate,
      sessionDuration: avgSessionDuration
    };
  };

  const stats = getCurrentStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Analytics', href: '/admin/analytics' },
          { label: 'Traffic', href: '/admin/analytics/traffic' }
        ]}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Traffic Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Monitor your website traffic, user behavior, and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300">
              📥 Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Page Views</h3>
              <span className="text-2xl">👁️</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{formatNumber(stats.pageViews)}</div>
            <div className="text-sm text-green-600 mt-1">↗️ +12.5% vs last period</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Unique Visitors</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{formatNumber(stats.visitors)}</div>
            <div className="text-sm text-green-600 mt-1">↗️ +8.3% vs last period</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Sessions</h3>
              <span className="text-2xl">🔄</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">{formatNumber(stats.sessions)}</div>
            <div className="text-sm text-green-600 mt-1">↗️ +15.2% vs last period</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Bounce Rate</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">{stats.bounceRate.toFixed(1)}%</div>
            <div className="text-sm text-red-600 mt-1">↗️ +2.1% vs last period</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg. Session</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="text-3xl font-bold text-indigo-600">{formatDuration(Math.round(stats.sessionDuration))}</div>
            <div className="text-sm text-green-600 mt-1">↗️ +5.7% vs last period</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traffic Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Traffic Trends</h2>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground text-sm"
                >
                  <option value="pageViews">Page Views</option>
                  <option value="uniqueVisitors">Unique Visitors</option>
                  <option value="sessions">Sessions</option>
                  <option value="bounceRate">Bounce Rate</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              {/* Simplified chart representation */}
              <div className="space-y-3">
                {trafficData.map((day, index) => {
                  const value = day[selectedMetric as keyof TrafficData] as number;
                  const maxValue = Math.max(...trafficData.map(d => d[selectedMetric as keyof TrafficData] as number));
                  const percentage = (value / maxValue) * 100;
                  
                  return (
                    <div key={day.date} className="flex items-center space-x-3">
                      <div className="w-16 text-xs text-slate-500">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-6 relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {selectedMetric === 'bounceRate' ? `${value.toFixed(1)}%` : formatNumber(value)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground">Traffic Sources</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {sourceData.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="font-medium text-foreground">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">{formatNumber(source.visitors)}</div>
                      <div className="text-sm text-slate-500">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Simple pie chart representation */}
              <div className="mt-6 flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 via-purple-500 to-red-500 relative flex items-center justify-center">
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">Traffic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-bold text-foreground">Top Pages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Page
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Unique Views
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Avg. Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Bounce Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {topPages.map((page, index) => (
                  <tr key={page.page} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground text-sm truncate max-w-xs">
                          {page.page}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground font-semibold">
                      {formatNumber(page.views)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {formatNumber(page.uniqueViews)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {page.avgTime}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        page.bounceRate < 30 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : page.bounceRate < 50
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {page.bounceRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">🔴 Real-time Activity</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Current users and activity on your website
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-600">127</div>
              <div className="text-sm text-slate-500">Active users right now</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">34</div>
              <div className="text-sm text-slate-500">Reading articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">23</div>
              <div className="text-sm text-slate-500">Browsing categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-sm text-slate-500">On homepage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalytics;

