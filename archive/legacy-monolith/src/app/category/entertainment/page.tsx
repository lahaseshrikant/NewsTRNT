"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { dbApi, Article, Category } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';
import { useSubCategoryFilters } from '@/hooks/useSubCategoryFilters';
import { getCategoryTheme } from '@/config/categoryThemes';
import AdSlot from '@/components/AdSlot';

const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const EntertainmentCategoryPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'analysis' | 'opinion'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [articles, categoryData] = await Promise.all([
          dbApi.getArticlesByCategory('entertainment', 30),
          dbApi.getCategoryBySlug('entertainment')
        ]);
        if (Array.isArray(articles)) setAllArticles(articles);
        if (categoryData) setCategory(categoryData);
      } catch (error) {
        console.error('Error loading entertainment data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Reviews' },
    { value: 'analysis', label: 'Deep Dive' },
    { value: 'opinion', label: 'Opinion' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ];

  const entertainmentCategories = [
    { name: 'Movies', icon: '🎬', count: 67, color: 'from-red-500/20 to-pink-500/20' },
    { name: 'Music', icon: '🎵', count: 54, color: 'from-blue-500/20 to-violet-500/20' },
    { name: 'TV Shows', icon: '📺', count: 43, color: 'from-green-500/20 to-emerald-500/20' },
    { name: 'Celebrity', icon: '⭐', count: 38, color: 'from-yellow-500/20 to-amber-500/20' },
    { name: 'Gaming', icon: '🎮', count: 29, color: 'from-purple-500/20 to-fuchsia-500/20' }
  ];

  const trendingHashtags = [
    { tag: '#MarvelPhase6', posts: '2.4M', trending: 'up' },
    { tag: '#Grammys2025', posts: '1.8M', trending: 'up' },
    { tag: '#NetflixOriginal', posts: '956K', trending: 'stable' },
    { tag: '#Oscars', posts: '748K', trending: 'up' },
    { tag: '#GameOfTheYear', posts: '523K', trending: 'down' },
  ];

  const boxOffice = [
    { rank: 1, title: 'Thunderbolts*', weekend: '$128M', total: '$289M' },
    { rank: 2, title: 'Mission: Impossible 8', weekend: '$89M', total: '$456M' },
    { rank: 3, title: 'Inside Out 3', weekend: '$67M', total: '$912M' },
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

  const theme = getCategoryTheme('entertainment');
  const articles = filteredArticles();
  const featuredArticles = articles.filter(a => a.isFeatured);
  const recentArticles = articles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE SPOTLIGHT — Cinematic Hero ═══ */}
      <div className="desk-entertainment-hero text-white relative overflow-hidden">
        <div className="container mx-auto pt-4 pb-6 relative z-10">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Entertainment' }
          ]} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_li:last-child_span]:text-white/80" />

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="desk-kicker text-pink-400/80 mb-2 flex items-center gap-2">
                <span className="text-sm">✦</span>
                THE SPOTLIGHT
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-serif), serif' }}>
                <span className="entertainment-marquee-text">Entertainment</span>
              </h1>
              <p className="text-white/50 text-lg max-w-xl">
                Movies, music, TV, gaming & culture — the stories everyone&apos;s talking about.
              </p>

              {/* Box Office Mini Ticker */}
              <div className="mt-6 bg-white/5 rounded-xl border border-pink-500/10 backdrop-blur-sm p-4 max-w-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Box Office Weekend</span>
                </div>
                <div className="space-y-2">
                  {boxOffice.map(movie => (
                    <div key={movie.rank} className="flex items-center gap-3">
                      <span className="text-lg font-black text-pink-500/40 tabular-nums w-6 text-center">
                        {movie.rank}
                      </span>
                      <span className="text-sm text-white/80 flex-1 truncate">{movie.title}</span>
                      <span className="text-xs font-bold text-pink-300 tabular-nums">{movie.weekend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Film Strip Decorative */}
            <div className="hidden lg:flex flex-col items-center gap-1" style={{ width: 60 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="w-6 h-4 rounded-sm bg-gradient-to-br from-pink-500/20 to-purple-500/20"></div>
                </div>
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
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
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
                      ? 'bg-pink-600 text-white shadow' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
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
                      ? 'bg-pink-600 text-white shadow' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
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
            {/* Featured Entertainment */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-pink-500"></div>
                <h2 className="desk-section-title text-xl text-foreground">In the Spotlight</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-pink-500/20 to-transparent"></div>
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
                          className="group entertainment-card bg-card rounded-xl overflow-hidden border border-border">
                      <div className="relative h-56">
                        <Image
                          src={article.imageUrl || '/api/placeholder/600/400'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="desk-badge bg-gradient-to-r from-pink-600 to-purple-600 text-white">★ SPOTLIGHT</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white group-hover:text-pink-200 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{article.author || 'Culture Desk'}</span>
                          <span>{formatPublishedTime(article.published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <AdSlot size="inline" className="my-6" />

            {/* Recent Articles */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-pink-500/50"></div>
                <h2 className="desk-section-title text-xl text-foreground">Latest Entertainment</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-pink-500/10 to-transparent"></div>
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
                      <article className="entertainment-card flex flex-col md:flex-row gap-4 bg-card rounded-xl p-4 border border-border">
                        <div className="md:w-1/3">
                          <div className="relative h-48 md:h-36 rounded-lg overflow-hidden">
                            <Image
                              src={article.imageUrl || '/api/placeholder/400/300'}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="md:flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="desk-badge bg-pink-500/10 text-pink-600 dark:text-pink-400">
                                {article.subCategory?.name || 'Entertainment'}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.readingTime || 5} min</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>{article.author || 'Culture Desk'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-600/20">
                  Load More Stories
                </button>
              </div>
            </section>
          </div>

          {/* ═══ Sidebar ═══ */}
          <aside className="lg:w-80 space-y-6">
            {/* Entertainment Categories */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <span className="text-sm">✦</span>
                  Browse
                </h3>
              </div>
              <div className="bg-card p-3 space-y-1">
                {entertainmentCategories.map((cat) => (
                  <Link key={cat.name}
                        href={`/category/entertainment?topic=${cat.name.toLowerCase().replace(' ', '-')}`}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r ${cat.color} transition-all`}>
                    <span className="text-xl">{cat.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-purple-950 to-pink-950">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Trending Now</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {trendingHashtags.map((item) => (
                  <div key={item.tag} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <span className="text-sm font-bold text-pink-600 dark:text-pink-400">{item.tag}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.posts}</span>
                    </div>
                    <span className="text-xs">
                      {item.trending === 'up' ? '📈' : item.trending === 'down' ? '📉' : '➡️'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box Office Full */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Box Office</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {boxOffice.map(movie => (
                  <div key={movie.rank} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-pink-500/30 tabular-nums w-8 text-center">
                        {movie.rank}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-foreground">{movie.title}</div>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>Weekend: <span className="text-pink-500 font-semibold">{movie.weekend}</span></span>
                          <span>Total: {movie.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AdSlot size="rectangle" />

            {/* Entertainment Weekly Newsletter */}
            <div className="rounded-xl overflow-hidden" style={{ background: theme.gradient }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
                  <span className="text-2xl">🎭</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">The Marquee</h3>
                <p className="text-white/50 text-sm mb-4">
                  Reviews, premieres & culture buzz — every weekend.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50 text-sm"
                  />
                  <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold text-sm hover:from-pink-500 hover:to-purple-500 transition-all">
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

export default EntertainmentCategoryPage;
