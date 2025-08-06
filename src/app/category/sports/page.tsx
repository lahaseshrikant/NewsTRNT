"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';

const SportsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Sports', count: 312 },
    { id: 'football', label: 'Football', count: 89 },
    { id: 'basketball', label: 'Basketball', count: 67 },
    { id: 'baseball', label: 'Baseball', count: 54 },
    { id: 'soccer', label: 'Soccer', count: 45 },
    { id: 'other', label: 'Other Sports', count: 57 }
  ];

  const featuredArticles = [
    {
      id: 1,
      title: "NFL Playoffs: Chiefs Secure Top Seed with Dominant 31-17 Victory",
      summary: "Patrick Mahomes throws for 320 yards and 3 touchdowns as Kansas City clinches home-field advantage throughout the playoffs.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "2 hours ago",
      readTime: "4 min read",
      author: "Mike Johnson",
      tags: ["NFL", "Playoffs", "Chiefs"],
      isFeatured: true
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
      isFeatured: true
    }
  ];

  const recentArticles = [
    {
      id: 3,
      title: "World Cup Qualifiers: USMNT Secures Crucial Win in South America",
      summary: "United States defeats Colombia 2-1 in thrilling match to boost World Cup qualification hopes.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "6 hours ago",
      readTime: "5 min read",
      author: "Carlos Martinez",
      tags: ["Soccer", "USMNT", "World Cup"]
    },
    {
      id: 4,
      title: "MLB Spring Training: Top Prospects Make Impressive Debuts",
      summary: "Rising stars showcase talent as teams prepare for upcoming season with promising young players.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "8 hours ago",
      readTime: "7 min read",
      author: "Tommy Rodriguez",
      tags: ["MLB", "Spring Training", "Prospects"]
    },
    {
      id: 5,
      title: "Tennis Grand Slam: Defending Champion Advances to Semifinals",
      summary: "Current title holder overcomes tough opponent in straight sets to reach final four.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "10 hours ago",
      readTime: "3 min read",
      author: "Elena Petrov",
      tags: ["Tennis", "Grand Slam", "Semifinals"]
    },
    {
      id: 6,
      title: "Olympic Training: Swimming Records Broken at National Championships",
      summary: "Multiple world records fall as athletes prepare for upcoming Olympic Games.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "12 hours ago",
      readTime: "5 min read",
      author: "David Kim",
      tags: ["Olympics", "Swimming", "Records"]
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Sports' }
          ]} className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Sports
              </h1>
              <p className="text-lg text-muted-foreground">
                Live scores, breaking news, and comprehensive sports coverage
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">312</div>
                <div className="text-sm text-muted-foreground">Articles today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Featured Articles */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Top Sports Stories</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map(article => (
                  <Link key={article.id} href={`/article/${article.id}`} 
                        className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                          LIVE SPORTS
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>{article.author}</span>
                          <span>{article.publishedAt}</span>
                        </div>
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.map(tag => (
                          <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent Articles */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Latest Sports News</h2>
              <div className="space-y-6">
                {recentArticles.map(article => (
                  <Link key={article.id} href={`/article/${article.id}`}
                        className="group flex flex-col md:flex-row gap-4 bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
                    <div className="md:w-1/3">
                      <div className="relative h-48 md:h-32 rounded-lg overflow-hidden">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>{article.author}</span>
                          <span>{article.publishedAt}</span>
                        </div>
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {article.tags.map(tag => (
                          <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
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
                {liveScores.map((game, index) => (
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
