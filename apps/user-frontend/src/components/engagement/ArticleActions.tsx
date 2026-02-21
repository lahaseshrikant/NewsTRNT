'use client';

import { useState, useCallback } from 'react';

interface ArticleActionsProps {
  articleId: string;
  articleTitle: string;
  articleUrl?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Quick action buttons — bookmark, share, copy link.
 * Appears on article cards and detail pages.
 */
export default function ArticleActions({
  articleId,
  articleTitle,
  articleUrl,
  size = 'sm',
  className = '',
}: ArticleActionsProps) {
  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('newstrnt_bookmarks') || '[]');
      return saved.includes(articleId);
    } catch { return false; }
  });
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const toggleBookmark = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('newstrnt_bookmarks') || '[]');
      const next = bookmarked
        ? saved.filter(id => id !== articleId)
        : [articleId, ...saved].slice(0, 500);
      localStorage.setItem('newstrnt_bookmarks', JSON.stringify(next));
      setBookmarked(!bookmarked);
    } catch { /* noop */ }
  }, [articleId, bookmarked]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareOpen(prev => !prev);
  }, []);

  const copyLink = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = articleUrl || (typeof window !== 'undefined' ? window.location.href : '');
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShareOpen(false);
  }, [articleUrl]);

  const shareToTwitter = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = articleUrl || (typeof window !== 'undefined' ? window.location.href : '');
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(url)}`, '_blank');
    setShareOpen(false);
  }, [articleTitle, articleUrl]);

  const btnBase = size === 'sm'
    ? 'w-8 h-8 text-xs'
    : 'w-9 h-9 text-sm';

  return (
    <div className={`flex items-center gap-1 relative ${className}`} onClick={e => e.stopPropagation()}>
      {/* Bookmark */}
      <button
        onClick={toggleBookmark}
        className={`${btnBase} rounded-full flex items-center justify-center transition-all ${
          bookmarked
            ? 'bg-primary/15 text-primary'
            : 'bg-background/80 backdrop-blur text-muted-foreground hover:text-primary hover:bg-primary/10'
        }`}
        title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
      >
        {bookmarked ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.537A.5.5 0 014 22.143V3a1 1 0 011-1z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        )}
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className={`${btnBase} rounded-full flex items-center justify-center bg-background/80 backdrop-blur text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all`}
        title="Share"
        aria-label="Share article"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className={`${btnBase} rounded-full flex items-center justify-center transition-all ${
          copied
            ? 'bg-emerald-500/15 text-emerald-500'
            : 'bg-background/80 backdrop-blur text-muted-foreground hover:text-primary hover:bg-primary/10'
        }`}
        title={copied ? 'Copied!' : 'Copy link'}
        aria-label="Copy article link"
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.686-5.754a4.5 4.5 0 00-6.364-6.364L4.5 8.257m6.364 6.364l4.5-4.5" />
          </svg>
        )}
      </button>

      {/* Share dropdown */}
      {shareOpen && (
        <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
          <button
            onClick={shareToTwitter}
            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Post on X
          </button>
          <button
            onClick={copyLink}
            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.686-5.754a4.5 4.5 0 00-6.364-6.364L4.5 8.257m6.364 6.364l4.5-4.5" /></svg>
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}
