"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories, Category } from '@/hooks/useCategories';
import { getCategoryBadgeStyle, findCategoryByName } from '@/lib/categoryUtils';
import { dbApi, Article } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';

// Helper to format published time
const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

const ShortsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsShorts, setNewsShorts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Load news from database
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const articles = await dbApi.getNews(20);
        if (Array.isArray(articles)) {
          setNewsShorts(articles);
        }
      } catch (error) {
        console.error('Error loading news shorts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  // Create categories list with special items and dynamic categories
  const categories = [
    { id: 'all', label: 'All Shorts', count: newsShorts.length },
    { id: 'breaking', label: 'Breaking', count: newsShorts.filter(s => s.isBreaking).length },
    ...dynamicCategories.slice(0, 4).map(cat => ({
      id: cat.slug,
      label: cat.name,
      count: newsShorts.filter(s => s.category?.slug === cat.slug).length
    }))
  ];

  const filteredShorts = selectedCategory === 'all' 
    ? newsShorts 
    : newsShorts.filter(short => {
        if (selectedCategory === 'breaking') return short.isBreaking;
        // Dynamic category matching using category slug
        return short.category?.slug === selectedCategory;
      });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'News Shorts' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              ⚡ News Shorts
            </h1>
            <p className="text-xl text-muted-foreground">
              Quick reads • Big impact • Stay informed in minutes
            </p>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
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

            {/* News Shorts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : filteredShorts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No news shorts available</p>
                </div>
              ) : (
                filteredShorts.map(short => (
                <Link key={short.id} href={`/news/${short.slug}`}
                      className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                  
                  {/* Image */}
                  <div className="relative h-48">
                    <Image
                      src={short.imageUrl || '/api/placeholder/400/300'}
                      alt={short.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {short.isBreaking && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                          BREAKING
                        </span>
                      )}
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {short.readingTime || 1} min
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        {short.category?.name || 'News'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {short.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {short.summary}
                    </p>

                    <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {short.shortContent || short.excerpt || ''}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center space-x-2">
                        <span>{short.author || 'Staff'}</span>
                        <span>•</span>
                        <span>{formatPublishedTime(short.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Load More Shorts
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Reading Progress */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">⚡ Quick Read Challenge</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">Today's Goal</span>
                    <span className="text-muted-foreground">8/10 shorts</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">12 min</div>
                  <div className="text-sm text-muted-foreground">Reading time saved today</div>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">📊 Popular This Hour</h3>
              <div className="space-y-3">
                {[
                  { category: "Technology", count: 45, trend: "+12%" },
                  { category: "Business", count: 38, trend: "+8%" },
                  { category: "Sports", count: 34, trend: "+15%" },
                  { category: "Science", count: 29, trend: "+6%" },
                  { category: "Health", count: 25, trend: "+10%" }
                ].map((item, index) => (
                  <Link key={item.category} href={`/category/${item.category.toLowerCase()}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-foreground">{item.category}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-2">📧 Daily Shorts Digest</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get the top 5 news shorts delivered to your inbox every morning.
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

            {/* Quick Navigation */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">⚡ Quick Access</h3>
              <div className="space-y-2">
                {[
                  { name: 'Breaking News', href: '/shorts?filter=breaking' },
                  { name: 'Tech Shorts', href: '/shorts?filter=tech' },
                  { name: 'Business Brief', href: '/shorts?filter=business' },
                  { name: 'Sports Flash', href: '/shorts?filter=sports' }
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

export default ShortsPage;
