// API Configuration for secure backend communication
// This ensures frontend NEVER touches database directly

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

export const API_CONFIG: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  timeout: 30000, // 30 seconds
  retries: 3
};

// API endpoints - centralized and type-safe
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/admin/login',
    LOGOUT: '/auth/admin/logout',
    REGISTER: '/auth/register',
    ME: '/auth/admin/me',
    VERIFY: '/auth/admin/verify',
    REFRESH: '/auth/refresh',
    CREATE_ADMIN: '/auth/admin/create',
  },
  
  // Articles
  ARTICLES: {
    LIST: '/articles/admin',
    CREATE: '/articles/admin',
    UPDATE: (id: string) => `/articles/admin/${id}`,
    DELETE: (id: string) => `/articles/admin/${id}`,
    TRASH: '/articles/admin/trash',
    RESTORE: (id: string) => `/articles/admin/${id}/restore`,
    DRAFTS: '/articles/admin/drafts',
    PUBLISHED: '/articles/admin/published'
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
    TRASH: '/categories/trash',
    RESTORE: (id: string) => `/categories/${id}/restore`
  },
  
  // Web Stories
  WEBSTORIES: {
    LIST: '/webstories/admin',
    CREATE: '/webstories/admin',
    UPDATE: (id: string) => `/webstories/admin/${id}`,
    DELETE: (id: string) => `/webstories/admin/${id}`,
    TRASH: '/webstories/admin/trash',
    RESTORE: (id: string) => `/webstories/admin/${id}/restore`
  },
  
  // Admin
  ADMIN: {
    STATS: '/stats',
    HEALTH: '/health'
  }
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
  timestamp: string;
}

