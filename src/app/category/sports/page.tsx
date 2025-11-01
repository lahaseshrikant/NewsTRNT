"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';

const SportsPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'analysis' | 'opinion' | 'review' | 'interview'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

  // Sub-categories for Sports
  const subCategories = [
    { id: 'all', label: 'All Sports', count: 312 },
    { id: 'football', label: 'Football', count: 89 },
    { id: 'basketball', label: 'Basketball', count: 67 },
    { id: 'baseball', label: 'Baseball', count: 54 },
    { id: 'other', label: 'Other Sports', count: 102 }
  ];

  // Combine all articles
  const allArticles = [
    {
      id: 1,
      title: "NFL Playoffs: Chiefs Secure Top Seed with Dominant 31-17 Victory",
      summary: "Patrick Mahomes throws for 320 yards and 3 touchdowns as Kansas City clinches home-field advantage throughout the playoffs.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "2 hours ago",
      readTime: "4 min read",
      author: "Mike Johnson",
      tags: ["NFL", "Playoffs", "Chiefs"],
      contentType: 'news' as const,
      category: 'Football',
      subCategory: 'football',
      isFeatured: true,
      views: 12500
    },
    {
      id: 2,
      title: "NBA Trade Deadline Shakeup: All-Star Forward Joins Championship Contender",
      summary: "Blockbuster trade sends veteran player to title-contending team in exchange for young prospects and draft picks.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "4 hours ago",
      readTime: "6 min read",
      author: "Sarah Davis",
      tags: ["NBA", "Trade", "All-Star"],
      contentType: 'analysis' as const,
      category: 'Basketball',
      subCategory: 'basketball',
      isFeatured: true,
      views: 9800
    },
    {
      id: 3,
      title: "World Cup Qualifiers: USMNT Secures Crucial Win in South America",
      summary: "United States defeats Colombia 2-1 in thrilling match to boost World Cup qualification hopes.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "6 hours ago",
      readTime: "5 min read",
      author: "Carlos Martinez",
      tags: ["Soccer", "USMNT", "World Cup"],
      contentType: 'news' as const,
      category: 'Soccer',
      subCategory: 'other',
      views: 7200
    },
    {
      id: 4,
      title: "MLB Spring Training: Top Prospects Make Impressive Debuts",
      summary: "Rising stars showcase talent as teams prepare for upcoming season with promising young players.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "8 hours ago",
      readTime: "7 min read",
      author: "Tommy Rodriguez",
      tags: ["MLB", "Spring Training", "Prospects"],
      contentType: 'article' as const,
      category: 'Baseball',
      subCategory: 'baseball',
      views: 5600
    },
    {
      id: 5,
      title: "Tennis Grand Slam: Defending Champion Advances to Semifinals",
      summary: "Current title holder overcomes tough opponent in straight sets to reach final four.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "10 hours ago",
      readTime: "3 min read",
      author: "Elena Petrov",
      tags: ["Tennis", "Grand Slam", "Semifinals"],
      contentType: 'short' as const,
      category: 'Tennis',
      subCategory: 'other',
      views: 4100
    },
    {
      id: 6,
      title: "Olympic Training: Swimming Records Broken at National Championships",
      summary: "Multiple world records fall as athletes prepare for upcoming Olympic Games.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "12 hours ago",
      readTime: "5 min read",
      author: "David Kim",
      tags: ["Olympics", "Swimming", "Records"],
      contentType: 'news' as const,
      category: 'Olympics',
      subCategory: 'other',
      views: 6800
    }
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
      filtered = filtered.filter(article => article.subCategory === selectedSubCategory);
    }

    // Sort articles
    if (sortBy === 'trending') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => parseInt(b.readTime) - parseInt(a.readTime));
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
            <div className="hidden lg:block">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2">
                <div className="text-lg font-bold text-primary">312</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Articles</div>
              </div>
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
                <span className={`ml-1.5 text-[10px] ${selectedSubCategory === subCat.id ? 'opacity-80' : 'opacity-60'}`}>
                  {subCat.count}
                </span>
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
                        src={article.imageUrl}
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
                          {article.category}
                        </span>
                        <span className="text-muted-foreground text-sm">{article.readTime}</span>
                      </div>
                      
                      <Link href={`/article/${article.id}`}>
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
                          <span>By {article.author}</span>
                          <span>•</span>
                          <span>{article.publishedAt}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

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
                    <span className="text-muted-foreground text-sm">{topic.count}</span>
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
