"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { dbApi, Article, Category } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';
import { useSubCategoryFilters } from '@/hooks/useSubCategoryFilters';

const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)} days ago`;
};

const TechnologyPage: React.FC = () => {
  // Content Type and Sort Filters
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  
  // Technology-specific sub-category filter
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  
  // Database articles state
  const [category, setCategory] = useState<{ subCategories?: Array<{ id: string; name: string; slug: string }> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [articles, categories] = await Promise.all([
          dbApi.getArticlesByCategory('technology', 30),
          dbApi.getCategories()
        ]);
        if (Array.isArray(articles)) {
          setAllArticles(articles);
        }
        const techCategory = categories.find(cat => cat.slug === 'technology');
        if (techCategory) {
          setCategory(techCategory);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Articles' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' },
  ];

  const subCategoryFilters = useSubCategoryFilters(allArticles, category?.subCategories, 'ALL');

  // Filtering logic
  const filteredArticles = () => {
    let filtered = [...allArticles];

    // Filter by content type
    if (contentType !== 'all') {
      filtered = filtered.filter(article => article.contentType === contentType);
    }

    // Filter by sub-category
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(article => article.subCategory?.slug === selectedSubCategory);
    }

    // Sort articles
    if (sortBy === 'trending') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.readingTime || 0) - (a.readingTime || 0));
    }
    // 'latest' is default order

    return filtered;
  };

  const articles = filteredArticles();
  const featuredArticles = articles.filter(article => article.isFeatured);
  const recentArticles = articles.filter(article => !article.isFeatured);

  const trendingTopics = [
    { name: "Artificial Intelligence", count: 156 },
    { name: "Quantum Computing", count: 89 },
    { name: "Cryptocurrency", count: 67 },
    { name: "5G Technology", count: 45 },
    { name: "Cloud Computing", count: 34 }
  ];

  const techStocks = [
    { symbol: "AAPL", price: "$192.45", change: "+2.3%" },
    { symbol: "GOOGL", price: "$142.80", change: "+1.8%" },
    { symbol: "MSFT", price: "$378.90", change: "+0.9%" },
    { symbol: "TSLA", price: "$248.50", change: "-1.2%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Content Type Tabs */}
      <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 border-b border-border/50">
  <div className="container mx-auto py-4">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Technology' }
          ]} className="mb-3" />
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Technology
              </h1>
              <p className="text-sm text-muted-foreground">
                Latest innovations & tech insights
              </p>
            </div>
          </div>

          {/* Content type tabs moved below header into compact filter bar */}

          {/* Sub-category Tabs in Header */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {subCategoryFilters.map((subCat) => (
              <button
                key={subCat.id}
                onClick={() => setSelectedSubCategory(subCat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSubCategory === subCat.id
                    ? 'bg-cyan-400 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                {subCat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

  <div className="container mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {/* Content Type Filter */}
              <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 p-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
                  {contentTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setContentType(type.value as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                        contentType === type.value
                          ? 'bg-cyan-500 text-white shadow'
                          : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
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
                      onClick={() => setSortBy(option.value as any)}
                      title={option.label}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                        sortBy === option.value
                          ? 'bg-cyan-500 text-white shadow'
                          : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm">{option.icon}</span>
                      <span className="hidden sm:inline">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Articles */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Breaking Tech News</h2>
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-card border border-border rounded-lg overflow-hidden">
                      <div className="h-48 bg-muted"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map(article => (
                  <Link key={article.id} href={getContentUrl(article)} 
                        className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48">
                      <Image
                        src={article.imageUrl || '/api/placeholder/600/400'}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          TECH NEWS
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>{article.author || 'Staff Writer'}</span>
                          <span>{formatPublishedTime(article.published_at)}</span>
                        </div>
                        <span>{article.readingTime || 5} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              )}
            </section>

            {/* Recent Articles */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Latest Technology News</h2>
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex flex-col md:flex-row gap-4 bg-card border border-border rounded-lg p-6">
                      <div className="md:w-1/3 h-48 md:h-32 bg-muted rounded-lg"></div>
                      <div className="md:w-2/3 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="space-y-6">
                {recentArticles.map(article => (
                  <Link key={article.id} href={getContentUrl(article)}
                        className="group flex flex-col md:flex-row gap-4 bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
                    <div className="md:w-1/3">
                      <div className="relative h-48 md:h-32 rounded-lg overflow-hidden">
                        <Image
                          src={article.imageUrl || '/api/placeholder/400/300'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>{article.author || 'Staff Writer'}</span>
                          <span>{formatPublishedTime(article.published_at)}</span>
                        </div>
                        <span>{article.readingTime || 5} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              )}

              {/* Load More */}
              <div className="text-center mt-8">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Load More Articles
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Tech Stocks */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Tech Stocks</h3>
              <div className="space-y-3">
                {techStocks.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-foreground">{stock.symbol}</span>
                    <div className="text-right">
                      <div className="text-foreground">{stock.price}</div>
                      <div className={`text-sm ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Trending in Tech</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-foreground">{topic.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Tech Weekly</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get the latest tech news and insights delivered weekly.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Tech Resources</h3>
              <div className="space-y-2">
                {[
                  { name: 'Product Launches', href: '/tech/launches' },
                  { name: 'Startup Directory', href: '/tech/startups' },
                  { name: 'Tech Jobs', href: '/careers' },
                  { name: 'Developer Tools', href: '/developers' }
                ].map(link => (
                  <Link key={link.name} href={link.href}
                        className="block text-primary hover:text-primary/80 text-sm">
                    {link.name} →
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

export default TechnologyPage;
