"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';

const TrendingPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('today');

  const timeRanges = [
    { id: 'today', label: 'Today', count: 45 },
    { id: 'week', label: 'This Week', count: 234 },
    { id: 'month', label: 'This Month', count: 1567 }
  ];

  const trendingStories = [
    {
      id: 1,
      title: "AI Breakthrough Sparks Global Tech Revolution",
      summary: "Revolutionary artificial intelligence development promises to transform industries worldwide, leading to unprecedented innovation.",
      imageUrl: "/api/placeholder/600/400",
      category: "Technology",
      publishedAt: "2 hours ago",
      readTime: "5 min read",
      author: "Dr. Sarah Chen",
      trendingScore: 95,
      socialShares: 15420,
      comments: 892,
      tags: ["AI", "Technology", "Innovation"]
    },
    {
      id: 2,
      title: "Climate Summit Reaches Historic Agreement",
      summary: "World leaders unite on ambitious climate action plan, setting new standards for global environmental cooperation.",
      imageUrl: "/api/placeholder/600/400",
      category: "Environment",
      publishedAt: "4 hours ago",
      readTime: "7 min read",
      author: "Maria Rodriguez",
      trendingScore: 88,
      socialShares: 12834,
      comments: 654,
      tags: ["Climate", "Environment", "Politics"]
    },
    {
      id: 3,
      title: "Stock Market Surge Defies Economic Predictions",
      summary: "Major indices reach record highs amid surprising economic resilience and investor optimism.",
      imageUrl: "/api/placeholder/600/400",
      category: "Business",
      publishedAt: "6 hours ago",
      readTime: "4 min read",
      author: "James Wilson",
      trendingScore: 82,
      socialShares: 9876,
      comments: 445,
      tags: ["Markets", "Economy", "Finance"]
    },
    {
      id: 4,
      title: "Space Mission Discovers Potential Signs of Life",
      summary: "NASA's latest Mars mission uncovers compelling evidence that could reshape our understanding of life beyond Earth.",
      imageUrl: "/api/placeholder/600/400",
      category: "Science",
      publishedAt: "8 hours ago",
      readTime: "6 min read",
      author: "Dr. Michael Park",
      trendingScore: 79,
      socialShares: 8543,
      comments: 523,
      tags: ["Space", "Science", "NASA"]
    },
    {
      id: 5,
      title: "Championship Upset Shocks Sports World",
      summary: "Underdog team defeats defending champions in stunning victory that defied all odds and predictions.",
      imageUrl: "/api/placeholder/600/400",
      category: "Sports",
      publishedAt: "10 hours ago",
      readTime: "3 min read",
      author: "Tommy Rodriguez",
      trendingScore: 75,
      socialShares: 7234,
      comments: 678,
      tags: ["Sports", "Championship", "Upset"]
    }
  ];

  const trendingTopics = [
    { name: "Artificial Intelligence", mentions: 2540, change: "+45%" },
    { name: "Climate Change", mentions: 1890, change: "+32%" },
    { name: "Cryptocurrency", mentions: 1567, change: "+28%" },
    { name: "Space Exploration", mentions: 1234, change: "+25%" },
    { name: "Electric Vehicles", mentions: 1087, change: "+22%" },
    { name: "Renewable Energy", mentions: 956, change: "+18%" },
    { name: "Quantum Computing", mentions: 743, change: "+15%" },
    { name: "Gene Therapy", mentions: 689, change: "+12%" }
  ];

  const socialTrends = [
    { platform: "Twitter", hashtag: "#AIRevolution", posts: "125K" },
    { platform: "Facebook", hashtag: "#ClimateAction", posts: "89K" },
    { platform: "LinkedIn", hashtag: "#TechInnovation", posts: "67K" },
    { platform: "Instagram", hashtag: "#SpaceDiscovery", posts: "45K" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Trending' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🔥 Trending News
            </h1>
            <p className="text-xl text-muted-foreground">
              What the world is talking about right now
            </p>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Time Range Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {timeRanges.map(range => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    timeRange === range.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {range.label} ({range.count})
                </button>
              ))}
            </div>

            {/* Trending Stories */}
            <div className="space-y-6">
              {trendingStories.map((story, index) => (
                <Link key={story.id} href={`/article/${story.id}`}
                      className="group block bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    {/* Trending Rank */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                          {story.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Trending Score: {story.trendingScore}%
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {story.title}
                      </h2>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {story.summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-4">
                          <span>{story.author}</span>
                          <span>{story.publishedAt}</span>
                          <span>{story.readTime}</span>
                        </div>
                      </div>

                      {/* Social Stats */}
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          <span>{story.socialShares.toLocaleString()} shares</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <span>{story.comments} comments</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {story.tags.map(tag => (
                          <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="hidden md:block flex-shrink-0 w-32 h-24">
                      <div className="relative w-full h-full rounded-lg overflow-hidden">
                        <Image
                          src={story.imageUrl}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Load More Trending Stories
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">🔥 Hot Topics</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium text-foreground">{topic.name}</div>
                      <div className="text-xs text-muted-foreground">{topic.mentions.toLocaleString()} mentions</div>
                    </div>
                    <div className="text-green-600 text-sm font-medium">{topic.change}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Media Trends */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">📱 Social Trends</h3>
              <div className="space-y-4">
                {socialTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium text-foreground">{trend.hashtag}</div>
                      <div className="text-xs text-muted-foreground">{trend.platform}</div>
                    </div>
                    <div className="text-primary font-medium">{trend.posts}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">📊 Trending Stats</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">2.4M</div>
                  <div className="text-sm text-muted-foreground">Total Engagements Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">156</div>
                  <div className="text-sm text-muted-foreground">Active Trending Topics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">89%</div>
                  <div className="text-sm text-muted-foreground">Stories Going Viral</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
