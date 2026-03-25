"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { dbApi, WebStory } from '@/lib/api-client';

const sanitizeImageUrl = (url?: string | null, fallback = '/api/placeholder/400/600'): string => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return fallback;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return trimmed;
    return fallback;
  } catch {
    return trimmed;
  }
};

const WebStoriesContent: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [webStories, setWebStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(14);
  const { categories: dynamicCategories } = useCategories();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const loadWebStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const stories = await dbApi.getWebStories({ limit: 50 });
        setWebStories(stories);
      } catch (err) {
        console.error('Error loading web stories:', err);
        setError('Failed to load web stories');
      } finally {
        setLoading(false);
      }
    };
    loadWebStories();
  }, []);

  const categories = [
    { id: 'all', label: 'All Stories', count: webStories.length },
    { id: 'trending', label: 'Trending', count: webStories.filter(s => s.isTrending).length },
    ...dynamicCategories.map(cat => ({
      id: cat.name,
      label: cat.name,
      count: webStories.filter(s => s.category === cat.name).length
    }))
  ];

  const filteredStories = selectedCategory === 'all' 
    ? webStories 
    : selectedCategory === 'trending'
    ? webStories.filter(story => story.isTrending)
    : webStories.filter(story => story.category === selectedCategory);

  useEffect(() => {
    setVisibleCount(14);
  }, [selectedCategory]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 10, filteredStories.length));
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredStories.length]);

  const visibleStories = filteredStories.slice(0, visibleCount);
  const featuredStory = visibleStories[0];
  const secondaryStories = visibleStories.slice(1);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden py-24 lg:py-32 border-b border-[rgb(var(--border))]/50 bg-gradient-to-b from-[rgb(var(--primary))]/5 to-background">
          <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              <span className="font-mono text-xs tracking-[0.3em] uppercase mb-6 px-4 py-1.5 border border-[rgb(var(--primary))]/20 bg-[rgb(var(--primary))]/5 text-[rgb(var(--primary))] rounded-full animate-pulse">
                Initializing Experience
              </span>
              <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-pulse text-muted">
                Web Stories
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl animate-pulse">
                Preparing immersive visual narratives...
              </p>
            </div>
          </div>
        </section>
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="aspect-[9/16] bg-[rgb(var(--muted))]/50 rounded-[2rem] animate-pulse border border-[rgb(var(--border))]/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-stone/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Error loading stories</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="hover-magnetic bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Category notification */}
      {categoryParam && categoryParam !== 'all' && (
        <div className="bg-gold/10 border-b border-border">
          <div className="container mx-auto py-2">
            <div className="text-center">
              <span className="text-sm text-vermillion dark:text-gold font-mono text-xs uppercase tracking-wider">
                Showing more {categoryParam} stories
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="relative overflow-hidden pt-6 pb-4 lg:pt-10 lg:pb-6 border-b border-[rgb(var(--border))]/50">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))]/10 via-background to-background" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[rgb(var(--primary))]/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border border-[rgb(var(--primary))]/30 rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] shadow-sm">
                Visual Journalism
              </span>
              <span className="h-px bg-[rgb(var(--border))] flex-1 min-w-[2rem]" />
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Web Stories
            </h1>
            
            <p className="text-base text-muted-foreground max-w-xl font-medium leading-snug">
              Swipe-ready, immersive narratives built for fast reading and rich visual context. Discover our most engaging stories.
            </p>
            
            <div className="mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground/80">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {webStories.length} Stories
              </span>
              <span className="w-1 h-1 bg-border rounded-full self-center" />
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AMP Optimized
              </span>
            </div>
          </div>

          <div className="mt-6 flex overflow-x-auto md:flex-wrap items-center gap-2 pb-2 md:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`snap-start whitespace-nowrap shrink-0 group relative px-4 py-2 font-mono text-[10px] tracking-wider uppercase transition-all duration-300 rounded-full overflow-hidden ${
                  selectedCategory === category.id
                    ? 'text-primary-foreground shadow-[0_0_15px_-5px_rgba(var(--primary),0.4)]'
                    : 'text-foreground/70 bg-secondary/50 hover:bg-secondary border border-[rgb(var(--border))] hover:text-foreground'
                }`}
              >
                {selectedCategory === category.id && (
                  <div className="absolute inset-0 bg-primary -z-10" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {category.label}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                     selectedCategory === category.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/80 text-muted-foreground'
                  }`}>
                    {category.count}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto py-8">
        {featuredStory && (
          <div className="group mb-7 relative grid overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl md:grid-cols-[1.1fr_minmax(0,1fr)]">
            <Link href={`/web-stories/${featuredStory.slug}/amp`} className="absolute inset-0 z-10">
              <span className="sr-only">Play {featuredStory.title}</span>
            </Link>
            
            <div className="relative aspect-[16/10] md:aspect-auto pointer-events-none overflow-hidden">
              <Image
                src={sanitizeImageUrl(
                  featuredStory.coverImage ||
                    (Array.isArray(featuredStory.slides)
                      ? featuredStory.slides[0]?.content?.image || featuredStory.slides[0]?.content?.video
                      : '') ||
                    '/api/placeholder/400/600'
                )}
                alt={featuredStory.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/15 to-transparent md:bg-gradient-to-t md:from-black/70 md:to-transparent" />
            </div>
            
            <div className="flex flex-col justify-between p-5 relative z-20 pointer-events-none">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Featured story</p>
                <h2 className="mt-3 font-serif text-2xl font-bold leading-tight md:text-3xl transition-colors group-hover:text-primary">{featuredStory.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">Continue into an immersive AMP experience with clear visual storytelling.</p>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDuration(featuredStory.duration)}</span>
                <div className="flex items-center gap-4 pointer-events-auto">
                  <Link 
                    href={`/web-stories/${featuredStory.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgb(var(--border))]/50 hover:bg-[rgb(var(--primary))] hover:text-white transition-colors text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm"
                    title="Read Article Version"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    Article Mode
                  </Link>
                  <span>{formatTimeAgo(featuredStory.publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Web Stories Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
          {secondaryStories.map((story) => (
            <Link
              key={story.id}
              href={`/web-stories/${story.slug}/amp`}
              className="group relative aspect-[10/16] overflow-hidden rounded-2xl border border-[rgb(var(--border))] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Image
                src={sanitizeImageUrl(
                  story.coverImage ||
                    (Array.isArray(story.slides)
                      ? story.slides[0]?.content?.image || story.slides[0]?.content?.video
                      : '') ||
                    '/api/placeholder/400/600'
                )}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {story.isNew && (
                  <span className="bg-green-600 text-white px-2 py-1 font-mono text-[9px] uppercase tracking-wider font-bold rounded-sm">
                    New
                  </span>
                )}
                {story.isTrending && (
                  <span className="bg-vermillion text-white px-2 py-1 font-mono text-[9px] uppercase tracking-wider font-bold rounded-sm">
                    Trending
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="absolute top-3 right-3">
                <span className="bg-black/70 text-white px-2 py-1 font-mono text-[10px] rounded-sm">
                  {formatDuration(story.duration)}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <div className="mb-2">
                  <span className="bg-black/70 text-white px-2 py-1 font-mono text-[9px] uppercase tracking-wider rounded-sm">
                    {story.category}
                  </span>
                </div>
                
                <h3 className="text-white font-serif font-bold text-sm mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                  {story.title}
                </h3>
                
                <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
                  <span>{story.duration || 30}s</span>
                  <span>{formatTimeAgo(story.publishedAt)}</span>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5-8-5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-stone/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">No stories found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back later for new stories
            </p>
          </div>
        )}

        {filteredStories.length > 0 && (
          <div className="mt-8 space-y-3">
            <div ref={loadMoreRef} className="h-8" />
            <div className="flex items-center justify-center">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 10, filteredStories.length))}
                disabled={visibleCount >= filteredStories.length}
                className="hover-magnetic rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-6 py-3 font-mono text-xs tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-50"
              >
                {visibleCount >= filteredStories.length ? 'You are all caught up' : 'Show More Stories'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WebStoriesPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse font-mono text-sm text-muted-foreground">Loading web stories...</div>
        </div>
      </div>
    }>
      <WebStoriesContent />
    </Suspense>
  );
};

export default WebStoriesPage;
