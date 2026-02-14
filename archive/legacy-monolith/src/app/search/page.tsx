"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryBadgeStyle } from '@/lib/categoryUtils';
import { getContentUrl } from '@/lib/contentUtils';
import { dbApi, Article } from '@/lib/database-real';

import { DivergenceMark } from '@/components/DivergenceMark';

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
      <div className="min-h-screen bg-paper dark:bg-ink">
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-ivory dark:bg-ash/20 mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-ash dark:border-ash/20 pb-6">
                  <div className="h-4 bg-ivory dark:bg-ash/20 mb-2 w-3/4"></div>
                  <div className="h-3 bg-ivory dark:bg-ash/20 mb-2 w-1/2"></div>
                  <div className="h-3 bg-ivory dark:bg-ash/20 w-2/3"></div>
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
              <div className="space-y-0 divide-y divide-ash dark:divide-ash/20">
                {results.map((result) => (
                  <Link 
                    key={result.id} 
                    href={getContentUrl(result)}
                    className="block py-6 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-24 h-24">
                        <Image
                          src={result.imageUrl}
                          alt={result.title}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-[10px] tracking-wider uppercase text-vermillion">
                            {result.category}
                          </span>
                          <span className="font-mono text-[10px] text-stone">{result.publishedAt}</span>
                        </div>
                        <h2 className="font-serif text-lg font-bold text-ink dark:text-ivory mb-1 group-hover:text-vermillion transition-colors">
                          {result.title}
                        </h2>
                        <p className="text-stone text-sm mb-2 line-clamp-2">
                          {result.summary}
                        </p>
                        <span className="font-mono text-xs text-stone">
                          {result.readingTime} min read
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <DivergenceMark size={48} className="mx-auto mb-6 text-stone" />
                <h2 className="font-serif text-2xl font-bold text-ink dark:text-ivory mb-4">No Results Found</h2>
                <p className="text-stone mb-8 max-w-md mx-auto">
                  Even our best investigators couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try different keywords.
                </p>
                <div className="space-x-4">
                  <Link
                    href="/"
                    className="bg-ink text-ivory px-6 py-3 hover:bg-ink/80 transition-colors font-mono text-xs tracking-wider uppercase"
                  >
                    Front Page
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search Suggestions */}
            <div className="border border-ash dark:border-ash/20 p-6 mb-6">
              <h3 className="font-mono text-xs tracking-wider uppercase text-stone mb-4">Related Searches</h3>
              <div className="space-y-2">
                {['AI technology', 'Machine learning news', 'Tech innovation', 'Artificial intelligence'].map((suggestion) => (
                  <Link
                    key={suggestion}
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="block text-ink dark:text-ivory hover:text-vermillion text-sm transition-colors"
                  >
                    {suggestion}
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div className="border border-ash dark:border-ash/20 p-6">
              <h3 className="font-mono text-xs tracking-wider uppercase text-stone mb-4">Sections</h3>
              <div className="space-y-3">
                {dynamicCategories.slice(0, 4).map((category) => (
                  <Link
                    key={category.name}
                    href={`/category/${category.slug}`}
                    className="flex items-center justify-between py-2 border-b border-ash/50 dark:border-ash/10 last:border-0 hover:text-vermillion transition-colors"
                  >
                    <span className="text-sm text-ink dark:text-ivory">{category.name}</span>
                    <span className="font-mono text-xs text-stone">{category.articleCount || 0}</span>
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
      <div className="min-h-screen bg-paper dark:bg-ink py-12">
        <div className="container mx-auto px-4 text-center">
          <DivergenceMark size={40} animated className="mx-auto mb-4" />
          <p className="font-mono text-xs tracking-wider uppercase text-stone">Searching the archives...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
