import { ApiResponse } from '@/types/api';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.baseURL;

export class AdminClient {
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('admin_token') 
      : null;
    
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_URL}/admin${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`Admin API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Dashboard Statistics
  async getStats(): Promise<{
    totalArticles: { count: number; growth: number; growthType: 'increase' | 'decrease' };
    activeUsers: { count: number; growth: number; growthType: 'increase' | 'decrease' };
    pageViews: { count: number; growth: number; growthType: 'increase' | 'decrease' };
    publishedArticles: { count: number; growth: number; growthType: 'increase' | 'decrease' };
    totalUsers: number;
    totalCategories: number;
    totalComments: number;
    recentArticles: Array<{
      id: string;
      title: string;
      status: string;
      publishedAt: string | null;
      views: number;
      author: string;
      category: string;
    }>;
    systemStatus: {
      server: { status: string; uptime: string };
      database: { status: string; responseTime: string };
      cdn: { status: string; cacheHitRate: string };
      backup: { status: string; lastBackup: string };
    };
    recentActivity: Array<{
      id: number;
      type: string;
      message: string;
      timestamp: string;
      icon: string;
      color: string;
    }>;
    performanceMetrics: {
      siteSpeed: number;
      userEngagement: number;
      contentQuality: number;
      seoScore: number;
    };
  }> {
    return this.request('/stats');
  }

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{
    users: Array<{
      id: string;
      email: string;
      username: string;
      fullName: string;
      isAdmin: boolean;
      isVerified: boolean;
      createdAt: string;
      lastLoginAt: string | null;
      _count: {
        articles: number;
        comments: number;
        savedArticles: number;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async updateUser(id: string, data: {
    isAdmin?: boolean;
    isVerified?: boolean;
    fullName?: string;
    username?: string;
  }): Promise<ApiResponse<{ 
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      isAdmin: boolean;
      isVerified: boolean;
      updatedAt: string;
    };
  }>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Article Management
  async getArticles(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: 'published' | 'draft';
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    return this.request(`/articles${queryString ? `?${queryString}` : ''}`);
  }

  async updateArticle(id: string, data: {
    isPublished?: boolean;
    isFeatured?: boolean;
    isBreaking?: boolean;
    title?: string;
    summary?: string;
    categoryId?: string;
  }): Promise<ApiResponse<{ article: any }>> {
    return this.request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/articles/${id}`, {
      method: 'DELETE',
    });
  }

  // Category Management
  async getCategories(): Promise<{
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      color: string;
      icon: string | null;
      isActive: boolean;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
      _count: { articles: number };
    }>;
  }> {
    return this.request('/categories');
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    color: string;
    icon?: string;
    sortOrder?: number;
  }): Promise<ApiResponse<{ category: any }>> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ApiResponse<{ category: any }>> {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
}

// Singleton instance
export const adminClient = new AdminClient();

