"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { dbApi, Article } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';

const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)} days ago`;
};

const WorldCategoryPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'analysis' | 'opinion'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const articles = await dbApi.getArticlesByCategory('world', 30);
        if (Array.isArray(articles)) {
          setAllArticles(articles);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  const contentTypes = [
    { value: 'all', label: 'All Content' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Articles' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ];

  const subCategories = [
    { id: 'all', label: 'All Regions', count: allArticles.length },
    { id: 'europe', label: 'Europe', count: allArticles.filter(a => a.category?.slug === 'europe').length || 0 },
    { id: 'asia', label: 'Asia', count: allArticles.filter(a => a.category?.slug === 'asia').length || 0 },
    { id: 'americas', label: 'Americas', count: allArticles.filter(a => a.category?.slug === 'americas').length || 0 },
    { id: 'africa-mideast', label: 'Africa & Middle East', count: allArticles.filter(a => a.category?.slug === 'africa-mideast').length || 0 }
  ];

  const filteredArticles = () => {
    let filtered = [...allArticles];

    // Filter by content type
    if (contentType !== 'all') {
      filtered = filtered.filter(article => article.contentType === contentType);
    }

    // Filter by sub-category
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(article => article.category?.slug === selectedSubCategory);
    }

    // Sort articles
    if (sortBy === 'trending') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.readingTime || 0) - (a.readingTime || 0));
    } else if (sortBy === 'breaking') {
      filtered = filtered.filter(article => article.isBreaking);
    }
    // 'latest' is default order

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner with Tabs */}
      <div className="bg-gradient-to-r from-teal-600/5 to-blue-600/5 border-b border-border/50">
  <div className="container mx-auto py-4">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'World' }
          ]} className="mb-3" />
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                World News
              </h1>
              <p className="text-sm text-muted-foreground">
                Global news & international developments
              </p>
            </div>
          </div>

          {/* Content type tabs moved below header into compact filter bar */}

          {/* Sub-category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {subCategories.map((subCat) => (
              <button
                key={subCat.id}
                onClick={() => setSelectedSubCategory(subCat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSubCategory === subCat.id
                    ? 'bg-teal-400 text-white shadow-md'
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
        <div className="max-w-6xl mx-auto">
          {/* Compact Filter Bar: content type + sort */}
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 p-2 mb-5">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    contentType === type.value
                      ? 'bg-teal-500 text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {type.label}
                </button>
              ))}

              <span className="hidden sm:inline-block mx-2 h-4 w-px bg-border/60" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Sort</span>

              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    sortBy === option.value
                      ? 'bg-teal-500 text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Articles */}
            <div className="lg:col-span-2 space-y-6">
              {filteredArticles().map((article, index) => (
                <article
                  key={article.id}
                  className={`bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow ${
                    index === 0 && sortBy === 'latest' ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className={`flex ${index === 0 && sortBy === 'latest' ? 'flex-col lg:flex-row' : 'flex-col sm:flex-row'} gap-4`}>
                    <div className={`relative ${index === 0 && sortBy === 'latest' ? 'lg:w-2/3' : 'sm:w-1/3'}`}>
                      <Image
                        src={article.imageUrl || '/api/placeholder/600/300'}
                        alt={article.title}
                        width={600}
                        height={300}
                        className={`w-full object-cover ${
                          index === 0 && sortBy === 'latest' ? 'h-64 lg:h-full' : 'h-48 sm:h-full'
                        }`}
                      />
                      {article.isBreaking && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                          BREAKING
                        </span>
                      )}
                      {article.sourceName && (
                        <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          📍 {article.sourceName}
                        </div>
                      )}
                    </div>
                    
                    <div className={`p-6 flex-1 ${index === 0 && sortBy === 'latest' ? 'lg:w-1/3' : 'sm:w-2/3'}`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300 px-2 py-1 rounded text-xs font-medium">
                          {article.category?.name || 'World'}
                        </span>
                        <span className="text-muted-foreground text-sm">{article.readingTime || 5} min read</span>
                      </div>
                      
                      <Link href={getContentUrl(article)}>
                        <h2 className={`font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors ${
                          index === 0 && sortBy === 'latest' ? 'text-2xl' : 'text-lg'
                        }`}>
                          {article.title}
                        </h2>
                      </Link>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>By {article.author || 'Staff Writer'}</span>
                        <span>{formatPublishedTime(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* World Regions */}
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Regions</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Europe', count: 78, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', flag: '🇪🇺' },
                    { name: 'Asia-Pacific', count: 65, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', flag: '🌏' },
                    { name: 'Americas', count: 54, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', flag: '🌎' },
                    { name: 'Middle East', count: 43, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', flag: '🕌' },
                    { name: 'Africa', count: 36, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300', flag: '🌍' }
                  ].map((region) => (
                    <Link
                      key={region.name}
                      href={`/category/world?region=${region.name.toLowerCase().replace('-', '')}`}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{region.flag}</span>
                        <span className="font-medium text-foreground">{region.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Live Updates */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg p-6 border border-red-200/50 dark:border-red-800/50">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    <h3 className="text-lg font-bold text-foreground">Live Updates</h3>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-background/50 rounded border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-foreground">UN Security Council</span>
                      <span className="text-xs text-muted-foreground">2 min ago</span>
                    </div>
                    <p className="text-muted-foreground">Emergency session called to address humanitarian crisis</p>
                  </div>
                  <div className="p-3 bg-background/50 rounded border-l-4 border-orange-500">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-foreground">G7 Summit</span>
                      <span className="text-xs text-muted-foreground">15 min ago</span>
                    </div>
                    <p className="text-muted-foreground">Joint statement on economic cooperation released</p>
                  </div>
                  <div className="p-3 bg-background/50 rounded border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-foreground">Climate Conference</span>
                      <span className="text-xs text-muted-foreground">32 min ago</span>
                    </div>
                    <p className="text-muted-foreground">New carbon emission targets announced</p>
                  </div>
                </div>
              </div>

              {/* World Newsletter */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="text-center">
                  <div className="text-3xl mb-3">📰</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">World Brief</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Daily digest of global events and international developments.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldCategoryPage;
