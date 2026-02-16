"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { dbApi, Article, Category } from '@/lib/api-client';
import { getContentUrl } from '@/lib/contentUtils';
import { useSubCategoryFilters } from '@/hooks/useSubCategoryFilters';
import { getCategoryTheme } from '@/config/categoryThemes';
import { useCategories } from '@/hooks/useCategories';
import AdSlot from '@/components/ui/AdSlot';

const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const HealthCategoryPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const { categories: cachedCategories, loading: categoriesLoading } = useCategories();

  useEffect(() => {
    const cached = cachedCategories.find(c => c.slug === 'health');
    if (cached && cached.isActive) {
      setCategory(cached as Category);
      setLoading(false);
    }
  }, [cachedCategories]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!category) {
          setLoading(true);
        }
        const articlesPromise = dbApi.getArticlesByCategory('health', 30);
        const categoryPromise = category ? Promise.resolve(null) : dbApi.getCategoryBySlug('health');
        
        const [articles, categoryData] = await Promise.all([articlesPromise, categoryPromise]);
        
        if (Array.isArray(articles)) setAllArticles(articles);
        if (categoryData) setCategory(categoryData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [category]);

  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Wellness' },
    { value: 'analysis', label: 'Clinical' },
    { value: 'opinion', label: 'Opinion' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ];

  const healthTopics = [
    { name: 'Medical Research', icon: '🔬', articles: 45, color: 'from-emerald-500/20 to-green-500/20' },
    { name: 'Mental Health', icon: '🧠', articles: 32, color: 'from-violet-500/20 to-purple-500/20' },
    { name: 'Nutrition', icon: '🥦', articles: 28, color: 'from-lime-500/20 to-green-500/20' },
    { name: 'Public Health', icon: '🏥', articles: 24, color: 'from-blue-500/20 to-cyan-500/20' },
    { name: 'Medical Tech', icon: '💊', articles: 19, color: 'from-teal-500/20 to-emerald-500/20' }
  ];

  const wellnessMetrics = [
    { label: 'Articles Today', value: '12', icon: '📰' },
    { label: 'Clinical Trials', value: '847', icon: '🧪' },
    { label: 'Expert Reviews', value: '23', icon: '✅' },
  ];

  const subCategoryFilters = useSubCategoryFilters(allArticles, category?.subCategories, 'ALL');

  const filteredArticles = () => {
    let filtered = [...allArticles];
    if (contentType !== 'all') filtered = filtered.filter(a => a.contentType === contentType);
    if (selectedSubCategory !== 'all') filtered = filtered.filter(a => a.subCategory?.slug === selectedSubCategory);
    if (sortBy === 'trending') filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sortBy === 'popular') filtered.sort((a, b) => (b.readingTime || 0) - (a.readingTime || 0));
    else if (sortBy === 'breaking') filtered = filtered.filter(a => a.isBreaking);
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-xs tracking-wider uppercase text-stone">Loading section...</p>
        </div>
      </div>
    );
  }

  if (!category || !category.isActive) {
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

  const theme = getCategoryTheme('health');
  const articles = filteredArticles();
  const featuredArticles = articles.filter(a => a.isFeatured);
  const recentArticles = articles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE WELLNESS CENTER — Forest Hero ═══ */}
      <div className="desk-health-hero text-white">
        <div className="container mx-auto pt-4 pb-6 relative z-10">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Health' }
          ]} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_li:last-child_span]:text-white/80" />

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="desk-kicker text-emerald-400/80 mb-2 flex items-center gap-2">
                <span className="health-pulse-icon w-3 h-3 bg-emerald-400 rounded-full inline-block"></span>
                WELLNESS CENTER
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-serif), serif' }}>
                Health
              </h1>
              <p className="text-white/50 text-lg max-w-xl">
                Medical breakthroughs, wellness insights & the science of living better.
              </p>

              {/* Wellness Metrics Row */}
              <div className="mt-6 flex gap-4">
                {wellnessMetrics.map(metric => (
                  <div key={metric.label} className="bg-white/5 rounded-xl px-4 py-3 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{metric.icon}</span>
                      <span className="text-xl font-bold text-white tabular-nums">{metric.value}</span>
                    </div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* EKG / Heartbeat Visual */}
            <div className="hidden lg:flex items-center justify-center" style={{ width: 200, height: 120 }}>
              <svg viewBox="0 0 200 80" className="w-full h-full" fill="none">
                <path
                  d="M0 40 L30 40 L40 40 L50 20 L60 60 L70 10 L80 50 L90 40 L120 40 L140 40 L150 30 L160 50 L170 25 L180 45 L190 40 L200 40"
                  stroke="rgba(52, 211, 153, 0.4)"
                  strokeWidth="2"
                  className="health-ekg-path"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                />
                <path
                  d="M0 40 L30 40 L40 40 L50 20 L60 60 L70 10 L80 50 L90 40 L120 40 L140 40 L150 30 L160 50 L170 25 L180 45 L190 40 L200 40"
                  stroke="rgba(52, 211, 153, 0.08)"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Heartbeat Divider + Sub-category Tabs */}
        <div className="health-heartbeat-divider">
          <div className="container mx-auto py-2">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {subCategoryFilters.map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => setSelectedSubCategory(subCat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSubCategory === subCat.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {subCat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Filters ═══ */}
      <div className="container mx-auto pt-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-2 flex-1">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value as typeof contentType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    contentType === type.value
                      ? 'bg-emerald-600 text-white shadow' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Sort:</span>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    sortBy === option.value
                      ? 'bg-emerald-600 text-white shadow' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="text-sm">{option.icon}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="container mx-auto pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Featured Health Reports */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-emerald-500"></div>
                <h2 className="desk-section-title text-xl text-foreground">Health Spotlight</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-card border border-border rounded-xl overflow-hidden">
                      <div className="h-48 bg-muted"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredArticles.map(article => (
                    <Link key={article.id} href={getContentUrl(article)}
                          className="group health-card bg-card rounded-xl overflow-hidden border border-border desk-card-hover">
                      <div className="relative h-52">
                        <Image
                          src={article.imageUrl || '/api/placeholder/600/400'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="desk-badge bg-emerald-600 text-white">WELLNESS</span>
                          {article.isBreaking && (
                            <span className="desk-badge bg-red-600 text-white animate-pulse">BREAKING</span>
                          )}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-200 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{article.author || 'Health Desk'}</span>
                          <div className="flex items-center gap-2">
                            <span className="health-stat-pill">{article.readingTime || 5} min</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <AdSlot size="inline" className="my-6" />

            {/* Recent Health Articles */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-emerald-500/50"></div>
                <h2 className="desk-section-title text-xl text-foreground">Latest Health News</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4 bg-card border border-border rounded-xl p-5">
                      <div className="w-1/3 h-32 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentArticles.map(article => (
                    <Link key={article.id} href={getContentUrl(article)} className="group block">
                      <article className="health-card flex flex-col md:flex-row gap-4 bg-card rounded-xl p-4 border border-border desk-card-hover">
                        <div className="md:w-1/3">
                          <div className="relative h-48 md:h-36 rounded-lg overflow-hidden">
                            <Image
                              src={article.imageUrl || '/api/placeholder/400/300'}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </div>
                        <div className="md:flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="desk-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                {article.subCategory?.name || 'Health'}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.readingTime || 5} min</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>{article.author || 'Health Desk'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button className="px-8 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all">
                  Load More Articles
                </button>
              </div>
            </section>
          </div>

          {/* ═══ Sidebar ═══ */}
          <aside className="lg:w-80 space-y-6">
            {/* Health Topics */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <span className="health-pulse-icon w-2 h-2 bg-emerald-400 rounded-full inline-block"></span>
                  Health Topics
                </h3>
              </div>
              <div className="bg-card p-3 space-y-1">
                {healthTopics.map((topic) => (
                  <Link key={topic.name}
                        href={`/category/health?topic=${topic.name.toLowerCase().replace(' ', '-')}`}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r ${topic.color} transition-all`}>
                    <span className="text-xl">{topic.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">{topic.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{topic.articles}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Health Check */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-green-950 to-emerald-900">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Daily Health Tip</h3>
              </div>
              <div className="bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium mb-1">Stay Hydrated</p>
                    <p className="text-xs text-muted-foreground">
                      Drinking 8 glasses of water daily improves cognitive function by up to 30% and reduces fatigue.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Source: WHO</span>
                  <button className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                    Read More →
                  </button>
                </div>
              </div>
            </div>

            <AdSlot size="rectangle" />

            {/* Health Newsletter */}
            <div className="rounded-xl overflow-hidden" style={{ background: theme.gradient }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <span className="text-2xl">💚</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Health Weekly</h3>
                <p className="text-white/50 text-sm mb-4">
                  Wellness tips & medical breakthroughs, every Wednesday.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm"
                  />
                  <button className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-colors">
                    Subscribe Free
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HealthCategoryPage;
