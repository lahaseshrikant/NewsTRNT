"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { dbApi, Article, Category } from '@/lib/api-client';
import { DivergenceMark } from '@/components/ui/DivergenceMark';
import { getContentUrl } from '@/lib/contentUtils';

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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('saved_date');
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Load articles from database
  useEffect(() => {
    const loadSavedArticles = async () => {
      setLoading(true);
      try {
        // For now, load latest articles as suggested reading
        // TODO: Implement proper saved articles API with user authentication
        const articles = await dbApi.getArticles({ limit: 10 });
        const formattedArticles: SavedArticle[] = articles.map((article: Article) => ({
          id: article.id,
          title: article.title,
          summary: article.summary || article.excerpt || '',
          imageUrl: article.imageUrl || '/api/placeholder/400/200',
          category: article.category?.name || 'Uncategorized',
          publishedAt: formatRelativeTime(article.published_at),
          savedAt: formatRelativeTime(article.published_at),
          readingTime: article.readingTime || 3,
          source: article.sourceName || 'NewsTRNT',
          isRead: false,
          slug: article.slug
        }));
        setSavedArticles(formattedArticles);
      } catch (error) {
        console.error('Error loading articles:', error);
        setSavedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadSavedArticles();
  }, []);

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

  const handleRemoveArticle = (articleId: string) => {
    // TODO: Implement remove from saved articles with backend API
    console.log('Removing article:', articleId);
    setSavedArticles(prev => prev.filter(a => a.id !== articleId));
  };

  const handleMarkAsRead = (articleId: string) => {
    // TODO: Implement mark as read with backend API
    console.log('Marking as read:', articleId);
    setSavedArticles(prev => prev.map(a => 
      a.id === articleId ? { ...a, isRead: !a.isRead } : a
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink">
        <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
          <div className="container mx-auto py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-ivory/10 w-1/3 mb-2"></div>
              <div className="h-4 bg-ivory/10 w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto py-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-ivory dark:bg-ash/10 p-6 animate-pulse border border-ash dark:border-ash/20">
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
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Header */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
  <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-ivory">Reading List</h1>
              <p className="text-ivory/60 mt-2">
                Your saved articles for later reading
              </p>
            </div>
            <Link 
              href="/dashboard" 
              className="font-mono text-xs tracking-wider uppercase text-ivory/60 hover:text-ivory flex items-center"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-ivory dark:bg-ash/5 border-b border-ash dark:border-ash/20">
  <div className="container mx-auto py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <span className="font-mono text-xs tracking-wider uppercase text-stone">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-ash dark:border-ash/20 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30 bg-paper dark:bg-ink text-ink dark:text-ivory"
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
              <span className="font-mono text-xs tracking-wider uppercase text-stone">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-ash dark:border-ash/20 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30 bg-paper dark:bg-ink text-ink dark:text-ivory"
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
        {filteredArticles.length > 0 ? (
          <div className="space-y-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="bg-ivory dark:bg-ash/10 border border-ash dark:border-ash/20 overflow-hidden">
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
                            article.category === 'Technology' ? 'bg-ink/5 text-ink dark:bg-ivory/10 dark:text-ivory' :
                            article.category === 'World' ? 'bg-ink/5 text-ink dark:bg-ivory/10 dark:text-ivory' :
                            article.category === 'Business' ? 'bg-ink/5 text-ink dark:bg-ivory/10 dark:text-ivory' :
                            'bg-ink/5 text-ink dark:bg-ivory/10 dark:text-ivory'
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
                            className="text-sm text-stone hover:text-vermillion transition-colors"
                          >
                            {article.isRead ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={() => handleRemoveArticle(article.id)}
                            className="text-sm text-stone hover:text-vermillion transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <Link href={getContentUrl(article)}>
                        <h3 className="font-serif text-lg font-semibold text-ink dark:text-ivory hover:text-vermillion mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-stone mb-3 line-clamp-2">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-stone">
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
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <DivergenceMark size={48} className="mx-auto" color="var(--color-vermillion, #C62828)" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-ink dark:text-ivory mb-2">
                Your reading list is empty
              </h3>
              <p className="text-stone mb-6">
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
