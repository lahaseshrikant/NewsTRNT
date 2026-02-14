import { Article } from '@/lib/content-api';

/**
 * Get the correct URL for an article based on its contentType
 * 
 * URL Structure:
 * - news content → /news/[slug]
 * - article content → /article/[slug] (long-form)
 * - opinion content → /opinion/[slug]
 * - analysis content → /analysis/[slug]
 * - review content → /article/[slug] (fallback)
 * - interview content → /article/[slug] (fallback)
 */
export function getContentUrl(article: Article | { slug: string; contentType?: string }): string {
  const { slug, contentType = 'article' } = article;
  
  switch (contentType) {
    case 'news':
      return `/news/${slug}`;
    case 'opinion':
      return `/opinion/${slug}`;
    case 'analysis':
      return `/analysis/${slug}`;
    case 'article':
    case 'review':
    case 'interview':
    default:
      return `/article/${slug}`;
  }
}

/**
 * Get the list page URL for a content type
 */
export function getContentListUrl(contentType: string): string {
  switch (contentType) {
    case 'news':
      return '/news';
    case 'opinion':
      return '/opinion';
    case 'analysis':
      return '/analysis';
    case 'article':
      return '/articles';
    default:
      return '/';
  }
}

/**
 * Get display name for content type
 */
export function getContentTypeName(contentType: string): string {
  const names: Record<string, string> = {
    news: 'News',
    article: 'Article',
    opinion: 'Opinion',
    analysis: 'Analysis',
    review: 'Review',
    interview: 'Interview'
  };
  return names[contentType] || 'Article';
}

/**
 * Get theme color for content type
 */
export function getContentTypeColor(contentType: string): string {
  const colors: Record<string, string> = {
    news: 'red',
    article: 'blue',
    opinion: 'amber',
    analysis: 'emerald',
    review: 'purple',
    interview: 'indigo'
  };
  return colors[contentType] || 'gray';
}

