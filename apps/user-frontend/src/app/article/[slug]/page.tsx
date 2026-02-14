"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { dbApi, Article } from '@/lib/api-client';
import { getContentUrl } from '@/lib/contentUtils';
import CommentSection from '@/components/articles/CommentSection';
import { BookmarkIcon, ShareIcon, ClockIcon, ArrowRightIcon } from '@/components/icons/EditorialIcons';
import AdSlot from '@/components/ui/AdSlot';

interface ArticleData extends Omit<Partial<Article>, 'tags'> {
  content?: string;
  summary?: string;
  tags?: string[] | { id: string; name: string; slug: string }[];
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

const ArticleDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedArticle = await dbApi.getArticle(slug);
        if (loadedArticle) {
          setArticle(loadedArticle as unknown as ArticleData);
          if (loadedArticle.category?.slug) {
            const related = await dbApi.getArticlesByCategory(loadedArticle.category.slug, 3);
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
    });
  };

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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
        break;
    }
    setShowShareMenu(false);
  };

  // Loading — editorial skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        {/* Progress bar placeholder */}
        <div className="fixed top-0 left-0 w-full h-0.5 bg-ash/30 z-50" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-reading mx-auto">
            <div className="skeleton-warm h-4 w-20 mb-6" />
            <div className="skeleton-warm h-10 w-4/5 mb-3" />
            <div className="skeleton-warm h-10 w-3/5 mb-6" />
            <div className="skeleton-warm h-5 w-2/3 mb-8" />
            <div className="flex items-center gap-4 mb-10">
              <div className="skeleton-warm w-10 h-10 rounded-full" />
              <div>
                <div className="skeleton-warm h-3 w-28 mb-2" />
                <div className="skeleton-warm h-3 w-40" />
              </div>
            </div>
            <div className="skeleton-warm w-full h-[400px] mb-10" />
            <div className="space-y-4">
              <div className="skeleton-warm h-4 w-full" />
              <div className="skeleton-warm h-4 w-full" />
              <div className="skeleton-warm h-4 w-5/6" />
              <div className="skeleton-warm h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center py-12 max-w-md px-4">
          <div className="editorial-rule mx-auto mb-6" />
          <h3 className="font-serif text-2xl text-ink mb-3">Story Not Found</h3>
          <p className="text-stone text-sm mb-6">{error || 'This article may have been removed or is no longer available.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-vermillion hover:text-vermillion-dark text-sm font-medium transition-colors"
          >
            <ArrowRightIcon size={14} className="rotate-180" />
            Back to Headlines
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = article.category?.name || 'News';
  const categorySlug = article.category?.slug || 'news';
  const authorName = article.author || 'NewsTRNT Staff';
  const articleTags: string[] = (article.tags || []).map((t) => typeof t === 'string' ? t : t.name);
  const publishedAt = article.published_at || new Date();

  return (
    <div className="min-h-screen bg-paper">
      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ '--progress': `${readingProgress}%` } as React.CSSProperties} />

      <article>
        {/* Article Header */}
        <header className="container mx-auto px-4 pt-8 pb-6">
          <div className="max-w-reading mx-auto">
            {/* Kicker / Category */}
            <div className="flex items-center gap-3 mb-5">
              <Link
                href={`/category/${categorySlug}`}
                className="kicker text-vermillion hover:text-vermillion-dark transition-colors"
              >
                {categoryName}
              </Link>
              {article.isBreaking && (
                <span className="text-xs font-mono uppercase tracking-widest text-vermillion bg-vermillion/8 px-2 py-0.5 border border-vermillion/20">
                  Breaking
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-ink leading-[1.15] mb-4 tracking-tight">
              {article.title}
            </h1>

            {/* Deck / Summary */}
            {(article.summary || article.excerpt) && (
              <p className="text-lg text-stone leading-relaxed mb-6 max-w-[38rem]">
                {article.summary || article.excerpt}
              </p>
            )}

            {/* Editorial Rule */}
            <div className="editorial-rule mb-6" />

            {/* Byline & Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ink/5 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-sm text-ink font-semibold">
                    {authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="byline">
                    By <span className="byline-author">{authorName}</span>
                  </div>
                  <div className="dateline flex items-center gap-2">
                    <span>{formatDate(publishedAt)}</span>
                    <span className="text-ash">|</span>
                    <span>{formatTime(publishedAt)}</span>
                    <span className="text-ash">|</span>
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon size={11} />
                      {article.readingTime || 5} min read
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 border transition-colors ${
                    isBookmarked
                      ? 'border-vermillion/30 text-vermillion bg-vermillion/5'
                      : 'border-ash/50 text-stone hover:text-ink hover:border-ink/30'
                  }`}
                  title={isBookmarked ? 'Saved' : 'Save for later'}
                >
                  <BookmarkIcon size={16} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 border border-ash/50 text-stone hover:text-ink hover:border-ink/30 transition-colors"
                    title="Share"
                  >
                    <ShareIcon size={16} />
                  </button>

                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-paper border border-ash shadow-editorial z-10">
                      {[
                        { label: 'Twitter / X', key: 'twitter' },
                        { label: 'Facebook', key: 'facebook' },
                        { label: 'LinkedIn', key: 'linkedin' },
                        { label: 'Copy Link', key: 'copy' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => shareArticle(item.key)}
                          className="w-full text-left px-4 py-2.5 text-sm text-ink/70 hover:bg-ivory hover:text-ink transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image — full-bleed */}
        {article.imageUrl && (
          <figure className="container mx-auto px-4 mb-10">
            <div className="max-w-4xl mx-auto">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={article.imageUrl}
                  alt={article.title || 'Article image'}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </figure>
        )}

        {/* Article Body */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-reading mx-auto">
            {/* Content */}
            <div
              id="article-content"
              className="prose-editorial"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />

            {/* Article Ad */}
            <div className="my-10">
              <AdSlot size="inline" label="Sponsored" />
            </div>

            {/* Tags */}
            {articleTags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-ash/40">
                <div className="flex flex-wrap gap-2">
                  {articleTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="font-mono text-xs text-stone border border-ash/50 px-3 py-1.5 hover:border-ink/30 hover:text-ink transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div className="mt-10 pt-8 border-t border-ash/40">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-ink/5 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-lg text-ink font-semibold">
                    {authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-stone mb-1">About the Author</p>
                  <h3 className="font-serif text-lg text-ink mb-1">{authorName}</h3>
                  <p className="text-stone text-sm leading-relaxed">
                    NewsTRNT contributor covering stories at the intersection of news and deeper understanding.
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-Comments Ad */}
            <div className="my-8">
              <AdSlot size="rectangle" />
            </div>

            {/* Comments */}
            <div className="mt-10 pt-8 border-t border-ash/40">
              <CommentSection articleId={article.id || ''} />
            </div>
          </div>
        </div>
      </article>

      {/* Related Stories */}
      {relatedArticles.length > 0 && (
        <aside className="bg-ivory border-t border-ash/40">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-xl text-ink mb-6">More from {categoryName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link key={relatedArticle.id} href={getContentUrl(relatedArticle)} className="group">
                    <div className="relative w-full aspect-[3/2] mb-3 bg-ash/20 overflow-hidden">
                      {relatedArticle.imageUrl ? (
                        <Image
                          src={relatedArticle.imageUrl}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-serif text-stone/30 text-2xl">NT</span>
                        </div>
                      )}
                    </div>
                    <p className="kicker text-stone text-[10px] mb-1">
                      {relatedArticle.category?.name || 'News'}
                    </p>
                    <h4 className="font-serif text-ink text-base leading-snug group-hover:text-vermillion transition-colors line-clamp-2">
                      {relatedArticle.title}
                    </h4>
                    <p className="dateline mt-1">{relatedArticle.readingTime || 5} min read</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default ArticleDetailPage;
