"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryBadgeStyle } from '@/lib/categoryUtils';
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

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsArticles, setNewsArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Load news from database
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

  // Create categories list with dynamic categories
  const categories = [
    { id: 'all', label: 'All News', count: newsArticles.length },
    { id: 'breaking', label: '🔴 Breaking', count: newsArticles.filter(a => a.isBreaking).length },
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
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600/10 to-orange-600/10 border-b border-border">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'News' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              📰 Latest News
            </h1>
            <p className="text-xl text-muted-foreground">
              Breaking news and current events • Stay informed 24/7
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

            {/* News Articles Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
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
                      className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-muted">
                        {article.imageUrl ? (
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            📰
                          </div>
                        )}
                        {article.isBreaking && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                            🔴 BREAKING
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Category Badge */}
                        {article.category && (
                          <span 
                            className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getCategoryBadgeStyle(article.category)}`}
                          >
                            {article.category.name}
                          </span>
                        )}

                        <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
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

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setPage(prev => prev + 1)}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Load More News
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-xl font-bold text-foreground mb-2">No News Found</h3>
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
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-4">📌 Quick Links</h3>
              <div className="space-y-2">
                <Link href="/shorts" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">⚡ News Shorts</span>
                  <p className="text-xs text-muted-foreground">Quick 1-minute reads</p>
                </Link>
                <Link href="/trending" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">🔥 Trending</span>
                  <p className="text-xs text-muted-foreground">Most popular stories</p>
                </Link>
                <Link href="/articles" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">📚 Long Reads</span>
                  <p className="text-xs text-muted-foreground">In-depth articles</p>
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-4">📂 Categories</h3>
              <div className="space-y-2">
                {dynamicCategories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">{cat.icon} {cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-2">📧 Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the top news delivered to your inbox daily.
              </p>
              <Link 
                href="/subscription" 
                className="block w-full text-center py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
