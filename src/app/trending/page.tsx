"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { dbApi, Article } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';

interface TrendingStory {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: string;
  trendingScore: number;
  socialShares: number;
  comments: number;
  tags: string[];
  contentType?: string;
}

const TrendingPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [trendingStories, setTrendingStories] = useState<TrendingStory[]>([]);
  const [loading, setLoading] = useState(true);

  // Format relative time
  const formatRelativeTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const loadTrendingArticles = async () => {
      setLoading(true);
      try {
        const articles = await dbApi.getTrendingArticles(10);
        const formattedStories: TrendingStory[] = articles.map((article: Article, index: number) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          summary: article.summary || article.excerpt || '',
          imageUrl: article.imageUrl || '/api/placeholder/600/400',
          category: article.category?.name || 'Uncategorized',
          publishedAt: formatRelativeTime(article.published_at),
          readTime: `${article.readingTime || 3} min read`,
          author: article.author || 'NewsTRNT Staff',
          trendingScore: Math.min(99, Math.max(50, 95 - (index * 5))),
          socialShares: article.shares || article.views || 0,
          comments: article.commentCount || 0,
          tags: [],
          contentType: article.contentType
        }));
        setTrendingStories(formattedStories);
      } catch (error) {
        console.error('Error loading trending articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingArticles();
  }, [timeRange]);

  const timeRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
  ];

  // Calculate real stats from trending stories
  const totalEngagements = trendingStories.reduce((sum, story) => sum + story.socialShares + story.comments, 0);
  const totalViews = trendingStories.reduce((sum, story) => sum + story.socialShares, 0);
  
  // Generate trending topics from article categories
  const categoryMap = new Map<string, number>();
  trendingStories.forEach(story => {
    const current = categoryMap.get(story.category) || 0;
    categoryMap.set(story.category, current + 1);
  });
  
  const trendingTopics = Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      mentions: count * (totalViews > 0 ? Math.ceil(totalViews / trendingStories.length) : 100),
      change: `+${Math.min(50, count * 10)}%`
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
  <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Trending' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl font-bold text-ivory mb-4">
              Trending Now
            </h1>
            <p className="text-xl text-ivory/60">
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
                  className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                    timeRange === range.id
                      ? 'bg-ink dark:bg-ivory text-ivory dark:text-ink'
                      : 'border border-ash dark:border-ash/20 text-stone hover:text-ink dark:hover:text-ivory'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Trending Stories */}
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingStories.length > 0 ? (
                trendingStories.map((story, index) => (
                <Link key={story.id} href={getContentUrl(story)}
                      className="hover-lift group block bg-card border border-border p-6 transition-all">
                  <div className="flex items-start gap-4">
                    {/* Trending Rank */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-ink dark:bg-ivory flex items-center justify-center text-ivory dark:text-ink font-mono font-bold text-lg">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs tracking-wider uppercase bg-vermillion/10 text-vermillion px-2 py-1">
                          {story.category}
                        </span>
                        <span className="font-mono text-xs text-stone">
                          Score: {story.trendingScore}%
                        </span>
                      </div>
                      
                      <h2 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-vermillion transition-colors">
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
              ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No trending stories found</p>
                </div>
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors">
                Load More Trending Stories
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">Hot Topics</h3>
              {trendingTopics.length > 0 ? (
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                          className="hover-row flex items-center justify-between p-2 transition-colors">
                      <div className="font-medium text-foreground">{topic.name}</div>
                      <div className="font-mono text-xs text-vermillion font-medium">Trending</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Loading trending topics...</p>
              )}
            </div>

            {/* About Trending */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">How We Rank</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <span className="font-mono text-vermillion text-xs">01</span>
                  <p>Stories ranked by real-time engagement and reader interest</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="font-mono text-vermillion text-xs">02</span>
                  <p>Updated continuously throughout the day</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="font-mono text-vermillion text-xs">03</span>
                  <p>Smart curation for most relevant stories</p>
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
