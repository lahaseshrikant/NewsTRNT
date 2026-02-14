"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

const SportsPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'analysis' | 'opinion' | 'review' | 'interview'>('all');
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
          dbApi.getArticlesByCategory('sports', 30),
          dbApi.getCategoryBySlug('sports')
        ]);
        if (Array.isArray(articles)) setAllArticles(articles);
        if (categoryData) setCategory(categoryData);
      } catch (error) {
        console.error('Error loading sports data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Features' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' },
  ];

  const liveScores = [
    { home: "Lakers", away: "Warriors", homeScore: 108, awayScore: 112, status: "Final", sport: "NBA", live: false },
    { home: "Cowboys", away: "Eagles", homeScore: 21, awayScore: 14, status: "3rd Qtr", sport: "NFL", live: true },
    { home: "Yankees", away: "Red Sox", homeScore: 7, awayScore: 4, status: "7th Inn", sport: "MLB", live: true },
    { home: "Chelsea", away: "Arsenal", homeScore: 2, awayScore: 1, status: "85'", sport: "EPL", live: true }
  ];

  const trendingTopics = [
    { name: "NFL Playoffs", count: 156 },
    { name: "NBA Trade Deadline", count: 89 },
    { name: "March Madness", count: 67 },
    { name: "World Cup", count: 45 },
    { name: "Olympics", count: 34 }
  ];

  const upcomingGames = [
    { teams: "Chiefs vs Bills", time: "Today 8:00 PM", channel: "CBS" },
    { teams: "Lakers vs Celtics", time: "Tomorrow 7:30 PM", channel: "ESPN" },
    { teams: "Yankees vs Mets", time: "Wed 7:05 PM", channel: "FOX" },
    { teams: "Man City vs Liverpool", time: "Sat 12:30 PM", channel: "NBC" }
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

  const theme = getCategoryTheme('sports');
  const articles = filteredArticles();
  const featuredArticles = articles.filter(a => a.isFeatured);
  const recentArticles = articles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE ARENA — Bold Kinetic Hero ═══ */}
      <div className="desk-sports-hero text-white">
        <div className="container mx-auto pt-4 pb-6 relative z-10">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Sports' }
          ]} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_li:last-child_span]:text-white/80" />

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="desk-kicker text-orange-400/80 mb-2 flex items-center gap-2">
                <span className="text-sm">⚡</span>
                THE ARENA
              </div>
              <h1 className="text-4xl lg:text-6xl font-black mb-3 tracking-tighter uppercase" style={{ fontFamily: 'var(--font-serif), serif' }}>
                Sports
              </h1>
              <p className="text-white/50 text-lg max-w-xl">
                Live scores, game-day coverage & deep analysis from every arena.
              </p>
            </div>

            {/* Live Score Ticker Mini */}
            <div className="hidden lg:block">
              <div className="sports-score-ticker rounded-xl overflow-hidden border border-orange-500/20" style={{ width: 260 }}>
                <div className="bg-orange-500/10 backdrop-blur-sm px-4 py-2 flex items-center gap-2 border-b border-orange-500/10">
                  <span className="sports-live-badge"></span>
                  <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">Live Scores</span>
                </div>
                <div className="divide-y divide-white/5">
                  {liveScores.slice(0, 3).map((game, i) => (
                    <div key={i} className="px-4 py-2.5 bg-black/30 backdrop-blur-sm hover:bg-black/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-white/40 font-bold">{game.sport}</span>
                        <span className={`text-[10px] font-bold ${game.live ? 'text-orange-400' : 'text-white/40'}`}>
                          {game.live && '● '}{game.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">{game.away}</span>
                        <span className="font-bold text-white tabular-nums">{game.awayScore}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">{game.home}</span>
                        <span className="font-bold text-white tabular-nums">{game.homeScore}</span>
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
              {subCategoryFilters.map(subCat => (
                <button
                  key={subCat.id}
                  onClick={() => setSelectedSubCategory(subCat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSubCategory === subCat.id
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
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
                      ? 'bg-orange-600 text-white shadow' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
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
                      ? 'bg-orange-600 text-white shadow' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
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
            {/* Featured Sports Stories */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-orange-500"></div>
                <h2 className="desk-section-title text-xl text-foreground">Game Changers</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 to-transparent"></div>
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
                          className="group sports-card bg-card rounded-xl overflow-hidden border border-border desk-card-hover">
                      <div className="relative h-52">
                        <Image
                          src={article.imageUrl || '/api/placeholder/600/400'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="desk-badge bg-orange-600 text-white font-black uppercase">⚡ Featured</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-black text-white group-hover:text-orange-200 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold">{article.author || 'Sports Desk'}</span>
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
                <div className="w-6 h-px bg-orange-500/50"></div>
                <h2 className="desk-section-title text-xl text-foreground">From the Arena</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-500/10 to-transparent"></div>
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
                      <article className="sports-card flex flex-col md:flex-row gap-4 bg-card rounded-xl p-4 border border-border desk-card-hover">
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
                              <span className="desk-badge bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black">
                                {article.subCategory?.name || 'Sports'}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.readingTime || 5} min</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span className="font-semibold">{article.author || 'Sports Desk'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button className="px-8 py-3 rounded-xl font-black uppercase tracking-wide text-white bg-orange-600 hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20">
                  Load More
                </button>
              </div>
            </section>
          </div>

          {/* ═══ Sidebar ═══ */}
          <aside className="lg:w-80 space-y-6">
            {/* Live Scores (Full) */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                  <span className="sports-live-badge"></span>
                  Live Scores
                </h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {liveScores.map((game, i) => (
                  <div key={i} className="sports-score-card p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{game.sport}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        game.live ? 'bg-orange-500/10 text-orange-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        {game.live && '● '}{game.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground font-semibold">{game.away}</span>
                        <span className="text-sm font-black text-foreground tabular-nums">{game.awayScore}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground font-semibold">{game.home}</span>
                        <span className="text-sm font-black text-foreground tabular-nums">{game.homeScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Games */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-amber-950 to-orange-900">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Upcoming</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {upcomingGames.map((game, i) => (
                  <div key={i} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="font-semibold text-sm text-foreground">{game.teams}</div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{game.time}</span>
                      <span className="font-mono">{game.channel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending in Sports */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Trending</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <span className="text-lg font-black text-muted-foreground/30 tabular-nums">0{index + 1}</span>
                    <span className="text-sm font-semibold text-foreground flex-1">{topic.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{topic.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <AdSlot size="rectangle" />

            {/* Sports Digest Newsletter */}
            <div className="rounded-xl overflow-hidden" style={{ background: theme.gradient }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg font-black text-white mb-2 uppercase">Sports Digest</h3>
                <p className="text-white/50 text-sm mb-4">
                  Scores, highlights & hot takes — every morning at 7 AM.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-sm"
                  />
                  <button className="w-full py-2.5 rounded-lg bg-orange-600 text-white font-black text-sm uppercase hover:bg-orange-500 transition-colors">
                    Subscribe Free
                  </button>
                </div>
              </div>
            </div>

            {/* Sports Hub Links */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-orange-950/80 to-amber-950/80">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Sports Hub</h3>
              </div>
              <div className="bg-card p-4 space-y-2">
                {[
                  { name: 'Schedule & Scores', icon: '📅' },
                  { name: 'Player Stats', icon: '📊' },
                  { name: 'Team Rankings', icon: '🏅' },
                  { name: 'Fantasy Sports', icon: '🎮' }
                ].map(link => (
                  <Link key={link.name} href={`/sports/${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-3 p-2 rounded-lg text-sm text-foreground hover:bg-muted/30 transition-colors">
                    <span>{link.icon}</span>
                    <span className="font-semibold">{link.name}</span>
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

export default SportsPage;
