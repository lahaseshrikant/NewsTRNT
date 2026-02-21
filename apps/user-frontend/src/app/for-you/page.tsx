"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { dbApi, Article } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { getContentUrl } from '@/lib/contentUtils';
import { Category } from '@/types/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffMin = Math.floor((now.getTime() - published.getTime()) / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
};

// ─── Personalization Engine (client-side) ────────────────────────────────────

interface UserProfile {
  followedCategories: string[]; // slugs
  readHistory: string[];        // article IDs
  interests: Record<string, number>; // category slug → weight
}

function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return { followedCategories: [], readHistory: [], interests: {} };
  try {
    const stored = localStorage.getItem('newstrnt_profile');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { followedCategories: [], readHistory: [], interests: {} };
}

function saveProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('newstrnt_profile', JSON.stringify(profile));
}

function trackRead(articleId: string, categorySlug: string) {
  const profile = loadProfile();
  if (!profile.readHistory.includes(articleId)) {
    profile.readHistory = [articleId, ...profile.readHistory].slice(0, 200);
  }
  profile.interests[categorySlug] = (profile.interests[categorySlug] || 0) + 1;
  saveProfile(profile);
}

function rankArticles(articles: Article[], profile: UserProfile): Article[] {
  if (Object.keys(profile.interests).length === 0) return articles;
  
  const maxWeight = Math.max(1, ...Object.values(profile.interests));
  
  return [...articles].sort((a, b) => {
    const aCatSlug = a.category?.slug || '';
    const bCatSlug = b.category?.slug || '';
    const aWeight = (profile.interests[aCatSlug] || 0) / maxWeight;
    const bWeight = (profile.interests[bCatSlug] || 0) / maxWeight;
    
    // Boost already read → lower priority (avoid re-showing)
    const aRead = profile.readHistory.includes(a.id) ? -0.5 : 0;
    const bRead = profile.readHistory.includes(b.id) ? -0.5 : 0;
    
    // Recency advantage (published within last 6h gets a +0.3 boost)
    const sixHoursAgo = Date.now() - 6 * 60 * 60_000;
    const aRecent = new Date(a.published_at).getTime() > sixHoursAgo ? 0.3 : 0;
    const bRecent = new Date(b.published_at).getTime() > sixHoursAgo ? 0.3 : 0;
    
    const aScore = aWeight + aRead + aRecent;
    const bScore = bWeight + bRead + bRecent;
    return bScore - aScore;
  });
}

// ─── Components ──────────────────────────────────────────────────────────────

const ForYouHero = ({ article, onRead }: { article: Article; onRead: (id: string, cat: string) => void }) => (
  <Link
    href={getContentUrl(article)}
    onClick={() => onRead(article.id, article.category?.slug || '')}
    className="block group"
  >
    <div className="relative h-[420px] sm:h-[500px] overflow-hidden rounded-xl">
      <Image
        src={article.imageUrl || '/api/placeholder/1200/600'}
        alt={article.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
          Recommended
        </span>
        <span className="bg-black/50 backdrop-blur text-white text-[10px] font-medium px-3 py-1 rounded-full">
          {article.category?.name || 'News'}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
        <h1 className="font-serif text-2xl sm:text-4xl text-white font-bold mb-3 line-clamp-3 group-hover:text-white/90 leading-tight max-w-3xl">
          {article.title}
        </h1>
        {article.summary && (
          <p className="text-white/70 text-sm sm:text-base mb-3 line-clamp-2 max-w-2xl">
            {article.summary}
          </p>
        )}
        <div className="flex items-center gap-3 text-white/50 text-xs">
          <span>{formatTime(article.published_at)}</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>{article.readingTime || 3} min read</span>
        </div>
      </div>
    </div>
  </Link>
);

const ForYouCard = ({ article, onRead }: { article: Article; onRead: (id: string, cat: string) => void }) => (
  <Link
    href={getContentUrl(article)}
    onClick={() => onRead(article.id, article.category?.slug || '')}
    className="block group"
  >
    <article className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.imageUrl || '/api/placeholder/400/300'}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full">
            {article.category?.name || 'News'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {article.summary}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(article.published_at)}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span>{article.readingTime || 3} min</span>
        </div>
      </div>
    </article>
  </Link>
);

