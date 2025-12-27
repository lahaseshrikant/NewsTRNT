"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dbApi, Article, WebStory } from '../lib/database-real';
import { useCategories, Category } from '@/hooks/useCategories';
import { getCategoryBadgeStyle, findCategoryByName } from '@/lib/categoryUtils';
import { getContentUrl } from '@/lib/contentUtils';
import NewsCard from '@/components/NewsCard';

// Helper function to format published time
const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)} days ago`;
};

// Helper function to get category color using dynamic categories
const getCategoryColor = (categoryName: string, categories: Category[]) => {
  const category = findCategoryByName(categories, categoryName);
  return getCategoryBadgeStyle(category || categoryName);
};

const HomePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [trendingNews, setTrendingNews] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [webStories, setWebStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use the categories hook for dynamic category loading
  const { categories, loading: categoriesLoading } = useCategories({ includeStats: false });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!(authToken && user));
  }, []);
  
  // Initialize time and load data with improved performance
  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date());
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Optimized data loading with content type differentiation
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load different content types in parallel
        const [breaking, news, featured, trending, stories] = await Promise.all([
          dbApi.getBreakingNews(5),
          dbApi.getNews(8),
          dbApi.getFeaturedArticles(4),
          dbApi.getTrendingArticles(6),
          dbApi.getWebStories({ limit: 6 })
        ]);
        
        if (Array.isArray(breaking)) setBreakingNews(breaking);
        if (Array.isArray(news)) setLatestNews(news);
        if (Array.isArray(featured)) setFeaturedArticles(featured);
        if (Array.isArray(trending)) setTrendingNews(trending);
        if (Array.isArray(stories)) setWebStories(stories);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Use requestIdleCallback for non-critical loading if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadData());
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(loadData, 0);
    }

    return () => clearInterval(timer);
  }, []);

  // Mock user interests - in real app, this would come from user profile/preferences
  // Get user's top interests from dynamic categories (or use fallback)
  const userInterests = categories.slice(0, 4).map(cat => cat.name);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
  <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              NewsTRNT: The Road Not Taken
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover stories that matter, from perspectives that challenge the mainstream. Your journey to informed independence starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isLoggedIn ? (
                <>
                  <Link href="/auth/signin" className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white hover:-translate-y-1 transition-all duration-300 ease-out border border-blue-200 relative overflow-hidden group">
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </Link>
                  <Link href="/auth/signup" className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg bg-transparent hover:bg-white hover:text-blue-700 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden group">
                    <span className="relative z-10">Register</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </Link>
                </>
              ) : (
                <>
                  <button className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white hover:-translate-y-1 transition-all duration-300 ease-out border border-blue-200 relative overflow-hidden group">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </button>
                  <button className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg bg-transparent hover:bg-white hover:text-blue-700 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden group">
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                      </svg>
                      Watch Demo
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breaking News Ticker */}
      <section className="bg-red-600 text-white py-3 overflow-hidden">
  <div className="container mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="bg-white text-red-600 px-3 py-1 rounded-md text-sm font-bold animate-pulse">BREAKING</span>
              <span className="hidden md:inline text-sm">
                {currentTime?.toLocaleTimeString() || ''}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              {loading || breakingNews.length === 0 ? (
                <div className="text-sm animate-pulse">Loading breaking news...</div>
              ) : (
                <div className="animate-scroll whitespace-nowrap">
                  {breakingNews.map((article, index) => (
                    <Link 
                      key={article.id} 
                      href={getContentUrl(article)}
                      className="inline-block hover:underline"
                    >
                      <span className="font-semibold">{article.title}</span>
                      {index < breakingNews.length - 1 && <span className="mx-4">•</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

  <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Story */}
            <section className="mb-8">
              {loading ? (
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-700 animate-pulse" style={{ aspectRatio: '16/9' }}></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : trendingNews.length > 0 ? (
                <Link href={getContentUrl(trendingNews[0])}>
                  <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200 ease-in-out cursor-pointer group">
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', height: 'auto' }}>
                      <Image
                        src={trendingNews[0].imageUrl || '/api/placeholder/800/400'}
                        alt={trendingNews[0].title}
                        width={800}
                        height={450}
                        priority
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJiv/Z"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-out will-change-transform"
                        style={{ aspectRatio: '16/9' }}
                      />
                      {trendingNews[0].isFeatured && (
                        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                          FEATURED
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 group-hover:from-black/80 transition-all duration-200 ease-in-out">
                        <div className="text-white">
                          <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                            {trendingNews[0].category?.name || 'News'}
                          </span>
                          <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-2 group-hover:text-blue-200 transition-colors duration-200 ease-in-out">
                            {trendingNews[0].title}
                          </h2>
                          <p className="text-gray-200 mb-2">
                            {trendingNews[0].summary}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>{formatPublishedTime(trendingNews[0].published_at)}</span>
                            <span>•</span>
                            <span>{trendingNews[0].readingTime || 3} min read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-center" style={{ minHeight: '300px' }}>
                  <p className="text-muted-foreground">No featured articles available at the moment.</p>
                </div>
              )}
            </section>

            {/* Trending Stories */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
                <Link href="/trending" className="text-primary hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="bg-gray-200 dark:bg-gray-700 animate-pulse" style={{ aspectRatio: '4/3', height: '200px' }}></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : (Array.isArray(trendingNews) ? trendingNews.slice(1) : []).map((article: Article) => (
                  <Link key={article.id} href={getContentUrl(article)}>
                    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-pointer group">
                      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', height: '200px' }}>
                        <Image
                          src={article.imageUrl || '/api/placeholder/400/300'}
                          alt={article.title}
                          width={400}
                          height={300}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJiv/Z"
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200 ease-out will-change-transform"
                          style={{ aspectRatio: '4/3' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"></div>
                      </div>
                      <div className="p-4 group-hover:bg-muted/30 transition-colors duration-200 ease-out">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 transition-all duration-200 ease-out group-hover:scale-105 ${getCategoryColor(article.category?.name || 'News', categories)}`}>
                          {article.category?.name || 'News'}
                        </span>
                        <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-200 ease-out line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 group-hover:text-foreground transition-colors duration-200 ease-out line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200 ease-out">
                          <span>{formatPublishedTime(article.published_at)}</span>
                          <span>{article.readingTime || 3} min read</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Latest News Feed */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">📰 Latest News</h2>
                <Link href="/category/news" className="text-primary hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : (
                  latestNews.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))
                )}
              </div>
            </section>

            {/* Featured Articles */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">📚 Featured Articles</h2>
                <Link href="/category/article" className="text-primary hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {loading ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  featuredArticles.slice(0, 2).map((article) => (
                    <Link key={article.id} href={getContentUrl(article)}>
                      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200 ease-in-out cursor-pointer group">
                        <div className="md:flex">
                          <div className="md:w-1/3 relative overflow-hidden" style={{ minHeight: '200px' }}>
                            <Image
                              src={article.imageUrl || '/api/placeholder/400/300'}
                              alt={article.title}
                              width={400}
                              height={300}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="md:w-2/3 p-6">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(article.category?.name || 'Article', categories)}`}>
                                {article.category?.name || 'Article'}
                              </span>
                              <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded text-xs font-semibold">
                                FEATURED
                              </span>
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{article.author || 'Staff Writer'}</span>
                              <span>{article.readingTime || 5} min read</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* Web Stories Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">📱 Web Stories</h2>
                  <p className="text-sm text-muted-foreground mt-1">Immersive visual storytelling • Tap through the latest news</p>
                </div>
                <Link href="/web-stories" className="text-primary hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" style={{ minHeight: '220px' }}>
                {loading ? (
                  // Loading skeleton for web stories
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-32">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" style={{ aspectRatio: '9/16', height: '180px' }}></div>
                    </div>
                  ))
                ) : webStories.length > 0 ? (
                  webStories.map((story) => (
                  <Link 
                    key={story.id}
                    href={`/web-stories/${story.slug}`}
                    className="flex-shrink-0 w-32 group"
                  >
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200" style={{ aspectRatio: '9/16', height: '180px' }}>
                      <Image
                        src={story.coverImage || '/api/placeholder/200/300'}
                        alt={story.title}
                        width={128}
                        height={180}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJiv/Z"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200 will-change-transform"
                        sizes="128px"
                        style={{ aspectRatio: '9/16' }}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {story.isNew && (
                          <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                            NEW
                          </span>
                        )}
                        {story.isTrending && (
                          <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                            🔥
                          </span>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/70 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                          {Math.floor(story.duration / 60)}:{(story.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="mb-1">
                          <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-medium">
                            {story.category}
                          </span>
                        </div>
                        
                        <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                          {story.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <div className="flex items-center space-x-1">
                            <span>⏱️</span>
                            <span>{story.duration || 30}s</span>
                          </div>
                        </div>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 5v10l8-5-8-5z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
                ) : (
                  <div className="flex items-center justify-center w-full text-muted-foreground">
                    <p>No web stories available</p>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Reads Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Quick Reads</h2>
                  <p className="text-sm text-muted-foreground mt-1">Top stories from: {userInterests.join(', ')}</p>
                </div>
                <Link href="/shorts" className="text-primary hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300 ease-out">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-muted rounded-lg animate-pulse">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : latestNews.slice(0, 4).map((article, index) => (
                    <Link 
                      key={article.id} 
                      href={getContentUrl(article)} 
                      className="flex items-center space-x-4 p-4 hover:bg-muted/50 hover:shadow-sm hover:border-l-4 hover:border-l-primary rounded-lg transition-all duration-250 ease-out block group relative shadow-[-3px_3px_8px_rgba(75,85,99,0.4)] dark:shadow-[-2px_2px_6px_rgba(255,255,255,0.15)]"
                    >
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold group-hover:scale-105 group-hover:shadow-sm transition-all duration-250 ease-out">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(article.category?.name || 'News', categories)}`}>
                            {article.category?.name || 'News'}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-250 ease-out line-clamp-1">
                          {article.title}
                        </h4>
                        <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-250 ease-out line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-250 ease-out">
                          <span>{formatPublishedTime(article.published_at)}</span>
                          <span>•</span>
                          <span>{article.readingTime || 3} min read</span>
                          <span className="text-primary hover:text-blue-800 cursor-pointer transition-all duration-200 ease-out hover:scale-105 hover:font-medium">🔊 Listen</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-4">Categories</h3>
              <div className="bg-card border border-border rounded-lg shadow-sm p-4">
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))
                  ) : categories.map((category: Category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="flex items-center justify-between p-3 hover:bg-muted hover:shadow-sm hover:border-l-2 hover:border-l-primary rounded-lg transition-all duration-200 ease-in-out group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl transition-transform duration-200 ease-in-out group-hover:scale-110">{category.icon || '📰'}</span>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 ease-in-out">{category.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(category.name, categories)}`}>
                        {category.name.slice(0, 3).toUpperCase()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* Newsletter Signup */}
            <section className="mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Daily Brief</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Get personalized news delivered to your inbox every morning.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-lg text-foreground placeholder-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-blue-700 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      Subscribe
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </button>
                </form>
              </div>
            </section>

            {/* AI Assistant */}
            <section className="mb-8">
              <div className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200 ease-in-out group">
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 ease-in-out">AI Assistant</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Ask me anything about today's news!
                </p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-900 hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                    </svg>
                    Start Chat
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                </button>
              </div>
            </section>

            {/* Trending Topics */}
            <section>
              <h3 className="text-xl font-bold text-foreground mb-4">Trending Topics</h3>
              <div className="bg-card border border-border rounded-lg shadow-sm p-4">
                <div className="flex flex-wrap gap-2">
                  {['AI', 'Climate Change', 'Cryptocurrency', 'Elections', 'Space', 'Health'].map((topic) => (
                    <button
                      key={topic}
                      className="bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-300 ease-out relative overflow-hidden group border border-border hover:border-primary"
                    >
                      <span className="relative z-10 flex items-center gap-1">
                        <span className="group-hover:scale-110 transition-transform duration-300 ease-out">#</span>
                        {topic}
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-900 hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2C10.5523 2 11 2.44772 11 3V10H18C18.5523 10 19 10.4477 19 11C19 11.5523 18.5523 12 18 12H11V19C11 19.5523 10.5523 20 10 20C9.44772 20 9 19.5523 9 19V12H2C1.44772 12 1 11.5523 1 11C1 10.4477 1.44772 10 2 10H9V3C9 2.44772 9.44772 2 10 2Z" clipRule="evenodd"/>
                      </svg>
                      Follow All Topics
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
