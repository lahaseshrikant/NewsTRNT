"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryBadgeStyle } from '@/lib/categoryUtils';
import { dbApi, Article } from '@/lib/api-client';
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

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsArticles, setNewsArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { categories: dynamicCategories } = useCategories();

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const result = await dbApi.getArticlesByType('news', 20, page);
        if (Array.isArray(result.articles)) {
          setNewsArticles(result.articles);
          setHasMore(result.pagination.hasNext);
        }
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, [page]);

  const categories = [
    { id: 'all', label: 'All News', count: newsArticles.length },
    { id: 'breaking', label: 'Breaking', count: newsArticles.filter(a => a.isBreaking).length },
    ...dynamicCategories.slice(0, 6).map(cat => ({
      id: cat.slug,
      label: cat.name,
      count: newsArticles.filter(a => a.category?.slug === cat.slug).length
    }))
  ];

  const filteredNews = selectedCategory === 'all' 
    ? newsArticles 
    : newsArticles.filter(article => {
        if (selectedCategory === 'breaking') return article.isBreaking;
        return article.category?.slug === selectedCategory;
      });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="hero-news border-b-2 border-vermillion">
        <div className="relative z-10 container mx-auto py-10 px-4">
          <div className="max-w-4xl">
            <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-70 mb-3 block">24/7 Coverage</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
              Latest News
            </h1>
            <p className="opacity-60 text-lg max-w-2xl">
              Breaking news and current events from around the world
            </p>
          </div>
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-6 max-w-4xl">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors backdrop-blur-sm ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-current/20 opacity-70 hover:opacity-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">

            {/* News Articles Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card border border-border overflow-hidden animate-pulse">
                    <div className="h-48 bg-muted"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNews.map((article) => (
                    <Link 
                      key={article.id} 
                      href={`/news/${article.slug}`}
                      className="hover-lift group bg-card border border-border rounded-editorial overflow-hidden transition-all"
                    >
                      {/* Image */}
                      <div className="hover-img-zoom relative h-48 bg-muted overflow-hidden">
                        {article.imageUrl ? (
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ivory to-ash dark:from-ink dark:to-ink/50">
                            <svg className="w-10 h-10 text-stone/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
                          </div>
                        )}
                        {article.isBreaking && (
                          <div className="absolute top-2 left-2 bg-vermillion text-white px-2 py-1 font-mono text-[10px] uppercase tracking-wider font-bold animate-pulse">
                            Breaking
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {article.category && (
                          <span className={`inline-block px-2 py-1 text-xs font-medium mb-2 ${getCategoryBadgeStyle(article.category)}`}>
                            {article.category.name}
                          </span>
                        )}

                        <h2 className="font-serif text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-vermillion transition-colors">
                          {article.title}
                        </h2>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {article.summary || article.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{article.author || 'NewsTRNT Staff'}</span>
                          <span>{formatPublishedTime(article.published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setPage(prev => prev + 1)}
                      className="hover-magnetic px-6 py-3 bg-primary text-primary-foreground font-mono text-xs tracking-wider uppercase"
                    >
                      Load More News
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <svg className="w-12 h-12 text-stone/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">No News Found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory === 'all' 
                    ? 'Check back later for the latest news updates.'
                    : 'Try selecting a different category.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Quick Links */}
            <div className="bg-card border border-border p-4">
              <h3 className="font-serif font-bold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/shorts" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">News Shorts</span>
                  <p className="text-xs text-muted-foreground">Quick 1-minute reads</p>
                </Link>
                <Link href="/trending" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">Trending</span>
                  <p className="text-xs text-muted-foreground">Most popular stories</p>
                </Link>
                <Link href="/articles" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">Long Reads</span>
                  <p className="text-xs text-muted-foreground">In-depth articles</p>
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-card border border-border p-4">
              <h3 className="font-serif font-bold text-foreground mb-4">Categories</h3>
              <div className="space-y-1">
                {dynamicCategories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="hover-row flex items-center justify-between p-2 transition-colors"
                  >
                    <span className="text-sm font-medium">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-card border border-border p-4">
              <h3 className="font-serif font-bold text-foreground mb-2">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the top news delivered to your inbox daily.
              </p>
              <Link 
                href="/subscription" 
                className="block w-full text-center py-2 bg-primary text-primary-foreground font-mono text-xs tracking-wider uppercase hover:opacity-90 transition-colors"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
