"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SearchResult {
  id: number;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  relevanceScore: number;
}

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock search results
  const mockResults = [
    {
      id: 1,
      title: 'AI Revolution Continues: New Breakthrough in Machine Learning',
      summary: 'Researchers announce a major breakthrough in machine learning algorithms that could dramatically improve AI efficiency.',
      imageUrl: '/api/placeholder/400/200',
      category: 'Technology',
      publishedAt: '2 hours ago',
      readingTime: 3,
      relevanceScore: 95
    },
    {
      id: 2,
      title: 'Artificial Intelligence in Healthcare Shows Promise',
      summary: 'New AI-powered diagnostic tools are helping doctors detect diseases earlier than ever before.',
      imageUrl: '/api/placeholder/400/200',
      category: 'Health',
      publishedAt: '5 hours ago',
      readingTime: 4,
      relevanceScore: 87
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setResults(mockResults);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [query]);

  const filters = [
    { id: 'all', name: 'All Results', count: mockResults.length },
    { id: 'articles', name: 'Articles', count: mockResults.length },
    { id: 'videos', name: 'Videos', count: 0 },
    { id: 'images', name: 'Images', count: 0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
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
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-muted-foreground">
            Found {results.length} results in 0.03 seconds
          </p>
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
              {filter.name} ({filter.count})
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
                  <div key={result.id} className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
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
                        <h2 className="text-lg font-bold text-foreground mb-2 hover:text-primary cursor-pointer">
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
                  </div>
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
                {[
                  { name: 'Technology', count: 156, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
                  { name: 'Politics', count: 89, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
                  { name: 'Business', count: 67, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
                  { name: 'Sports', count: 45, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' }
                ].map((category) => (
                  <Link
                    key={category.name}
                    href={`/category/${category.name.toLowerCase()}`}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-foreground">{category.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${category.color}`}>
                      {category.count}
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

export default SearchPage;
