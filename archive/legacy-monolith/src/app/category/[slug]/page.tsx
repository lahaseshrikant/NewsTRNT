"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { dbApi } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';
import { useSubCategoryFilters } from '@/hooks/useSubCategoryFilters';
import { DivergenceMark } from '@/components/DivergenceMark';
import { getCategoryTheme } from '@/config/categoryThemes';

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
  subCategory?: {
    id: string;
    name: string;
    slug: string;
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
  subCategories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

const CategoryPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedFilter, setSelectedFilter] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview'>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
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
    { value: 'latest', label: 'Latest' },
    { value: 'trending', label: 'Trending' },
    { value: 'popular', label: 'Popular' },
    { value: 'breaking', label: 'Breaking' }
  ] as const;

  // Fetch category and articles from backend
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError('');

        const [fetchedArticles, categoryData] = await Promise.all([
          dbApi.getArticlesByCategory(slug, 50),
          dbApi.getCategoryBySlug(slug)
        ]);
        
        if (Array.isArray(fetchedArticles)) {
          setArticles(fetchedArticles);
        }
        
        if (categoryData) {
          setCategory(categoryData);
        } else {
          setError('Category not found');
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

  // Subcategory filters
  const subCategoryFilters = useSubCategoryFilters(articles, category?.subCategories || [], 'ALL');

  // Filter articles based on selected filters
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Filter by content type
    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(article => article.contentType === contentTypeFilter);
    }

    // Filter by sub-category
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(article => article.subCategory?.slug === selectedSubCategory);
    }

    // Sort articles
    if (selectedFilter === 'trending') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (selectedFilter === 'popular') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (selectedFilter === 'breaking') {
      filtered = filtered.filter(article => article.isBreaking);
    }
    // 'latest' is default order

    return filtered;
  }, [articles, contentTypeFilter, selectedSubCategory, selectedFilter]);

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

  // Get filter label
  const getFilterLabel = (filter: string) => {
    return sortOptions.find(o => o.value === filter)?.label || 'Latest';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink flex items-center justify-center">
        <div className="text-center">
          <DivergenceMark size={40} animated className="mx-auto mb-4" />
          <p className="font-mono text-xs tracking-wider uppercase text-stone">Loading section...</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !category) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-ink dark:text-ivory mb-4">Section Not Found</h1>
          <p className="text-stone mb-8">The section you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="bg-ink text-ivory px-6 py-3 hover:bg-ink/80 transition-colors font-mono text-xs tracking-wider uppercase">
            Back to Front Page
          </Link>
        </div>
      </div>
    );
  }

  const theme = getCategoryTheme(slug);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Category Header — Editorial Banner */}
      <section style={{ background: theme.gradient }} className="border-b-2 border-vermillion">
        <div className="container mx-auto py-10 px-4">
          <div className="max-w-4xl">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/70 mb-3 block">
              Section
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">
              {category.name}
            </h1>
            <p className="text-white/60 text-lg max-w-2xl">
              {category.description || `Latest ${category.name} news and updates`}
            </p>
          </div>
        </div>
      </section>

      {/* Sub-category Tabs */}
      {subCategoryFilters.length > 1 && (
        <section className="bg-ivory dark:bg-ink border-b border-ash dark:border-ash/20">
          <div className="container mx-auto py-3 px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {subCategoryFilters.map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => setSelectedSubCategory(subCat.id)}
                  className={`px-4 py-1.5 text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all border ${
                    selectedSubCategory === subCat.id
                      ? 'bg-ink text-ivory dark:bg-ivory dark:text-ink border-ink dark:border-ivory'
                      : 'text-stone hover:text-ink dark:hover:text-ivory border-transparent hover:border-ash'
                  }`}
                >
                  {subCat.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="container mx-auto py-8 px-4">
        {/* Filter Bars */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Content Type Filter */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
            {contentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setContentTypeFilter(type.value as typeof contentTypeFilter)}
                className={`px-4 py-1.5 text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all border ${
                  contentTypeFilter === type.value
                    ? 'bg-ink text-ivory dark:bg-ivory dark:text-ink border-ink dark:border-ivory'
                    : 'text-stone hover:text-ink dark:hover:text-ivory border-ash hover:border-ink dark:hover:border-ivory'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="font-mono text-[11px] text-stone uppercase tracking-wider whitespace-nowrap">Sort:</span>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value as typeof selectedFilter)}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all border ${
                  selectedFilter === option.value
                    ? 'bg-vermillion text-white border-vermillion'
                    : 'text-stone hover:text-ink dark:hover:text-ivory border-transparent hover:border-ash'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {/* Filter Status */}
        <div className="mb-6 flex items-center justify-between border-b border-ash dark:border-ash/20 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink dark:text-ivory flex items-center gap-3">
              {getFilterLabel(selectedFilter)} Articles
              {selectedFilter === 'breaking' && (
                <span className="w-2 h-2 bg-vermillion rounded-full animate-pulse" />
              )}
            </h2>
            <p className="text-stone text-sm mt-1">
              {filteredArticles.length === 0 
                ? `No ${selectedFilter} articles found in ${category.name}`
                : `Showing ${filteredArticles.length} ${selectedFilter} ${filteredArticles.length === 1 ? 'article' : 'articles'} in ${category.name}`
              }
            </p>
          </div>
          <span className="font-mono text-xs tracking-wider uppercase text-vermillion hidden md:block">
            {selectedFilter}
          </span>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="space-y-0 divide-y divide-ash dark:divide-ash/20">
                {filteredArticles.map((article, index) => (
                  <Link key={article.id} href={getContentUrl(article)} className="block group">
                    <div className={`py-6 ${index === 0 ? 'pt-0' : ''}`}>
                      <div className="md:flex gap-6">
                        {article.image_url && (
                          <div className="md:w-1/3 mb-4 md:mb-0">
                            <div className="relative aspect-[3/2] overflow-hidden">
                              <Image
                                src={article.image_url}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {article.isBreaking && (
                                <div className="absolute top-2 left-2 bg-vermillion text-white px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                                  Breaking
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="md:flex-1">
                          <span className="font-mono text-[10px] tracking-wider uppercase text-vermillion">
                            {category.name}
                          </span>
                          <span className="font-mono text-[10px] text-stone mx-2">/</span>
                          <span className="font-mono text-[10px] text-stone">
                            {formatDate(article.published_at)}
                          </span>
                          <h2 className="font-serif text-xl font-bold text-ink dark:text-ivory mt-1 mb-2 group-hover:text-vermillion transition-colors">
                            {article.title}
                          </h2>
                          <p className="text-stone text-sm mb-3 line-clamp-2">
                            {article.summary || article.excerpt}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-stone">
                            <span className="font-medium text-ink dark:text-ivory">{article.author || 'Staff Writer'}</span>
                            <span className="w-1 h-1 bg-stone rounded-full" />
                            <span className="font-mono">{getReadingTime(article)} min read</span>
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
              <div className="border border-ash dark:border-ash/20 p-6 mb-6">
                <h3 className="font-mono text-xs tracking-wider uppercase text-stone mb-4">Related Topics</h3>
                <p className="text-sm text-stone">
                  Explore more content in {category.name}
                </p>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-ink dark:bg-ivory/5 p-6">
                <h3 className="font-serif text-lg font-bold text-ivory mb-2">The {category.name} Brief</h3>
                <p className="text-ivory/60 text-sm mb-4">
                  Get the latest {category.name.toLowerCase()} dispatches in your inbox.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 bg-white/10 text-ivory placeholder-ivory/40 border border-ivory/20 font-mono text-sm focus:outline-none focus:border-vermillion"
                  />
                  <button
                    type="submit"
                    className="w-full bg-vermillion text-white py-2.5 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <DivergenceMark size={48} className="mx-auto mb-6 text-stone" />
            <h2 className="font-serif text-2xl font-bold text-ink dark:text-ivory mb-4">
              No {getFilterLabel(selectedFilter)} Articles
            </h2>
            <p className="text-stone mb-8 max-w-md mx-auto">
              {selectedFilter === 'latest' 
                ? `We're working on bringing you the latest ${category.name.toLowerCase()} dispatches.`
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
                className="bg-ink text-ivory px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ink/80 transition-colors"
              >
                View Latest
              </button>
              <Link
                href="/"
                className="border border-ash text-ink dark:text-ivory px-6 py-3 font-mono text-xs tracking-wider uppercase hover:border-ink transition-colors"
              >
                Front Page
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
