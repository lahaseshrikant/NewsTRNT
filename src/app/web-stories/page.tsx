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
  
  // Use dynamic categories (active only)
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Set initial category from URL parameter
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Load web stories from database
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

  // Create categories list with special items and dynamic categories
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

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-border">
          <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">📱 Web Stories</h1>
              <p className="text-xl text-muted-foreground">Loading stories...</p>
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading stories</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Show notification if came from "See More" */}
      {categoryParam && categoryParam !== 'all' && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-200/20">
          <div className="container mx-auto py-2">
            <div className="text-center">
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                📰 Showing more {categoryParam} stories
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Web Stories' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              📱 Web Stories
            </h1>
            <p className="text-xl text-muted-foreground">
              Immersive visual storytelling • Swipe through the latest news
            </p>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        {/* Stats and Categories */}
        <div className="mb-8">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Web Stories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredStories.map((story, index) => (
            <Link
              key={story.id}
              href={`/web-stories/${story.slug}`}
              className="group relative aspect-[9/19.5] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Cover Image */}
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {story.isNew && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    NEW
                  </span>
                )}
                {story.isTrending && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🔥 TRENDING
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="absolute top-3 right-3">
                <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {formatDuration(story.duration)}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="mb-2">
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                    {story.category}
                  </span>
                </div>
                
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary-foreground transition-colors">
                  {story.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center space-x-1">
                    <span>⏱️</span>
                    <span>{story.duration || 30}s</span>
                  </div>
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
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No stories found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back later for new stories
            </p>
          </div>
        )}

        {/* Load More */}
        {filteredStories.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">Loading web stories...</div>
        </div>
      </div>
    }>
      <WebStoriesContent />
    </Suspense>
  );
};

export default WebStoriesPage;
