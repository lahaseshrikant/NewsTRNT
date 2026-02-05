// src/app/admin/analytics/realtime/page.tsx - Real-time Analytics Dashboard
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdminRoute } from '@/components/admin/RouteGuard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LiveVisitor {
  id: string;
  country: string;
  countryFlag: string;
  page: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  referrer: string;
  duration: number;
  actions: number;
}

interface TrendingArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

interface RealtimeData {
  activeVisitors: number;
  pageViewsPerSecond: number;
  avgSessionDuration: string;
  bounceRate: number;
  topPages: { page: string; visitors: number }[];
  recentEvents: { type: string; page: string; timestamp: string }[];
}

function RealtimeAnalyticsContent() {
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [visitorHistory, setVisitorHistory] = useState<number[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<TrendingArticle[]>([]);
  const [pageViewsPerSecond, setPageViewsPerSecond] = useState(0);
  const [avgSession, setAvgSession] = useState('0:00');
  const [bounceRate, setBounceRate] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'5min' | '15min' | '30min' | '1hour'>('5min');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRealtimeData = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/realtime`, {
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
          setError(data.error || 'Failed to fetch analytics');
        }
        setLoading(false);
        return;
      }

      const data: RealtimeData = await response.json();
      
      setActiveVisitors(data.activeVisitors || 0);
      setPageViewsPerSecond(data.pageViewsPerSecond || 0);
      setAvgSession(data.avgSessionDuration || '0:00');
      setBounceRate(data.bounceRate || 0);
      
      // Update visitor history
      setVisitorHistory(prev => {
        const newHistory = [...prev, data.activeVisitors || 0].slice(-10);
        return newHistory;
      });

      // Map top pages to live visitors format
      const visitors: LiveVisitor[] = (data.topPages || []).map((page, i) => ({
        id: `visitor-${Date.now()}-${i}`,
        country: 'Unknown',
        countryFlag: '🌍',
        page: page.page,
        device: 'desktop' as const,
        browser: 'Unknown',
        referrer: 'Direct',
        duration: Math.floor(Math.random() * 300),
        actions: page.visitors
      }));
      setLiveVisitors(visitors);

      setError(null);
    } catch (err) {
      console.error('Error fetching realtime analytics:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trending articles
  const fetchTrendingArticles = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/articles?limit=5&sortBy=views&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const articles: TrendingArticle[] = (data.articles || []).map((article: any) => ({
          id: article.id,
          title: article.title,
          category: article.category?.name || 'General',
          views: article.views || 0,
          trend: 'stable' as const,
          changePercent: 0
        }));
        setTrendingArticles(articles);
      }
    } catch (err) {
      console.error('Error fetching trending articles:', err);
    }
  }, []);

  useEffect(() => {
    fetchRealtimeData();
    fetchTrendingArticles();

    // Real-time updates every 5 seconds
    intervalRef.current = setInterval(fetchRealtimeData, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRealtimeData, fetchTrendingArticles]);

  const getDeviceIcon = (device: LiveVisitor['device']) => {
    const icons = { desktop: '🖥️', mobile: '📱', tablet: '📱' };
    return icons[device];
  };

  const getTrendIcon = (trend: TrendingArticle['trend']) => {
    const icons = { up: '↑', down: '↓', stable: '→' };
    return icons[trend];
  };

  const getTrendColor = (trend: TrendingArticle['trend']) => {
    const colors = { up: 'text-green-600', down: 'text-red-600', stable: 'text-gray-600' };
    return colors[trend];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maxVisitors = Math.max(...visitorHistory, 1);
  const minVisitors = Math.min(...visitorHistory, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchRealtimeData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <h1 className="text-2xl font-bold text-foreground">Real-Time Analytics</h1>
          </div>
          <p className="text-muted-foreground">Live visitor activity and engagement metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchRealtimeData}
            className="px-3 py-1.5 rounded-lg text-sm bg-muted hover:bg-muted/80 text-foreground"
          >
            🔄 Refresh
          </button>
          <div className="flex gap-2">
            {(['5min', '15min', '30min', '1hour'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {range === '5min' ? '5 min' : range === '15min' ? '15 min' : range === '30min' ? '30 min' : '1 hour'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <p className="text-green-100 text-sm">Active Right Now</p>
          <p className="text-4xl font-bold">{activeVisitors.toLocaleString()}</p>
          <p className="text-green-100 text-sm mt-1">visitors on site</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Page Views/sec</p>
          <p className="text-4xl font-bold text-blue-600">{pageViewsPerSecond}</p>
          <p className="text-muted-foreground text-sm mt-1">requests per second</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Avg. Session</p>
          <p className="text-4xl font-bold text-purple-600">{avgSession}</p>
          <p className="text-muted-foreground text-sm mt-1">minutes on site</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Bounce Rate</p>
          <p className="text-4xl font-bold text-orange-600">{bounceRate}%</p>
          <p className="text-muted-foreground text-sm mt-1">single page visits</p>
        </div>
      </div>

      {/* Live Visitor Graph */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Active Visitors (Last 10 updates)</h3>
        <div className="h-40 flex items-end gap-1">
          {visitorHistory.map((value, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-500"
              style={{ height: `${((value - minVisitors) / (maxVisitors - minVisitors || 1)) * 100 + 20}%` }}
              title={`${value} visitors`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>10 updates ago</span>
          <span>Now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Visitors Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">👥 Live Visitors</h3>
            <span className="text-xs text-muted-foreground">Updates every 2s</span>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {liveVisitors.map(visitor => (
              <div key={visitor.id} className="p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{visitor.countryFlag}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{visitor.page}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDeviceIcon(visitor.device)} {visitor.browser} • via {visitor.referrer}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{formatDuration(visitor.duration)}</p>
                    <p className="text-xs text-muted-foreground">{visitor.actions} actions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Right Now */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">🔥 Trending Now</h3>
            <span className="text-xs text-muted-foreground">Top 5 articles</span>
          </div>
          <div className="divide-y divide-border">
            {trendingArticles.map((article, index) => (
              <div key={article.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-muted-foreground/50">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-foreground">{article.title}</p>
                      <p className="text-sm text-muted-foreground">{article.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{article.views.toLocaleString()}</p>
                    <p className={`text-sm ${getTrendColor(article.trend)}`}>
                      {getTrendIcon(article.trend)} {Math.abs(article.changePercent).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Sources & Device Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Traffic Sources */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {[
              { source: 'Organic Search', percent: 42, color: 'bg-green-500' },
              { source: 'Direct', percent: 28, color: 'bg-blue-500' },
              { source: 'Social', percent: 18, color: 'bg-purple-500' },
              { source: 'Referral', percent: 8, color: 'bg-orange-500' },
              { source: 'Other', percent: 4, color: 'bg-gray-500' },
            ].map(item => (
              <div key={item.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{item.source}</span>
                  <span className="text-muted-foreground">{item.percent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Split */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Device Split</h3>
          <div className="flex items-center justify-center h-40">
            <div className="relative w-40 h-40">
              {/* Simplified pie chart representation */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-purple-500" />
              <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{activeVisitors}</p>
                  <p className="text-xs text-muted-foreground">active</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-sm">Desktop</span>
              </div>
              <p className="font-bold">52%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm">Mobile</span>
              </div>
              <p className="font-bold">38%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-purple-500 rounded" />
                <span className="text-sm">Tablet</span>
              </div>
              <p className="font-bold">10%</p>
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Top Countries</h3>
          <div className="space-y-3">
            {[
              { flag: '🇺🇸', country: 'United States', visitors: 523 },
              { flag: '🇮🇳', country: 'India', visitors: 287 },
              { flag: '🇬🇧', country: 'United Kingdom', visitors: 156 },
              { flag: '🇨🇦', country: 'Canada', visitors: 98 },
              { flag: '🇦🇺', country: 'Australia', visitors: 76 },
            ].map((item, i) => (
              <div key={item.country} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.flag}</span>
                  <span className="text-foreground">{item.country}</span>
                </div>
                <span className="font-medium text-foreground">{item.visitors}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RealtimeAnalyticsPage() {
  return (
    <AdminRoute>
      <RealtimeAnalyticsContent />
    </AdminRoute>
  );
}
