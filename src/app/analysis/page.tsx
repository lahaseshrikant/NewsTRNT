"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryBadgeStyle } from '@/lib/categoryUtils';
import { dbApi, Article } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';

// Helper to format published time
const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  if (diffInMinutes < 7200) return `${Math.floor(diffInMinutes / 1440)} days ago`;
  const date = new Date(publishedAt);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AnalysisPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analysisArticles, setAnalysisArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Load analysis from database
  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const result = await dbApi.getArticlesByType('analysis', 12, page);
        if (Array.isArray(result.articles)) {
          setAnalysisArticles(result.articles);
          setHasMore(result.pagination.hasNext);
        }
      } catch (error) {
        console.error('Error loading analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [page]);

  // Create categories list
  const categories = [
    { id: 'all', label: 'All Analysis', count: analysisArticles.length },
    ...dynamicCategories.slice(0, 6).map(cat => ({
      id: cat.slug,
      label: cat.name,
      count: analysisArticles.filter(a => a.category?.slug === cat.slug).length
    }))
  ];

  const filteredAnalysis = selectedCategory === 'all' 
    ? analysisArticles 
    : analysisArticles.filter(article => article.category?.slug === selectedCategory);

  // Get featured analysis for hero
  const featuredAnalysis = analysisArticles[0];
  const remainingAnalysis = featuredAnalysis 
    ? filteredAnalysis.filter(a => a.id !== featuredAnalysis.id)
    : filteredAnalysis;

  // Research topics
  const researchTopics = [
    { topic: "Market Trends", articles: 15, icon: "📈" },
    { topic: "Policy Impact", articles: 12, icon: "⚖️" },
    { topic: "Tech Innovation", articles: 18, icon: "💡" },
    { topic: "Global Economy", articles: 10, icon: "🌍" },
    { topic: "Climate Science", articles: 8, icon: "🌱" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border-b border-border">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Analysis' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🔍 Analysis
            </h1>
            <p className="text-xl text-muted-foreground">
              Deep dives, data-driven insights, and expert research
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Featured Analysis Hero */}
        {featuredAnalysis && selectedCategory === 'all' && (
          <Link 
            href={`/analysis/${featuredAnalysis.slug}`}
            className="block mb-8 group"
          >
            <div className="relative h-80 rounded-xl overflow-hidden bg-card border border-border">
              {featuredAnalysis.imageUrl ? (
                <Image
                  src={featuredAnalysis.imageUrl}
                  alt={featuredAnalysis.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-8xl">
                  🔍
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    🔍 DEEP DIVE
                  </span>
                  {featuredAnalysis.category && (
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                      {featuredAnalysis.category.name}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-emerald-200 transition-colors">
                  {featuredAnalysis.title}
                </h2>
                <p className="text-white/80 text-lg mb-4 line-clamp-2 max-w-3xl">
                  {featuredAnalysis.summary || featuredAnalysis.excerpt}
                </p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span>{featuredAnalysis.author || 'NewsTRNT Research'}</span>
                  <span>•</span>
                  <span>{featuredAnalysis.readingTime || 12} min read</span>
                  <span>•</span>
                  <span>{formatPublishedTime(featuredAnalysis.published_at)}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Analysis Articles */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                    <div className="flex">
                      <div className="w-1/3 h-48 bg-muted"></div>
                      <div className="flex-1 p-6 space-y-3">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : remainingAnalysis.length > 0 ? (
              <>
                <div className="space-y-6">
                  {remainingAnalysis.map((article) => (
                    <Link 
                      key={article.id} 
                      href={`/analysis/${article.slug}`}
                      className="group block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="relative w-full md:w-1/3 h-48 md:h-auto bg-muted">
                          {article.imageUrl ? (
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20">
                              🔍
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">
                            ANALYSIS
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          {/* Category Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            {article.category && (
                              <span 
                                className={`px-2 py-1 rounded text-xs font-medium ${getCategoryBadgeStyle(article.category)}`}
                              >
                                {article.category.name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {article.readingTime || 12} min read
                            </span>
                          </div>

                          <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {article.title}
                          </h2>

                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {article.summary || article.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{article.author || 'NewsTRNT Research'}</span>
                            </div>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>

                          {/* Key Insights Preview */}
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                              <span>📊</span>
                              <span>Data-driven insights included</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setPage(prev => prev + 1)}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Load More Analysis
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Analysis Found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory === 'all' 
                    ? 'Deep dives coming soon. Check back for in-depth analysis.'
                    : 'Try selecting a different category.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Research Topics */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-4">📊 Research Topics</h3>
              <div className="space-y-2">
                {researchTopics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-sm font-medium">{item.topic}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* More Content */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-4">📖 More Content</h3>
              <div className="space-y-2">
                <Link href="/news" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">📰 Latest News</span>
                  <p className="text-xs text-muted-foreground">Breaking and current events</p>
                </Link>
                <Link href="/articles" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">📚 Long Reads</span>
                  <p className="text-xs text-muted-foreground">In-depth articles</p>
                </Link>
                <Link href="/opinion" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">💭 Opinion</span>
                  <p className="text-xs text-muted-foreground">Expert perspectives</p>
                </Link>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-2">📋 Our Methodology</h3>
              <p className="text-sm text-muted-foreground">
                All analysis pieces are fact-checked and backed by data from verified sources. We prioritize accuracy and depth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
