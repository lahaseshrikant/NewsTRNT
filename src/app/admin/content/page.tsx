"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';
import { articleAPI } from '@/lib/api';

interface Article {
  id: string;
  title: string;
  slug?: string;
  category: { name: string; slug: string } | null;
  author: { fullName: string } | null;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
  updatedAt: string;
  // Make viewCount optional since backend Article type may omit it or name it differently
  viewCount?: number;
  isFeatured?: boolean;
}

const ContentManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Technology', 'Environment', 'Business', 'Politics', 'Sports', 'Entertainment'];
  const statuses = ['draft', 'published', 'scheduled'];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, selectedStatus, searchTerm]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the articleAPI client instead of direct fetch
      const params = {
        page: 1,
        limit: 50,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: 'updatedAt',
        sortOrder: 'desc' as const
      };

      const response = await articleAPI.getArticles(params);
      
      if (response.success) {
  const raw = (response.articles || []) as any[];
        // Normalize to local Article shape with safe defaults
        const normalized: Article[] = raw.map(a => ({
          id: a.id,
          title: a.title || '(Untitled)',
          slug: a.slug,
            // Some APIs might return categoryName or category; handle both
          category: a.category || (a.categoryName ? { name: a.categoryName, slug: a.categorySlug || a.categoryName.toLowerCase().replace(/\s+/g,'-') } : null),
          author: a.author || (a.authorName ? { fullName: a.authorName } : null),
          status: a.status || 'draft',
          publishedAt: a.publishedAt || null,
          updatedAt: a.updatedAt || a.createdAt || new Date().toISOString(),
          viewCount: typeof a.viewCount === 'number' ? a.viewCount : (a.views ?? 0),
          isFeatured: !!a.isFeatured
        }));
        setArticles(normalized);
      } else {
        setError('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(`Failed to fetch articles: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      // Remove the article from local state
      setArticles(prev => prev.filter(article => article.id !== articleId));
      
      // Show success message (you could add a toast notification here)
      console.log('Article deleted successfully');
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article. Please try again.');
    }
  };

  const filteredArticles = articles.filter(article => {
    const categoryMatch = selectedCategory === 'all' || article.category?.name === selectedCategory;
    const statusMatch = selectedStatus === 'all' || article.status === selectedStatus;
    const searchMatch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
  });

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    drafts: articles.filter(a => a.status === 'draft').length,
    totalViews: articles.reduce((sum, a) => sum + (a.viewCount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Content Management' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Content Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage articles and news content</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              📝 New Article
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              📁 Manage Categories
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{articles.length}</div>
            <div className="text-sm text-muted-foreground">Total Articles</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">
              {articles.filter(a => a.status === 'published').length}
            </div>
            <div className="text-sm text-muted-foreground">Published</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">
              {articles.filter(a => a.status === 'draft').length}
            </div>
            <div className="text-sm text-muted-foreground">Drafts</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground w-64"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1"></div>
            <div className="flex space-x-2">
              <button 
                onClick={fetchArticles}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                🔄 Refresh
              </button>
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
                📊 Export
              </button>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>{error}</p>
              <button 
                onClick={fetchArticles}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Article</th>
                    <th className="text-left p-4 font-medium text-foreground">Category</th>
                    <th className="text-left p-4 font-medium text-foreground">Author</th>
                    <th className="text-left p-4 font-medium text-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-foreground">Views</th>
                    <th className="text-left p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article, index) => (
                    <tr key={article.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {article.isFeatured && <span className="text-yellow-500">⭐</span>}
                          <div>
                            <div className="font-medium text-foreground">{article.title}</div>
                            <div className="text-sm text-muted-foreground">ID: {article.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                          {article.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-4 text-foreground">{article.author?.fullName || 'Unknown'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(article.status)}`}>
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-foreground">{formatDate(article.publishedAt || article.updatedAt)}</td>
                      <td className="p-4 text-foreground">{(article.viewCount || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/content/new?id=${article.id}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            title="Edit article"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => window.open(`/article/${article.slug || article.id}`, '_blank')}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                            title="Preview article"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete article"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredArticles.length} of {articles.length} articles
          </div>
          <div className="flex space-x-2">
            <button className="bg-secondary text-secondary-foreground px-3 py-2 rounded hover:bg-secondary/90 transition-colors">
              Previous
            </button>
            <button className="bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminContentPage() {
  return (
    <UnifiedAdminGuard>
      <ContentManagement />
    </UnifiedAdminGuard>
  );
}
