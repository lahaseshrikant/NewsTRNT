"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

const PoliticsPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [articles, categoryData] = await Promise.all([
          dbApi.getArticlesByCategory('politics', 30),
          dbApi.getCategoryBySlug('politics')
        ]);
        if (Array.isArray(articles)) setAllArticles(articles);
        if (categoryData) setCategory(categoryData);
      } catch (error) {
        console.error('Error loading politics data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const contentTypes = [
    { value: 'all', label: 'All Coverage' },
    { value: 'news', label: 'Breaking' },
    { value: 'article', label: 'Reports' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ];

  const powerWatchItems = [
    { branch: 'Executive', status: 'In Session', indicator: 'active' as const },
    { branch: 'Legislative', status: 'Recess', indicator: 'idle' as const },
    { branch: 'Judiciary', status: 'Hearing', indicator: 'active' as const },
    { branch: 'State Dept.', status: 'Briefing', indicator: 'active' as const }
  ];

  const trendingTopics = [
    { name: "Congressional Hearings", count: 23, trend: 'up' as const },
    { name: "Election Coverage", count: 18, trend: 'up' as const },
    { name: "Supreme Court", count: 15, trend: 'stable' as const },
    { name: "Foreign Policy", count: 12, trend: 'down' as const },
    { name: "Climate Policy", count: 9, trend: 'up' as const }
  ];

  const subCategoryFilters = useSubCategoryFilters(allArticles, category?.subCategories || [], 'ALL');

  const filteredArticles = () => {
    let filtered = [...allArticles];
    if (contentType !== 'all') filtered = filtered.filter(a => a.contentType === contentType);
    if (selectedSubCategory !== 'all') filtered = filtered.filter(a => a.subCategory?.slug === selectedSubCategory);
    if (sortBy === 'trending') filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sortBy === 'popular') filtered.sort((a, b) => (b.readingTime || 0) - (a.readingTime || 0));
    return filtered;
  };

  const theme = getCategoryTheme('politics');
  const articles = filteredArticles();
  const featuredArticles = articles.filter(a => a.isFeatured);
  const recentArticles = articles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE POWER DESK — Dark, Urgent Hero ═══ */}
      <div className="desk-politics-hero text-white">
        {/* Urgency bar */}
        <div className="politics-urgency-bar py-1">
          <div className="container mx-auto flex items-center justify-center gap-4 text-xs font-bold tracking-widest">
            <span className="text-white/90">POLITICAL COVERAGE</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span className="text-white/60">LIVE UPDATES</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span className="text-white/60">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="container mx-auto pt-4 pb-6 relative z-10">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Politics' }
          ]} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_li:last-child_span]:text-white/80" />

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="desk-kicker text-red-400/80 mb-2">POWER WATCH</div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-serif), serif' }}>
                Politics
              </h1>
              <p className="text-white/50 text-lg max-w-xl">
                In-depth political analysis, breaking legislation updates & accountability journalism.
              </p>
            </div>

            {/* Power Watch Dashboard */}
            <div className="hidden lg:block">
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 min-w-[260px]">
                <div className="text-[10px] font-bold text-red-400/70 tracking-widest uppercase mb-3">Power Status</div>
                <div className="space-y-2">
                  {powerWatchItems.map((item) => (
                    <div key={item.branch} className="flex items-center justify-between">
                      <span className="text-xs text-white/70 font-medium">{item.branch}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40">{item.status}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          item.indicator === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500/60'
                        }`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                      ? 'bg-red-800/40 text-red-300 border border-red-700/40'
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
                      ? 'bg-red-900 text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
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
                      ? 'bg-red-900 text-white shadow'
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
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="container mx-auto pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Featured: Breaking Political News */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-red-800 rounded-full"></div>
                <h2 className="desk-section-title text-xl text-foreground">Breaking Political News</h2>
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
                          className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all politics-card-featured">
                      <div className="relative h-52">
                        <Image
                          src={article.imageUrl || '/api/placeholder/600/400'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <span className="desk-badge bg-red-700 text-white">BREAKING</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white group-hover:text-red-200 transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                            {article.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{article.author || 'Political Desk'}</span>
                          <span>{formatPublishedTime(article.published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <AdSlot size="inline" className="my-8" />

            {/* Recent Articles — Timeline Style */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-red-800/50 rounded-full"></div>
                <h2 className="desk-section-title text-xl text-foreground">Latest Political Coverage</h2>
              </div>

              {loading ? (
                <div className="space-y-6">
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
                  {recentArticles.map((article, index) => (
                    <Link key={article.id} href={getContentUrl(article)} className="group block">
                      <article className="flex flex-col md:flex-row gap-4 bg-card rounded-xl border border-border p-4 hover:shadow-lg transition-all politics-card">
                        {/* Timeline indicator */}
                        <div className="hidden md:flex flex-col items-center mr-2">
                          <div className="politics-timeline-dot"></div>
                          {index < recentArticles.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gradient-to-b from-red-800/30 to-transparent mt-1"></div>
                          )}
                        </div>

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
                              <span className="desk-badge bg-red-900/10 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                {article.subCategory?.name || 'Politics'}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.readingTime || 5} min</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>{article.author || 'Political Desk'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button className="px-8 py-3 rounded-xl font-semibold text-white bg-red-900 hover:bg-red-800 transition-all">
                  Load More Coverage
                </button>
              </div>
            </section>
          </div>

          {/* ═══ Sidebar ═══ */}
          <aside className="lg:w-80 space-y-6">
            {/* Trending in Politics */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-red-950 to-red-900">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Trending in Politics</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <span className="text-lg font-bold text-muted-foreground/40 tabular-nums">0{index + 1}</span>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">{topic.name}</span>
                    </div>
                    <span className={`text-xs ${topic.trend === 'up' ? 'text-red-500' : topic.trend === 'down' ? 'text-blue-500' : 'text-muted-foreground'}`}>
                      {topic.trend === 'up' ? '↑' : topic.trend === 'down' ? '↓' : '—'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <AdSlot size="rectangle" />

            {/* Political Briefing Newsletter */}
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-red-950 to-gray-950">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-800/30 flex items-center justify-center mx-auto mb-4 border border-red-700/30">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                  Political Briefing
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Daily political intel and analysis, delivered before the first session.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                  <button className="w-full py-2.5 rounded-lg bg-red-700 text-white font-semibold text-sm hover:bg-red-600 transition-colors">
                    Subscribe Free
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 tracking-wider uppercase">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { name: 'Election Results', href: '/elections', icon: '🗳️' },
                  { name: 'Congressional Directory', href: '/congress', icon: '🏛️' },
                  { name: 'Policy Tracker', href: '/policy', icon: '📋' },
                  { name: 'Political Calendar', href: '/calendar', icon: '📅' }
                ].map(link => (
                  <Link key={link.name} href={link.href}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm text-foreground">
                    <span>{link.icon}</span>
                    <span>{link.name}</span>
                    <span className="ml-auto text-muted-foreground">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PoliticsPage;
