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

const TechnologyPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [articles, categories] = await Promise.all([
          dbApi.getArticlesByCategory('technology', 30),
          dbApi.getCategories()
        ]);
        if (Array.isArray(articles)) setAllArticles(articles);
        const techCategory = categories.find(cat => cat.slug === 'technology');
        if (techCategory) setCategory(techCategory as Category);
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
    { value: 'article', label: 'Features' },
    { value: 'analysis', label: 'Deep Dive' },
    { value: 'opinion', label: 'Opinion' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' },
  ];

  const techRadar = [
    { name: 'Artificial Intelligence', status: 'Adopt', ring: 1 },
    { name: 'Quantum Computing', status: 'Trial', ring: 2 },
    { name: 'Web3 / Blockchain', status: 'Assess', ring: 3 },
    { name: 'Edge Computing', status: 'Adopt', ring: 1 },
    { name: 'AR / VR', status: 'Trial', ring: 2 },
  ];

  const techStocks = [
    { symbol: "AAPL", price: "$192.45", change: "+2.3%", up: true },
    { symbol: "GOOGL", price: "$142.80", change: "+1.8%", up: true },
    { symbol: "MSFT", price: "$378.90", change: "+0.9%", up: true },
    { symbol: "TSLA", price: "$248.50", change: "-1.2%", up: false },
    { symbol: "NVDA", price: "$876.30", change: "+3.4%", up: true },
  ];

  const trendingTopics = [
    { name: "Artificial Intelligence", count: 156 },
    { name: "Quantum Computing", count: 89 },
    { name: "Cryptocurrency", count: 67 },
    { name: "5G Technology", count: 45 },
    { name: "Cloud Computing", count: 34 }
  ];

  const subCategoryFilters = useSubCategoryFilters(allArticles, category?.subCategories, 'ALL');

  const filteredArticles = () => {
    let filtered = [...allArticles];
    if (contentType !== 'all') filtered = filtered.filter(a => a.contentType === contentType);
    if (selectedSubCategory !== 'all') filtered = filtered.filter(a => a.subCategory?.slug === selectedSubCategory);
    if (sortBy === 'trending') filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sortBy === 'popular') filtered.sort((a, b) => (b.readingTime || 0) - (a.readingTime || 0));
    return filtered;
  };

  const theme = getCategoryTheme('technology');
  const articles = filteredArticles();
  const featuredArticles = articles.filter(a => a.isFeatured);
  const recentArticles = articles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE LAB — Futuristic Hero ═══ */}
      <div className="desk-tech-hero text-white">
        <div className="container mx-auto pt-4 pb-6 relative z-10">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Technology' }
          ]} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_li:last-child_span]:text-white/80" />

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="desk-kicker text-indigo-400/80 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                THE LAB
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-serif), serif' }}>
                Technology
              </h1>
              <p className="text-white/50 text-lg max-w-xl">
                Innovation frontlines — AI, quantum, cybersecurity & the future being built today.
              </p>

              {/* Terminal-style latest */}
              <div className="mt-6 tech-terminal max-w-xl">
                <div className="tech-terminal-header">
                  <span className="tech-terminal-dot bg-red-500"></span>
                  <span className="tech-terminal-dot bg-yellow-500"></span>
                  <span className="tech-terminal-dot bg-green-500"></span>
                  <span className="ml-2 text-[10px] text-white/30 font-mono">lab://tech-feed</span>
                </div>
                <div className="p-3 text-sm font-mono">
                  <span className="text-indigo-400">$</span>
                  <span className="text-white/60 ml-2">latest --category=technology</span>
                  <div className="mt-1 text-white/40 text-xs">
                    → {articles.length} articles loaded • {featuredArticles.length} featured
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Radar Mini */}
            <div className="hidden lg:block relative" style={{ width: 200, height: 200 }}>
              <div className="tech-radar-ring absolute inset-0"></div>
              <div className="tech-radar-ring absolute" style={{ inset: '20%' }}></div>
              <div className="tech-radar-ring absolute" style={{ inset: '40%' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] text-indigo-400/50 font-bold tracking-widest">RADAR</span>
              </div>
              {techRadar.map((tech, i) => {
                const angle = (i / techRadar.length) * Math.PI * 2 - Math.PI / 2;
                const radius = tech.ring * 25 + 20;
                return (
                  <div
                    key={tech.name}
                    className="absolute w-2 h-2 bg-indigo-400 rounded-full"
                    style={{
                      left: `${50 + Math.cos(angle) * radius / 100 * 50}%`,
                      top: `${50 + Math.sin(angle) * radius / 100 * 50}%`,
                      opacity: 1 - tech.ring * 0.2,
                    }}
                    title={`${tech.name} — ${tech.status}`}
                  />
                );
              })}
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
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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
                      ? 'bg-indigo-600 text-white shadow'
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
                      ? 'bg-indigo-600 text-white shadow'
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
            {/* Featured Tech News */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-indigo-500"></div>
                <h2 className="desk-section-title text-xl text-foreground">Featured from The Lab</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
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
                          className="group tech-card bg-card rounded-xl overflow-hidden desk-card-hover">
                      <div className="relative h-52">
                        <Image
                          src={article.imageUrl || '/api/placeholder/600/400'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="desk-badge bg-indigo-600 text-white">FROM THE LAB</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-mono">{article.author || 'Tech Desk'}</span>
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
                <div className="w-6 h-px bg-indigo-500/50"></div>
                <h2 className="desk-section-title text-xl text-foreground">Latest Technology News</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/10 to-transparent"></div>
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
                      <article className="flex flex-col md:flex-row gap-4 tech-card bg-card rounded-xl p-4 desk-card-hover">
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
                              <span className="desk-badge bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                {article.subCategory?.name || 'Tech'}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.readingTime || 5} min</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span className="font-mono">{article.author || 'Tech Desk'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button className="px-8 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all">
                  Load More Articles
                </button>
              </div>
            </section>
          </div>

          {/* ═══ Sidebar ═══ */}
          <aside className="lg:w-80 space-y-6">
            {/* Tech Radar */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  Tech Radar
                </h3>
              </div>
              <div className="bg-card p-4 space-y-2">
                {techRadar.map((tech) => (
                  <div key={tech.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-sm text-foreground">{tech.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tech.status === 'Adopt' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      tech.status === 'Trial' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                      'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tech.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stocks */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono">Tech Stocks</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {techStocks.map(stock => (
                  <div key={stock.symbol} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <span className="font-mono font-bold text-sm text-foreground">{stock.symbol}</span>
                    <div className="text-right">
                      <div className="text-sm text-foreground tabular-nums">{stock.price}</div>
                      <div className={`text-xs font-bold tabular-nums ${stock.up ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending in Tech */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-950 to-indigo-900">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Trending in Tech</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <span className="text-lg font-bold text-muted-foreground/40 font-mono">0{index + 1}</span>
                    <span className="text-sm font-semibold text-foreground flex-1">{topic.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{topic.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <AdSlot size="rectangle" />

            {/* Tech Weekly Newsletter */}
            <div className="rounded-xl overflow-hidden" style={{ background: theme.gradient }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Tech Weekly
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Curated innovations & insights from the lab, every Friday.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 text-sm font-mono"
                  />
                  <button className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors">
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

export default TechnologyPage;
