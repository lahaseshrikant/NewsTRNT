"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { dbApi, Article, Category } from '@/lib/api-client';
import { getContentUrl } from '@/lib/contentUtils';
import { useSubCategoryFilters } from '@/hooks/useSubCategoryFilters';
import { getCategoryTheme } from '@/config/categoryThemes';
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

const WorldCategoryPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'analysis' | 'opinion'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [articles, categoryData] = await Promise.all([
          dbApi.getArticlesByCategory('world', 30),
          dbApi.getCategoryBySlug('world')
        ]);
        if (Array.isArray(articles)) setAllArticles(articles);
        if (categoryData) setCategory(categoryData);
      } catch (error) {
        console.error('Error loading world data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const contentTypes = [
    { value: 'all', label: 'All Dispatches' },
    { value: 'news', label: 'Breaking' },
    { value: 'article', label: 'Reports' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Commentary' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ];

  const regions = [
    { id: 'europe', name: 'Europe', flag: '🇪🇺', description: 'EU, UK, Eastern Europe', color: '#3B82F6' },
    { id: 'asia-pacific', name: 'Asia-Pacific', flag: '🌏', description: 'China, Japan, India, ASEAN', color: '#F59E0B' },
    { id: 'americas', name: 'Americas', flag: '🌎', description: 'US, Canada, Latin America', color: '#10B981' },
    { id: 'middle-east', name: 'Middle East', flag: '🕌', description: 'Gulf states, Levant, Iran', color: '#EF4444' },
    { id: 'africa', name: 'Africa', flag: '🌍', description: 'Sub-Saharan, North Africa', color: '#8B5CF6' }
  ];

  const liveUpdates = [
    { title: 'UN Security Council', detail: 'Emergency session called to address humanitarian crisis', time: '2 min ago', severity: 'high' as const },
    { title: 'G7 Economic Summit', detail: 'Joint statement on global trade cooperation released', time: '15 min ago', severity: 'medium' as const },
    { title: 'Climate Conference', detail: 'New carbon emission targets announced for 2030', time: '32 min ago', severity: 'low' as const },
    { title: 'Indo-Pacific Security', detail: 'New defense pact signed between three nations', time: '1 hr ago', severity: 'medium' as const }
  ];

  const subCategoryFilters = useSubCategoryFilters(allArticles, category?.subCategories || [], 'ALL');

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
      <div className="min-h-screen bg-background">
        <div className="desk-world-hero py-20">
          <div className="container mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-48"></div>
              <div className="h-6 bg-white/10 rounded w-96"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const theme = getCategoryTheme('world');
  const articles = filteredArticles();
  const heroArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE GLOBE DESK — Immersive Hero ═══ */}
      <div className="desk-world-hero text-white">
        <div className="desk-world-grid" />
        
        <div className="container mx-auto pt-4 relative z-10">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'World' }
          ]} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_li:last-child_span]:text-white/80" />
        </div>

        <div className="container mx-auto pb-8 relative z-10">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="desk-kicker text-amber-400/80 mb-2">WORLD DISPATCH</div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-serif), serif' }}>
                Global News
              </h1>
              <p className="text-white/60 text-lg max-w-xl">
                International developments, geopolitics & global affairs — reporting from every corner of the world.
              </p>

              {/* Around the World ticker */}
              <div className="mt-6 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10 max-w-xl">
                <div className="world-pulse-dot">
                  <span className="w-2 h-2 bg-amber-400 rounded-full block"></span>
                </div>
                <div className="text-xs text-white/50 uppercase tracking-wider font-semibold whitespace-nowrap">Around the World</div>
                <div className="h-4 w-px bg-white/20"></div>
                <div className="text-sm text-white/80 truncate">
                  {heroArticle ? heroArticle.title : 'Latest global developments across 5 continents'}
                </div>
              </div>
            </div>

            {/* Globe Visualization */}
            <div className="hidden lg:flex items-center justify-center relative" style={{ width: 180, height: 180 }}>
              <div className="world-globe-ring absolute" style={{ width: 160, height: 160, opacity: 0.5 }}></div>
              <div className="world-globe-ring absolute" style={{ width: 120, height: 120, opacity: 0.4, animationDirection: 'reverse', animationDuration: '20s' }}></div>
              <div className="world-globe-ring absolute" style={{ width: 80, height: 80, opacity: 0.3 }}></div>
              <div className="text-5xl relative z-10">🌐</div>
              {regions.map((r, i) => (
                <div
                  key={r.id}
                  className="absolute w-3 h-3 rounded-full opacity-60"
                  style={{
                    backgroundColor: r.color,
                    top: `${30 + Math.sin(i * 1.2) * 35}%`,
                    left: `${30 + Math.cos(i * 1.2) * 35}%`,
                  }}
                  title={r.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sub-category Tabs */}
        <div className="border-t border-white/10">
          <div className="container mx-auto py-2">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {subCategoryFilters.map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => setSelectedSubCategory(subCat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSubCategory === subCat.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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

      {/* ═══ Filter Bar ═══ */}
      <div className="container mx-auto pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-2 mb-6">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value as typeof contentType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    contentType === type.value
                      ? 'bg-vermillion text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  style={contentType === type.value ? { background: theme.primary } : {}}
                >
                  {type.label}
                </button>
              ))}
              <span className="hidden sm:inline-block mx-2 h-4 w-px bg-border/60" />
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    sortBy === option.value
                      ? 'text-white shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  style={sortBy === option.value ? { background: theme.primary } : {}}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="container mx-auto pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Hero Article */}
              {heroArticle && (
                <Link href={getContentUrl(heroArticle)} className="group block">
                  <article className="relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl transition-all desk-card-hover">
                    <div className="relative h-72 lg:h-96">
                      <Image
                        src={heroArticle.imageUrl || '/api/placeholder/1200/600'}
                        alt={heroArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        {heroArticle.isBreaking && (
                          <span className="desk-badge bg-red-600 text-white animate-pulse">BREAKING</span>
                        )}
                        <span className="desk-badge text-white" style={{ background: theme.primary }}>
                          WORLD DISPATCH
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-amber-200 transition-colors" style={{ fontFamily: 'var(--font-serif), serif' }}>
                          {heroArticle.title}
                        </h2>
                        <p className="text-white/70 mb-4 line-clamp-2 max-w-2xl">{heroArticle.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span>By {heroArticle.author || 'Staff Correspondent'}</span>
                          <span>•</span>
                          <span>{heroArticle.readingTime || 5} min read</span>
                          <span>•</span>
                          <span>{formatPublishedTime(heroArticle.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Latest Dispatches */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1" style={{ backgroundImage: `linear-gradient(to right, transparent, ${theme.accent}40, transparent)` }}></div>
                  <h2 className="desk-section-title text-xl text-foreground">Latest Dispatches</h2>
                  <div className="h-px flex-1" style={{ backgroundImage: `linear-gradient(to left, transparent, ${theme.accent}40, transparent)` }}></div>
                </div>

                <div className="space-y-5">
                  {remainingArticles.map((article) => (
                    <Link key={article.id} href={getContentUrl(article)} className="group block">
                      <article className="flex flex-col sm:flex-row gap-4 bg-card rounded-xl border border-border p-4 hover:shadow-lg transition-all desk-card-hover world-region-card">
                        <div className="sm:w-1/3 relative">
                          <div className="relative h-48 sm:h-full min-h-[140px] rounded-lg overflow-hidden">
                            <Image
                              src={article.imageUrl || '/api/placeholder/400/300'}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {article.isBreaking && (
                              <span className="absolute top-2 left-2 desk-badge bg-red-600 text-white animate-pulse">BREAKING</span>
                            )}
                          </div>
                        </div>
                        <div className="sm:w-2/3 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="desk-badge" style={{ background: `${theme.primary}15`, color: theme.primary }}>
                                {article.subCategory?.name || article.category?.name || 'World'}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.readingTime || 5} min read</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>By {article.author || 'Staff Correspondent'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              <AdSlot size="inline" className="my-4" />

              <div className="text-center">
                <button className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg" style={{ background: theme.gradient }}>
                  Load More Dispatches
                </button>
              </div>
            </div>

            {/* ═══ Sidebar ═══ */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Regions Navigator */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4" style={{ background: theme.gradient }}>
                  <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                    <span>🗺️</span> Region Navigator
                  </h3>
                </div>
                <div className="bg-card p-3 space-y-1">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setActiveRegion(activeRegion === region.id ? null : region.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                        activeRegion === region.id
                          ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <span className="text-xl">{region.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground">{region.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{region.description}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: region.color }}></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Updates */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-red-900 to-red-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    Live Wire
                  </h3>
                  <span className="text-[10px] text-red-200/60 font-semibold">UPDATING</span>
                </div>
                <div className="bg-card divide-y divide-border">
                  {liveUpdates.map((update, i) => (
                    <div key={i} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{update.title}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{update.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{update.detail}</p>
                      <div className="mt-2">
                        <span className={`inline-block w-8 h-0.5 rounded-full ${
                          update.severity === 'high' ? 'bg-red-500' :
                          update.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <AdSlot size="rectangle" />

              {/* World Brief Newsletter */}
              <div className="rounded-xl overflow-hidden" style={{ background: theme.gradient }}>
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📰</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                    The World Brief
                  </h3>
                  <p className="text-white/60 text-sm mb-4">Daily digest of global events delivered at 6 AM.</p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
                    />
                    <button className="w-full py-2.5 rounded-lg bg-amber-500 text-white font-semibold text-sm hover:bg-amber-400 transition-colors">
                      Subscribe Free
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldCategoryPage;
