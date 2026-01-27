"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryBadgeStyle } from '@/lib/categoryUtils';
import { getContentUrl } from '@/lib/contentUtils';
import { dbApi, Article } from '@/lib/database-real';

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  slug: string;
  publishedAt: string;
  readingTime: number;
  relevanceScore: number;
  contentType?: string;
}

const SearchContent: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Use dynamic categories for search suggestions
  const { categories: dynamicCategories } = useCategories();

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

  useEffect(() => {
    const searchArticles = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const articles = await dbApi.searchArticles(query, 20);
        const formattedResults: SearchResult[] = articles.map((article: Article, index: number) => ({
          id: article.id,
          title: article.title,
          summary: article.summary || article.excerpt || '',
          imageUrl: article.imageUrl || '/api/placeholder/400/200',
          category: article.category?.name || 'Uncategorized',
          slug: article.slug,
          publishedAt: formatRelativeTime(article.published_at),
          readingTime: article.readingTime || 3,
          relevanceScore: Math.max(70, 100 - (index * 3)), // Relevance decreases by position
          contentType: article.contentType
        }));
        setResults(formattedResults);
      } catch (error) {
        console.error('Error searching articles:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchArticles();
  }, [query]);

  const filters = [
    { id: 'all', name: 'All Results', count: results.length },
    { id: 'articles', name: 'Articles', count: results.length },
    { id: 'videos', name: 'Videos', count: 0 },
    { id: 'images', name: 'Images', count: 0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg p-6 border border-border">
                  <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-muted rounded mb-2 w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Search Results for "{query}"
          </h1>
        </div>

        {/* Search Filters */}
        <div className="flex space-x-6 mb-8 border-b border-border">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`pb-2 border-b-2 transition-colors font-medium ${
                selectedFilter === filter.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2">
            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result) => (
                  <Link 
                    key={result.id} 
                    href={getContentUrl(result)}
                    className="block bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-border"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-24 h-24">
                        <Image
                          src={result.imageUrl}
                          alt={result.title}
                          width={96}
                          height={96}
                          className="rounded-lg object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">
                            {result.category}
                          </span>
                          <span className="text-muted-foreground text-sm">{result.publishedAt}</span>
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                            {result.relevanceScore}% match
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-2 hover:text-primary">
                          {result.title}
                        </h2>
                        <p className="text-muted-foreground text-sm mb-2">
                          {result.summary}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          {result.readingTime} min read
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">No Results Found</h2>
                <p className="text-muted-foreground mb-8">
                  We couldn't find any articles matching "{query}". Try different keywords or browse our categories.
                </p>
                <div className="space-x-4">
                  <Link
                    href="/"
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Browse All News
                  </Link>
                  <button className="border border-border text-foreground px-6 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                    Search Tips
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search Suggestions */}
            <div className="bg-card rounded-lg shadow-sm p-6 mb-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Related Searches</h3>
              <div className="space-y-2">
                {['AI technology', 'Machine learning news', 'Tech innovation', 'Artificial intelligence'].map((suggestion) => (
                  <Link
                    key={suggestion}
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="block text-primary hover:text-primary/80 text-sm"
                  >
                    {suggestion}
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Popular Categories</h3>
              <div className="space-y-3">
                {dynamicCategories.slice(0, 4).map((category) => (
                  <Link
                    key={category.name}
                    href={`/category/${category.slug}`}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-foreground">{category.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryBadgeStyle(category)}`}>
                      {category.articleCount || 0}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">Loading search results...</div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
