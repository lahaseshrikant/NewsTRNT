// Real Database API for NewsTRNT
// Pure API client — connects to backend API server (no direct DB, no mock fallback)

import { API_CONFIG } from '@/config/api';

// Backend API URL based on environment
const API_URL = API_CONFIG.baseURL;

// =============================================================================
// API CLIENT
// =============================================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_URL);

// =============================================================================
// TYPE DEFINITIONS (Match backend schema)
// =============================================================================

// Content Types
export type ContentType = 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview';
export type AuthorType = 'staff' | 'wire' | 'contributor' | 'ai' | 'syndicated';

export interface Article {
  id: string;
  title: string;
  slug: string;
  contentType: ContentType;
  summary?: string;
  content?: string;
  shortContent?: string;
  excerpt?: string;
  author?: string;
  authorType: AuthorType;
  sourceName?: string;
  sourceUrl?: string;
  imageUrl?: string;
  published_at: Date;
  isBreaking: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  views: number;
  likes: number;
  shares?: number;
  commentCount?: number;
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
  engagementScore?: number;
  readingTime?: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon?: string;
  };
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  subCategories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

// =============================================================================
// DATABASE API FUNCTIONS (Route to backend API)
// =============================================================================

export const dbApi = {
  // Get articles with pagination and filtering
  async getArticles(options: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    contentType?: ContentType;
    isBreaking?: boolean;
    isFeatured?: boolean;
    isTrending?: boolean;
  } = {}): Promise<Article[]> {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.offset) queryParams.append('offset', options.offset.toString());
    if (options.categoryId) queryParams.append('categoryId', options.categoryId);
    if (options.contentType) queryParams.append('contentType', options.contentType);
    if (options.isBreaking !== undefined) queryParams.append('isBreaking', options.isBreaking.toString());
    if (options.isFeatured !== undefined) queryParams.append('isFeatured', options.isFeatured.toString());
    if (options.isTrending !== undefined) queryParams.append('isTrending', options.isTrending.toString());

    const queryString = queryParams.toString();
    const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ success: boolean; articles: any[] }>(endpoint);
    const articles = response.articles || [];
    
    // Transform backend response to match frontend Article type
    return articles.map(article => ({
      ...article,
      published_at: article.publishedAt || article.published_at,
      views: article.views || article.viewCount || 0,
      likes: article.likes || article.likeCount || 0
    })) as Article[];
  },

  // Get news only (short-form content)
  async getNews(limit: number = 20): Promise<Article[]> {
    return this.getArticles({ contentType: 'news', limit });
  },

  // Get articles only (long-form content)
  async getLongFormArticles(limit: number = 10): Promise<Article[]> {
    return this.getArticles({ contentType: 'article', limit });
  },

  // Get featured articles
  async getFeaturedArticles(limit: number = 5): Promise<Article[]> {
    return this.getArticles({ contentType: 'article', isFeatured: true, limit });
  },

  // Get breaking news
  async getBreakingNews(limit: number = 10): Promise<Article[]> {
    return this.getArticles({ contentType: 'news', isBreaking: true, limit });
  },

  // Get trending articles
  async getTrendingArticles(limit: number = 10): Promise<Article[]> {
    return this.getArticles({ isTrending: true, limit });
  },

  // Get articles by category
  async getArticlesByCategory(categorySlug: string, limit: number = 20, contentType?: ContentType): Promise<Article[]> {
    try {
      const endpoint = contentType 
        ? `/articles/category/${categorySlug}?limit=${limit}&contentType=${contentType}`
        : `/articles/category/${categorySlug}?limit=${limit}`;
      const response = await apiClient.get<any>(endpoint);
      const articles = Array.isArray(response) ? response : (response.articles || []);
      
      // Transform backend response to match frontend Article type
      return articles.map((article: any) => ({
        ...article,
        published_at: article.publishedAt || article.published_at,
        views: article.views || article.viewCount || 0,
        likes: article.likes || article.likeCount || 0
      })) as Article[];
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      return [];
    }
  },

  // Get articles by content type (news, article, opinion, analysis, review, interview)
  async getArticlesByType(contentType: ContentType, limit: number = 20, page: number = 1): Promise<{
    articles: Article[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const endpoint = `/articles/type/${contentType}?limit=${limit}&page=${page}`;
      const response = await apiClient.get<any>(endpoint);
      const articles = response.articles || [];
      
      // Transform backend response to match frontend Article type
      const transformedArticles = articles.map((article: any) => ({
        ...article,
        published_at: article.publishedAt || article.published_at,
        views: article.views || article.viewCount || 0,
        likes: article.likes || article.likeCount || 0
      })) as Article[];

      return {
        articles: transformedArticles,
        pagination: response.pagination || {
          page: 1,
          limit,
          total: articles.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      console.error('Error fetching articles by type:', error);
      return {
        articles: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
      };
    }
  },

  // Get opinion pieces
  async getOpinionPieces(limit: number = 20): Promise<Article[]> {
    const result = await this.getArticlesByType('opinion', limit);
    return result.articles;
  },

  // Get analysis articles
  async getAnalysisArticles(limit: number = 20): Promise<Article[]> {
    const result = await this.getArticlesByType('analysis', limit);
    return result.articles;
  },

  // Get news by category
  async getNewsByCategory(categorySlug: string, limit: number = 20): Promise<Article[]> {
    return this.getArticlesByCategory(categorySlug, limit, 'news');
  },

  // Get single article
  async getArticle(slug: string): Promise<Article | null> {
    try {
      const response = await apiClient.get<{ success: boolean; article: any }>(`/articles/${slug}`);
      if (response.article) {
        // Transform backend response to match frontend Article type
        return {
          ...response.article,
          published_at: response.article.publishedAt || response.article.published_at,
          views: response.article.views || response.article.viewCount || 0,
          likes: response.article.likes || response.article.likeCount || 0
        } as Article;
      }
      return null;
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  },

  // Get categories
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories');
  },

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await apiClient.get<Category>(`/categories/${slug}/info`);
    } catch (error) {
      console.warn(`Category with slug '${slug}' not found:`, error);
      return null;
    }
  },

  // Search articles
  async searchArticles(query: string, limit: number = 20, contentType?: ContentType): Promise<Article[]> {
    try {
      const endpoint = contentType
        ? `/articles/search?q=${encodeURIComponent(query)}&limit=${limit}&contentType=${contentType}`
        : `/articles/search?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await apiClient.get<any>(endpoint);
      const articles = Array.isArray(response) ? response : (response.articles || []);
      
      // Transform backend response to match frontend Article type
      return articles.map((article: any) => ({
        ...article,
        published_at: article.publishedAt || article.published_at,
        views: article.views || article.viewCount || 0,
        likes: article.likes || article.likeCount || 0
      })) as Article[];
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  },

  // ==========================================================================
  // WEB STORIES API
  // ==========================================================================

  // Get web stories with pagination and filtering
  async getWebStories(options: {
    limit?: number;
    page?: number;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<WebStory[]> {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.category) queryParams.append('category', options.category);
    if (options.sortBy) queryParams.append('sortBy', options.sortBy);
    if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = `/webstories${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiClient.get<{ success: boolean; webStories: WebStory[] }>(endpoint);
      return response.webStories || [];
    } catch (error) {
      console.error('Error fetching web stories:', error);
      return [];
    }
  },

  // Get single web story by ID or slug
  async getWebStory(idOrSlug: string): Promise<WebStory | null> {
    try {
      const response = await apiClient.get<{ success: boolean; webStory: WebStory }>(`/webstories/${idOrSlug}`);
      return response.webStory || null;
    } catch (error) {
      console.error('Error fetching web story:', error);
      return null;
    }
  },

  // Get featured web stories
  async getFeaturedWebStories(limit: number = 6): Promise<WebStory[]> {
    return this.getWebStories({ limit, sortBy: 'viewCount', sortOrder: 'desc' });
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await apiClient.get('/health');
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  },
};

