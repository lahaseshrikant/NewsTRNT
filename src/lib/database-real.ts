// Real Database API for NewsTRNT
// Connects to backend API server instead of direct database access

import { config } from './scalable-config';

// Backend API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  source_name?: string;
  source_url?: string;
  image_url?: string;
  published_at: Date;
  isBreaking: boolean;
  isFeatured: boolean;
  isActive: boolean;
  views: number;
  likes: number;
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
    isBreaking?: boolean;
    isFeatured?: boolean;
  } = {}): Promise<Article[]> {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.offset) queryParams.append('offset', options.offset.toString());
    if (options.categoryId) queryParams.append('categoryId', options.categoryId);
    if (options.isBreaking !== undefined) queryParams.append('isBreaking', options.isBreaking.toString());
    if (options.isFeatured !== undefined) queryParams.append('isFeatured', options.isFeatured.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/articles${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<Article[]>(endpoint);
  },

  // Get featured articles
  async getFeaturedArticles(limit: number = 5): Promise<Article[]> {
    return apiClient.get<Article[]>(`/api/articles/featured?limit=${limit}`);
  },

  // Get breaking news
  async getBreakingNews(limit: number = 10): Promise<Article[]> {
    return apiClient.get<Article[]>(`/api/articles/breaking?limit=${limit}`);
  },

  // Get articles by category
  async getArticlesByCategory(categorySlug: string, limit: number = 20): Promise<Article[]> {
    return apiClient.get<Article[]>(`/api/articles/category/${categorySlug}?limit=${limit}`);
  },

  // Get single article
  async getArticle(slug: string): Promise<Article | null> {
    try {
      return await apiClient.get<Article>(`/api/articles/${slug}`);
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  },

  // Get categories
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/api/categories');
  },

  // Search articles
  async searchArticles(query: string, limit: number = 20): Promise<Article[]> {
    return apiClient.get<Article[]>(`/api/articles/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await apiClient.get('/api/health');
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  },
};

export default dbApi;
