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
  if (diffInMinutes < 7200) return `${Math.floor(diffInMinutes / 1440)} days ago`;
  const date = new Date(publishedAt);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const OpinionPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [opinionPieces, setOpinionPieces] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Load opinion pieces from database
  useEffect(() => {
    const loadOpinion = async () => {
      try {
        setLoading(true);
        const result = await dbApi.getArticlesByType('opinion', 12, page);
        if (Array.isArray(result.articles)) {
          setOpinionPieces(result.articles);
          setHasMore(result.pagination.hasNext);
        }
      } catch (error) {
        console.error('Error loading opinion pieces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOpinion();
  }, [page]);

  // Create categories list
  const categories = [
    { id: 'all', label: 'All Opinion', count: opinionPieces.length },
    ...dynamicCategories.slice(0, 6).map(cat => ({
      id: cat.slug,
      label: cat.name,
      count: opinionPieces.filter(a => a.category?.slug === cat.slug).length
    }))
  ];

  const filteredOpinion = selectedCategory === 'all' 
    ? opinionPieces 
    : opinionPieces.filter(article => article.category?.slug === selectedCategory);

  // Featured columnists
  const featuredColumnists = [
    { name: "Sarah Chen", role: "Tech Analyst", avatar: "👩‍💼" },
    { name: "Michael Torres", role: "Political Correspondent", avatar: "👨‍💼" },
    { name: "Priya Sharma", role: "Economics Editor", avatar: "👩‍🏫" },
    { name: "James Wilson", role: "Foreign Affairs", avatar: "👨‍🎓" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-b border-border">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Opinion' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              💭 Opinion
            </h1>
            <p className="text-xl text-muted-foreground">
              Expert perspectives and thought-provoking commentary
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

            {/* Opinion Pieces */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOpinion.length > 0 ? (
              <>
                <div className="space-y-6">
                  {filteredOpinion.map((article) => (
                    <Link 
                      key={article.id} 
                      href={`/opinion/${article.slug}`}
                      className="group block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Author Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                            ✍️
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {article.author || 'NewsTRNT Staff'}
                            </span>
                            {article.category && (
                              <span 
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeStyle(article.category)}`}
                              >
                                {article.category.name}
                              </span>
                            )}
                          </div>

                          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h2>

                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {article.summary || article.excerpt}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatPublishedTime(article.published_at)}</span>
                            <span>•</span>
                            <span>{article.readingTime || 5} min read</span>
                          </div>
                        </div>

                        {/* Image */}
                        {article.imageUrl && (
                          <div className="hidden md:block flex-shrink-0">
                            <div className="relative w-32 h-24 rounded-lg overflow-hidden">
                              <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </div>
                        )}
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
                      Load More Opinion Pieces
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Opinion Pieces Found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory === 'all' 
                    ? 'Opinion pieces coming soon. Check back later for expert perspectives.'
                    : 'Try selecting a different category.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Featured Columnists */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-4">✍️ Our Columnists</h3>
              <div className="space-y-3">
                {featuredColumnists.map((columnist, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-lg">
                      {columnist.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{columnist.name}</div>
                      <div className="text-xs text-muted-foreground">{columnist.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* More Content */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-4">📖 More Content</h3>
              <div className="space-y-2">
                <Link href="/news" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">📰 Latest News</span>
                  <p className="text-xs text-muted-foreground">Breaking and current events</p>
                </Link>
                <Link href="/articles" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">📚 Long Reads</span>
                  <p className="text-xs text-muted-foreground">In-depth articles</p>
                </Link>
                <Link href="/analysis" className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium">🔍 Analysis</span>
                  <p className="text-xs text-muted-foreground">Deep dives and insights</p>
                </Link>
              </div>
            </div>

            {/* Submit Opinion CTA */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
              <h3 className="font-bold text-foreground mb-2">📝 Have an Opinion?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We welcome guest contributions from experts and thought leaders.
              </p>
              <Link 
                href="/contact" 
                className="block w-full text-center py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Submit Your Piece
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpinionPage;