// Web Story type definition
export interface WebStory {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  categoryColor?: string;
  slides: WebStorySlide[];
  slidesCount?: number;
  author: string;
  duration: number;
  coverImage: string;
  isFeature: boolean;
  priority?: string;
  viewCount: number;
  views: number;
  likeCount?: number;
  shareCount?: number;
  isNew?: boolean;
  isTrending?: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WebStorySlide {
  id: string;
  type: 'image' | 'video' | 'text';
  background: string;
  content: {
    headline?: string;
    text?: string;
    image?: string;
    video?: string;
    cta?: {
      text: string;
      url: string;
    };
  };
  duration?: number;
}

// =============================================================================
// SITE STATISTICS TYPES AND FUNCTIONS
// =============================================================================

export interface SiteStats {
  totalArticles: number;
  totalViews: number;
  totalCategories: number;
  totalWebStories: number;
  publishedArticles: number;
  trendingArticles: number;
  featuredArticles: number;
  breakingNews: number;
  totalComments: number;
  totalShares: number;
  topCategories: Array<{ name: string; count: number }>;
  recentActivityCount: number;
}

export interface FormattedStats {
  totalArticles: string;
  monthlyVisitors: string;
  pageViews: string;
  emailSubscribers: string;
  socialFollowers: string;
  totalCategories: string;
  totalWebStories: string;
  engagements: string;
}

export interface CategoryStats {
  category: string;
  slug: string;
  totalArticles: number;
  totalViews: number;
  totalComments: number;
  totalShares: number;
}

// Stats API functions
export const statsApi = {
  // Get raw site statistics
  async getSiteStats(): Promise<SiteStats> {
    try {
      return await apiClient.get<SiteStats>('/stats');
    } catch (error) {
      console.warn('Failed to fetch site stats, returning defaults:', error);
      return {
        totalArticles: 0,
        totalViews: 0,
        totalCategories: 0,
        totalWebStories: 0,
        publishedArticles: 0,
        trendingArticles: 0,
        featuredArticles: 0,
        breakingNews: 0,
        totalComments: 0,
        totalShares: 0,
        topCategories: [],
        recentActivityCount: 0
      };
    }
  },

  // Get formatted statistics for display
  async getFormattedStats(): Promise<FormattedStats> {
    try {
      return await apiClient.get<FormattedStats>('/stats/formatted');
    } catch (error) {
      console.warn('Failed to fetch formatted stats, returning defaults:', error);
      return {
        totalArticles: '0',
        monthlyVisitors: '0',
        pageViews: '0',
        emailSubscribers: '0',
        socialFollowers: '0',
        totalCategories: '0',
        totalWebStories: '0',
        engagements: '0'
      };
    }
  },

  // Get category-specific statistics
  async getCategoryStats(slug: string): Promise<CategoryStats> {
    try {
      return await apiClient.get<CategoryStats>(`/stats/category/${slug}`);
    } catch (error) {
      console.warn(`Failed to fetch stats for category ${slug}:`, error);
      return {
        category: '',
        slug: slug,
        totalArticles: 0,
        totalViews: 0,
        totalComments: 0,
        totalShares: 0
      };
    }
  }
};

export default dbApi;
