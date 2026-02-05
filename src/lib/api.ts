// Secure API service layer for article management - NO DEVELOPMENT BYPASSES
import RBACAuth from './rbac-auth';

// --------------------------------------------------------------
// Unified API base URL logic
// Ensures a single canonical base, always ending with /api
// Adds dev fallback probing (5000,5001,5002) if primary target unreachable.
// --------------------------------------------------------------
const rawEnv = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const primaryBase = rawEnv.endsWith('/api') ? rawEnv : `${rawEnv}/api`;

let cachedWorkingBase: string | null = null;

async function probeBase(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${url}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function resolveApiBase(): Promise<string> {
  if (cachedWorkingBase) return cachedWorkingBase;
  // In production just trust the env variable
  if (process.env.NODE_ENV === 'production') {
    cachedWorkingBase = primaryBase;
    return cachedWorkingBase;
  }
  // Development probing sequence
  const candidates = [primaryBase, 'http://localhost:5000/api', 'http://localhost:5001/api', 'http://localhost:5002/api']
    .filter((v, i, arr) => arr.indexOf(v) === i); // de-duplicate

  for (const base of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await probeBase(base);
    if (ok) {
      console.info(`✅ API base resolved: ${base}`);
      cachedWorkingBase = base;
      return base;
    } else {
      console.warn(`⚠️ API base probe failed: ${base}`);
    }
  }
  console.error('❌ No reachable API base found. Using primary (may fail):', primaryBase);
  cachedWorkingBase = primaryBase;
  return primaryBase;
}

// Lazy promise so concurrent requests reuse resolution
let basePromise: Promise<string> | null = null;
function getApiBasePromise() {
  if (!basePromise) basePromise = resolveApiBase();
  return basePromise;
}

// Simple fallback that doesn't require server-side execution
function getApiBaseFallback(): string {
  return primaryBase;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  summary: string | null;
  author: { fullName: string } | null;
  category: { id: string; name: string; slug: string } | null;
  tags: string[];
  imageUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBreaking: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'scheduled';
}

export interface CreateArticleData {
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
}

export interface UpdateArticleData extends CreateArticleData {
  id: string;
}

export interface ArticleListResponse {
  success: boolean;
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ArticleResponse {
  success: boolean;
  article: Article;
}

class ArticleAPI {
  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private getAuthToken(): string | null {
    // Use the new RBAC auth system
    return RBACAuth.getAuthToken();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let base: string;
    try {
      // Only do probing in browser environment
      if (typeof window !== 'undefined') {
        base = await getApiBasePromise();
      } else {
        // Server-side: use simple fallback to avoid crashes
        base = getApiBaseFallback();
      }
    } catch (error) {
      console.warn('API base resolution failed, using fallback:', error);
      base = getApiBaseFallback();
    }
    
    const url = `${base}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        // Provide targeted guidance
        if (response.status >= 500) {
          errorMessage += ` | Server error. Verify backend at ${base}.`;
        } else if (response.status === 404) {
          errorMessage += ` | Endpoint not found: ${endpoint}. Check route on backend.`;
        } else if (response.status === 401) {
          errorMessage += ' | Unauthorized. Re-authenticate or refresh credentials.';
        }

        throw new Error(`API Error: ${errorMessage}`);
      }

      return response.json();
    } catch (err: any) {
      if (err?.name === 'TypeError' && /fetch/i.test(err.message)) {
        throw new Error(`Network Failure: Could not reach backend at ${base}.\n` +
          'Troubleshooting:\n' +
          '- Is the Express/API server running?\n' +
          `- Does NEXT_PUBLIC_API_URL match the running port (current: ${process.env.NEXT_PUBLIC_API_URL || 'unset'})?\n` +
          '- Any CORS errors in browser devtools?\n' +
          '- Mixed content? (HTTPS frontend calling HTTP backend).');
      }
      throw err;
    }
  }

  // All admin endpoints require authentication
  async getArticles(params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.makeRequest<ArticleListResponse>(`/articles/admin${queryString ? '?' + queryString : ''}`);
  }

  async getDrafts(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.makeRequest<ArticleListResponse>(`/articles/admin/drafts${queryString ? '?' + queryString : ''}`);
  }

  async getArticle(id: string): Promise<ArticleResponse> {
    return this.makeRequest<ArticleResponse>(`/articles/admin/${id}`);
  }

  async createArticle(data: CreateArticleData): Promise<ArticleResponse> {
    return this.makeRequest<ArticleResponse>('/articles/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: string, data: Partial<CreateArticleData>): Promise<ArticleResponse> {
    return this.makeRequest<ArticleResponse>(`/articles/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/articles/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // Public endpoints (no auth required)
  async getPublishedArticles(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.makeRequest<ArticleListResponse>(`/articles${queryString ? '?' + queryString : ''}`);
  }

  async getPublishedArticleBySlug(slug: string): Promise<ArticleResponse> {
    return this.makeRequest<ArticleResponse>(`/articles/${slug}`);
  }
}

export const articleAPI = new ArticleAPI();