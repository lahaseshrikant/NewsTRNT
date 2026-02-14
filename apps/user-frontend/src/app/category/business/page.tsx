"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/layout/Breadcrumb';
import MarketWidget from '@/components/MarketWidget';
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

const BusinessPage: React.FC = () => {
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
          dbApi.getArticlesByCategory('business', 30),
          dbApi.getCategoryBySlug('business')
        ]);
        if (Array.isArray(articles)) setAllArticles(articles);
        if (categoryData) setCategory(categoryData);
      } catch (error) {
        console.error('Error loading business data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'news', label: 'Market News' },
    { value: 'article', label: 'Analysis' },
    { value: 'analysis', label: 'Deep Dive' },
    { value: 'opinion', label: 'Commentary' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ];

  const marketTickerItems = [
    { symbol: 'S&P 500', value: '5,234.18', change: '+0.8%', up: true },
    { symbol: 'NASDAQ', value: '16,742.39', change: '+1.2%', up: true },
    { symbol: 'DOW', value: '39,512.84', change: '+0.4%', up: true },
    { symbol: 'BTC', value: '$67,245', change: '-2.1%', up: false },
    { symbol: 'EUR/USD', value: '1.0847', change: '+0.1%', up: true },
    { symbol: 'GOLD', value: '$2,342.50', change: '+0.6%', up: true },
    { symbol: 'OIL', value: '$78.43', change: '-0.9%', up: false },
    { symbol: 'NIFTY', value: '22,456.80', change: '+0.5%', up: true },
  ];

  const trendingTopics = [
    { name: "Interest Rates", count: 89 },
    { name: "Inflation", count: 67 },
    { name: "Corporate Earnings", count: 54 },
    { name: "ESG Investing", count: 43 },
    { name: "Supply Chain", count: 31 }
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

  const theme = getCategoryTheme('business');
  const articles = filteredArticles();
  const featuredArticles = articles.filter(a => a.isFeatured);
  const recentArticles = articles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE MARKET FLOOR — Data-Driven Hero ═══ */}
      <div className="desk-business-hero text-white">
        {/* Animated Market Ticker Bar */}
        <div className="business-ticker-bar border-b border-white/5">
          <div className="py-2 overflow-hidden">
            <div className="business-ticker-inner">
              {[...marketTickerItems, ...marketTickerItems].map((item, i) => (
                <div key={i} className="inline-flex items-center gap-2 px-6 text-sm">
                  <span className="font-semibold text-white/70">{item.symbol}</span>
                  <span className="text-white/90 tabular-nums">{item.value}</span>
                  <span className={`text-xs font-bold tabular-nums ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto pt-4 pb-6 relative z-10">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Business' }
          ]} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_li:last-child_span]:text-white/80" />

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="desk-kicker text-teal-400/80 mb-2">MARKET PULSE</div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-serif), serif' }}>
                Business
              </h1>
              <p className="text-white/50 text-lg max-w-xl">
                Markets, economy & corporate news — data-driven reporting for informed decisions.
              </p>
            </div>

            {/* Market Pulse Mini Dashboard */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {marketTickerItems.slice(0, 4).map((item) => (
                <div key={item.symbol} className="business-metric-card p-3">
                  <div className="text-[10px] text-white/40 font-semibold tracking-wider mb-1">{item.symbol}</div>
                  <div className="text-lg text-white font-bold tabular-nums">{item.value}</div>
                  <div className={`text-xs font-bold tabular-nums ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.change} {item.up ? '↑' : '↓'}
                  </div>
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
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
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
                      ? 'text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  style={contentType === type.value ? { background: theme.primary } : {}}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Sort:</span>
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    sortBy === option.value
                      ? 'text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  style={sortBy === option.value ? { background: theme.primary } : {}}
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
            {/* Featured: Market Moving News */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full" style={{ background: theme.accent }}></div>
                <h2 className="desk-section-title text-xl text-foreground">Market Moving News</h2>
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
              ) : featuredArticles.length === 0 ? (
                <div className="text-center text-muted-foreground border border-dashed border-border rounded-xl py-10">
                  No feature stories match the current filters.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredArticles.map(article => (
                    <Link key={article.id} href={getContentUrl(article)}
                          className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all desk-card-hover">
                      <div className="relative h-52">
                        <Image
                          src={article.imageUrl || '/api/placeholder/600/400'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="desk-badge text-white" style={{ background: theme.accent }}>
                            {article.isFeatured ? 'FEATURED' : 'MARKETS'}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white group-hover:text-teal-200 transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                            {article.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{article.author || 'Market Desk'}</span>
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
                <div className="w-1 h-6 rounded-full" style={{ background: `${theme.accent}60` }}></div>
                <h2 className="desk-section-title text-xl text-foreground">Latest Business News</h2>
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
              ) : recentArticles.length === 0 ? (
                <div className="text-center text-muted-foreground border border-dashed border-border rounded-xl py-10">
                  No articles available for the selected filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentArticles.map(article => (
                    <Link key={article.id} href={getContentUrl(article)} className="group block">
                      <article className="flex flex-col md:flex-row gap-4 bg-card rounded-xl border border-border p-4 hover:shadow-lg transition-all desk-card-hover" style={{ borderLeftColor: `${theme.accent}30` }}>
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
                              <span className="desk-badge" style={{ background: `${theme.accent}15`, color: theme.accent }}>
                                {article.subCategory?.name || 'Business'}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.readingTime || 5} min</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>{article.author || 'Market Desk'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg" style={{ background: theme.gradient }}>
                  Load More Articles
                </button>
              </div>
            </section>
          </div>

          {/* ═══ Sidebar ═══ */}
          <aside className="lg:w-80 space-y-6">
            {/* Market Data Widget */}
            <div className="mb-0">
              <MarketWidget showCommodities={true} showCurrencies={true} showCrypto={true} maxItems={8} />
            </div>

            {/* Trending in Business */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Trending in Business</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <span className="text-lg font-bold text-muted-foreground/40 tabular-nums">0{index + 1}</span>
                    <span className="text-sm font-semibold text-foreground flex-1">{topic.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{topic.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <AdSlot size="rectangle" />

            {/* Business Daily Newsletter */}
            <div className="rounded-xl overflow-hidden" style={{ background: theme.gradient }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                  Business Daily
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Market updates & business intel before the opening bell.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-sm"
                  />
                  <button className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:brightness-110 transition-all" style={{ background: theme.accent }}>
                    Subscribe Free
                  </button>
                </div>
              </div>
            </div>

            {/* Business Tools */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 tracking-wider uppercase">Business Tools</h3>
              <div className="space-y-2">
                {[
                  { name: 'Stock Screener', href: '/tools/stocks', icon: '📈' },
                  { name: 'Economic Calendar', href: '/tools/calendar', icon: '📅' },
                  { name: 'Company Profiles', href: '/companies', icon: '🏢' },
                  { name: 'Market Analysis', href: '/analysis', icon: '🔍' }
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

export default BusinessPage;
