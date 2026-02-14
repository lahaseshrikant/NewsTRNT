"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryBadgeStyle } from '@/lib/categoryUtils';
import { dbApi, Article } from '@/lib/api-client';
import { getContentUrl } from '@/lib/contentUtils';

const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  if (diffInMinutes < 7200) return `${Math.floor(diffInMinutes / 1440)} days ago`;
  return new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AnalysisPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analysisArticles, setAnalysisArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { categories: dynamicCategories } = useCategories();

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

  const featuredAnalysis = analysisArticles[0];
  const remainingAnalysis = featuredAnalysis 
    ? filteredAnalysis.filter(a => a.id !== featuredAnalysis.id)
    : filteredAnalysis;

  const researchTopics = [
    { topic: "Market Trends", articles: 15 },
    { topic: "Policy Impact", articles: 12 },
    { topic: "Tech Innovation", articles: 18 },
    { topic: "Global Economy", articles: 10 },
    { topic: "Climate Science", articles: 8 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Analysis' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">Deep Dives</p>
            <h1 className="font-serif text-4xl font-bold text-ivory mb-4">
              Analysis &amp; Research
            </h1>
            <p className="text-xl text-ivory/60">
              Data-driven insights and expert research
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Featured Analysis Hero */}
        {featuredAnalysis && selectedCategory === 'all' && (
          <Link 
            href={`/analysis/${featuredAnalysis.slug}`}
            className="hover-hero-card block mb-8 group"
          >
            <div className="relative h-80 overflow-hidden bg-card border border-border">
              {featuredAnalysis.imageUrl ? (
                <Image
                  src={featuredAnalysis.imageUrl}
                  alt={featuredAnalysis.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-ink via-vermillion/20 to-ink flex items-center justify-center">
                  <svg className="w-16 h-16 text-ivory/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-vermillion text-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-bold">
                    Deep Dive
                  </span>
                  {featuredAnalysis.category && (
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
                      {featuredAnalysis.category.name}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-3xl font-bold text-white mb-3 group-hover:text-gold transition-colors">
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
                  className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-ink dark:bg-ivory text-ivory dark:text-ink'
                      : 'border border-ash dark:border-ash/20 text-stone hover:text-ink dark:hover:text-ivory'
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
                  <div key={i} className="bg-card border border-border overflow-hidden animate-pulse">
                    <div className="flex">
                      <div className="w-1/3 h-48 bg-muted"></div>
                      <div className="flex-1 p-6 space-y-3">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
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
                      className="hover-lift group block bg-card border border-border overflow-hidden transition-all"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="hover-img-zoom relative w-full md:w-1/3 h-48 md:h-auto bg-muted overflow-hidden">
                          {article.imageUrl ? (
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ivory to-ash dark:from-ink dark:to-ink/50">
                              <svg className="w-10 h-10 text-stone/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-vermillion text-white px-2 py-1 font-mono text-[10px] uppercase tracking-wider font-bold">
                            Analysis
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-center gap-2 mb-3">
                            {article.category && (
                              <span className={`px-2 py-1 text-xs font-medium ${getCategoryBadgeStyle(article.category)}`}>
                                {article.category.name}
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-stone uppercase tracking-wider">
                              {article.readingTime || 12} min read
                            </span>
                          </div>

                          <h2 className="font-serif text-xl font-bold text-foreground mb-3 group-hover:text-vermillion transition-colors line-clamp-2">
                            {article.title}
                          </h2>

                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {article.summary || article.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="font-medium">{article.author || 'NewsTRNT Research'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>

                          <div className="mt-4 pt-4 border-t border-border">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-vermillion font-medium">
                              Data-driven insights included
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setPage(prev => prev + 1)}
                      className="hover-magnetic px-6 py-3 bg-vermillion text-white font-mono text-xs tracking-wider uppercase"
                    >
                      Load More Analysis
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <svg className="w-12 h-12 text-stone/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">No Analysis Found</h3>
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
            <div className="bg-card border border-border p-4">
              <h3 className="font-serif font-bold text-foreground mb-4">Research Topics</h3>
              <div className="space-y-1">
                {researchTopics.map((item, index) => (
                  <div key={index} className="hover-row flex items-center justify-between p-2 cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-foreground">{item.topic}</span>
                    <span className="font-mono text-[10px] text-stone">{item.articles} articles</span>
                  </div>
                ))}
              </div>
            </div>

            {/* More Content */}
            <div className="bg-card border border-border p-4">
              <h3 className="font-serif font-bold text-foreground mb-4">More Content</h3>
              <div className="space-y-2">
                <Link href="/news" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">Latest News</span>
                  <p className="text-xs text-muted-foreground">Breaking and current events</p>
                </Link>
                <Link href="/articles" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">Long Reads</span>
                  <p className="text-xs text-muted-foreground">In-depth articles</p>
                </Link>
                <Link href="/opinion" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">Opinion</span>
                  <p className="text-xs text-muted-foreground">Expert perspectives</p>
                </Link>
              </div>
            </div>

            {/* Methodology */}
            <div className="bg-ink dark:bg-ivory/5 border border-ash dark:border-ash/20 p-4">
              <h3 className="font-serif font-bold text-ivory mb-2">Our Methodology</h3>
              <p className="text-sm text-ivory/60">
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
