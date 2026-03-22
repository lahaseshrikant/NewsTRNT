'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  BookmarkIcon, 
  ShareIcon, 
  ClockIcon, 
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { getContentUrl } from '@/lib/contentUtils';
import { buildPlacementMediaUrl } from '@/lib/mediaUrl';

interface Article {
  id: number;
  title: string;
  summary: string;
  content?: string;
  imageUrl: string;
  category: string;
  author?: string;
  publishedAt: string;
  readingTime: number;
  isBreaking?: boolean;
  slug: string;
  contentType?: string;
  views?: number;
  likes?: number;
  comments?: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
}

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact' | 'list';
  showActions?: boolean;
  onBookmark?: (id: number) => void;
  onLike?: (id: number) => void;
  onShare?: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'default',
  showActions = true,
  onBookmark,
  onLike,
  onShare,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [likesCount, setLikesCount] = useState(article.likes || 0);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(article.id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(article.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    onShare?.(article);
  };

  const getCategoryColor = (category: string) => {
    return 'bg-muted text-foreground font-mono text-[10px] tracking-wider uppercase';
  };

  if (variant === 'featured') {
    return (
      <article className="card-hover bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <Link href={getContentUrl(article)}>
          <div className="relative">
            <Image
              src={buildPlacementMediaUrl(article.imageUrl, 'featured')}
              alt={article.title}
              width={800}
              height={400}
              className="w-full h-64 object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            {article.isBreaking && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                BREAKING
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
            </div>
          </div>
        </Link>
        
        <div className="p-6">
          <Link href={getContentUrl(article)}>
            <h2 className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              {article.title}
            </h2>
          </Link>
          
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {article.summary}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              {article.author && <span>By {article.author}</span>}
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{article.readingTime} min read</span>
              </div>
              <span>{article.publishedAt}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={handleLike}
                    className="flex items-center space-x-1 text-muted-foreground hover:text-vermillion transition-colors"
                  >
                    {isLiked ? <HeartSolidIcon className="w-4 h-4 text-vermillion" /> : <HeartIcon className="w-4 h-4" />}
                    <span>{likesCount}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{article.comments || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBookmark}
                  className="p-2 text-muted-foreground hover:text-vermillion hover:bg-muted transition-all"
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  {isBookmarked ? <BookmarkSolidIcon className="w-5 h-5 text-vermillion" /> : <BookmarkIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-muted-foreground hover:text-vermillion hover:bg-muted transition-all"
                  title="Share article"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="card-hover bg-card border border-border rounded-lg overflow-hidden shadow-md">
        <Link href={getContentUrl(article)} className="flex">
          <Image
            src={buildPlacementMediaUrl(article.imageUrl, 'thumb')}
            alt={article.title}
            width={120}
            height={80}
            className="w-32 h-20 object-cover flex-shrink-0"
            sizes="128px"
          />
          <div className="p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              {article.isBreaking && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                  BREAKING
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <ClockIcon className="w-3 h-3 mr-1" />
              <span>{article.readingTime} min</span>
              <span className="mx-1">&bull;</span>
              <span>{article.publishedAt}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'list') {
    return (
      <article className="card-hover bg-card border border-border rounded-lg overflow-hidden shadow-md">
        <Link href={getContentUrl(article)} className="flex p-4">
          <div className="flex-1 mr-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              {article.isBreaking && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  BREAKING
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {article.summary}
            </p>
            <div className="flex items-center text-sm text-muted-foreground space-x-4">
              {article.author && <span>By {article.author}</span>}
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{article.readingTime} min</span>
              </div>
              <span>{article.publishedAt}</span>
            </div>
          </div>
          <Image
            src={buildPlacementMediaUrl(article.imageUrl, 'list')}
            alt={article.title}
            width={160}
            height={120}
            className="w-40 h-28 object-cover rounded-lg flex-shrink-0"
            sizes="160px"
          />
        </Link>
        
        {showActions && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <button 
                  onClick={handleLike}
                  className="flex items-center space-x-1 hover:text-vermillion transition-colors"
                >
                  {isLiked ? <HeartSolidIcon className="w-4 h-4 text-vermillion" /> : <HeartIcon className="w-4 h-4" />}
                  <span>{likesCount}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{article.comments || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleBookmark}
                  className="p-1 text-muted-foreground hover:text-vermillion transition-colors"
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4 text-vermillion" /> : <BookmarkIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShare}
                  className="p-1 text-muted-foreground hover:text-vermillion transition-colors"
                  title="Share article"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    );
  }

  // Default variant
  return (
    <article className="card-hover bg-card border border-border rounded-lg overflow-hidden shadow-md">
      <Link href={getContentUrl(article)}>
        <div className="relative">
          <Image
            src={buildPlacementMediaUrl(article.imageUrl, 'card')}
            alt={article.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          {article.isBreaking && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              BREAKING
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={getContentUrl(article)}>
          <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-2">
            {article.author && <span>By {article.author}</span>}
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{article.readingTime} min</span>
            </div>
          </div>
          <span>{article.publishedAt}</span>
        </div>
        
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-1 hover:text-vermillion transition-colors"
              >
                {isLiked ? <HeartSolidIcon className="w-4 h-4 text-vermillion" /> : <HeartIcon className="w-4 h-4" />}
                <span>{likesCount}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={handleBookmark}
                className="p-1 text-muted-foreground hover:text-vermillion transition-colors"
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              >
                {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4 text-vermillion" /> : <BookmarkIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleShare}
                className="p-1 text-muted-foreground hover:text-vermillion transition-colors"
                title="Share article"
              >
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;
export type { Article, ArticleCardProps };
