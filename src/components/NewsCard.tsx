import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/database-real';

interface NewsCardProps {
  article: Article;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, className = '' }) => {
  // Format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffMs = now.getTime() - articleDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    
    return articleDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get author display name
  const getAuthorDisplay = () => {
    if (article.authorType === 'wire' && article.sourceName) {
      return article.sourceName;
    }
    return article.author || 'Staff';
  };

  return (
    <Link href={`/article/${article.slug}`}>
      <div 
        className={`news-card border-l-4 ${
          article.isBreaking ? 'border-red-500' : 'border-blue-500'
        } bg-card hover:bg-muted/50 p-4 rounded-r-lg transition-all duration-200 hover:shadow-lg cursor-pointer group ${className}`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {article.isBreaking && (
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
              <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
              BREAKING
            </span>
          )}
          {!article.isBreaking && (
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded">
              NEWS
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex gap-3">
          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            
            {(article.shortContent || article.summary) && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {article.shortContent || article.summary}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium">{getAuthorDisplay()}</span>
              <span>•</span>
              <span>{getTimeAgo(article.published_at)}</span>
              {article.readingTime && (
                <>
                  <span>•</span>
                  <span>{article.readingTime} min read</span>
                </>
              )}
            </div>
          </div>

          {/* Small Thumbnail */}
          {article.imageUrl && (
            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
              <div className="relative w-full h-full rounded-md overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 80px, 96px"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
