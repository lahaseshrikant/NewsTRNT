/**
 * News Article Detail Page
 *
 * Editorial-grade article layout with:
 * - Serif headline + summary deck
 * - Conditional author byline (DivergenceMark fallback when no author)
 * - Full-width hero image with credit overlay
 * - Centered reading-width body + sticky sidebar
 * - Share menu, bookmark, and reading progress
 * - Integrated comment section with user context
 *
 * @route /news/[slug]
 */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { dbApi, Article } from '@/lib/api-client';
import { getContentUrl } from '@/lib/contentUtils';
import { useAuth } from '@/contexts/AuthContext';
import CommentSection from '@/components/articles/CommentSection';
import ReadingProgressBar from '@/components/ui/ReadingProgressBar';
import { DivergenceMark } from '@/components/ui/DivergenceMark';
import { FollowIcon } from '@/components/icons/EditorialIcons';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ArticleData extends Partial<Omit<Article, 'tags'>> {
  content?: string;
  summary?: string;
  tags?: string[] | Array<{ id: string; name: string; slug: string }>;
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const NewsDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);

  /* ---------- Data fetching ---------- */

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedArticle = await dbApi.getArticle(slug);

        if (loadedArticle) {
          setArticle(loadedArticle as ArticleData);

          if (loadedArticle.category?.slug) {
            const related = await dbApi.getArticlesByCategory(loadedArticle.category.slug, 4);
            setRelatedArticles(related.filter(a => a.slug !== slug).slice(0, 3));
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

  /* ---------- Share handler ---------- */

  const shareArticle = useCallback((platform: string) => {
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
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  }, [article]);

  /* ---------- Loading skeleton ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ReadingProgressBar />
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
          <div className="animate-pulse space-y-6">
            <div className="h-3 bg-muted rounded w-40" />
            <div className="space-y-3 mt-6">
              <div className="h-9 bg-muted rounded w-full" />
              <div className="h-9 bg-muted rounded w-4/5" />
            </div>
            <div className="h-5 bg-muted rounded w-3/5 mt-3" />
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
              <div className="w-11 h-11 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="h-3.5 bg-muted rounded w-28" />
                <div className="h-3 bg-muted rounded w-44" />
              </div>
            </div>
            <div className="h-[420px] bg-muted rounded-sm mt-8" />
            <div className="space-y-4 mt-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Error / Not found ---------- */

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <DivergenceMark size={40} className="text-vermillion mx-auto mb-6" />
          <h2 className="font-serif text-headline-3 text-foreground mb-3">Article Not Found</h2>
          <p className="text-body-sm text-muted-foreground mb-8">
            {error || 'This article may have been removed or is temporarily unavailable.'}
          </p>
          <Link
            href="/news"
            className="inline-block bg-vermillion text-white px-6 py-3 text-sm font-semibold tracking-wide hover:bg-vermillion-dark transition-colors"
          >
            Browse Latest News
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Derived data ---------- */

  const categoryName = article.category?.name || 'News';
  const categorySlug = article.category?.slug || 'news';
  const hasAuthor = article.author && article.author !== 'NewsTRNT Staff' && article.author !== 'Unknown';
  const authorDisplay = hasAuthor ? article.author! : null;
  const articleTags: string[] = (article.tags || []).map((tag: string | { id: string; name: string; slug: string }) =>
    typeof tag === 'string' ? tag : tag.name
  );
  const publishedAt = article.published_at || new Date();

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgressBar />

      {/* ========== Article Header ========== */}
      <header className="bg-background">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-micro uppercase tracking-wider text-muted-foreground mb-8">
            <Link href="/" className="hover:text-vermillion transition-colors">Home</Link>
            <span className="text-border">/</span>
            <Link href="/news" className="hover:text-vermillion transition-colors">News</Link>
            <span className="text-border">/</span>
            <Link href={`/category/${categorySlug}`} className="hover:text-vermillion transition-colors">
              {categoryName}
            </Link>
          </nav>

          {/* Category & breaking badge */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {article.isBreaking && (
              <span className="inline-flex items-center gap-1.5 bg-vermillion text-white px-2.5 py-0.5 text-overline uppercase tracking-wider font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Breaking
              </span>
            )}
            <Link
              href={`/category/${categorySlug}`}
              className="text-overline uppercase tracking-wider text-vermillion font-bold hover:text-vermillion-dark transition-colors"
            >
              {categoryName}
            </Link>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] leading-[1.12] tracking-tight text-foreground mb-4">
            {article.title}
          </h1>

          {/* Summary / deck */}
          {(article.summary || article.excerpt) && (
            <p className="font-sans text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
              {article.summary || article.excerpt}
            </p>
          )}

          {/* Byline & actions */}
          <div className="flex items-center justify-between flex-wrap gap-4 py-5 border-y border-border">
            <div className="flex items-center gap-3.5">
              {authorDisplay ? (
                <div className="w-11 h-11 bg-muted rounded-full flex items-center justify-center text-base font-serif text-foreground font-semibold ring-2 ring-border">
                  {authorDisplay.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="w-11 h-11 bg-muted/50 rounded-full flex items-center justify-center ring-2 ring-border">
                  <DivergenceMark size={16} className="text-vermillion" />
                </div>
              )}

              <div className="min-w-0">
                {authorDisplay ? (
                  <p className="text-sm font-semibold text-foreground leading-tight">{authorDisplay}</p>
                ) : (
                  <p className="text-sm font-semibold text-foreground leading-tight">NewsTRNT</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <time dateTime={new Date(publishedAt).toISOString()}>
                    {formatDate(publishedAt)}
                  </time>
                  <span className="text-border">&middot;</span>
                  <span>{article.readingTime || 3} min read</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-full transition-all ${
                  isBookmarked
                    ? 'bg-vermillion/10 text-vermillion'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              >
                <svg className="w-[18px] h-[18px]" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                  aria-label="Share article"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-card rounded-lg shadow-editorial-lg border border-border z-20 py-1 animate-fade-in">
                    {[
                      { key: 'twitter', label: 'Share on X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                      { key: 'facebook', label: 'Share on Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                      { key: 'linkedin', label: 'Share on LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.028-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                    ].map(({ key, label, icon }) => (
                      <button
                        key={key}
                        onClick={() => shareArticle(key)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d={icon} /></svg>
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => shareArticle('copy')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <FollowIcon size={16} className="text-muted-foreground" />
                      {linkCopied ? 'Link copied!' : 'Copy link'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== Hero Image ========== */}
      {article.imageUrl && (
        <figure className="mt-8 mb-0">
          <div className="max-w-3xl mx-auto px-6">
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-sm bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.title || 'Article image'}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
              />
            </div>
          </div>
        </figure>
      )}

      {/* ========== Article Body + Sidebar ========== */}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Main content column */}
          <article className="lg:col-span-8">
            <div
              id="article-content"
              className="
                prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-[1.375rem] prose-h2:mt-10 prose-h2:mb-4 prose-h2:leading-snug
                prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-foreground/85 prose-p:leading-[1.85] prose-p:mb-5 prose-p:text-[1.0625rem] prose-p:font-normal
                prose-strong:text-foreground prose-strong:font-semibold
                prose-a:text-vermillion prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-ul:text-foreground/85 prose-ol:text-foreground/85 prose-li:mb-2 prose-li:leading-relaxed prose-li:text-[1.0625rem]
                prose-blockquote:border-l-vermillion prose-blockquote:border-l-[3px] prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r prose-blockquote:not-italic prose-blockquote:text-foreground/80 prose-blockquote:font-serif prose-blockquote:text-lg
                prose-img:rounded-sm prose-img:shadow-editorial
                prose-figure:my-8
                dark:prose-invert
              "
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />

            {/* Tags */}
            {articleTags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-micro uppercase tracking-wider text-muted-foreground mr-2">Tags</span>
                  {articleTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="text-xs font-mono bg-muted/70 text-muted-foreground px-3 py-1.5 rounded-sm hover:bg-vermillion/10 hover:text-vermillion transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author bio */}
            {authorDisplay && (
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-lg font-serif text-foreground flex-shrink-0 ring-2 ring-border">
                    {authorDisplay.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-micro uppercase tracking-wider text-muted-foreground mb-1">Written by</p>
                    <h3 className="font-serif text-base text-foreground mb-1 font-semibold">{authorDisplay}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      NewsTRNT contributor covering {categoryName.toLowerCase()} and delivering quality journalism.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="mt-10 pt-8 border-t border-border">
              <CommentSection
                articleId={article.id || ''}
                userId={isAuthenticated ? user?.id : undefined}
                userDisplayName={isAuthenticated ? (user?.fullName || user?.username) : undefined}
              />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Related articles */}
              <div>
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
                  <div className="w-1 h-4 bg-vermillion rounded-full" />
                  <h3 className="font-mono text-micro uppercase tracking-wider text-muted-foreground">
                    Related Stories
                  </h3>
                </div>
                <div className="space-y-5">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((relatedArticle, idx) => (
                      <Link key={relatedArticle.id} href={getContentUrl(relatedArticle)} className="group block">
                        <div className="flex gap-3.5">
                          <div className="relative w-[72px] h-[72px] flex-shrink-0 bg-muted rounded-sm overflow-hidden">
                            {relatedArticle.imageUrl ? (
                              <Image
                                src={relatedArticle.imageUrl}
                                alt={relatedArticle.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <DivergenceMark size={12} className="text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 py-0.5">
                            <h4 className="font-serif text-[13px] font-semibold text-foreground group-hover:text-vermillion transition-colors line-clamp-2 leading-snug mb-1.5">
                              {relatedArticle.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {relatedArticle.readingTime || 3} min read
                            </p>
                          </div>
                        </div>
                        {idx < relatedArticles.length - 1 && (
                          <div className="border-b border-border/50 mt-5" />
                        )}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No related stories found.</p>
                  )}
                </div>
              </div>

              {/* More from category */}
              <div className="pt-2">
                <Link
                  href={`/category/${categorySlug}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-border text-xs font-mono uppercase tracking-wider text-foreground hover:border-vermillion hover:text-vermillion transition-colors"
                >
                  More {categoryName}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              {/* Newsletter CTA */}
              <div className="bg-muted/40 border border-border p-5">
                <DivergenceMark size={14} className="text-vermillion mb-3" />
                <h4 className="font-serif text-sm font-semibold text-foreground mb-1.5">Stay Informed</h4>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Get the day&apos;s top stories delivered to your inbox every morning.
                </p>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center bg-vermillion text-white py-2.5 text-[10px] font-mono uppercase tracking-wider hover:bg-vermillion-dark transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;