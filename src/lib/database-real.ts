// Real Database API for NewsTRNT
// Connects to backend API server instead of direct database access

import { config } from './scalable-config';

// Backend API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// =============================================================================
// API CLIENT WITH AUTOMATIC FALLBACK
// =============================================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithFallback<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
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
    } catch (error) {
      console.warn(`Backend API not available (${endpoint}), falling back to mock data:`, error);
      
      // Fallback to mock data when backend is not available
      if (process.env.NODE_ENV === 'development') {
        const { dbApi: mockApi } = await import('./database-mock');
        
        // Map API endpoints to mock functions
        if (endpoint.includes('/articles')) {
          if (endpoint.includes('featured')) {
            const result = await mockApi.getFeaturedArticles();
            return result.data as unknown as T;
          }
          if (endpoint.includes('breaking')) {
            // Use trending articles as breaking news fallback
            const result = await mockApi.getTrendingArticles();
            return result.data as unknown as T;
          }
          if (endpoint.includes('/category/')) {
            // Extract category slug from endpoint
            const slugMatch = endpoint.match(/\/category\/([^?]+)/);
            if (slugMatch) {
              const categorySlug = slugMatch[1];
              const result = await mockApi.getArticlesByCategory(categorySlug);
              return result.data as unknown as T;
            }
          }
          if (endpoint.includes('/search')) {
            // Extract search query from endpoint
            const queryMatch = endpoint.match(/[?&]q=([^&]+)/);
            if (queryMatch) {
              const searchQuery = decodeURIComponent(queryMatch[1]);
              const result = await mockApi.searchArticles(searchQuery);
              return result.data as unknown as T;
            }
          }
          // Default: return all articles
          const result = await mockApi.getArticles();
          return result.data as unknown as T;
        }
        
        if (endpoint.includes('/categories')) {
          const result = await mockApi.getCategories();
          return result.data as unknown as T;
        }
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.fetchWithFallback<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.fetchWithFallback<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.fetchWithFallback<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.fetchWithFallback<T>(endpoint, { method: 'DELETE' });
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
  readingTime?: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
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
    
    return apiClient.get<Article[]>(endpoint);
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
      const articles = await apiClient.get<Article[]>(endpoint);
      return Array.isArray(articles) ? articles : [];
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      return [];
    }
  },

  // Get news by category
  async getNewsByCategory(categorySlug: string, limit: number = 20): Promise<Article[]> {
    return this.getArticlesByCategory(categorySlug, limit, 'news');
  },

  // Get single article
  async getArticle(slug: string): Promise<Article | null> {
    try {
      return await apiClient.get<Article>(`/articles/${slug}`);
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  },

  // Get categories
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories');
  },

  // Search articles
  async searchArticles(query: string, limit: number = 20, contentType?: ContentType): Promise<Article[]> {
    const endpoint = contentType
      ? `/articles/search?q=${encodeURIComponent(query)}&limit=${limit}&contentType=${contentType}`
      : `/articles/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    return apiClient.get<Article[]>(endpoint);
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

export default dbApi;
