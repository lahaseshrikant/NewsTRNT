"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryBadgeStyle } from '@/lib/categoryUtils';
import { dbApi, Article } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';

const formatPublishedTime = (publishedAt: string | Date) => {
  const now = new Date();
  const published = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  if (diffInMinutes < 7200) return `${Math.floor(diffInMinutes / 1440)} days ago`;
  return new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ArticlesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { categories: dynamicCategories } = useCategories();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const result = await dbApi.getArticlesByType('article', 12, page);
        if (Array.isArray(result.articles)) {
          setArticles(result.articles);
          setHasMore(result.pagination.hasNext);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [page]);

  const categories = [
    { id: 'all', label: 'All Articles', count: articles.length },
    { id: 'featured', label: 'Featured', count: articles.filter(a => a.isFeatured).length },
    ...dynamicCategories.slice(0, 6).map(cat => ({
      id: cat.slug,
      label: cat.name,
      count: articles.filter(a => a.category?.slug === cat.slug).length
    }))
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => {
        if (selectedCategory === 'featured') return article.isFeatured;
        return article.category?.slug === selectedCategory;
      });

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const remainingArticles = featuredArticle 
    ? filteredArticles.filter(a => a.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Articles' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">In-Depth</p>
            <h1 className="font-serif text-4xl font-bold text-ivory mb-4">
              Long Reads
            </h1>
            <p className="text-xl text-ivory/60">
              In-depth articles and deep dives into the stories that matter
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Featured Article Hero */}
        {featuredArticle && selectedCategory === 'all' && (
          <Link 
            href={getContentUrl(featuredArticle)}
            className="hover-hero-card block mb-8 group"
          >
            <div className="relative h-96 overflow-hidden bg-card border border-border">
              {featuredArticle.imageUrl ? (
                <Image
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-ink via-vermillion/20 to-ink flex items-center justify-center">
                  <svg className="w-16 h-16 text-ivory/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  {featuredArticle.isFeatured && (
                    <span className="bg-gold text-ink px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-bold">
                      Featured
                    </span>
                  )}
                  {featuredArticle.category && (
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
                      {featuredArticle.category.name}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-3xl font-bold text-white mb-3 group-hover:text-gold transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-white/80 text-lg mb-4 line-clamp-2 max-w-3xl">
                  {featuredArticle.summary || featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span>{featuredArticle.author || 'NewsTRNT Staff'}</span>
                  <span>•</span>
                  <span>{featuredArticle.readingTime || 8} min read</span>
                  <span>•</span>
                  <span>{formatPublishedTime(featuredArticle.published_at)}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

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

            {/* Articles Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : remainingArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingArticles.map((article) => (
                    <Link 
                      key={article.id} 
                      href={getContentUrl(article)}
                      className="hover-lift group bg-card border border-border overflow-hidden transition-all"
                    >
                      {/* Image */}
                      <div className="hover-img-zoom relative h-48 bg-muted overflow-hidden">
                        {article.imageUrl ? (
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ivory to-ash dark:from-ink dark:to-ink/50">
                            <svg className="w-10 h-10 text-stone/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                          </div>
                        )}
                        {article.isFeatured && (
                          <div className="absolute top-2 left-2 bg-gold text-ink px-2 py-1 font-mono text-[10px] uppercase tracking-wider font-bold">
                            Featured
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 font-mono text-[10px]">
                          {article.readingTime || 8} min read
                        </div>
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

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
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
                      className="hover-magnetic px-6 py-3 bg-vermillion text-white font-mono text-xs tracking-wider uppercase"
                    >
                      Load More Articles
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <svg className="w-12 h-12 text-stone/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">No Articles Found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory === 'all' 
                    ? 'Check back later for in-depth articles.'
                    : 'Try selecting a different category.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Content Types */}
            <div className="bg-card border border-border p-4">
              <h3 className="font-serif font-bold text-foreground mb-4">More Content</h3>
              <div className="space-y-2">
                <Link href="/news" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">Latest News</span>
                  <p className="text-xs text-muted-foreground">Breaking and current events</p>
                </Link>
                <Link href="/shorts" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">News Shorts</span>
                  <p className="text-xs text-muted-foreground">Quick 1-minute reads</p>
                </Link>
                <Link href="/opinion" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">Opinion</span>
                  <p className="text-xs text-muted-foreground">Expert perspectives</p>
                </Link>
                <Link href="/analysis" className="hover-row block p-3 transition-colors">
                  <span className="font-medium">Analysis</span>
                  <p className="text-xs text-muted-foreground">Deep dives and insights</p>
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

            {/* Reading Tip */}
            <div className="bg-ink dark:bg-ivory/5 border border-ash dark:border-ash/20 p-4">
              <h3 className="font-serif font-bold text-ivory mb-2">Reading Tip</h3>
              <p className="text-sm text-ivory/60">
                Long-form articles are best enjoyed with your morning coffee. Take your time to absorb the details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
