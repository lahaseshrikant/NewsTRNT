"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

interface EngagementMetric {
  id: string;
  title: string;
  slug: string;
  publishedDate: string;
  category: string;
  author: string;
  views: number;
  likes: number;
  comments: number;
  shares: {
    facebook: number;
    twitter: number;
    linkedin: number;
    email: number;
    other: number;
  };
  socialEngagement: number;
  engagementRate: number;
  averageTimeOnPage: number;
  scrollDepth: number;
  returnVisitors: number;
}

interface UserEngagement {
  userId: string;
  username: string;
  avatar: string;
  totalComments: number;
  totalLikes: number;
  totalShares: number;
  engagementScore: number;
  lastActivity: string;
  favoriteCategories: string[];
}

interface EngagementTrend {
  date: string;
  comments: number;
  likes: number;
  shares: number;
  totalEngagement: number;
}

const EngagementAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [engagementType, setEngagementType] = useState<'all' | 'comments' | 'likes' | 'shares'>('all');
  const [sortBy, setSortBy] = useState<'engagement' | 'rate' | 'comments' | 'shares'>('engagement');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock engagement data
  const engagementMetrics: EngagementMetric[] = [
    {
      id: '1',
      title: 'AI Breakthrough in Healthcare Technology',
      slug: 'ai-breakthrough-healthcare',
      publishedDate: '2024-01-15',
      category: 'Technology',
      author: 'Dr. Sarah Johnson',
      views: 15420,
      likes: 892,
      comments: 67,
      shares: {
        facebook: 145,
        twitter: 123,
        linkedin: 56,
        email: 18,
        other: 12
      },
      socialEngagement: 354,
      engagementRate: 8.2,
      averageTimeOnPage: 245,
      scrollDepth: 78.5,
      returnVisitors: 2340
    },
    {
      id: '2',
      title: 'Climate Change Solutions for 2024',
      slug: 'climate-change-solutions-2024',
      publishedDate: '2024-01-18',
      category: 'Environment',
      author: 'Mike Chen',
      views: 12890,
      likes: 1023,
      comments: 89,
      shares: {
        facebook: 234,
        twitter: 189,
        linkedin: 98,
        email: 34,
        other: 12
      },
      socialEngagement: 567,
      engagementRate: 13.1,
      averageTimeOnPage: 312,
      scrollDepth: 82.3,
      returnVisitors: 1890
    },
    {
      id: '3',
      title: 'Remote Work Trends and Future Predictions',
      slug: 'remote-work-trends-2024',
      publishedDate: '2024-01-20',
      category: 'Business',
      author: 'Lisa Wang',
      views: 11230,
      likes: 734,
      comments: 78,
      shares: {
        facebook: 167,
        twitter: 145,
        linkedin: 89,
        email: 32,
        other: 12
      },
      socialEngagement: 445,
      engagementRate: 11.2,
      averageTimeOnPage: 278,
      scrollDepth: 75.8,
      returnVisitors: 1560
    },
    {
      id: '4',
      title: 'Cybersecurity Best Practices for Small Business',
      slug: 'cybersecurity-best-practices',
      publishedDate: '2024-01-08',
      category: 'Technology',
      author: 'Alex Thompson',
      views: 8920,
      likes: 445,
      comments: 34,
      shares: {
        facebook: 78,
        twitter: 56,
        linkedin: 34,
        email: 10,
        other: 0
      },
      socialEngagement: 178,
      engagementRate: 7.4,
      averageTimeOnPage: 198,
      scrollDepth: 68.2,
      returnVisitors: 890
    }
  ];

  // Mock top engaged users
  const topEngagedUsers: UserEngagement[] = [
    {
      userId: '1',
      username: 'TechEnthusiast92',
      avatar: '👨‍💻',
      totalComments: 156,
      totalLikes: 1240,
      totalShares: 89,
      engagementScore: 1485,
      lastActivity: '2024-01-21',
      favoriteCategories: ['Technology', 'Business']
    },
    {
      userId: '2',
      username: 'ClimateActivist',
      avatar: '🌱',
      totalComments: 134,
      totalLikes: 890,
      totalShares: 234,
      engagementScore: 1258,
      lastActivity: '2024-01-21',
      favoriteCategories: ['Environment', 'Politics']
    },
    {
      userId: '3',
      username: 'BusinessAnalyst',
      avatar: '📊',
      totalComments: 98,
      totalLikes: 567,
      totalShares: 145,
      engagementScore: 810,
      lastActivity: '2024-01-20',
      favoriteCategories: ['Business', 'Technology']
    },
    {
      userId: '4',
      username: 'HealthAdvocate',
      avatar: '🏥',
      totalComments: 76,
      totalLikes: 445,
      totalShares: 67,
      engagementScore: 588,
      lastActivity: '2024-01-19',
      favoriteCategories: ['Health', 'Environment']
    }
  ];

  // Mock engagement trends (last 30 days)
  const engagementTrends: EngagementTrend[] = [
    { date: '2024-01-01', comments: 234, likes: 1567, shares: 456, totalEngagement: 2257 },
    { date: '2024-01-02', comments: 189, likes: 1234, shares: 345, totalEngagement: 1768 },
    { date: '2024-01-03', comments: 267, likes: 1890, shares: 567, totalEngagement: 2724 },
    { date: '2024-01-04', comments: 298, likes: 2134, shares: 623, totalEngagement: 3055 },
    { date: '2024-01-05', comments: 156, likes: 1456, shares: 289, totalEngagement: 1901 },
    // More data points would be here in a real app
  ];

  const filteredContent = engagementMetrics.filter(content => {
    const matchesCategory = categoryFilter === 'all' || content.category === categoryFilter;
    return matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'engagement':
        return (b.likes + b.comments + b.socialEngagement) - (a.likes + a.comments + a.socialEngagement);
      case 'rate':
        return b.engagementRate - a.engagementRate;
      case 'comments':
        return b.comments - a.comments;
      case 'shares':
        return b.socialEngagement - a.socialEngagement;
      default:
        return 0;
    }
  });

  const totalEngagement = engagementMetrics.reduce(
    (sum, content) => sum + content.likes + content.comments + content.socialEngagement, 0
  );
  const totalComments = engagementMetrics.reduce((sum, content) => sum + content.comments, 0);
  const totalLikes = engagementMetrics.reduce((sum, content) => sum + content.likes, 0);
  const totalShares = engagementMetrics.reduce(
    (sum, content) => sum + Object.values(content.shares).reduce((shareSum, shareCount) => shareSum + shareCount, 0), 0
  );
  const avgEngagementRate = engagementMetrics.reduce((sum, content) => sum + content.engagementRate, 0) / engagementMetrics.length;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb 
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Analytics', href: '/admin/analytics' },
              { label: 'Engagement Analytics' }
            ]} 
            className="mb-4" 
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Engagement Analytics
              </h1>
              <p className="text-xl text-muted-foreground">
                Track user interactions and community engagement
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Export Report
              </button>
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors">
                Engagement Settings
              </button>
            </div>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Engagement Overview</h2>
          <div className="flex space-x-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : 
                 range === '30d' ? 'Last 30 Days' :
                 range === '90d' ? 'Last 90 Days' : 'Last Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Engagement Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
                <p className="text-2xl font-bold text-foreground">{totalEngagement.toLocaleString()}</p>
                <p className="text-sm text-green-600">+18.5% vs previous period</p>
              </div>
              <div className="text-3xl">💬</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold text-foreground">{totalComments.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12.3% vs previous period</p>
              </div>
              <div className="text-3xl">💭</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Likes</p>
                <p className="text-2xl font-bold text-foreground">{totalLikes.toLocaleString()}</p>
                <p className="text-sm text-green-600">+25.7% vs previous period</p>
              </div>
              <div className="text-3xl">❤️</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="text-2xl font-bold text-foreground">{totalShares.toLocaleString()}</p>
                <p className="text-sm text-green-600">+31.2% vs previous period</p>
              </div>
              <div className="text-3xl">📤</div>
            </div>
          </div>
        </div>

        {/* Engagement Rate Overview */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Average Engagement Rate</h3>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-primary">{avgEngagementRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              <div>Average across all content</div>
              <div className="text-green-600">+2.8% improvement from last period</div>
            </div>
          </div>
        </div>

        {/* Top Engaged Users */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Most Engaged Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Comments</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Likes</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Shares</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Score</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Interests</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {topEngagedUsers.map((user) => (
                  <tr key={user.userId} className="border-t border-border hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{user.avatar}</span>
                        <div>
                          <div className="font-medium text-foreground">{user.username}</div>
                          <div className="text-sm text-muted-foreground">User ID: {user.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{user.totalComments}</td>
                    <td className="p-4 text-foreground">{user.totalLikes}</td>
                    <td className="p-4 text-foreground">{user.totalShares}</td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                        {user.engagementScore}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.favoriteCategories.map((category) => (
                          <span key={category} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-foreground">
                      {new Date(user.lastActivity).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Engagement Breakdown */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Environment">Environment</option>
                <option value="Health">Health</option>
                <option value="Politics">Politics</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="engagement">Sort by Total Engagement</option>
                <option value="rate">Sort by Engagement Rate</option>
                <option value="comments">Sort by Comments</option>
                <option value="shares">Sort by Shares</option>
              </select>
            </div>
          </div>

          {/* Content Engagement Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Article</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Engagement Rate</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Comments</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Likes</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Shares</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Scroll Depth</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Return Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((content) => (
                    <tr key={content.id} className="border-t border-border hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <Link 
                            href={`/articles/${content.slug}`}
                            className="font-medium text-foreground hover:text-primary line-clamp-2"
                          >
                            {content.title}
                          </Link>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                            <span>By {content.author}</span>
                            <span>•</span>
                            <span>{content.category}</span>
                            <span>•</span>
                            <span>{new Date(content.publishedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-semibold text-primary">{content.engagementRate}%</div>
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.min(content.engagementRate * 5, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">💬</span>
                          <span className="font-medium text-foreground">{content.comments}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">❤️</span>
                          <span className="font-medium text-foreground">{content.likes}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-foreground">{content.socialEngagement}</div>
                          <div className="text-xs text-muted-foreground">
                            FB: {content.shares.facebook}, TW: {content.shares.twitter}, LI: {content.shares.linkedin}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-foreground">{content.scrollDepth}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${content.scrollDepth}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">🔄</span>
                          <span className="font-medium text-foreground">{content.returnVisitors}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No engagement data found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngagementAnalytics;

