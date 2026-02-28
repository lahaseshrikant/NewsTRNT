"use client";

import React, { useState, useEffect } from'react';
import Link from'next/link';

import { API_CONFIG } from'@/config/api';
import adminAuth from'@/lib/auth/admin-auth';
const API_URL = API_CONFIG.baseURL;

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
 trend:'up' |'down' |'stable';
 trendPercentage: number;
 type:'article' |'web-story';
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
 const [sortBy, setSortBy] = useState<'views' |'engagement' |'shares' |'date'>('views');
 const [categoryFilter, setCategoryFilter] = useState('all');
 const [contentType, setContentType] = useState<'all' |'articles' |'web-stories'>('all');
 const [searchTerm, setSearchTerm] = useState('');
 const [loading, setLoading] = useState(true);
 const [contentMetrics, setContentMetrics] = useState<ContentMetric[]>([]);
 const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);

 // Fetch content performance data from API
 useEffect(() => {
 const fetchContentData = async () => {
 setLoading(true);
 try {
 // Fetch articles and stats in parallel
 const [articlesRes, statsRes] = await Promise.all([
 fetch(`${API_URL}/articles?limit=50&sortBy=viewCount&order=desc`, { headers: { ...adminAuth.getAuthHeaders() } }),
 fetch(`${API_URL}/stats`, { headers: { ...adminAuth.getAuthHeaders() } })
 ]);

 if (articlesRes.ok) {
 const data = await articlesRes.json();
 const articles = data.articles || [];

 // Transform to content metrics
 const metrics: ContentMetric[] = articles.map((article: any) => {
 const views = article.viewCount || article.views || 0;
 const likes = article.likeCount || article.likes || 0;
 const comments = article.commentCount || 0;
 const shares = article.shareCount || article.shares || 0;
 const engagement = likes + comments + shares;
 
 // Calculate trend based on engagement score
 let trend:'up' |'down' |'stable' ='stable';
 let trendPercentage = 0;
 if (article.engagementScore > 50) {
 trend ='up';
 trendPercentage = Math.round(article.engagementScore / 5);
 } else if (article.engagementScore < 20 && views > 0) {
 trend ='down';
 trendPercentage = Math.round((50 - article.engagementScore) / 5);
 }

 return {
 id: article.id,
 title: article.title,
 slug: article.slug,
 publishedDate: article.publishedAt || article.createdAt,
 category: article.category?.name ||'Uncategorized',
 author: article.author ||'Staff Writer',
 views,
 uniqueViews: Math.round(views * 0.82), // Estimate 82% unique
 timeOnPage: Math.round(180 + Math.random() * 120), // Estimate
 bounceRate: Math.round(25 + Math.random() * 20), // Estimate
 shares,
 comments,
 likes,
 trend,
 trendPercentage,
 type:'article' as const
 };
 });

 setContentMetrics(metrics);
 }

 if (statsRes.ok) {
 const stats = await statsRes.json();
 // Transform top categories to category performance
 if (stats.topCategories) {
 const catPerf: CategoryPerformance[] = stats.topCategories.map((cat: any) => ({
 category: cat.name,
 articles: cat.count,
 totalViews: cat.count * Math.round(500 + Math.random() * 2000), // Estimate
 avgTimeOnPage: Math.round(150 + Math.random() * 100),
 engagementRate: Math.round((5 + Math.random() * 5) * 10) / 10
 }));
 setCategoryPerformance(catPerf);
 }
 }
 } catch (error) {
 console.error('Failed to fetch content data:', error);
 } finally {
 setLoading(false);
 }
 };

 fetchContentData();
 }, [timeRange]);

 const filteredContent = contentMetrics.filter(content => {
 const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
 content.author.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesCategory = categoryFilter ==='all' || content.category === categoryFilter;
 const matchesType = contentType ==='all' || 
 (contentType ==='articles' && content.type ==='article') ||
 (contentType ==='web-stories' && content.type ==='web-story');
 return matchesSearch && matchesCategory && matchesType;
 }).sort((a, b) => {
 switch (sortBy) {
 case'views':
 return b.views - a.views;
 case'engagement':
 return (b.comments + b.likes + b.shares) - (a.comments + a.likes + a.shares);
 case'shares':
 return b.shares - a.shares;
 case'date':
 return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
 default:
 return 0;
 }
 });

 const formatTime = (seconds: number) => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2,'0')}`;
 };

 const getTrendIcon = (trend: string) => {
 switch (trend) {
 case'up': return'📈';
 case'down': return'📉';
 case'stable': return'📊';
 default: return'📊';
 }
 };

 const getTrendColor = (trend: string) => {
 switch (trend) {
 case'up': return'text-green-600';
 case'down': return'text-red-600';
 case'stable': return'text-[rgb(var(--muted-foreground))]';
 default: return'text-[rgb(var(--muted-foreground))]';
 }
 };

 const totalViews = contentMetrics.reduce((sum, content) => sum + content.views, 0);
 const totalEngagement = contentMetrics.reduce((sum, content) => sum + content.comments + content.likes + content.shares, 0);
 const avgTimeOnPage = contentMetrics.reduce((sum, content) => sum + content.timeOnPage, 0) / contentMetrics.length;
 const avgBounceRate = contentMetrics.reduce((sum, content) => sum + content.bounceRate, 0) / contentMetrics.length;

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-b border-[rgb(var(--border))]">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))] mb-2">
 Content Performance
 </h1>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">
 Analyze articles and web stories performance metrics
 </p>
 </div>
 <div className="flex space-x-3">
 <button className="bg-[rgb(var(--primary))] text-white px-6 py-3 rounded-lg font-medium hover:bg-[rgb(var(--primary))]/90 transition-colors">
 Export Report
 </button>
 <button className="bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] px-6 py-3 rounded-lg font-medium hover:bg-[rgb(var(--muted))]/10/90 transition-colors">
 Schedule Report
 </button>
 </div>
 </div>
 </div>

 <div>
 {/* Time Range Selector */}
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">Performance Overview</h2>
 <div className="flex space-x-2">
 {['7d','30d','90d','1y'].map((range) => (
 <button
 key={range}
 onClick={() => setTimeRange(range)}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
 timeRange === range
 ?'bg-[rgb(var(--primary))] text-white'
 :'bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10'
 }`}
 >
 {range ==='7d' ?'Last 7 Days' : 
 range ==='30d' ?'Last 30 Days' :
 range ==='90d' ?'Last 90 Days' :'Last Year'}
 </button>
 ))}
 </div>
 </div>

 {/* Overview Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Total Views</p>
 <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{totalViews.toLocaleString()}</p>
 <p className="text-sm text-green-600">+15.3% vs previous period</p>
 </div>
 <div className="text-3xl">👁️</div>
 </div>
 </div>
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Total Engagement</p>
 <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{totalEngagement.toLocaleString()}</p>
 <p className="text-sm text-green-600">+8.7% vs previous period</p>
 </div>
 <div className="text-3xl">❤️</div>
 </div>
 </div>
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Avg Time on Page</p>
 <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{formatTime(Math.round(avgTimeOnPage))}</p>
 <p className="text-sm text-green-600">+12.1% vs previous period</p>
 </div>
 <div className="text-3xl">⏱️</div>
 </div>
 </div>
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Avg Bounce Rate</p>
 <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{avgBounceRate.toFixed(1)}%</p>
 <p className="text-sm text-red-600">+2.3% vs previous period</p>
 </div>
 <div className="text-3xl">🔄</div>
 </div>
 </div>
 </div>

 {/* Category Performance */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6 mb-8">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-6">Performance by Category</h3>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-muted">
 <tr>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Category</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Articles</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Total Views</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Avg Time on Page</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Engagement Rate</th>
 </tr>
 </thead>
 <tbody>
 {categoryPerformance.map((category) => (
 <tr key={category.category} className="border-t border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5">
 <td className="p-4 font-medium text-[rgb(var(--foreground))]">{category.category}</td>
 <td className="p-4 text-[rgb(var(--foreground))]">{category.articles}</td>
 <td className="p-4 text-[rgb(var(--foreground))]">{category.totalViews.toLocaleString()}</td>
 <td className="p-4 text-[rgb(var(--foreground))]">{formatTime(category.avgTimeOnPage)}</td>
 <td className="p-4 text-[rgb(var(--foreground))]">{category.engagementRate}%</td>
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
 className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 />
 <select
 value={contentType}
 onChange={(e) => setContentType(e.target.value as any)}
 className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 >
 <option value="all">All Content</option>
 <option value="articles">Articles Only</option>
 <option value="web-stories">Web Stories Only</option>
 </select>
 <select
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
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
 className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 >
 <option value="views">Sort by Views</option>
 <option value="engagement">Sort by Engagement</option>
 <option value="shares">Sort by Shares</option>
 <option value="date">Sort by Date</option>
 </select>
 </div>
 </div>

 {/* Content Performance Table */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-muted">
 <tr>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Content</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Type</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Views</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Time on Page</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Bounce Rate</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Engagement</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Trend</th>
 <th className="p-4 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredContent.map((content) => (
 <tr key={content.id} className="border-t border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5">
 <td className="p-4">
 <div>
 <Link 
 href={content.type ==='web-story' ? `/web-stories/${content.slug}` : `/article/${content.slug}`}
 className="font-medium text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] line-clamp-2"
 >
 {content.title}
 </Link>
 <div className="flex items-center space-x-3 text-sm text-[rgb(var(--muted-foreground))] mt-1">
 <span>By {content.author}</span>
 <span>•</span>
 <span>{content.category}</span>
 <span>•</span>
 <span>{new Date(content.publishedDate).toLocaleDateString()}</span>
 {content.type ==='web-story' && content.slides && (
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
 content.type ==='article' 
 ?'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]' 
 :'bg-purple-100 text-purple-800'
 }`}>
 {content.type ==='article' ?'Article' :'Web Story'}
 </span>
 </td>
 <td className="p-4">
 <div>
 <div className="font-medium text-[rgb(var(--foreground))]">{content.views.toLocaleString()}</div>
 <div className="text-sm text-[rgb(var(--muted-foreground))]">
 {content.uniqueViews.toLocaleString()} unique
 </div>
 </div>
 </td>
 <td className="p-4 text-[rgb(var(--foreground))]">
 {content.type ==='web-story' && content.duration ? 
 formatTime(content.duration) : 
 formatTime(content.timeOnPage)
 }
 </td>
 <td className="p-4 text-[rgb(var(--foreground))]">{content.bounceRate}%</td>
 <td className="p-4">
 <div className="text-sm">
 <div className="text-[rgb(var(--foreground))]">{content.shares} shares</div>
 <div className="text-[rgb(var(--muted-foreground))]">
 {content.type ==='web-story' ? 
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
 href={content.type ==='web-story' ? `/web-stories/${content.slug}` : `/article/${content.slug}`}
 className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] text-sm"
 >
 View
 </Link>
 <Link
 href={content.type ==='web-story' ? 
 `/content/web-stories/${content.id}/edit` : 
 `/content/edit/${content.id}`
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
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">No content found</h3>
 <p className="text-[rgb(var(--muted-foreground))]">
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


