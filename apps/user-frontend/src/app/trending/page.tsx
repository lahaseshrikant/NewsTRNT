"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { dbApi, Article } from '@/lib/api-client';
import { getContentUrl } from '@/lib/contentUtils';

interface TrendingStory {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  categorySlug: string;
  publishedAt: string;
  readTime: string;
  author: string;
  trendingScore: number;
  socialShares: number;
  comments: number;
  contentType?: string;
}

const TrendingPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [trendingStories, setTrendingStories] = useState<TrendingStory[]>([]);
  const [loading, setLoading] = useState(true);

  const formatRelativeTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60_000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return `${Math.floor(diffMin / 1440)}d ago`;
  };

  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      try {
        const articles = await dbApi.getTrendingArticles(15);
        const formatted: TrendingStory[] = articles.map((article: Article, index: number) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          summary: article.summary || article.excerpt || '',
          imageUrl: article.imageUrl || '/api/placeholder/600/400',
          category: article.category?.name || 'Uncategorized',
          categorySlug: article.category?.slug || 'news',
          publishedAt: formatRelativeTime(article.published_at),
          readTime: `${article.readingTime || 3} min read`,
          author: article.author || 'NewsTRNT Staff',
          trendingScore: Math.min(99, Math.max(50, 98 - (index * 4))),
          socialShares: article.shares || article.views || 0,
          comments: article.commentCount || 0,
          contentType: article.contentType,
        }));
        setTrendingStories(formatted);
      } catch (error) {
        console.error('Error loading trending:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTrending();
  }, [timeRange]);

  const timeRanges = [
    { id: 'today', label: 'Today', icon: '🔥' },
    { id: 'week', label: 'This Week', icon: '📈' },
    { id: 'month', label: 'This Month', icon: '📊' },
  ];

  // Category stats for sidebar
  const categoryMap = new Map<string, number>();
  trendingStories.forEach(s => categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + 1));
  const topCategories = Array.from(categoryMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const topThree = trendingStories.slice(0, 3);
  const rest = trendingStories.slice(3);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-primary/8 via-primary/3 to-background border-b border-border">
        <div className="container mx-auto py-8 sm:py-10">
          <Breadcrumb items={[{ label: 'Trending' }]} className="mb-4" />
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🔥</span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                  Trending Now
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                The most talked-about stories right now
              </p>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-full p-1">
              {timeRanges.map(range => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    timeRange === range.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{range.icon}</span>
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`rounded-xl bg-muted animate-pulse ${i === 1 ? 'md:col-span-2 md:row-span-2 h-[450px]' : 'h-[215px]'}`} />
              ))}
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Top 3 Hero Grid */}
              {topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  {/* #1 — Large Feature */}
                  <Link href={getContentUrl(topThree[0])} className="md:col-span-2 md:row-span-2 group block relative rounded-xl overflow-hidden">
                    <div className="relative h-[300px] md:h-[450px]">
                      <Image
                        src={topThree[0].imageUrl}
                        alt={topThree[0].title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 66vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          🥇 #1 Trending
                        </span>
                        <span className="bg-black/50 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">
                          {topThree[0].category}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <h2 className="font-serif text-2xl md:text-3xl text-white font-bold mb-3 line-clamp-3 group-hover:text-white/90 leading-snug">
                          {topThree[0].title}
                        </h2>
                        <p className="text-white/60 text-sm line-clamp-2 mb-3 max-w-xl">{topThree[0].summary}</p>
                        <div className="flex items-center gap-3 text-white/50 text-xs">
                          <span>{topThree[0].publishedAt}</span>
                          <span className="w-1 h-1 rounded-full bg-white/30" />
                          <span>{topThree[0].readTime}</span>
                          <span className="w-1 h-1 rounded-full bg-white/30" />
                          <span className="text-emerald-400 font-semibold">{topThree[0].trendingScore}% trending</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* #2 */}
                  {topThree[1] && (
                    <Link href={getContentUrl(topThree[1])} className="group block relative rounded-xl overflow-hidden">
                      <div className="relative h-[215px]">
                        <Image
                          src={topThree[1].imageUrl}
                          alt={topThree[1].title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          🥈 #2
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">{topThree[1].category}</span>
                          <h3 className="font-serif text-base text-white font-bold line-clamp-2 group-hover:text-white/90 mt-1">
                            {topThree[1].title}
                          </h3>
                          <span className="text-white/40 text-xs mt-1 block">{topThree[1].publishedAt}</span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* #3 */}
                  {topThree[2] && (
                    <Link href={getContentUrl(topThree[2])} className="group block relative rounded-xl overflow-hidden">
                      <div className="relative h-[215px]">
                        <Image
                          src={topThree[2].imageUrl}
                          alt={topThree[2].title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <span className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          🥉 #3
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">{topThree[2].category}</span>
                          <h3 className="font-serif text-base text-white font-bold line-clamp-2 group-hover:text-white/90 mt-1">
                            {topThree[2].title}
                          </h3>
                          <span className="text-white/40 text-xs mt-1 block">{topThree[2].publishedAt}</span>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              )}

              {/* Ranked List */}
              <div className="space-y-3">
                {rest.map((story, idx) => (
                  <Link
                    key={story.id}
                    href={getContentUrl(story)}
                    className="group flex items-stretch bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                  >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center bg-muted/50 border-r border-border">
                      <span className="text-2xl font-bold font-mono text-primary/60">
                        {String(idx + 4).padStart(2, '0')}
                      </span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <span className="text-emerald-500 text-[10px]">▲</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{story.trendingScore}%</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-primary">{story.category}</span>
                        <span className="text-muted-foreground text-[10px]">{story.publishedAt}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                        {story.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 hidden sm:block">{story.summary}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{story.author}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span>{story.readTime}</span>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="hidden sm:block flex-shrink-0 w-36 relative">
                      <Image
                        src={story.imageUrl}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="144px"
                      />
                    </div>
                  </Link>
                ))}
              </div>

              {rest.length > 0 && (
                <div className="text-center mt-10">
                  <button className="px-8 py-3 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    Load More Trending Stories
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0 space-y-6">
              {/* Trending Categories */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span>📊</span> Trending Categories
                </h3>
                <div className="space-y-2">
                  {topCategories.map(([name, count], idx) => (
                    <Link
                      key={name}
                      href={`/search?q=${encodeURIComponent(name)}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-5">{idx + 1}.</span>
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{name}</span>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        {count} {count === 1 ? 'story' : 'stories'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* How We Rank */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-xl p-6">
                <h3 className="font-serif text-lg font-bold text-foreground mb-4">How We Rank</h3>
                <div className="space-y-4">
                  {[
                    { num: '01', text: 'Real-time engagement tracking across all stories' },
                    { num: '02', text: 'AI-powered relevance scoring and topic clustering' },
                    { num: '03', text: 'Continuously updated throughout the day' },
                  ].map(item => (
                    <div key={item.num} className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold text-primary mt-0.5">{item.num}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-serif text-lg font-bold text-foreground mb-4">Explore</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'For You', href: '/for-you', icon: '✨' },
                    { label: 'Latest', href: '/news', icon: '📰' },
                    { label: 'Shorts', href: '/shorts', icon: '⚡' },
                    { label: 'Opinion', href: '/opinion', icon: '💬' },
                  ].map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium text-foreground hover:text-primary transition-all"
                    >
                      <span>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
