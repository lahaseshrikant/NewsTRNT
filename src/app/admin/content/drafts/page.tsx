"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { articleAPI, type Article } from '@/lib/api';
import { api } from '@/lib/api-client';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories } from '@/hooks/useCategories';
import { showToast } from '@/lib/toast';

interface Draft {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  category: { name: string } | null;
  tags: string[];
  author: { fullName: string } | null;
  updatedAt: string;
  createdAt: string;
  wordCount?: number;
  autoSaved?: boolean;
  status: 'draft' | 'published' | 'scheduled';
  imageUrl: string | null;
  type?: 'article' | 'webstory'; // Add type to distinguish content types
  slides?: number; // For web stories - number of slides
  duration?: number; // For web stories - duration in seconds
  priority?: string; // For web stories - priority level
}

const Drafts: React.FC = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'wordCount'>('updatedAt');
  const [filterCategory, setFilterCategory] = useState('all');
  const [contentType, setContentType] = useState<'all' | 'articles' | 'webstories'>('all');
  
  // Get dynamic categories (include inactive for admin)
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories({ 
    includeInactive: true 
  });

  // Fetch drafts from API
  const fetchDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication first
      const { isAuthenticated, session } = UnifiedAdminAuth.isAuthenticated();
      console.log('🔐 Auth check:', { isAuthenticated, email: session?.email });
      
      if (!isAuthenticated) {
        console.log('❌ Not authenticated, redirecting to login...');
        throw new Error('Authentication required. Please login first.');
      }
      
      console.log('🔍 Fetching drafts...', { searchTerm, sortBy, contentType });
      
      // Only pass valid database fields to backend, handle wordCount on frontend
      const validSortFields = ['updatedAt', 'title', 'createdAt', 'publishedAt'];
      const backendSortBy = validSortFields.includes(sortBy) ? sortBy : 'updatedAt';
      
      const promises = [];
      
      // Fetch article drafts
      if (contentType === 'all' || contentType === 'articles') {
        promises.push(
          articleAPI.getDrafts({
            search: searchTerm || undefined,
            sortBy: backendSortBy,
            sortOrder: 'desc'
          }).then(response => ({ type: 'articles', response }))
        );
      }
      
      // Fetch webstory drafts
      if (contentType === 'all' || contentType === 'webstories') {
        promises.push(
          api.webstories.getDrafts({
            search: searchTerm || undefined,
            sortBy: backendSortBy,
            sortOrder: 'desc'
          }).then(response => ({ type: 'webstories', response }))
        );
      }
      
      const responses = await Promise.all(promises);
      console.log('📝 Drafts API responses:', responses);
      
      let allDrafts: Draft[] = [];
      
      // Process article drafts
      const articleResponse = responses.find(r => r.type === 'articles')?.response;
      if (articleResponse?.success && Array.isArray((articleResponse as any).articles)) {
        const articleDrafts: Draft[] = (articleResponse as any).articles.map((article: Article) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          summary: article.summary,
          category: article.category,
          tags: article.tags,
          author: article.author,
          updatedAt: article.updatedAt,
          createdAt: article.createdAt,
          wordCount: article.content ? article.content.split(' ').length : 0,
          autoSaved: false,
          status: article.status,
          imageUrl: article.imageUrl,
          type: 'article'
        }));
        allDrafts = [...allDrafts, ...articleDrafts];
      }
      
      // Process webstory drafts
      const webstoryResponse = responses.find(r => r.type === 'webstories')?.response;
      if (webstoryResponse?.success && Array.isArray((webstoryResponse as any).data?.webstories)) {
        const webstoryDrafts: Draft[] = (webstoryResponse as any).data.webstories.map((webstory: any) => ({
          id: webstory.id,
          title: webstory.title,
          content: null, // Web stories don't have traditional content
          summary: null, // Web stories don't have summary
          category: webstory.category,
          tags: webstory.tags || [],
          author: webstory.author,
          updatedAt: webstory.updatedAt,
          createdAt: webstory.createdAt,
          wordCount: 0, // Web stories don't have word count
          autoSaved: false,
          status: webstory.status,
          imageUrl: webstory.imageUrl,
          type: 'webstory',
          slides: webstory.slides,
          duration: webstory.duration,
          priority: webstory.priority
        }));
        allDrafts = [...allDrafts, ...webstoryDrafts];
      }
      
      // Sort combined results by updatedAt
      allDrafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setDrafts(allDrafts);
    } catch (err) {
      console.error('❌ Error fetching drafts:', err);
      
      // More detailed error handling
      let errorMessage = 'Failed to load drafts';
      if (err instanceof Error) {
        if (err.message.includes('Invalid or expired token')) {
          errorMessage = 'Authentication expired. Please refresh and try again.';
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Use fallback data on error
      console.log('📋 Using fallback data due to API error');
      setDrafts(getFallbackDrafts());
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data
  const getFallbackDrafts = (): Draft[] => [
    {
      id: '1',
      title: 'The Future of Quantum Computing',
      content: 'Quantum computing represents a paradigm shift in computational power. Unlike classical computers that use bits as the smallest unit of data...',
      summary: 'An overview of quantum computing technology and its potential impact.',
      category: { name: 'Technology' },
      tags: ['quantum', 'computing', 'technology', 'future'],
      author: { fullName: 'John Doe' },
      updatedAt: '2024-01-15T14:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      wordCount: 1250,
      autoSaved: true,
      status: 'draft',
      imageUrl: null
    },
    {
      id: '2',
      title: 'Sustainable Energy Solutions for 2024',
      content: 'As the world continues to grapple with climate change, sustainable energy solutions have become more critical than ever...',
      summary: 'Exploring renewable energy trends for the upcoming year.',
      category: { name: 'Environment' },
      tags: ['energy', 'sustainability', 'climate'],
      author: { fullName: 'Jane Smith' },
      updatedAt: '2024-01-14T16:45:00Z',
      createdAt: '2024-01-14T12:00:00Z',
      wordCount: 890,
      autoSaved: false,
      status: 'draft',
      imageUrl: null
    }
  ];

  // Load drafts on component mount and when search/sort changes
  useEffect(() => {
    fetchDrafts();
  }, [searchTerm, contentType]); // Refetch when search term or content type changes

  // Filter and sort drafts
  const filteredAndSortedDrafts = drafts
    .filter(draft => {
      const matchesSearch = searchTerm === '' || 
        draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || 
        draft.category?.name === filterCategory;
      
      const matchesContentType = contentType === 'all' ||
        (contentType === 'articles' && draft.type === 'article') ||
        (contentType === 'webstories' && draft.type === 'webstory');
      
      return matchesSearch && matchesCategory && matchesContentType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'wordCount':
          // Frontend sorting for wordCount since it's calculated, not stored in DB
          return (b.wordCount || 0) - (a.wordCount || 0);
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  // Toggle draft selection
  const toggleDraftSelection = (draftId: string) => {
    setSelectedDrafts(prev =>
      prev.includes(draftId)
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    );
  };

  // Select all drafts
  const selectAllDrafts = () => {
    if (selectedDrafts.length === filteredAndSortedDrafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(filteredAndSortedDrafts.map(draft => draft.id));
    }
  };

  // Delete selected drafts
  const deleteSelectedDrafts = async () => {
    if (selectedDrafts.length === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedDrafts.length} draft${selectedDrafts.length > 1 ? 's' : ''}?`);
    if (!confirmed) return;

    try {
      // Delete each selected draft based on its type
      await Promise.all(
        selectedDrafts.map(draftId => {
          const draft = drafts.find(d => d.id === draftId);
          if (draft?.type === 'webstory') {
            return api.webstories.delete(draftId);
          } else {
            return articleAPI.deleteArticle(draftId);
          }
        })
      );
      
      // Refresh the list
      await fetchDrafts();
      setSelectedDrafts([]);
      
      showToast(`${selectedDrafts.length} draft${selectedDrafts.length > 1 ? 's' : ''} deleted successfully!`, 'success');
    } catch (error) {
      console.error('Error deleting drafts:', error);
      showToast('Failed to delete some drafts. Please try again.', 'error');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Content', href: '/admin/content' },
            { label: 'Drafts', href: '/admin/content/drafts' }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <h3 className="text-red-800 font-medium">Error Loading Drafts</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <div className="mt-3 space-x-2">
            <button
              onClick={() => fetchDrafts()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
            <button
              onClick={() => {
                console.log('🔧 Clearing auth and retrying...');
                UnifiedAdminAuth.logout();
                setTimeout(() => fetchDrafts(), 100);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Clear Auth & Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'Drafts', href: '/admin/content/drafts' }
        ]}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-border/50 mt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Draft Content
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your unpublished articles and web stories ({filteredAndSortedDrafts.length} drafts)
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/content/new"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            >
              New Article
            </Link>
            <Link
              href="/admin/content/web-stories"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg"
            >
              New Web Story
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search drafts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
          >
            <option value="all">All Categories</option>
            {dynamicCategories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name} {!category.isActive && '(Inactive)'}
              </option>
            ))}
          </select>
          <select
            value={contentType}
            onChange={(e) => {
              setContentType(e.target.value as 'all' | 'articles' | 'webstories');
              fetchDrafts(); // Refetch when content type changes
            }}
            className="px-4 py-2 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
          >
            <option value="all">All Content</option>
            <option value="articles">Articles Only</option>
            <option value="webstories">Web Stories Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
          >
            <option value="updatedAt">Last Modified</option>
            <option value="title">Title</option>
            <option value="wordCount">Word Count</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedDrafts.length > 0 && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-blue-700 dark:text-blue-300">
              {selectedDrafts.length} draft{selectedDrafts.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={deleteSelectedDrafts}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedDrafts([])}
              className="px-4 py-2 border border-border/30 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Drafts List */}
        {filteredAndSortedDrafts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">
              No drafts found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start writing your first draft article.'
              }
            </p>
            <Link
              href="/admin/content/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Create New Article
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header row with select all */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-border/30">
              <input
                type="checkbox"
                checked={selectedDrafts.length === filteredAndSortedDrafts.length && filteredAndSortedDrafts.length > 0}
                onChange={selectAllDrafts}
                className="w-4 h-4 text-blue-600"
              />
              <span className="font-medium">Select All ({filteredAndSortedDrafts.length})</span>
            </div>

            {/* Draft items */}
            {filteredAndSortedDrafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-start gap-4 p-6 border border-border/30 rounded-lg hover:border-blue-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedDrafts.includes(draft.id)}
                  onChange={() => toggleDraftSelection(draft.id)}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      href={draft.type === 'webstory' ? `/admin/content/web-stories` : `/admin/content/new?id=${draft.id}`}
                      className="text-xl font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {draft.title}
                    </Link>
                    <div className="flex items-center gap-2 ml-4">
                      {draft.type === 'webstory' && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 rounded-full">
                          📱 Web Story
                        </span>
                      )}
                      {draft.type === 'article' && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                          📄 Article
                        </span>
                      )}
                      {draft.autoSaved && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Auto-saved
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-full">
                        {draft.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                    {draft.type === 'webstory' 
                      ? `Web story with ${draft.slides || 0} slides${draft.duration ? ` • ${draft.duration}s duration` : ''}${draft.priority ? ` • ${draft.priority} priority` : ''}`
                      : (draft.summary || (draft.content ? draft.content.substring(0, 150) + '...' : 'No content'))
                    }
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {draft.author?.fullName || 'Unknown'}</span>
                    <span>•</span>
                    <span>{draft.category?.name || 'Uncategorized'}</span>
                    <span>•</span>
                    {draft.type === 'webstory' ? (
                      <span>{draft.slides || 0} slides</span>
                    ) : (
                      <span>{draft.wordCount || 0} words</span>
                    )}
                    <span>•</span>
                    <span>Modified {formatDate(draft.updatedAt)}</span>
                  </div>

                  {draft.tags && draft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {draft.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {draft.tags.length > 5 && (
                        <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full">
                          +{draft.tags.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={draft.type === 'webstory' ? `/admin/content/web-stories` : `/admin/content/new?id=${draft.id}`}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      const confirmed = confirm('Are you sure you want to delete this draft?');
                      if (confirmed) {
                        try {
                          if (draft.type === 'webstory') {
                            await api.webstories.delete(draft.id);
                          } else {
                            await articleAPI.deleteArticle(draft.id);
                          }
                          await fetchDrafts();
                          showToast('Draft deleted successfully!', 'success');
                        } catch (error) {
                          showToast('Failed to delete draft', 'error');
                        }
                      }
                    }}
                    className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drafts;
