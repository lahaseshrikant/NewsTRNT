"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import RBACAuth from '@/lib/rbac-auth';
import ErrorHandler from '@/lib/error-handler';

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

interface WebStory {
  id: string;
  title: string;
  slug: string;
  category: string;
  slides: number;
  status: 'published' | 'draft' | 'archived';
  publishedAt: string;
  author: string;
  views: number;
  likes: number;
  shares: number;
  duration: number;
  coverImage: string;
  isFeature: boolean;
  priority: 'high' | 'normal' | 'low';
}

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'published' | 'draft' | 'archived';
type SortBy = 'date' | 'views' | 'title' | 'performance';

export default function WebStoriesAdmin() {
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [webStories, setWebStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const fetchWebStories = async () => {
      setLoading(true);
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        const authToken = RBACAuth.getAuthToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const response = await fetch(`${API_URL}/webstories/admin`, { headers });
        const data = await response.json().catch(() => null);

        if (response.ok) {
          const rawStories = Array.isArray(data) ? data
            : Array.isArray(data?.webStories) ? data.webStories
            : Array.isArray(data?.stories) ? data.stories
            : Array.isArray(data?.data?.webStories) ? data.data.webStories
            : Array.isArray(data?.data?.stories) ? data.data.stories
            : [];

          const stories = rawStories.map((story: any) => ({
            id: story.id,
            title: story.title,
            slug: story.slug || story.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
            category: story.category?.name || story.category || 'Uncategorized',
            slides: story.slidesCount || story.slides?.length || 0,
            status: story.isPublished ? 'published' : (story.isArchived ? 'archived' : 'draft') as WebStory['status'],
            publishedAt: story.publishedAt || story.createdAt,
            author: story.author || 'Staff',
            views: story.viewCount || story.views || 0,
            likes: story.likeCount || story.likes || 0,
            shares: story.shareCount || story.shares || 0,
            duration: story.duration || 30,
            coverImage: story.coverImage || '',
            isFeature: story.isFeature || story.isFeatured || false,
            priority: (story.priority || 'normal') as WebStory['priority'],
          }));
          setWebStories(stories);
        } else {
          const parsedError = ErrorHandler.parseApiError({ status: response.status, data });
          console.error('Failed to fetch web stories:', parsedError.message);
          setWebStories([]);
        }
      } catch (error) {
        const parsedError = ErrorHandler.parseApiError(error);
        console.error('Failed to fetch web stories:', parsedError.message);
        setWebStories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWebStories();
  }, []);

  const filteredStories = webStories
    .filter(story => {
      const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'views': return b.views - a.views;
        case 'title': return a.title.localeCompare(b.title);
        case 'performance': return (b.likes + b.shares) - (a.likes + a.shares);
        default: return 0;
      }
    });

  const handleSelectStory = (id: string) => {
    setSelectedStories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkAction = async (action: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const authToken = RBACAuth.getAuthToken();
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      await fetch(`${API_URL}/webstories/admin/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, ids: selectedStories })
      });
    } catch {}
    setSelectedStories([]);
  };

  const fmtViews = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(1)}K` : String(v);
  const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const totalStories = webStories.length;
  const publishedCount = webStories.filter(s => s.status === 'published').length;
  const draftCount = webStories.filter(s => s.status === 'draft').length;
  const totalViews = webStories.reduce((sum, s) => sum + s.views, 0);

  const statusStyle = (s: string) => {
    const map: Record<string, string> = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[s] || map.draft;
  };

  const priorityIcon: Record<string, string> = { high: '🔥', normal: '📊', low: '📝' };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/' },
          { label: 'Content', href: '/content' },
          { label: 'Web Stories' }
        ]}
        className="mb-4"
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Web Stories</h1>
          <p className="text-muted-foreground mt-1">Create immersive visual stories for mobile-first audiences</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/content/web-stories/create"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Create Story
          </Link>
          <button className="px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
            Import
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Stories', value: totalStories, icon: '📱', color: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20' },
          { label: 'Published', value: publishedCount, icon: '✅', color: 'from-green-500/10 to-emerald-500/10 dark:from-green-900/20 dark:to-emerald-900/20' },
          { label: 'Drafts', value: draftCount, icon: '✏️', color: 'from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20' },
          { label: 'Total Views', value: fmtViews(totalViews), icon: '👁️', color: 'from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20' },
        ].map(stat => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border border-border rounded-2xl p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px] lg:min-w-[280px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            >
              <option value="date">Newest</option>
              <option value="views">Most Viewed</option>
              <option value="title">Title A-Z</option>
              <option value="performance">Best Performing</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {selectedStories.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => handleBulkAction('publish')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                  Publish ({selectedStories.length})
                </button>
                <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                  Delete
                </button>
              </div>
            )}
            <div className="flex bg-muted rounded-lg p-0.5">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                Grid
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[9/16] w-full bg-muted max-h-[200px]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStories.map(story => (
            <div key={story.id} className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
              {/* Cover */}
              <div className="relative aspect-[9/16] max-h-[200px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 overflow-hidden">
                {story.coverImage && (
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${story.coverImage})` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Select checkbox */}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedStories.includes(story.id)}
                    onChange={() => handleSelectStory(story.id)}
                    className="w-4 h-4 rounded border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle(story.status)}`}>
                    {story.status}
                  </span>
                  {story.isFeature && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                {/* Duration + slides */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-xs font-medium">
                  <span className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">{story.slides} slides</span>
                  <span className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">{fmtDuration(story.duration)}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <Link href={`/content/web-stories/create?id=${story.id}`} className="block">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {story.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{story.category}</span>
                  <span>•</span>
                  <span>{story.author}</span>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">👁️ {fmtViews(story.views)}</span>
                  <span className="flex items-center gap-1">❤️ {fmtViews(story.likes)}</span>
                  <span className="flex items-center gap-1">📤 {fmtViews(story.shares)}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">{new Date(story.publishedAt).toLocaleDateString()}</span>
                  <span className="text-xs">{priorityIcon[story.priority]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === 'list' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-4 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedStories.length === filteredStories.length && filteredStories.length > 0}
                      onChange={() => setSelectedStories(
                        selectedStories.length === filteredStories.length ? [] : filteredStories.map(s => s.id)
                      )}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Story</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Performance</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStories.map(story => (
                  <tr key={story.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <input type="checkbox" checked={selectedStories.includes(story.id)} onChange={() => handleSelectStory(story.id)} className="rounded border-border" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg overflow-hidden shrink-0">
                          {story.coverImage && <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${story.coverImage})` }} />}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/content/web-stories/create?id=${story.id}`} className="font-medium text-foreground text-sm hover:text-blue-600 line-clamp-1">
                            {story.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">{story.category} • {story.slides} slides • {fmtDuration(story.duration)}</p>
                          <p className="text-xs text-muted-foreground">By {story.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(story.status)}`}>{story.status}</span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="text-xs space-y-0.5 text-muted-foreground">
                        <span className="flex items-center gap-1">👁️ {fmtViews(story.views)}</span>
                        <span className="flex items-center gap-1">❤️ {story.likes} 📤 {story.shares}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-xs text-muted-foreground">{new Date(story.publishedAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/content/web-stories/create?id=${story.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs font-medium">
                          Edit
                        </Link>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 text-xs font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredStories.length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">📱</span>
          <h3 className="text-xl font-semibold text-foreground mb-2">No web stories found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first web story to captivate your audience'}
          </p>
          <Link
            href="/content/web-stories/create"
            className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Create First Story
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredStories.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
          <span>Showing {filteredStories.length} of {totalStories} stories</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/50 transition-colors">Prev</button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium">1</button>
            <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/50 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}


