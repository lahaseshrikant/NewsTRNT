"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

interface ContentMetric {
  id: string;
  title: string;
  slug: string;
  publishedDate: string;
  category: string;
  author: string;
  views: number;
  uniqueViews: number;
  timeOnPage: number;
  bounceRate: number;
  shares: number;
  comments: number;
  likes: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  type: 'article' | 'web-story';
  duration?: number; // for web stories
  slides?: number; // for web stories
}

interface CategoryPerformance {
  category: string;
  articles: number;
  totalViews: number;
  avgTimeOnPage: number;
  engagementRate: number;
}

const ContentPerformance: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [sortBy, setSortBy] = useState<'views' | 'engagement' | 'shares' | 'date'>('views');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [contentType, setContentType] = useState<'all' | 'articles' | 'web-stories'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock content performance data
  const contentMetrics: ContentMetric[] = [
    {
      id: '1',
      title: 'AI Breakthrough in Healthcare Technology',
      slug: 'ai-breakthrough-healthcare',
      publishedDate: '2024-01-15',
      category: 'Technology',
      author: 'Dr. Sarah Johnson',
      views: 15420,
      uniqueViews: 12340,
      timeOnPage: 245, // seconds
      bounceRate: 35.2,
      shares: 342,
      comments: 67,
      likes: 892,
      trend: 'up',
      trendPercentage: 23.5,
      type: 'article'
    },
    {
      id: '2',
      title: 'Climate Change Solutions for 2024',
      slug: 'climate-change-solutions-2024',
      publishedDate: '2024-01-18',
      category: 'Environment',
      author: 'Mike Chen',
      views: 12890,
      uniqueViews: 10120,
      timeOnPage: 312,
      bounceRate: 28.7,
      shares: 567,
      comments: 89,
      likes: 1023,
      trend: 'up',
      trendPercentage: 18.3,
      type: 'article'
    },
    {
      id: '3',
      title: 'Economic Outlook for Q1 2024',
      slug: 'economic-outlook-q1-2024',
      publishedDate: '2024-01-12',
      category: 'Business',
      author: 'Robert Kim',
      views: 9870,
      uniqueViews: 8210,
      timeOnPage: 189,
      bounceRate: 42.1,
      shares: 234,
      comments: 45,
      likes: 567,
      trend: 'down',
      trendPercentage: 12.8,
      type: 'article'
    },
    {
      id: '4',
      title: 'Remote Work Trends and Future Predictions',
      slug: 'remote-work-trends-2024',
      publishedDate: '2024-01-20',
      category: 'Business',
      author: 'Lisa Wang',
      views: 11230,
      uniqueViews: 9450,
      timeOnPage: 278,
      bounceRate: 31.5,
      shares: 445,
      comments: 78,
      likes: 734,
      trend: 'up',
      trendPercentage: 34.2,
      type: 'article'
    },
    {
      id: '5',
      title: 'Cybersecurity Best Practices for Small Business',
      slug: 'cybersecurity-best-practices',
      publishedDate: '2024-01-08',
      category: 'Technology',
      author: 'Alex Thompson',
      views: 8920,
      uniqueViews: 7340,
      timeOnPage: 198,
      bounceRate: 38.9,
      shares: 178,
      comments: 34,
      likes: 445,
      trend: 'stable',
      trendPercentage: 2.1,
      type: 'article'
    },
    {
      id: '6',
      title: 'Climate Summit 2024: Visual Story',
      slug: 'climate-summit-2024-story',
      publishedDate: '2024-01-21',
      category: 'Environment',
      author: 'Environmental Team',
      views: 18500,
      uniqueViews: 15200,
      timeOnPage: 45, // duration for web stories
      bounceRate: 22.3,
      shares: 678,
      comments: 0, // web stories typically don't have comments
      likes: 1340,
      trend: 'up',
      trendPercentage: 42.1,
      type: 'web-story',
      duration: 45,
      slides: 4
    },
    {
      id: '7',
      title: 'AI Revolution in Healthcare Story',
      slug: 'ai-healthcare-story',
      publishedDate: '2024-01-21',
      category: 'Technology',
      author: 'Tech News',
      views: 14200,
      uniqueViews: 11800,
      timeOnPage: 60, // duration
      bounceRate: 18.7,
      shares: 445,
      comments: 0,
      likes: 892,
      trend: 'up',
      trendPercentage: 28.5,
      type: 'web-story',
      duration: 60,
      slides: 5
    }
  ];

  // Mock category performance data
  const categoryPerformance: CategoryPerformance[] = [
    {
      category: 'Technology',
      articles: 45,
      totalViews: 235670,
      avgTimeOnPage: 221,
      engagementRate: 8.7
    },
    {
      category: 'Business',
      articles: 38,
      totalViews: 189430,
      avgTimeOnPage: 198,
      engagementRate: 6.4
    },
    {
      category: 'Environment',
      articles: 22,
      totalViews: 145280,
      avgTimeOnPage: 267,
      engagementRate: 9.2
    },
    {
      category: 'Health',
      articles: 31,
      totalViews: 167890,
      avgTimeOnPage: 243,
      engagementRate: 7.8
    },
    {
      category: 'Politics',
      articles: 19,
      totalViews: 98750,
      avgTimeOnPage: 156,
      engagementRate: 5.3
    }
  ];

  const filteredContent = contentMetrics.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || content.category === categoryFilter;
    const matchesType = contentType === 'all' || 
                       (contentType === 'articles' && content.type === 'article') ||
                       (contentType === 'web-stories' && content.type === 'web-story');
    return matchesSearch && matchesCategory && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.views - a.views;
      case 'engagement':
        return (b.comments + b.likes + b.shares) - (a.comments + a.likes + a.shares);
      case 'shares':
        return b.shares - a.shares;
      case 'date':
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      default:
        return 0;
    }
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '📊';
      default: return '📊';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
  case 'stable': return 'text-slate-600 dark:text-slate-400';
  default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const totalViews = contentMetrics.reduce((sum, content) => sum + content.views, 0);
  const totalEngagement = contentMetrics.reduce((sum, content) => sum + content.comments + content.likes + content.shares, 0);
  const avgTimeOnPage = contentMetrics.reduce((sum, content) => sum + content.timeOnPage, 0) / contentMetrics.length;
  const avgBounceRate = contentMetrics.reduce((sum, content) => sum + content.bounceRate, 0) / contentMetrics.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb 
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Analytics', href: '/admin/analytics' },
              { label: 'Content Performance' }
            ]} 
            className="mb-4" 
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Content Performance
              </h1>
              <p className="text-xl text-muted-foreground">
                Analyze articles and web stories performance metrics
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Export Report
              </button>
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors">
                Schedule Report
              </button>
            </div>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Performance Overview</h2>
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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600">+15.3% vs previous period</p>
              </div>
              <div className="text-3xl">👁️</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
                <p className="text-2xl font-bold text-foreground">{totalEngagement.toLocaleString()}</p>
                <p className="text-sm text-green-600">+8.7% vs previous period</p>
              </div>
              <div className="text-3xl">❤️</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Time on Page</p>
                <p className="text-2xl font-bold text-foreground">{formatTime(Math.round(avgTimeOnPage))}</p>
                <p className="text-sm text-green-600">+12.1% vs previous period</p>
              </div>
              <div className="text-3xl">⏱️</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Bounce Rate</p>
                <p className="text-2xl font-bold text-foreground">{avgBounceRate.toFixed(1)}%</p>
                <p className="text-sm text-red-600">+2.3% vs previous period</p>
              </div>
              <div className="text-3xl">🔄</div>
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Performance by Category</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Articles</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Total Views</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Avg Time on Page</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Engagement Rate</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map((category) => (
                  <tr key={category.category} className="border-t border-border hover:bg-muted/50">
                    <td className="p-4 font-medium text-foreground">{category.category}</td>
                    <td className="p-4 text-foreground">{category.articles}</td>
                    <td className="p-4 text-foreground">{category.totalViews.toLocaleString()}</td>
                    <td className="p-4 text-foreground">{formatTime(category.avgTimeOnPage)}</td>
                    <td className="p-4 text-foreground">{category.engagementRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters and Content List */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="all">All Content</option>
                <option value="articles">Articles Only</option>
                <option value="web-stories">Web Stories Only</option>
              </select>
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
                <option value="views">Sort by Views</option>
                <option value="engagement">Sort by Engagement</option>
                <option value="shares">Sort by Shares</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          </div>

          {/* Content Performance Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Content</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Views</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Time on Page</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Bounce Rate</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Engagement</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Trend</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((content) => (
                    <tr key={content.id} className="border-t border-border hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <Link 
                            href={content.type === 'web-story' ? `/web-stories/${content.id}` : `/articles/${content.slug}`}
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
                            {content.type === 'web-story' && content.slides && (
                              <>
                                <span>•</span>
                                <span>{content.slides} slides</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          content.type === 'article' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {content.type === 'article' ? '📄 Article' : '📱 Web Story'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-foreground">{content.views.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {content.uniqueViews.toLocaleString()} unique
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-foreground">
                        {content.type === 'web-story' && content.duration ? 
                          formatTime(content.duration) : 
                          formatTime(content.timeOnPage)
                        }
                      </td>
                      <td className="p-4 text-foreground">{content.bounceRate}%</td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-foreground">{content.shares} shares</div>
                          <div className="text-muted-foreground">
                            {content.type === 'web-story' ? 
                              `${content.likes} likes` : 
                              `${content.comments} comments, ${content.likes} likes`
                            }
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center space-x-1 ${getTrendColor(content.trend)}`}>
                          <span>{getTrendIcon(content.trend)}</span>
                          <span className="text-sm font-medium">{content.trendPercentage}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Link
                            href={content.type === 'web-story' ? `/web-stories/${content.id}` : `/articles/${content.slug}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </Link>
                          <Link
                            href={content.type === 'web-story' ? 
                              `/admin/content/web-stories/${content.id}/edit` : 
                              `/admin/content/edit/${content.id}`
                            }
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Edit
                          </Link>
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
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No content found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentPerformance;

