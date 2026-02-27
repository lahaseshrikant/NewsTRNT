"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { userPreferencesApi, type SavedArticleResponse } from '@/lib/api-client';
import { DivergenceMark } from '@/components/ui/DivergenceMark';
import { getContentUrl } from '@/lib/contentUtils';
import showToast from '@/lib/toast';

interface SavedArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  savedAt: string;
  readingTime: number;
  source: string;
  isRead: boolean;
  slug: string;
  contentType?: string;
}

const SavedArticlesPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('saved_date');
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSaved, setTotalSaved] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/signin?redirect=/saved');
    }
  }, [authLoading, isAuthenticated, router]);
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Format relative time
  const formatRelativeTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Load saved articles from backend API
  const loadSavedArticles = useCallback(async (page: number = 1) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await userPreferencesApi.getSavedArticles(user.id, page, 20);
      const formattedArticles: SavedArticle[] = response.articles.map((article: SavedArticleResponse) => ({
        id: article.id,
        title: article.title,
        summary: article.summary || article.excerpt || '',
        imageUrl: article.imageUrl || '/images/placeholder-news.svg',
        category: article.category?.name || 'Uncategorized',
        publishedAt: formatRelativeTime(article.publishedAt || article.published_at || new Date()),
        savedAt: formatRelativeTime(article.savedAt),
        readingTime: article.readingTime || 3,
        source: article.sourceName || 'NewsTRNT',
        isRead: false,
        slug: article.slug,
        contentType: article.contentType,
      }));
      setSavedArticles(formattedArticles);
      setTotalPages(response.pagination.totalPages);
      setTotalSaved(response.pagination.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading saved articles:', error);
      setSavedArticles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSavedArticles(1);
    }
  }, [user?.id, loadSavedArticles]);

  // Create categories list with 'all' option and dynamic categories
  const categories = ['all', ...dynamicCategories.map(cat => cat.name)];
  const sortOptions = [
    { value: 'saved_date', label: 'Recently Saved' },
    { value: 'published_date', label: 'Recently Published' },
    { value: 'reading_time', label: 'Reading Time' },
    { value: 'category', label: 'Category' }
  ];

  const filteredArticles = savedArticles.filter(article => 
    selectedCategory === 'all' || article.category === selectedCategory
  );

  // Sort articles client-side
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'reading_time': return a.readingTime - b.readingTime;
      case 'category': return a.category.localeCompare(b.category);
      default: return 0; // Already sorted by saved_date from API
    }
  });

  const handleRemoveArticle = async (articleId: string) => {
    if (!user?.id) return;
    // Optimistic UI update
    setSavedArticles(prev => prev.filter(a => a.id !== articleId));
    setTotalSaved(prev => prev - 1);
    
    const result = await userPreferencesApi.removeSavedArticle(user.id, articleId);
    if (result.success) {
      showToast('Article removed from reading list', 'success');
    } else {
      // Revert on failure
      loadSavedArticles(currentPage);
      showToast('Failed to remove article', 'error');
    }
  };

  const handleMarkAsRead = (articleId: string) => {
    // Toggle read status locally (reading state is client-side)
    setSavedArticles(prev => prev.map(a => 
      a.id === articleId ? { ...a, isRead: !a.isRead } : a
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border border-border border-b-2 border-vermillion">
          <div className="container mx-auto py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 w-1/3 mb-2"></div>
              <div className="h-4 bg-white/10 w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto py-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted/50 p-6 animate-pulse border border-border">
                <div className="flex space-x-4">
                  <div className="w-48 h-28 bg-ash/30"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-ash/30 w-3/4"></div>
                    <div className="h-4 bg-ash/30 w-1/2"></div>
                    <div className="h-4 bg-ash/30 w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border border-border border-b-2 border-vermillion">
  <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-white">Reading List</h1>
              <p className="text-white/60 mt-2">
                {totalSaved > 0 ? `${totalSaved} saved article${totalSaved !== 1 ? 's' : ''} for later reading` : 'Your saved articles for later reading'}
              </p>
            </div>
            <Link 
              href="/dashboard" 
              className="font-mono text-xs tracking-wider uppercase text-white/60 hover:text-white flex items-center"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-muted/50 border-b border-border">
  <div className="container mx-auto py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <span className="font-mono text-xs tracking-wider uppercase text-muted-foreground">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30 bg-background text-foreground"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="font-mono text-xs tracking-wider uppercase text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30 bg-background text-foreground"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
  <div className="container mx-auto py-8">
        {sortedArticles.length > 0 ? (
          <div className="space-y-6">
            {sortedArticles.map((article) => (
              <div key={article.id} className="bg-muted/50 border border-border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Article Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        width={200}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    </div>

                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 font-mono text-xs tracking-wider uppercase ${
                            article.category === 'Technology' ? 'bg-muted text-foreground' :
                            article.category === 'World' ? 'bg-muted text-foreground' :
                            article.category === 'Business' ? 'bg-muted text-foreground' :
                            'bg-muted text-foreground'
                          }`}>
                            {article.category}
                          </span>
                          {!article.isRead && (
                            <span className="px-2 py-1 font-mono text-xs tracking-wider uppercase bg-vermillion/10 text-vermillion">
                              Unread
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMarkAsRead(article.id)}
                            className="text-sm text-muted-foreground hover:text-vermillion transition-colors"
                          >
                            {article.isRead ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={() => handleRemoveArticle(article.id)}
                            className="text-sm text-muted-foreground hover:text-vermillion transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <Link href={getContentUrl(article)}>
                        <h3 className="font-serif text-lg font-semibold text-foreground hover:text-vermillion mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="font-mono text-xs">{article.source}</span>
                          <span>•</span>
                          <span>{article.readingTime} min read</span>
                          <span>•</span>
                          <span>Published {article.publishedAt}</span>
                        </div>
                        <div className="text-xs">
                          Saved {article.savedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <button
                  onClick={() => loadSavedArticles(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 border border-border text-sm font-mono uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <span className="font-mono text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => loadSavedArticles(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 border border-border text-sm font-mono uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <DivergenceMark size={48} className="mx-auto" color="var(--color-vermillion, #C62828)" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Your reading list is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Start saving articles you want to read later by clicking the bookmark icon on any article.
              </p>
              <Link
                href="/"
                className="bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors inline-block"
              >
                Browse Articles
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedArticlesPage;
