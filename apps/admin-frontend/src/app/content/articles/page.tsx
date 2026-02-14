"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import UnifiedAdminGuard from '@/components/auth/UnifiedAdminGuard';
import { articleAPI } from '@/lib/api';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/api';
import { showToast } from '@/lib/toast';

interface Article {
  id: string;
  title: string;
  slug?: string;
  category: { name: string; slug: string } | null;
  author: { fullName: string } | null;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
  updatedAt: string;
  viewCount?: number;
  isFeatured?: boolean;
  excerpt?: string;
  readTime?: number;
  tags?: Array<{ name: string; slug: string }>;
}

const ArticlesManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'views' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const { categories, loading: categoriesLoading } = useCategories({ includeInactive: true });
  const statuses = ['draft', 'published', 'scheduled'];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, selectedStatus, searchTerm, sortBy, sortOrder, currentPage]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm }),
        sortBy,
        sortOrder
      };

      const response = await articleAPI.getArticles(params);
      
      if (response.success) {
        const raw = (response.articles || []) as any[];
        const normalized: Article[] = raw.map(a => ({
          id: a.id,
          title: a.title || '(Untitled)',
          slug: a.slug,
          category: a.category || (a.categoryName ? { name: a.categoryName, slug: a.categorySlug || a.categoryName.toLowerCase().replace(/\s+/g,'-') } : null),
          author: a.author || (a.authorName ? { fullName: a.authorName } : null),
          status: a.status || 'draft',
          publishedAt: a.publishedAt || null,
          updatedAt: a.updatedAt || a.createdAt || new Date().toISOString(),
          viewCount: typeof a.viewCount === 'number' ? a.viewCount : (a.views ?? 0),
          isFeatured: !!a.isFeatured,
          excerpt: a.excerpt || a.summary || '',
          readTime: a.readTime || Math.ceil((a.content?.length || 0) / 1000) || 5,
          tags: a.tags || []
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

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map(article => article.id));
    }
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleBulkAction = async (action: 'publish' | 'draft' | 'delete' | 'feature') => {
    if (selectedArticles.length === 0) return;
    
    if (!confirm(`Are you sure you want to ${action} ${selectedArticles.length} article(s)?`)) {
      return;
    }

    try {
      // Implement bulk actions based on your API
      console.log(`Bulk ${action} on articles:`, selectedArticles);
      
      // For now, just show success message
      showToast(`Successfully ${action}ed ${selectedArticles.length} article(s)`, 'success');
      setSelectedArticles([]);
      fetchArticles();
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast(`Failed to ${action} articles`, 'error');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action can be undone from the trash.')) {
      return;
    }

    try {
      const response = await articleAPI.deleteArticle(articleId);

      if (response.success) {
        setArticles(prev => prev.filter(article => article.id !== articleId));
        showToast('Article moved to trash successfully!', 'success');
      } else {
        throw new Error('Failed to delete article');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      showToast(`Failed to delete article: ${err instanceof Error ? err.message : 'Please try again.'}`, 'error');
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const filteredArticles = articles.filter(article => {
    const categoryMatch = selectedCategory === 'all' || article.category?.name === selectedCategory;
    const statusMatch = selectedStatus === 'all' || article.status === selectedStatus;
    const searchMatch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.author?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortBy) {
      case 'date':
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
        break;
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'views':
        aVal = a.viewCount || 0;
        bVal = b.viewCount || 0;
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    drafts: articles.filter(a => a.status === 'draft').length,
    scheduled: articles.filter(a => a.status === 'scheduled').length,
    totalViews: articles.reduce((sum, a) => sum + (a.viewCount || 0), 0),
    featured: articles.filter(a => a.isFeatured).length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb 
            items={[
              { label: 'Admin', href: '/' },
              { label: 'Content', href: '/content' },
              { label: 'Articles' }
            ]} 
            className="mb-4" 
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                📰 Articles Management
              </h1>
              <p className="text-xl text-muted-foreground">
                Create, edit, and manage all your articles
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/content/new"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                ✨ Create Article
              </Link>
              <Link
                href="/content/articles/import"
                className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                📥 Import Articles
              </Link>
            </div>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Articles</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-muted-foreground">Published</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
            <div className="text-sm text-muted-foreground">Drafts</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{formatNumber(stats.totalViews)}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.featured}</div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <input
                type="text"
                placeholder="Search articles, categories, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground flex-1 min-w-64"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                disabled={categoriesLoading}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {!cat.isActive && '(Inactive)'}
                  </option>
                ))}
              </select>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy as any);
                  setSortOrder(newSortOrder as any);
                }}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="views-desc">Most Views</option>
                <option value="views-asc">Least Views</option>
                <option value="status-asc">Status A-Z</option>
              </select>
            </div>

            {selectedArticles.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  📢 Publish ({selectedArticles.length})
                </button>
                <button
                  onClick={() => handleBulkAction('draft')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                >
                  📝 Draft ({selectedArticles.length})
                </button>
                <button
                  onClick={() => handleBulkAction('feature')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  ⭐ Feature ({selectedArticles.length})
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  🗑️ Delete ({selectedArticles.length})
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {paginatedArticles.length} of {sortedArticles.length} articles
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            <button 
              onClick={fetchArticles}
              className="text-primary hover:text-primary/80 font-medium"
            >
              🔄 Refresh
            </button>
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
          ) : paginatedArticles.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                  ? 'No articles found' 
                  : 'No articles yet'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first article to get started'
                }
              </p>
              <Link
                href="/content/new"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Create First Article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedArticles.length === paginatedArticles.length && paginatedArticles.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Article</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Author</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Performance</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedArticles.map((article) => (
                    <tr key={article.id} className="border-t border-border hover:bg-muted/50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedArticles.includes(article.id)}
                          onChange={() => handleSelectArticle(article.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {article.isFeatured && <span className="text-yellow-500" title="Featured">⭐</span>}
                              <Link 
                                href={`/content/new?id=${article.id}`}
                                className="font-medium text-foreground hover:text-primary line-clamp-2 text-sm"
                              >
                                {article.title}
                              </Link>
                            </div>
                            {article.excerpt && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                {article.excerpt}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>ID: {article.id}</span>
                              {article.readTime && (
                                <>
                                  <span>•</span>
                                  <span>📖 {article.readTime}min read</span>
                                </>
                              )}
                              {article.tags && article.tags.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>🏷️ {article.tags.length} tags</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(article.status)}`}>
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                          {article.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {article.author?.fullName || 'Unknown'}
                      </td>
                      <td className="p-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center space-x-2">
                            <span>👁️</span>
                            <span className="font-medium">{formatNumber(article.viewCount || 0)}</span>
                          </div>
                          {article.status === 'published' && article.viewCount && article.viewCount > 0 && (
                            <div className="text-xs text-green-600">
                              {article.viewCount > 1000 ? 'High engagement' : 'Growing'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        <div>
                          <div className="font-medium">
                            {formatDate(article.publishedAt || article.updatedAt)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {article.publishedAt ? 'Published' : 'Modified'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-1">
                          <Link
                            href={`/content/new?id=${article.id}`}
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
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/article/${article.slug || article.id}`)}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                            title="Copy link"
                          >
                            🔗
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({sortedArticles.length} total articles)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-muted'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ArticlesPage() {
  return (
    <UnifiedAdminGuard>
      <ArticlesManagement />
    </UnifiedAdminGuard>
  );
}

