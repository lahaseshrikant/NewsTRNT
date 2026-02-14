"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/api';
import { getCategoryBadgeStyle, findCategoryByName } from '@/lib/categoryUtils';
import { dbApi, Article } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';

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
  const { categories: dynamicCategories } = useCategories();

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
        return short.category?.slug === selectedCategory;
      });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-gold">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'News Shorts' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Quick Reads</p>
            <h1 className="font-serif text-4xl font-bold text-ivory mb-4">
              News Shorts
            </h1>
            <p className="text-xl text-ivory/60">
              Stay informed in minutes
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
                  className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-ink dark:bg-ivory text-ivory dark:text-ink'
                      : 'border border-ash dark:border-ash/20 text-stone hover:text-ink dark:hover:text-ivory'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* News Shorts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-card border border-border overflow-hidden">
                    <div className="h-48 bg-ash dark:bg-ash/20 animate-pulse"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-ash dark:bg-ash/20 rounded animate-pulse"></div>
                      <div className="h-3 bg-ash dark:bg-ash/20 rounded w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : filteredShorts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <svg className="w-12 h-12 text-stone/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                  <p className="text-muted-foreground">No news shorts available</p>
                </div>
              ) : (
                filteredShorts.map(short => (
                <Link key={short.id} href={`/news/${short.slug}`}
                      className="hover-lift group bg-card border border-border overflow-hidden transition-all">
                  
                  {/* Image */}
                  <div className="hover-img-zoom relative h-48 overflow-hidden">
                    <Image
                      src={short.imageUrl || '/api/placeholder/400/300'}
                      alt={short.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {short.isBreaking && (
                        <span className="bg-vermillion text-white px-2 py-1 font-mono text-[10px] uppercase tracking-wider font-bold">
                          Breaking
                        </span>
                      )}
                      <span className="bg-ink/70 text-white px-2 py-1 font-mono text-[10px]">
                        {short.readingTime || 1} min
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-ink text-ivory px-2 py-1 font-mono text-[10px] uppercase tracking-wider">
                        {short.category?.name || 'News'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-foreground mb-2 group-hover:text-vermillion transition-colors line-clamp-2">
                      {short.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {short.summary}
                    </p>

                    <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {short.shortContent || short.excerpt || ''}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
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
              <button className="hover-magnetic bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase">
                Load More Shorts
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Reading Stats */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">Quick Read Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-mono text-xs uppercase tracking-wider">Today&apos;s Goal</span>
                    <span className="text-muted-foreground font-mono text-xs">8/10</span>
                  </div>
                  <div className="w-full bg-muted h-1.5">
                    <div className="bg-vermillion h-1.5" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div className="text-center pt-2 border-t border-border">
                  <div className="font-serif text-2xl font-bold text-vermillion mb-1">12 min</div>
                  <div className="text-sm text-muted-foreground">Reading time saved today</div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-ink dark:bg-ivory/5 border border-ash dark:border-ash/20 p-6">
              <h3 className="font-serif text-lg font-bold text-ivory mb-2">Daily Shorts Digest</h3>
              <p className="text-ivory/60 text-sm mb-4">
                Get the top 5 news shorts delivered to your inbox every morning.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="auth-field w-full px-3 py-2 bg-ink/50 text-ivory placeholder-ivory/30 text-sm focus:outline-none"
                />
                <button className="w-full bg-vermillion text-white py-2 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">Quick Access</h3>
              <div className="space-y-1">
                {[
                  { name: 'Breaking News', href: '/shorts?filter=breaking' },
                  { name: 'Tech Shorts', href: '/shorts?filter=tech' },
                  { name: 'Business Brief', href: '/shorts?filter=business' },
                  { name: 'Sports Flash', href: '/shorts?filter=sports' }
                ].map(link => (
                  <Link key={link.name} href={link.href}
                        className="hover-row block p-2 text-sm font-medium text-foreground transition-colors">
                    {link.name}
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
