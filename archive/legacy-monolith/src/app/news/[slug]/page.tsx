"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { dbApi, Article } from '@/lib/database-real';
import { getContentUrl } from '@/lib/contentUtils';
import CommentSection from '@/components/CommentSection';

interface ArticleData extends Partial<Article> {
  content?: string;
  summary?: string;
  tags?: string[];
  viewCount?: number;
  shareCount?: number;
  readingTime?: number;
  isBreaking?: boolean;
  author?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon?: string;
  };
}

const NewsDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  // Load article from database
  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedArticle = await dbApi.getArticle(slug);
        if (loadedArticle) {
          setArticle(loadedArticle as ArticleData);
          // Load related articles from same category
          if (loadedArticle.category?.slug) {
            const related = await dbApi.getArticlesByCategory(loadedArticle.category.slug, 3);
            // Filter out current article
            setRelatedArticles(related.filter(a => a.slug !== slug));
          }
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const articleElement = document.getElementById('article-content');
      if (articleElement) {
        const scrollTop = window.scrollY;
        const docHeight = articleElement.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        const progress = Math.min(100, Math.max(0, scrollPercent * 100));
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shareArticle = (platform: string) => {
    if (!article) return;
    const url = window.location.href;
    const title = article.title || '';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
              <div className="h-96 bg-muted rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">News Not Found</h3>
          <p className="text-muted-foreground mb-4">{error || 'This news article may have been removed or is not available.'}</p>
          <Link
            href="/news"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Browse News
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = article.category?.name || 'News';
  const categorySlug = article.category?.slug || 'news';
  const authorName = article.author || 'NewsTRNT Staff';
  const articleTags = article.tags || [];
  const publishedAt = article.published_at || new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted/50 z-50">
        <div 
          className="h-full bg-red-600 transition-all duration-100"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* News Header Banner */}
      <div className="bg-gradient-to-r from-red-600/10 to-orange-600/10 border-b border-border">
        <div className="container mx-auto py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">NEWS</span>
            <span className="text-muted-foreground">Latest updates and breaking stories</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <article className="bg-card">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link href="/news" className="hover:text-primary">News</Link>
                <span>/</span>
                <Link href={`/category/${categorySlug}`} className="hover:text-primary">
                  {categoryName}
                </Link>
              </div>
            </nav>

            {/* Article Meta */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                {article.isBreaking && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold animate-pulse">
                    🔴 BREAKING NEWS
                  </span>
                )}
                <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-3 py-1 rounded-lg text-sm font-semibold">
                  {categoryName}
                </span>
                <span className="text-muted-foreground text-sm">
                  {article.readingTime || 3} min read
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {article.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {article.summary || article.excerpt || ''}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{authorName}</div>
                    <div className="text-sm text-muted-foreground">
                      Published {formatDate(publishedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-full transition-colors ${
                      isBookmarked ? 'bg-red-600/10 text-red-600' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    🔖
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full transition-colors"
                    >
                      📤
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-10">
                        <div className="py-2">
                          <button
                            onClick={() => shareArticle('twitter')}
                            className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground"
                          >
                            Share on Twitter
                          </button>
                          <button
                            onClick={() => shareArticle('facebook')}
                            className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground"
                          >
                            Share on Facebook
                          </button>
                          <button
                            onClick={() => shareArticle('linkedin')}
                            className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground"
                          >
                            Share on LinkedIn
                          </button>
                          <button
                            onClick={() => shareArticle('copy')}
                            className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-8">
              <div className="relative w-full h-96 md:h-[500px]">
                <Image
                  src={article.imageUrl || '/api/placeholder/800/500'}
                  alt={article.title || 'News image'}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Article Content */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div 
                  id="article-content"
                  className="prose prose-lg max-w-none 
                    prose-headings:text-foreground prose-headings:font-bold prose-headings:leading-tight
                    prose-p:text-foreground prose-p:leading-relaxed prose-p:text-justify prose-p:mb-6
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 hover:prose-a:underline
                    prose-ul:text-foreground prose-ol:text-foreground prose-li:mb-2 prose-li:leading-relaxed
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-blockquote:text-muted-foreground prose-blockquote:border-l-red-600 prose-blockquote:italic
                    dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: article.content || '' }}
                />

                {/* Tags */}
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {articleTags.length > 0 ? (
                      articleTags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/search?q=${encodeURIComponent(tag)}`}
                          className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm hover:bg-red-600/10 hover:text-red-600 transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No tags</span>
                    )}
                  </div>
                </div>

                {/* Author Bio */}
                <div className="mt-8 pt-8 border-t border-border">
                  <div className="bg-red-600/5 rounded-lg p-6 border border-red-600/10">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">👤</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          About {authorName}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          NewsTRNT contributor delivering quality journalism and breaking news coverage.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8">
                  <CommentSection articleId={article.id || ''} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Related News */}
                <div className="bg-card rounded-lg shadow-sm p-6 sticky top-20 border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Related News</h3>
                  <div className="space-y-4">
                    {relatedArticles.length > 0 ? (
                      relatedArticles.map((relatedArticle) => (
                        <Link key={relatedArticle.id} href={getContentUrl(relatedArticle)}>
                          <div className="group cursor-pointer">
                            <div className="relative w-full h-24 mb-2 bg-muted rounded overflow-hidden">
                              {relatedArticle.imageUrl ? (
                                <Image
                                  src={relatedArticle.imageUrl}
                                  alt={relatedArticle.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>
                              )}
                            </div>
                            <h4 className="font-medium text-foreground text-sm group-hover:text-red-600 line-clamp-2">
                              {relatedArticle.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                              <span>{relatedArticle.category?.name || 'News'}</span>
                              <span>•</span>
                              <span>{relatedArticle.readingTime || 3} min read</span>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No related news found</p>
                    )}
                  </div>

                  {/* More News Link */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <Link
                      href="/news"
                      className="block text-center py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      More News →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
