"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dbApi, Article, WebStory } from '../lib/database-real';
import { useCategories, Category } from '@/hooks/useCategories';
import { getContentUrl } from '@/lib/contentUtils';

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

// Format date for topbar
const formatFullDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Section Header Component
const SectionHeader = ({ title, viewAllLink, icon }: { title: string; viewAllLink?: string; icon?: string }) => (
  <div className="section-header">
    <h2 className="section-title flex items-center gap-2">
      {icon && <span>{icon}</span>}
      {title}
    </h2>
    {viewAllLink && (
      <Link href={viewAllLink} className="section-link">
        View All →
      </Link>
    )}
  </div>
);

// Featured Card Component
const FeaturedCard = ({ article, size = 'large' }: { article: Article; size?: 'large' | 'medium' | 'small' }) => {
  const heights = { large: 'h-[500px]', medium: 'h-[240px]', small: 'h-[200px]' };
  
  return (
    <Link href={getContentUrl(article)} className="block">
      <div className={`featured-card ${heights[size]} relative group`}>
        <Image
          src={article.imageUrl || '/api/placeholder/800/600'}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="overlay"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="category-badge category-badge-red mb-3 inline-block">
            {article.category?.name || 'News'}
          </span>
          <h3 className={`text-white font-bold mb-2 line-clamp-2 group-hover:text-red-300 transition-colors ${
            size === 'large' ? 'text-2xl md:text-3xl' : size === 'medium' ? 'text-lg' : 'text-base'
          }`}>
            {article.title}
          </h3>
          {size === 'large' && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{article.summary}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{formatPublishedTime(article.published_at)}</span>
            <span>•</span>
            <span>{article.readingTime || 3} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Small News Card Component
const SmallNewsCard = ({ article, index }: { article: Article; index?: number }) => (
  <Link href={getContentUrl(article)} className="block group">
    <div className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200">
      {index !== undefined && (
        <div className="trending-number">{index + 1}</div>
      )}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={article.imageUrl || '/api/placeholder/80/80'}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-primary uppercase">
          {article.category?.name || 'News'}
        </span>
        <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors mt-1">
          {article.title}
        </h4>
        <span className="text-xs text-muted-foreground mt-1 block">
          {formatPublishedTime(article.published_at)}
        </span>
      </div>
    </div>
  </Link>
);

// Medium News Card Component  
const MediumNewsCard = ({ article }: { article: Article }) => (
  <Link href={getContentUrl(article)} className="block group">
    <div className="news-card border border-border">
      <div className="relative h-48 img-hover-zoom">
        <Image
          src={article.imageUrl || '/api/placeholder/400/300'}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute top-3 left-3">
          <span className="category-badge category-badge-red">
            {article.category?.name || 'News'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {article.summary}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatPublishedTime(article.published_at)}</span>
          <span>•</span>
          <span>{article.readingTime || 3} min read</span>
        </div>
      </div>
    </div>
  </Link>
);

const HomePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [trendingNews, setTrendingNews] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [webStories, setWebStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { categories } = useCategories({ includeStats: false });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!(authToken && user));
  }, []);
  
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const loadData = async () => {
      try {
        setLoading(true);
        const [breaking, news, featured, trending, stories] = await Promise.all([
          dbApi.getBreakingNews(5),
          dbApi.getNews(12),
          dbApi.getFeaturedArticles(6),
          dbApi.getTrendingArticles(8),
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

    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => loadData());
    } else {
      setTimeout(loadData, 0);
    }

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <div className="topbar">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <span className="text-xs md:text-sm">
                {currentTime ? formatFullDate(currentTime) : ''}
              </span>
              <div className="hidden md:flex items-center gap-4 text-xs">
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <a href="#" className="social-link !w-7 !h-7 !bg-transparent hover:!bg-white/10">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="social-link !w-7 !h-7 !bg-transparent hover:!bg-white/10">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#" className="social-link !w-7 !h-7 !bg-transparent hover:!bg-white/10">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flash News Ticker */}
      {breakingNews.length > 0 && (
        <div className="flash-ticker py-2">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              <span className="badge flex items-center gap-2 flex-shrink-0">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                FLASH NEWS
              </span>
              <div className="flex-1 overflow-hidden">
                <div className="animate-scroll inline-flex items-center whitespace-nowrap">
                  {breakingNews.map((article, index) => (
                    <span key={article.id} className="inline-flex items-center">
                      {index > 0 && (
                        <span className="mx-4 text-white/60 text-lg">•</span>
                      )}
                      <Link 
                        href={getContentUrl(article)}
                        className="text-white hover:text-gray-200 text-sm font-medium transition-colors"
                      >
                        {article.title}
                      </Link>
                    </span>
                  ))}
                  {/* Separator before duplicate loop */}
                  <span className="mx-4 text-white/60 text-lg">•</span>
                  {/* Duplicate for seamless loop */}
                  {breakingNews.map((article, index) => (
                    <span key={`dup-${article.id}`} className="inline-flex items-center">
                      {index > 0 && (
                        <span className="mx-4 text-white/60 text-lg">•</span>
                      )}
                      <Link 
                        href={getContentUrl(article)}
                        className="text-white hover:text-gray-200 text-sm font-medium transition-colors"
                      >
                        {article.title}
                      </Link>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Hero Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Featured Story */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="h-[500px] bg-muted rounded-lg animate-pulse"></div>
              ) : trendingNews[0] ? (
                <FeaturedCard article={trendingNews[0]} size="large" />
              ) : null}
            </div>
            
            {/* Side Stories */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {loading ? (
                <>
                  <div className="h-[240px] bg-muted rounded-lg animate-pulse"></div>
                  <div className="h-[240px] bg-muted rounded-lg animate-pulse"></div>
                </>
              ) : (
                <>
                  {trendingNews[1] && <FeaturedCard article={trendingNews[1]} size="medium" />}
                  {trendingNews[2] && <FeaturedCard article={trendingNews[2]} size="medium" />}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            
            {/* Trending Section */}
            <section className="mb-12">
              <SectionHeader title="Trending Now" viewAllLink="/trending" icon="🔥" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-80 bg-muted rounded-lg animate-pulse"></div>
                  ))
                ) : (
                  trendingNews.slice(3, 7).map((article) => (
                    <MediumNewsCard key={article.id} article={article} />
                  ))
                )}
              </div>
            </section>

            {/* Latest News Section */}
            <section className="mb-12">
              <SectionHeader title="Latest Stories" viewAllLink="/news" icon="📰" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-72 bg-muted rounded-lg animate-pulse"></div>
                  ))
                ) : (
                  latestNews.slice(0, 6).map((article) => (
                    <MediumNewsCard key={article.id} article={article} />
                  ))
                )}
              </div>
            </section>

            {/* Featured Articles */}
            <section className="mb-12">
              <SectionHeader title="Editor's Pick" viewAllLink="/featured" icon="⭐" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                  <div className="h-96 bg-muted rounded-lg animate-pulse col-span-2"></div>
                ) : (
                  <>
                    {featuredArticles[0] && (
                      <div className="lg:row-span-2">
                        <FeaturedCard article={featuredArticles[0]} size="large" />
                      </div>
                    )}
                    <div className="space-y-4">
                      {featuredArticles.slice(1, 4).map((article) => (
                        <SmallNewsCard key={article.id} article={article} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Web Stories Section */}
            {webStories.length > 0 && (
              <section className="mb-12">
                <SectionHeader title="Web Stories" viewAllLink="/stories" icon="📱" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {webStories.map((story) => (
                    <Link key={story.id} href={`/stories/${story.slug}`} className="block group">
                      <div className="relative h-48 rounded-xl overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
                        <Image
                          src={story.coverImage || '/api/placeholder/200/300'}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="text-white text-xs font-bold line-clamp-2">{story.title}</h4>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                            {story.slidesCount || 5} slides
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            {/* Popular Posts Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">📈 Most Popular</h3>
              <div className="space-y-0">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 p-3">
                      <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  latestNews.slice(0, 5).map((article, idx) => (
                    <SmallNewsCard key={article.id} article={article} index={idx} />
                  ))
                )}
              </div>
            </div>

            {/* Categories Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">📂 Categories</h3>
              <div className="space-y-2">
                {categories.slice(0, 8).map((category: Category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <span>{category.icon || '📰'}</span>
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                    </span>
                    <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Widget */}
            <div className="newsletter-box">
              <h3 className="text-xl font-bold mb-2">📬 Stay Updated</h3>
              <p className="text-white/80 text-sm mb-4">
                Get the latest news delivered to your inbox daily.
              </p>
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe Now</button>
            </div>

            {/* Social Links Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">🔗 Follow Us</h3>
              <div className="social-links">
                <a href="#" className="social-link">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="social-link">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#" className="social-link">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="social-link">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </a>
              </div>
            </div>

            {/* Trending Tags Widget */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">🏷️ Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['Technology', 'Politics', 'Sports', 'Business', 'Health', 'Science', 'Entertainment', 'World'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${tag.toLowerCase()}`}
                    className="px-3 py-1.5 bg-muted text-foreground text-sm rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA Section */}
      <section className="hero-gradient text-white py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            NewsTRNT: The Road Not Taken
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Discover stories that matter, from perspectives that challenge the mainstream. Your journey to informed independence starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoggedIn ? (
              <>
                <Link href="/auth/signin" className="bg-primary hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                  Get Started
                </Link>
                <Link href="/about" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-gray-900 transition-colors">
                  Learn More
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="bg-primary hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                  Go to Dashboard
                </Link>
                <Link href="/news" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-gray-900 transition-colors">
                  Browse News
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
