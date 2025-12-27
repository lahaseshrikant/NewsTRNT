"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { dbApi, Article } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';

const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)} days ago`;
};

const SportsPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'analysis' | 'opinion' | 'review' | 'interview'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  
  // Database articles state
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const articles = await dbApi.getArticlesByCategory('sports', 30);
        if (Array.isArray(articles)) {
          setAllArticles(articles);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  // Sub-categories for Sports
  const subCategories = [
    { id: 'all', label: 'All Sports', count: allArticles.length },
    { id: 'football', label: 'Football', count: allArticles.filter(a => a.category?.slug === 'football').length || 0 },
    { id: 'basketball', label: 'Basketball', count: allArticles.filter(a => a.category?.slug === 'basketball').length || 0 },
    { id: 'baseball', label: 'Baseball', count: allArticles.filter(a => a.category?.slug === 'baseball').length || 0 },
    { id: 'other', label: 'Other Sports', count: allArticles.filter(a => a.category?.slug === 'other').length || 0 }
  ];

  // Filtering logic
  const filteredArticles = () => {
    let filtered = [...allArticles];

    // Filter by content type
    if (contentType !== 'all') {
      filtered = filtered.filter(article => article.contentType === contentType);
    }

    // Filter by sub-category
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(article => article.category?.slug === selectedSubCategory);
    }

    // Sort articles
    if (sortBy === 'trending') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.readingTime || 0) - (a.readingTime || 0));
    }
    // 'latest' is default order

    return filtered;
  };

  const liveScores = [
    { home: "Lakers", away: "Warriors", homeScore: 108, awayScore: 112, status: "Final", sport: "NBA" },
    { home: "Cowboys", away: "Eagles", homeScore: 21, awayScore: 14, status: "3rd Quarter", sport: "NFL" },
    { home: "Yankees", away: "Red Sox", homeScore: 7, awayScore: 4, status: "7th Inning", sport: "MLB" },
    { home: "Chelsea", away: "Arsenal", homeScore: 2, awayScore: 1, status: "85'", sport: "Soccer" }
  ];

  const trendingTopics = [
    { name: "NFL Playoffs", count: 156 },
    { name: "NBA Trade Deadline", count: 89 },
    { name: "March Madness", count: 67 },
    { name: "World Cup", count: 45 },
    { name: "Olympics", count: 34 }
  ];

  const upcomingGames = [
    { teams: "Chiefs vs Bills", time: "Today 8:00 PM", channel: "CBS" },
    { teams: "Lakers vs Celtics", time: "Tomorrow 7:30 PM", channel: "ESPN" },
    { teams: "Yankees vs Mets", time: "Wed 7:05 PM", channel: "FOX" },
    { teams: "Man City vs Liverpool", time: "Sat 12:30 PM", channel: "NBC" }
  ];

  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Articles' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Content Type Tabs */}
      <div className="bg-gradient-to-r from-orange-600/5 to-red-600/5 border-b border-border/50">
  <div className="container mx-auto py-4">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Sports' }
          ]} className="mb-3" />
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Sports
              </h1>
              <p className="text-sm text-muted-foreground">
                Live scores & comprehensive coverage
              </p>
            </div>
          </div>

          {/* Content type tabs moved below header into compact filter bar */}

          {/* Sub-category Tabs in Header */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {subCategories.map(subCat => (
              <button
                key={subCat.id}
                onClick={() => setSelectedSubCategory(subCat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubCategory === subCat.id
                    ? 'bg-orange-400 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5'
                }`}
              >
                {subCat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

  <div className="container mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Compact Filter Bar: content type + sort */}
            <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 p-2 mb-5">
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
                {contentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setContentType(type.value as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                      contentType === type.value
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}

                <span className="hidden sm:inline-block mx-2 h-4 w-px bg-border/60" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Sort</span>

                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                      sortBy === option.value
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Articles */}
            <section className="space-y-6">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/3 h-48 sm:h-full bg-muted"></div>
                        <div className="p-6 flex-1 sm:w-2/3 space-y-3">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-6 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-full"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
              <>
              {filteredArticles().map((article, index) => (
                <article
                  key={article.id}
                  className={`bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow ${
                    index === 0 && sortBy === 'latest' ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className={`flex ${index === 0 && sortBy === 'latest' ? 'flex-col lg:flex-row' : 'flex-col sm:flex-row'} gap-4`}>
                    <div className={`relative ${index === 0 && sortBy === 'latest' ? 'lg:w-2/3' : 'sm:w-1/3'}`}>
                      <Image
                        src={article.imageUrl || '/api/placeholder/600/400'}
                        alt={article.title}
                        width={600}
                        height={300}
                        className={`w-full object-cover ${
                          index === 0 && sortBy === 'latest' ? 'h-64 lg:h-full' : 'h-48 sm:h-full'
                        }`}
                      />
                      {article.isFeatured && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          ⚡ FEATURED
                        </span>
                      )}
                    </div>
                    
                    <div className={`p-6 flex-1 ${index === 0 && sortBy === 'latest' ? 'lg:w-1/3' : 'sm:w-2/3'}`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 px-2 py-1 rounded text-xs font-medium">
                          {article.category?.name || 'Sports'}
                        </span>
                        <span className="text-muted-foreground text-sm">{article.readingTime || 5} min read</span>
                      </div>
                      
                      <Link href={getContentUrl(article)}>
                        <h2 className={`font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors ${
                          index === 0 && sortBy === 'latest' ? 'text-2xl' : 'text-lg'
                        }`}>
                          {article.title}
                        </h2>
                      </Link>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <span>By {article.author || 'Staff Writer'}</span>
                          <span>•</span>
                          <span>{formatPublishedTime(article.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              </>
              )}

              {/* Load More */}
              <div className="text-center mt-8">
                <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all font-medium">
                  Load More Articles
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Live Scores */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Live Scores</h3>
              <div className="space-y-4">
                {liveScores.map((game: any, index: number) => (
                  <div key={index} className="p-3 rounded border border-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">{game.sport}</span>
                      <span className="text-xs text-primary">{game.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-foreground">{game.away}</div>
                      <div className="font-bold text-foreground">{game.awayScore}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-foreground">{game.home}</div>
                      <div className="font-bold text-foreground">{game.homeScore}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Games */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Upcoming Games</h3>
              <div className="space-y-3">
                {upcomingGames.map((game, index) => (
                  <div key={index} className="p-2 rounded hover:bg-muted/50 transition-colors">
                    <div className="font-medium text-foreground text-sm">{game.teams}</div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{game.time}</span>
                      <span>{game.channel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Trending in Sports</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-foreground">{topic.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Sports Digest</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get daily sports highlights and scores delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Sports Hub</h3>
              <div className="space-y-2">
                {[
                  { name: 'Schedule & Scores', href: '/sports/scores' },
                  { name: 'Player Stats', href: '/sports/stats' },
                  { name: 'Team Rankings', href: '/sports/rankings' },
                  { name: 'Fantasy Sports', href: '/sports/fantasy' }
                ].map(link => (
                  <Link key={link.name} href={link.href}
                        className="block text-primary hover:text-primary/80 text-sm">
                    {link.name} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsPage;
