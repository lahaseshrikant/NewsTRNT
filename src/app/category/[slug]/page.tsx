"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { dbApi } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';
// Note: We use a compact filter bar below the header instead of CategoryFilters

// Types
interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  excerpt?: string;
  image_url?: string;
  published_at: Date;
  isBreaking: boolean;
  isFeatured: boolean;
  contentType?: string;
  readingTime?: number;
  author?: string;
  views: number;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon?: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
}

const CategoryPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedFilter, setSelectedFilter] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  // Compact filter bar data
  const contentTypes = [
    { value: 'all', label: 'All Content' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Articles' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' }
  ] as const;

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ] as const;

  // Fetch category and articles from backend
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch articles for this category
        const fetchedArticles = await dbApi.getArticlesByCategory(slug, 50);
        
        if (fetchedArticles && fetchedArticles.length > 0) {
          setArticles(fetchedArticles);
          // Get category info from the first article
          setCategory({
            id: fetchedArticles[0].category.id,
            name: fetchedArticles[0].category.name,
            slug: fetchedArticles[0].category.slug,
            description: `Latest ${fetchedArticles[0].category.name} news and updates`,
            color: fetchedArticles[0].category.color || '#3B82F6',
            icon: fetchedArticles[0].category.icon || '📰',
            isActive: true
          });
        } else {
          // Try to fetch category info even if no articles
          const categories = await dbApi.getCategories();
          const foundCategory = categories.find(cat => cat.slug === slug);
          
          if (foundCategory) {
            setCategory(foundCategory);
            setArticles([]);
          } else {
            setError('Category not found');
          }
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  // Helper function to format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffMs = now.getTime() - articleDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return articleDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: articleDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Calculate reading time (if not provided)
  const getReadingTime = (article: Article) => {
    if (article.readingTime) return article.readingTime;
    const words = (article.summary || article.excerpt || '').split(' ').length;
    return Math.max(1, Math.ceil(words / 200)); // Average reading speed: 200 words/min
  };

  // Get category color classes
  const getCategoryColorClass = (color: string) => {
    // If color is hex, use it directly in inline styles
    // Otherwise use predefined Tailwind classes
    const colorMap: Record<string, string> = {
      'red': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      'blue': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      'green': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
      'yellow': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      'purple': 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      'pink': 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
      'indigo': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      'orange': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    };
    
    return colorMap[color.toLowerCase()] || 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Filter articles based on selected filter
  const getFilteredArticles = () => {
    let filteredList = [...articles];
    
    // First filter by content type
    if (contentTypeFilter !== 'all') {
      filteredList = filteredList.filter(article => {
        const articleType = (article as any).contentType || 'article';
        return articleType === contentTypeFilter;
      });
    }
    
    // Then apply sort/filter
    switch (selectedFilter) {
      case 'latest':
        return filteredList.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
      case 'trending':
        // Sort by views
        return filteredList.sort((a, b) => b.views - a.views);
      case 'popular':
        // Sort by views (same as trending for now)
        return filteredList.sort((a, b) => b.views - a.views).slice(0, 10);
      case 'breaking':
        return filteredList.filter(article => article.isBreaking);
      default:
        return filteredList;
    }
  };

  const filteredArticles = getFilteredArticles();

  const filters = [
    { id: 'latest', name: 'Latest' },
    { id: 'trending', name: 'Trending' },
    { id: 'popular', name: 'Popular' },
    { id: 'breaking', name: 'Breaking' }
  ];

  const categoryColorClass = getCategoryColorClass(category.color);

  return (
    <div className="min-h-screen bg-background">
      {/* Category Header */}
      <section className="bg-card border-b border-border">
  <div className="container mx-auto py-8">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-4xl">{category.icon || '📰'}</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
              <p className="text-muted-foreground mt-2">{category.description || `Latest ${category.name} news and updates`}</p>
            </div>
          </div>
          
          {/* Filters moved below header into a compact bar */}
        </div>
      </section>

      {/* Articles Grid */}
  <section className="container mx-auto py-8">
        {/* Filter Bars - Separated */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Content Type Filter */}
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 p-2 flex-1">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentTypeFilter(type.value as typeof contentTypeFilter)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    contentTypeFilter === type.value
                      ? 'text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  style={contentTypeFilter === type.value ? { backgroundColor: category.color } : undefined}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 p-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Sort By:</span>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFilter(option.value as typeof selectedFilter)}
                  title={option.label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedFilter === option.value
                      ? 'text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  style={selectedFilter === option.value ? { backgroundColor: category.color } : undefined}
                >
                  <span className="text-sm">{option.icon}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Filter Status */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
              {filters.find(f => f.id === selectedFilter)?.name} Articles
              {selectedFilter === 'breaking' && <span className="animate-pulse">🔴</span>}
              {selectedFilter === 'trending' && <span className="animate-bounce">📈</span>}
              {selectedFilter === 'popular' && <span className="animate-pulse">⭐</span>}
              {selectedFilter === 'latest' && <span className="animate-pulse">🆕</span>}
            </h2>
            <p className="text-muted-foreground">
              {filteredArticles.length === 0 
                ? `No ${selectedFilter} articles found in ${category.name}`
                : `Showing ${filteredArticles.length} ${selectedFilter} ${filteredArticles.length === 1 ? 'article' : 'articles'} in ${category.name}`
              }
            </p>
          </div>
          
          {/* Quick Filter Indicators */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter:</span>
            <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
              selectedFilter === 'latest' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 dark:from-blue-900/70 dark:to-blue-800/70 dark:text-blue-100 shadow-blue-200/50 dark:shadow-blue-800/30' :
              selectedFilter === 'trending' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 dark:from-green-900/70 dark:to-green-800/70 dark:text-green-100 shadow-green-200/50 dark:shadow-green-800/30' :
              selectedFilter === 'popular' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 dark:from-yellow-900/70 dark:to-yellow-800/70 dark:text-yellow-100 shadow-yellow-200/50 dark:shadow-yellow-800/30' :
              'bg-gradient-to-r from-red-100 to-red-200 text-red-900 dark:from-red-900/70 dark:to-red-800/70 dark:text-red-100 shadow-red-200/50 dark:shadow-red-800/30'
            }`}>
              {selectedFilter.toUpperCase()}
            </div>
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {filteredArticles.map((article) => (
                  <Link key={article.id} href={getContentUrl(article)} className="block">
                    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group">
                      <div className="md:flex">
                        {article.image_url && (
                          <div className="md:w-1/3">
                            <div className="relative h-48 md:h-full overflow-hidden">
                              <Image
                                src={article.image_url}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              />
                              {article.isBreaking && (
                                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                                  BREAKING
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${categoryColorClass} group-hover:scale-105 transition-transform duration-300 ease-out`}>
                              {category.name}
                            </span>
                            <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300 ease-out">
                              {formatDate(article.published_at)}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 ease-out">
                            {article.title}
                          </h2>
                          <p className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors duration-300 ease-out">
                            {article.summary || article.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 ease-out">
                            <span>By {article.author || 'Staff Writer'}</span>
                            <span>{getReadingTime(article)} min read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related Topics */}
              <div className="bg-card rounded-lg shadow-sm p-6 mb-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Related Topics</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Explore more content in {category.name}
                  </p>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
                <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Get the latest {category.name.toLowerCase()} news in your inbox.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder-gray-500 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent shadow-sm"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-900 hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      Subscribe
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{category.icon || '📰'}</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              No {filters.find(f => f.id === selectedFilter)?.name} Articles
            </h2>
            <p className="text-muted-foreground mb-8">
              {selectedFilter === 'latest' 
                ? `We're working on bringing you the latest ${category.name.toLowerCase()} news.`
                : selectedFilter === 'breaking'
                ? `No breaking news in ${category.name.toLowerCase()} right now.`
                : selectedFilter === 'trending'
                ? `No trending articles in ${category.name.toLowerCase()} at the moment.`
                : `No popular articles in ${category.name.toLowerCase()} currently.`
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSelectedFilter('latest')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Latest
              </button>
              <Link
                href="/"
                className="bg-muted text-muted-foreground px-6 py-3 rounded-lg hover:bg-muted/80 transition-colors"
              >
                Browse All News
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
