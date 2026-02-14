// src/lib/api/index.ts - API client with authentication
import adminAuth from '../admin-auth';

// Types
export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  slug: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  imageUrl?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBreaking: boolean;
  viewCount: number;
  status: 'draft' | 'published' | 'scheduled';
  author: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  articles?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  article?: T;
  data?: T;
  message?: string;
  error?: string;
}

// Base API client
class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = adminAuth.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      console.log('🔐 Auth headers:', (config.headers as Record<string, string>)?.['Authorization'] ? 'Present' : 'Missing');
      
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Authentication failed - redirecting to login');
          if (typeof window !== 'undefined') {
            adminAuth.logout();
            window.location.href = '/login';
          }
          throw new Error('Invalid or expired token');
        }

        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error(`❌ API Error ${response.status}:`, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${url}`, data);
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ Network error - backend server may not be running');
  throw new Error('Backend server is not accessible. Expected at ' + API_BASE_URL + ' (check Express server).');
      }
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Backend API URL (either Express server or Next.js API routes)
// IMPORTANT: The Express backend currently defaults to port 5000. We previously
// had a fallback of 5001 which caused network failures in dev if the env var
// NEXT_PUBLIC_API_URL was not provided. Adjusting the fallback back to 5000 and
// surfacing a clear console warning when the fallback (implicit) URL is used.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  // One–time warning to help developers notice misconfiguration.
  if (!(window as any).__NEWSTRNT_API_BASE_WARNED) {
    console.warn('[NewsTRNT API] Using fallback API_BASE_URL:', API_BASE_URL,
      '\nSet NEXT_PUBLIC_API_URL in .env.local to remove this warning.');
    (window as any).__NEWSTRNT_API_BASE_WARNED = true;
  }
}

const apiClient = new APIClient(API_BASE_URL);

// Article API class
export class ArticleAPI {
  // Get all articles (admin)
  async getArticles(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Article>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = `/articles/admin${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PaginatedResponse<Article>>(endpoint);
  }

  // Get draft articles (admin)
  async getDrafts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Article>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/articles/admin/drafts${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PaginatedResponse<Article>>(endpoint);
  }

  // Get single article by ID (admin)
  async getArticle(id: string): Promise<ApiResponse<Article>> {
    return apiClient.get<ApiResponse<Article>>(`/articles/admin/${id}`);
  }

  // Create new article (admin)
  async createArticle(data: {
    title: string;
    content: string;
    summary?: string;
    categoryId?: string;
    imageUrl?: string;
    tags?: string[];
    isPublished?: boolean;
    publishedAt?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    isBreaking?: boolean;
  }): Promise<ApiResponse<Article>> {
    return apiClient.post<ApiResponse<Article>>('/articles/admin', data);
  }

  // Update article (admin)
  async updateArticle(id: string, data: {
    title?: string;
    content?: string;
    summary?: string;
    categoryId?: string;
    imageUrl?: string;
    tags?: string[];
    isPublished?: boolean;
    publishedAt?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    isBreaking?: boolean;
  }): Promise<ApiResponse<Article>> {
    return apiClient.put<ApiResponse<Article>>(`/articles/admin/${id}`, data);
  }

  // Delete article (admin)
  async deleteArticle(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/articles/admin/${id}`);
  }

  // Public methods (no auth required)
  async getPublicArticles(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Article>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PaginatedResponse<Article>>(endpoint);
  }

  // Get single article by slug (public)
  async getArticleBySlug(slug: string): Promise<ApiResponse<Article>> {
    return apiClient.get<ApiResponse<Article>>(`/articles/slug/${slug}`);
  }
}

// Category API
export class CategoryAPI {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<ApiResponse<Category[]>>('/categories');
  }
}

// Export instances
export const articleAPI = new ArticleAPI();
export const categoryAPI = new CategoryAPI();

// Default export
export default {
  articles: articleAPI,
  categories: categoryAPI,
};

