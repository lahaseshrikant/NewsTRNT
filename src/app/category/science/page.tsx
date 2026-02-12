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

const ScienceCategoryPage: React.FC = () => {
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
          dbApi.getArticlesByCategory('science', 30),
          dbApi.getCategoryBySlug('science')
        ]);
        if (Array.isArray(articles)) setAllArticles(articles);
        if (categoryData) setCategory(categoryData);
      } catch (error) {
        console.error('Error loading science data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Research' },
    { value: 'analysis', label: 'Deep Dive' },
    { value: 'opinion', label: 'Opinion' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ];

  const scienceFields = [
    { name: 'Physics', icon: '⚛️', articles: 89, color: 'from-blue-500/20 to-cyan-500/20' },
    { name: 'Biology', icon: '🧬', articles: 67, color: 'from-green-500/20 to-emerald-500/20' },
    { name: 'Chemistry', icon: '🧪', articles: 54, color: 'from-purple-500/20 to-violet-500/20' },
    { name: 'Space Science', icon: '🚀', articles: 43, color: 'from-indigo-500/20 to-blue-500/20' },
    { name: 'Earth Science', icon: '🌍', articles: 38, color: 'from-amber-500/20 to-orange-500/20' },
  ];

  const recentDiscoveries = [
    { title: 'New Exoplanet Detected', desc: 'Earth-like planet in habitable zone of nearby star', time: '2h ago', severity: 'breakthrough' },
    { title: 'Cancer Immunotherapy Advance', desc: 'New treatment shows 90% success rate in trials', time: '6h ago', severity: 'breakthrough' },
    { title: 'Quantum Error Correction', desc: 'Room temperature quantum computing moves closer', time: '1d ago', severity: 'notable' },
  ];

  const institutions = [
    { name: 'MIT', badge: '🏆', papers: 45 },
    { name: 'CERN', badge: '⚛️', papers: 38 },
    { name: 'NASA', badge: '🚀', papers: 34 },
    { name: 'Harvard', badge: '🎓', papers: 29 },
    { name: 'Stanford', badge: '🔬', papers: 26 },
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

  const theme = getCategoryTheme('science');
  const articles = filteredArticles();
  const featuredArticles = articles.filter(a => a.isFeatured);
  const recentArticles = articles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE OBSERVATORY — Cosmic Hero ═══ */}
      <div className="desk-science-hero text-white relative overflow-hidden">
        {/* Twinkling stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="science-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
          />
        ))}

        <div className="container mx-auto pt-4 pb-6 relative z-10">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Science' }
          ]} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_li:last-child_span]:text-white/80" />

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="desk-kicker text-cyan-400/80 mb-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                THE OBSERVATORY
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-serif), serif' }}>
                Science
              </h1>
              <p className="text-white/50 text-lg max-w-xl">
                Breakthroughs, discoveries & the frontiers of human knowledge.
              </p>

              {/* Discovery of the Week Card */}
              <div className="mt-6 science-discovery-card rounded-xl p-[2px] max-w-lg">
                <div className="bg-slate-900/90 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Discovery of the Week</span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Gravitational Wave Echo Detected</h3>
                  <p className="text-white/40 text-sm">First evidence of quantum gravity effects observed in LIGO data, opening a new chapter in fundamental physics.</p>
                </div>
              </div>
            </div>

            {/* Orbit Visualization */}
            <div className="hidden lg:block relative" style={{ width: 180, height: 180 }}>
              <div className="absolute inset-0 rounded-full border border-cyan-500/10"></div>
              <div className="absolute rounded-full border border-cyan-500/8" style={{ inset: '15%' }}></div>
              <div className="absolute rounded-full border border-cyan-500/6" style={{ inset: '30%' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/30"></div>
              </div>
              {/* Orbiting dots */}
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400/60 rounded-full"
                  style={{
                    animation: `orbit ${8 + i * 4}s linear infinite`,
                    left: 'calc(50% - 4px)',
                    top: `${15 * i}%`,
                    transformOrigin: `4px ${90 - 15 * i}px`,
                  }}
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
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
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
                      ? 'text-white shadow' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  style={contentType === type.value ? { background: theme.primary } : undefined}
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
                      ? 'text-white shadow' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  style={sortBy === option.value ? { background: theme.primary } : undefined}
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
            {/* Featured Discoveries */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px" style={{ background: theme.accent }}></div>
                <h2 className="desk-section-title text-xl text-foreground">Breakthrough Research</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
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
                          className="group bg-card rounded-xl overflow-hidden border border-border desk-card-hover relative">
                      <div className="relative h-52">
                        <Image
                          src={article.imageUrl || '/api/placeholder/600/400'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="desk-badge text-white" style={{ background: theme.primary }}>BREAKTHROUGH</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {article.sourceName && (
                              <span className="science-field-badge">🏛️ {article.sourceName}</span>
                            )}
                            <span>{article.author || 'Research Desk'}</span>
                          </div>
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
                <div className="w-6 h-px bg-cyan-500/40"></div>
                <h2 className="desk-section-title text-xl text-foreground">Latest from the Observatory</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
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
                      <article className="flex flex-col md:flex-row gap-4 bg-card rounded-xl p-4 border border-border desk-card-hover"
                        style={{ borderLeftWidth: '3px', borderLeftColor: `${theme.accent}30` }}>
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
                              <span className="science-field-badge text-xs">
                                {article.subCategory?.name || 'Science'}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.readingTime || 5} min</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>{article.author || 'Research Desk'}</span>
                            <span>{formatPublishedTime(article.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button className="px-8 py-3 rounded-xl font-semibold text-white transition-all" style={{ background: theme.primary }}>
                  Load More Research
                </button>
              </div>
            </section>
          </div>

          {/* ═══ Sidebar ═══ */}
          <aside className="lg:w-80 space-y-6">
            {/* Science Fields */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Science Fields
                </h3>
              </div>
              <div className="bg-card p-3 space-y-1">
                {scienceFields.map((field) => (
                  <Link key={field.name}
                        href={`/category/science?field=${field.name.toLowerCase().replace(' ', '-')}`}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r ${field.color} transition-all`}>
                    <span className="text-xl">{field.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">{field.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{field.articles}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Discoveries */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-cyan-950 to-blue-950">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Recent Discoveries</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {recentDiscoveries.map((discovery, i) => (
                  <div key={i} className="p-4"
                       style={{ borderLeftWidth: '3px', borderLeftColor: discovery.severity === 'breakthrough' ? theme.accent : theme.primary }}>
                    <div className="font-semibold text-sm text-foreground mb-1">{discovery.title}</div>
                    <p className="text-xs text-muted-foreground mb-1">{discovery.desc}</p>
                    <span className="text-[10px] text-muted-foreground/60">{discovery.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Institutions */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4" style={{ background: theme.gradient }}>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">Top Institutions</h3>
              </div>
              <div className="bg-card divide-y divide-border">
                {institutions.map((inst) => (
                  <div key={inst.name} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <span className="text-lg">{inst.badge}</span>
                    <span className="flex-1 text-sm font-semibold text-foreground">{inst.name}</span>
                    <span className="text-xs text-muted-foreground">{inst.papers} papers</span>
                  </div>
                ))}
              </div>
            </div>

            <AdSlot size="rectangle" />

            {/* Science Weekly Newsletter */}
            <div className="rounded-xl overflow-hidden" style={{ background: theme.gradient }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                  <span className="text-2xl">🔭</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Science Weekly</h3>
                <p className="text-white/50 text-sm mb-4">
                  Breakthroughs & discoveries delivered to your inbox every Thursday.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-sm"
                  />
                  <button className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:brightness-110 transition-all"
                          style={{ background: theme.primary }}>
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

export default ScienceCategoryPage;
