import { API_CONFIG, HTTP_STATUS } from '@/config/api';
import { 
  ApiResponse, 
  Article, 
  Category,
  ListResponse,
  ArticleListParams,
  CategoryListParams 
} from '@/types/api';

class SecureApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Get authentication headers
   * Only includes JWT token, never database credentials
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get JWT token from secure storage (never database credentials)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Make secure API request - NEVER accesses database directly
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      // Security: No database credentials ever sent
      mode: 'cors',
      credentials: 'include', // For secure cookie handling
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.error || 'Request failed',
            code: data.code,
            details: data.details,
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // HTTP Methods - All route through secure backend API
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file securely through backend API
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
        ...this.getAuthHeaders(),
        'Content-Type': undefined as any,
      },
    });
  }
}

// Export singleton instance
export const apiClient = new SecureApiClient();

// Export typed API methods for better DX
export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    getMe: () => apiClient.get('/auth/me'),
  },

  // Articles
  articles: {
    list: (params?: ArticleListParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
      ).toString()}` : '';
      return apiClient.get<ListResponse<Article>>(`/articles/admin${query}`);
    },
    getPublic: (params?: ArticleListParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
      ).toString()}` : '';
      return apiClient.get<ListResponse<Article>>(`/articles${query}`);
    },
    create: (data: any) => apiClient.post('/articles/admin', data),
    update: (id: string, data: any) => apiClient.put(`/articles/admin/${id}`, data),
    delete: (id: string, permanent = false) => 
      apiClient.delete(`/articles/admin/${id}${permanent ? '?permanent=true' : ''}`),
    restore: (id: string) => apiClient.post(`/articles/admin/${id}/restore`),
    getTrash: () => apiClient.get('/articles/admin/trash'),
  },

  // Categories
  categories: {
    list: (params?: CategoryListParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
      ).toString()}` : '';
      return apiClient.get<ListResponse<Category>>(`/categories${query}`);
    },
    create: (data: any) => apiClient.post('/categories', data),
    update: (id: string, data: any) => apiClient.put(`/categories/${id}`, data),
    delete: (id: string, permanent = false) => 
      apiClient.delete(`/categories/${id}${permanent ? '?permanent=true' : ''}`),
    restore: (id: string) => apiClient.post(`/categories/${id}/restore`),
    getTrash: () => apiClient.get('/categories/trash'),
  },

  // Web Stories
  webstories: {
    list: (params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return apiClient.get(`/webstories/admin${query}`);
    },
    getDrafts: (params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return apiClient.get(`/webstories/admin/drafts${query}`);
    },
    create: (data: any) => apiClient.post('/webstories/admin', data),
    update: (id: string, data: any) => apiClient.put(`/webstories/admin/${id}`, data),
    delete: (id: string, permanent = false) => 
      apiClient.delete(`/webstories/admin/${id}${permanent ? '?permanent=true' : ''}`),
    restore: (id: string) => apiClient.post(`/webstories/admin/${id}/restore`),
    getTrash: () => apiClient.get('/webstories/admin/trash'),
  },

  // Admin
  admin: {
    getStats: () => apiClient.get('/admin/stats'),
    health: () => apiClient.get('/health'),
  },
};

export default api;