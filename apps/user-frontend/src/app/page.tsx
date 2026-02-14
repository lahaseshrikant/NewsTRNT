"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dbApi, Article, WebStory } from '../lib/api-client';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/api';
import { getContentUrl } from '@/lib/contentUtils';
import DivergenceMark from '@/components/ui/DivergenceMark';
import {
  TrendingIcon,
  BreakingIcon,
  EditorPickIcon,
  StoriesIcon,
  PopularIcon,
  CategoriesIcon,
  NewsletterIcon,
  TagsIcon,
  ArrowRightIcon,
} from '@/components/icons/EditorialIcons';
import AdSlot from '@/components/ui/AdSlot';

// Helper function to format published time
const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)}d ago`;
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

// Editorial Section Header Component
const SectionHeader = ({ title, viewAllLink, icon }: { title: string; viewAllLink?: string; icon?: React.ReactNode }) => (
  <div className="section-header">
    <h2 className="section-title flex items-center gap-2.5">
      {icon && <span className="text-primary">{icon}</span>}
      {title}
    </h2>
    {viewAllLink && (
      <Link href={viewAllLink} className="section-link inline-flex items-center gap-1 group">
        View All
        <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-1" />
      </Link>
    )}
  </div>
);

// Cinematic Hero Card
const HeroCard = ({ article }: { article: Article }) => (
  <Link href={getContentUrl(article)} className="block group">
    <div className="relative h-[520px] lg:h-[600px] overflow-hidden rounded-editorial">
      <Image
        src={article.imageUrl || '/api/placeholder/1200/800'}
        alt={article.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 66vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
        <span className="kicker">
          {article.category?.name || 'News'}
        </span>
        <h1 className="font-serif text-headline-1 text-white mb-4 line-clamp-3 group-hover:text-white/90 transition-colors leading-tight max-w-3xl">
          {article.title}
        </h1>
        {article.summary && (
          <p className="text-white/70 text-body-lg mb-4 line-clamp-2 max-w-2xl">
            {article.summary}
          </p>
        )}
        <div className="byline text-white/50">
          <span className="dateline">{formatPublishedTime(article.published_at)}</span>
          <span className="byline-separator bg-white/40" />
          <span>{article.readingTime || 3} min read</span>
        </div>
      </div>
    </div>
  </Link>
);

// Side Feature Card
const SideFeatureCard = ({ article }: { article: Article }) => (
  <Link href={getContentUrl(article)} className="block group">
    <div className="relative h-[288px] overflow-hidden rounded-editorial">
      <Image
        src={article.imageUrl || '/api/placeholder/600/400'}
        alt={article.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <span className="kicker text-white/70">
          {article.category?.name || 'News'}
        </span>
        <h3 className="font-serif text-lg text-white font-bold line-clamp-2 group-hover:text-white/90 transition-colors">
          {article.title}
        </h3>
        <span className="dateline text-white/40 mt-2 block">
          {formatPublishedTime(article.published_at)}
        </span>
      </div>
    </div>
  </Link>
);

// Editorial Card — clean, no-frills article card
const EditorialCard = ({ article }: { article: Article }) => (
  <Link href={getContentUrl(article)} className="block group">
    <article className="editorial-card">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.imageUrl || '/api/placeholder/400/300'}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
      <div className="p-5">
        <span className="kicker">{article.category?.name || 'News'}</span>
        <h3 className="font-serif text-headline-4 text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">
          {article.summary}
        </p>
        <div className="byline">
          <span className="dateline">{formatPublishedTime(article.published_at)}</span>
          <span className="byline-separator" />
          <span>{article.readingTime || 3} min read</span>
        </div>
      </div>
    </article>
  </Link>
);

// Compact list item
const CompactStory = ({ article, index }: { article: Article; index?: number }) => (
  <Link href={getContentUrl(article)} className="block group">
    <div className="flex gap-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors -mx-2 px-2 rounded-editorial">
      {index !== undefined && (
        <span className="font-mono text-2xl font-bold text-primary/30 w-8 flex-shrink-0 text-right pt-0.5">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-editorial overflow-hidden">
        <Image
          src={article.imageUrl || '/api/placeholder/64/64'}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="kicker text-micro">{article.category?.name || 'News'}</span>
        <h4 className="font-serif text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h4>
        <span className="dateline mt-1 block">{formatPublishedTime(article.published_at)}</span>
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
              <span className="dateline">
                {currentTime ? formatFullDate(currentTime) : ''}
              </span>
              <div className="hidden md:flex items-center gap-4 text-xs">
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
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
                BREAKING
              </span>
              <div className="flex-1 overflow-hidden">
                <div className="animate-scroll inline-flex items-center whitespace-nowrap">
                  {breakingNews.map((article, index) => (
                    <span key={article.id} className="inline-flex items-center">
                      {index > 0 && (
                        <span className="mx-4 text-white/40">|</span>
                      )}
                      <Link 
                        href={getContentUrl(article)}
                        className="text-white hover:text-white/80 text-sm font-medium transition-colors"
                      >
                        {article.title}
                      </Link>
                    </span>
                  ))}
                  <span className="mx-4 text-white/40">|</span>
                  {breakingNews.map((article, index) => (
                    <span key={`dup-${article.id}`} className="inline-flex items-center">
                      {index > 0 && (
                        <span className="mx-4 text-white/40">|</span>
                      )}
                      <Link 
                        href={getContentUrl(article)}
                        className="text-white hover:text-white/80 text-sm font-medium transition-colors"
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

      {/* ===== HERO SECTION ===== */}
      <section className="py-8 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Main Hero */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="skeleton-warm h-[520px] lg:h-[600px] rounded-editorial" />
              ) : trendingNews[0] ? (
                <HeroCard article={trendingNews[0]} />
              ) : null}
            </div>
            
            {/* Side Stories */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {loading ? (
                <>
                  <div className="skeleton-warm h-[288px] rounded-editorial" />
                  <div className="skeleton-warm h-[288px] rounded-editorial" />
                </>
              ) : (
                <>
                  {trendingNews[1] && <SideFeatureCard article={trendingNews[1]} />}
                  {trendingNews[2] && <SideFeatureCard article={trendingNews[2]} />}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Ad */}
      <div className="container mx-auto py-4">
        <AdSlot size="leaderboard" className="mx-auto" />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            
            {/* Trending Section */}
            <section className="mb-14">
              <SectionHeader title="Trending Now" viewAllLink="/trending" icon={<TrendingIcon size={18} />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-warm h-80 rounded-editorial" />
                  ))
                ) : (
                  trendingNews.slice(3, 7).map((article) => (
                    <EditorialCard key={article.id} article={article} />
                  ))
                )}
              </div>
            </section>

            {/* Editorial Divider */}
            <hr className="editorial-rule" />

            {/* In-Feed Ad */}
            <AdSlot size="inline" className="mb-8" />

            {/* Latest News Section */}
            <section className="mb-14">
              <SectionHeader title="Latest Stories" viewAllLink="/news" icon={<BreakingIcon size={18} />} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-warm h-72 rounded-editorial" />
                  ))
                ) : (
                  latestNews.slice(0, 6).map((article) => (
                    <EditorialCard key={article.id} article={article} />
                  ))
                )}
              </div>
            </section>

            {/* Editor's Pick */}
            <section className="mb-14">
              <SectionHeader title="Editor's Pick" viewAllLink="/featured" icon={<EditorPickIcon size={18} />} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                  <div className="skeleton-warm h-96 rounded-editorial col-span-2" />
                ) : (
                  <>
                    {featuredArticles[0] && (
                      <div className="lg:row-span-2">
                        <Link href={getContentUrl(featuredArticles[0])} className="block group">
                          <div className="relative h-full min-h-[400px] overflow-hidden rounded-editorial">
                            <Image
                              src={featuredArticles[0].imageUrl || '/api/placeholder/600/800'}
                              alt={featuredArticles[0].title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <span className="kicker text-white/70">{featuredArticles[0].category?.name || 'Featured'}</span>
                              <h3 className="font-serif text-headline-3 text-white font-bold line-clamp-3 group-hover:text-white/90 transition-colors">
                                {featuredArticles[0].title}
                              </h3>
                              <p className="text-white/60 text-body-sm mt-2 line-clamp-2">
                                {featuredArticles[0].summary}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                    <div className="space-y-1">
                      {featuredArticles.slice(1, 5).map((article) => (
                        <CompactStory key={article.id} article={article} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Web Stories Section */}
            {webStories.length > 0 && (
              <section className="mb-14">
                <SectionHeader title="Visual Stories" viewAllLink="/stories" icon={<StoriesIcon size={18} />} />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {webStories.map((story) => (
                    <Link key={story.id} href={`/stories/${story.slug}`} className="block group">
                      <div className="relative h-52 rounded-editorial overflow-hidden border border-border group-hover:border-primary/30 transition-colors">
                        <Image
                          src={story.coverImage || '/api/placeholder/200/300'}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="text-white text-xs font-bold line-clamp-2">{story.title}</h4>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="bg-foreground/80 text-background text-micro px-2 py-0.5 rounded-editorial font-mono">
                            {story.slidesCount || 5}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <aside className="lg:col-span-4">
            {/* Sidebar Ad */}
            <div className="mb-6">
              <AdSlot size="rectangle" />
            </div>

            {/* Popular Posts */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title flex items-center gap-2">
                <PopularIcon size={16} className="text-primary" />
                Most Popular
              </h3>
              <div className="space-y-0">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 py-3">
                      <div className="skeleton-warm w-8 h-8 rounded-editorial" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton-warm h-4 w-full" />
                        <div className="skeleton-warm h-3 w-2/3" />
                      </div>
                    </div>
                  ))
                ) : (
                  latestNews.slice(0, 5).map((article, idx) => (
                    <CompactStory key={article.id} article={article} index={idx} />
                  ))
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title flex items-center gap-2">
                <CategoriesIcon size={16} className="text-primary" />
                Categories
              </h3>
              <div className="space-y-1">
                {categories.slice(0, 8).map((category: Category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="flex items-center justify-between py-2 px-2 rounded-editorial hover:bg-muted transition-colors group"
                  >
                    <span className="text-body-sm font-medium group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                    <ArrowRightIcon size={14} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="newsletter-box">
              <NewsletterIcon size={24} className="mx-auto mb-3 text-white/80" />
              <h3 className="font-serif text-xl font-bold mb-2">The Daily Dispatch</h3>
              <p className="text-white/70 text-body-sm mb-4">
                The stories that matter, curated daily. No noise.
              </p>
              <input type="email" placeholder="your@email.com" />
              <button type="submit">Subscribe</button>
            </div>

            {/* Trending Tags */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title flex items-center gap-2">
                <TagsIcon size={16} className="text-primary" />
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Technology', 'Politics', 'Sports', 'Business', 'Health', 'Science', 'Entertainment', 'World'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${tag.toLowerCase()}`}
                    className="px-3 py-1.5 border border-border text-foreground text-body-sm rounded-editorial hover:border-primary hover:text-primary transition-all"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ===== CTA SECTION ===== */}
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto text-center max-w-3xl">
          <DivergenceMark size={48} className="mx-auto mb-6 text-white/40" />
          <h2 className="font-serif text-headline-2 mb-4">
            The Road Not Taken
          </h2>
          <p className="text-white/60 text-body-lg mb-10 max-w-xl mx-auto">
            Stories that challenge, perspectives that illuminate, journalism that matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoggedIn ? (
              <>
                <Link href="/auth/signin" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-semibold transition-colors rounded-editorial inline-flex items-center gap-2">
                  Start Reading
                  <ArrowRightIcon size={16} />
                </Link>
                <Link href="/about" className="border border-white/30 text-white px-8 py-3 font-semibold hover:bg-white/10 transition-colors rounded-editorial">
                  Our Story
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-semibold transition-colors rounded-editorial inline-flex items-center gap-2">
                  Dashboard
                  <ArrowRightIcon size={16} />
                </Link>
                <Link href="/news" className="border border-white/30 text-white px-8 py-3 font-semibold hover:bg-white/10 transition-colors rounded-editorial">
                  Browse Stories
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