const CategoryPill = ({ 
  category, active, onClick 
}: { 
  category: { name: string; slug: string; color?: string }; 
  active: boolean; 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
      active
        ? 'bg-primary text-white shadow-md shadow-primary/20'
        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
    }`}
  >
    {category.name}
  </button>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ForYouPage() {
  const { user, isAuthenticated } = useAuth();
  const { categories } = useCategories({ includeStats: false });
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [feedMode, setFeedMode] = useState<'personalized' | 'trending' | 'latest'>('personalized');
  const profile = useRef<UserProfile>(loadProfile());

  const handleRead = useCallback((articleId: string, categorySlug: string) => {
    trackRead(articleId, categorySlug);
    profile.current = loadProfile();
  }, []);

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [trending, latest, featured] = await Promise.all([
          dbApi.getTrendingArticles(20),
          dbApi.getNews(30),
          dbApi.getFeaturedArticles(10),
        ]);

        // Merge and deduplicate
        const seen = new Set<string>();
        const merged: Article[] = [];
        for (const art of [...featured, ...trending, ...latest]) {
          if (!seen.has(art.id)) {
            seen.add(art.id);
            merged.push(art);
          }
        }

        setArticles(merged);
      } catch (err) {
        console.error('Error loading For You feed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Apply personalization + category filter
  useEffect(() => {
    let pool = [...articles];

    if (feedMode === 'personalized') {
      pool = rankArticles(pool, profile.current);
    } else if (feedMode === 'trending') {
      // Already sorted by trending score from API
    } else {
      pool.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }

    if (activeCategory !== 'all') {
      pool = pool.filter(a => a.category?.slug === activeCategory);
    }

    setFiltered(pool);
  }, [articles, activeCategory, feedMode]);

  const hero = filtered[0];
  const rest = filtered.slice(1);

  // Interest sections: group articles by most-interested categories
  const interestSlugs = Object.entries(profile.current.interests)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([slug]) => slug);

  const interestSections = interestSlugs
    .map(slug => {
      const cat = categories.find((c: Category) => c.slug === slug);
      const catArticles = articles.filter(a => a.category?.slug === slug).slice(0, 4);
      return cat && catArticles.length >= 2 ? { category: cat, articles: catArticles } : null;
    })
    .filter(Boolean) as { category: Category; articles: Article[] }[];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto py-8 sm:py-10">
          <Breadcrumb items={[{ label: 'For You' }]} className="mb-4" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-1">
                {isAuthenticated ? `For You, ${user?.fullName?.split(' ')[0] || user?.username || 'Reader'}` : 'For You'}
              </h1>
              <p className="text-muted-foreground">
                {Object.keys(profile.current.interests).length > 0
                  ? 'Personalized based on your reading habits'
                  : 'Start reading to personalize your feed'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-full p-1">
              {(['personalized', 'trending', 'latest'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setFeedMode(mode)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                    feedMode === mode
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode === 'personalized' ? 'For You' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container mx-auto py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <CategoryPill
              category={{ name: 'All', slug: 'all' }}
              active={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
            />
            {categories.slice(0, 10).map((cat: Category) => (
              <CategoryPill
                key={cat.slug}
                category={cat}
                active={activeCategory === cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="h-[420px] bg-muted animate-pulse rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">No stories found</h2>
            <p className="text-muted-foreground">Try selecting a different category or feed mode</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Hero */}
            {hero && <ForYouHero article={hero} onRead={handleRead} />}

            {/* Main feed grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.slice(0, 9).map((article) => (
                <ForYouCard key={article.id} article={article} onRead={handleRead} />
              ))}
            </div>

            {/* Interest-based sections */}
            {interestSections.length > 0 && (
              <div className="space-y-10 pt-4">
                <h2 className="font-serif text-2xl font-bold text-foreground border-b border-border pb-3">
                  Because You Read
                </h2>
                {interestSections.map(({ category, articles: catArticles }) => (
                  <div key={category.slug}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color || 'rgb(var(--primary))' }} />
                        {category.name}
                      </h3>
                      <Link href={`/category/${category.slug}`} className="text-xs text-primary font-semibold hover:underline">
                        View all &rarr;
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {catArticles.map((article) => (
                        <ForYouCard key={article.id} article={article} onRead={handleRead} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* More articles */}
            {rest.length > 9 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground border-b border-border pb-3 mb-6">
                  More Stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.slice(9).map((article) => (
                    <ForYouCard key={article.id} article={article} onRead={handleRead} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
