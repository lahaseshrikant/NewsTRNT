"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories } from '@/hooks/useCategories';

interface WebStory {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  slides: WebStorySlide[];
  publishedAt: string;
  duration: number; // in seconds
  author: string;
  views: number;
  isNew: boolean;
  isTrending: boolean;
}

interface WebStorySlide {
  id: string;
  type: 'image' | 'video' | 'text';
  background: string;
  content: {
    headline?: string;
    text?: string;
    image?: string;
    video?: string;
    animation?: string;
  };
  duration: number;
}

const WebStoriesPage: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use dynamic categories (active only)
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Set initial category from URL parameter
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Mock Web Stories data
  const webStories: WebStory[] = [
    {
      id: 'story-1',
      title: 'Climate Summit 2024: Key Highlights',
      category: 'Environment',
      coverImage: '/api/placeholder/400/600',
      publishedAt: '2024-01-21T10:30:00Z',
      duration: 45,
      author: 'Environmental Team',
      views: 12540,
      isNew: true,
      isTrending: true,
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          content: {
            headline: 'Climate Summit 2024',
            text: 'World leaders gather for crucial climate discussions',
            image: '/api/placeholder/400/600'
          },
          duration: 5
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          content: {
            headline: '195 Countries Participate',
            text: 'Largest climate summit in history brings together world leaders'
          },
          duration: 4
        },
        {
          id: 'slide-3',
          type: 'image',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          content: {
            headline: '$100B Climate Fund',
            text: 'Historic funding commitment for developing nations',
            image: '/api/placeholder/400/600'
          },
          duration: 5
        }
      ]
    },
    {
      id: 'story-2',
      title: 'AI Revolution in Healthcare',
      category: 'Technology',
      coverImage: '/api/placeholder/400/600',
      publishedAt: '2024-01-21T08:15:00Z',
      duration: 60,
      author: 'Tech News',
      views: 8920,
      isNew: false,
      isTrending: true,
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          content: {
            headline: 'AI Transforms Healthcare',
            text: 'Revolutionary breakthroughs in medical diagnosis',
            image: '/api/placeholder/400/600'
          },
          duration: 6
        },
        {
          id: 'slide-2',
          type: 'text',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          content: {
            headline: '95% Accuracy Rate',
            text: 'AI models now outperform human doctors in early detection'
          },
          duration: 5
        }
      ]
    },
    {
      id: 'story-3',
      title: 'Space Mission Success',
      category: 'Science',
      coverImage: '/api/placeholder/400/600',
      publishedAt: '2024-01-20T16:45:00Z',
      duration: 50,
      author: 'Space Desk',
      views: 15670,
      isNew: false,
      isTrending: false,
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          content: {
            headline: 'Mars Mission Update',
            text: 'Historic rover landing sends first images',
            image: '/api/placeholder/400/600'
          },
          duration: 6
        }
      ]
    },
    {
      id: 'story-4',
      title: 'Economic Outlook 2024',
      category: 'Business',
      coverImage: '/api/placeholder/400/600',
      publishedAt: '2024-01-20T12:30:00Z',
      duration: 40,
      author: 'Business Team',
      views: 7430,
      isNew: false,
      isTrending: false,
      slides: [
        {
          id: 'slide-1',
          type: 'text',
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          content: {
            headline: 'Market Outlook 2024',
            text: 'Expert predictions for the global economy'
          },
          duration: 5
        }
      ]
    },
    {
      id: 'story-5',
      title: 'Sports Championship Finals',
      category: 'Sports',
      coverImage: '/api/placeholder/400/600',
      publishedAt: '2024-01-19T20:00:00Z',
      duration: 35,
      author: 'Sports Desk',
      views: 22100,
      isNew: false,
      isTrending: true,
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          content: {
            headline: 'Championship Victory',
            text: 'Thrilling final match decides the winner',
            image: '/api/placeholder/400/600'
          },
          duration: 4
        }
      ]
    },
    {
      id: 'story-6',
      title: 'Celebrity Red Carpet Event',
      category: 'Entertainment',
      coverImage: '/api/placeholder/400/600',
      publishedAt: '2024-01-19T18:30:00Z',
      duration: 30,
      author: 'Entertainment',
      views: 18900,
      isNew: false,
      isTrending: false,
      slides: [
        {
          id: 'slide-1',
          type: 'image',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          content: {
            headline: 'Red Carpet Glamour',
            text: 'Star-studded premiere showcases fashion',
            image: '/api/placeholder/400/600'
          },
          duration: 5
        }
      ]
    }
  ];

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
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">📱</div>
              <div className="text-lg font-bold text-foreground">{webStories.length}</div>
              <div className="text-sm text-muted-foreground">Stories</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-lg font-bold text-foreground">{webStories.filter(s => s.isTrending).length}</div>
              <div className="text-sm text-muted-foreground">Trending</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">👀</div>
              <div className="text-lg font-bold text-foreground">{formatViews(webStories.reduce((sum, s) => sum + s.views, 0))}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">🆕</div>
              <div className="text-lg font-bold text-foreground">{webStories.filter(s => s.isNew).length}</div>
              <div className="text-sm text-muted-foreground">New Today</div>
            </div>
          </div>

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
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Web Stories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredStories.map((story, index) => (
            <Link
              key={story.id}
              href={`/web-stories/${story.id}`}
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
                    <span>👁️</span>
                    <span>{formatViews(story.views)}</span>
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

export default WebStoriesPage;
