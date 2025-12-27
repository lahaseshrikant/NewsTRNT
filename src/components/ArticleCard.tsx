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
    const colors: { [key: string]: string } = {
      'Technology': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Politics': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Business': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Sports': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Entertainment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Health': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Science': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'World': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  if (variant === 'featured') {
    return (
      <article className="card-hover bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <Link href={getContentUrl(article)}>
          <div className="relative">
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={800}
              height={400}
              className="w-full h-64 object-cover"
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
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {article.summary}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
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
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={handleLike}
                    className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    {isLiked ? <HeartSolidIcon className="w-4 h-4 text-red-500" /> : <HeartIcon className="w-4 h-4" />}
                    <span>{likesCount}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{article.comments || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBookmark}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-accent transition-all"
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  {isBookmarked ? <BookmarkSolidIcon className="w-5 h-5 text-blue-600" /> : <BookmarkIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-accent transition-all"
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
            src={article.imageUrl}
            alt={article.title}
            width={120}
            height={80}
            className="w-32 h-20 object-cover flex-shrink-0"
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
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-3 h-3 mr-1" />
              <span>{article.readingTime} min</span>
              <span className="mx-1">•</span>
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
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {article.summary}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
              {article.author && <span>By {article.author}</span>}
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{article.readingTime} min</span>
              </div>
              <span>{article.publishedAt}</span>
            </div>
          </div>
          <Image
            src={article.imageUrl}
            alt={article.title}
            width={160}
            height={120}
            className="w-40 h-28 object-cover rounded-lg flex-shrink-0"
          />
        </Link>
        
        {showActions && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <button 
                  onClick={handleLike}
                  className="flex items-center space-x-1 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  {isLiked ? <HeartSolidIcon className="w-4 h-4 text-red-500" /> : <HeartIcon className="w-4 h-4" />}
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
                  className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4 text-blue-600" /> : <BookmarkIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShare}
                  className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
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
            src={article.imageUrl}
            alt={article.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
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
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
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
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-1 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                {isLiked ? <HeartSolidIcon className="w-4 h-4 text-red-500" /> : <HeartIcon className="w-4 h-4" />}
                <span>{likesCount}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={handleBookmark}
                className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              >
                {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4 text-blue-600" /> : <BookmarkIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleShare}
                className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
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
