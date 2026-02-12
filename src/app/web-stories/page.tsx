"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories } from '@/hooks/useCategories';
import { dbApi, WebStory } from '@/lib/database-real';

const WebStoriesContent: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [webStories, setWebStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { categories: dynamicCategories } = useCategories();

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
      <div className="min-h-screen bg-background">
        <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
          <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">Visual</p>
              <h1 className="font-serif text-4xl font-bold text-ivory mb-4">Web Stories</h1>
              <p className="text-xl text-ivory/60">Loading stories...</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[9/19.5] bg-muted rounded-2xl animate-pulse" />
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
        <div className="bg-gold/10 border-b border-ash/20">
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
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Web Stories' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">Visual</p>
            <h1 className="font-serif text-4xl font-bold text-ivory mb-4">
              Web Stories
            </h1>
            <p className="text-xl text-ivory/60">
              Immersive visual storytelling
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                selectedCategory === category.id
                  ? 'bg-ink dark:bg-ivory text-ivory dark:text-ink'
                  : 'border border-ash dark:border-ash/20 text-stone hover:text-ink dark:hover:text-ivory'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Web Stories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredStories.map((story) => (
            <Link
              key={story.id}
              href={`/web-stories/${story.slug}`}
              className="group relative aspect-[9/19.5] bg-gradient-to-br from-ivory to-ash dark:from-ink dark:to-[#1a1917] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.03]"
            >
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
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
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="mb-2">
                  <span className="bg-ink text-ivory px-2 py-1 font-mono text-[9px] uppercase tracking-wider">
                    {story.category}
                  </span>
                </div>
                
                <h3 className="text-white font-serif font-bold text-sm mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                  {story.title}
                </h3>
                
                <div className="flex items-center justify-between text-[10px] text-ash font-mono">
                  <span>{story.duration || 30}s</span>
                  <span>{formatTimeAgo(story.publishedAt)}</span>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

        {/* Load More */}
        {filteredStories.length > 0 && (
          <div className="text-center mt-8">
            <button className="hover-magnetic bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase">
              Load More Stories
            </button>
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
          <div className="animate-pulse font-mono text-sm text-stone">Loading web stories...</div>
        </div>
      </div>
    }>
      <WebStoriesContent />
    </Suspense>
  );
};

export default WebStoriesPage;
