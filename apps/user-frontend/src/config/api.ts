// API Configuration for secure backend communication
// This ensures frontend NEVER touches database directly

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

export const API_CONFIG: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  retries: 3
};

// Development-time validations to catch SSR vs client env mismatches early
if (process.env.NODE_ENV === 'development') {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    // helpful reminder for devs who forget to set .env.local
    // (NEXT_PUBLIC_* is injected at build/start time for Next.js)
    // eslint-disable-next-line no-console
    console.warn('[API_CONFIG] NEXT_PUBLIC_API_URL is not set — using fallback', API_CONFIG.baseURL);
  } else {
    // common mistake: admin-frontend env accidentally used for user-frontend
    if (raw.includes('localhost') && raw.includes(':5002')) {
      // eslint-disable-next-line no-console
      console.warn('[API_CONFIG] NEXT_PUBLIC_API_URL looks like admin-backend (port 5002). For user-frontend use http://localhost:5000/api');
    }
    if (!raw.endsWith('/api')) {
      // eslint-disable-next-line no-console
      console.warn('[API_CONFIG] NEXT_PUBLIC_API_URL should include the `/api` suffix for correct routing (current=', raw, ')');
    }
  }
}

// API endpoints - centralized and type-safe (reader-facing only)
export const API_ENDPOINTS = {
  // User Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  
  // Articles (public read)
  ARTICLES: {
    LIST: '/articles',
    GET: (slug: string) => `/articles/${slug}`,
    TRENDING: '/articles/trending',
    LATEST: '/articles/latest',
    BY_CATEGORY: (slug: string) => `/articles/category/${slug}`,
    SEARCH: '/articles/search',
  },
  
  // Categories (public read)
  CATEGORIES: {
    LIST: '/categories',
    GET: (slug: string) => `/categories/${slug}`,
  },
  
  // Web Stories (public read)
  WEBSTORIES: {
    LIST: '/webstories',
    GET: (id: string) => `/webstories/${id}`,
  },

  // Market Data (backend-only — user never calls third-party APIs)
  MARKET: {
    INDICES: '/market/indices',
    CRYPTO: '/market/crypto',
    CURRENCIES: '/market/currencies',
    COMMODITIES: '/market/commodities',
    COUNTRY: (code: string) => `/market/country/${code}`,
  },
  
  // User-specific
  USER: {
    PREFERENCES: '/user-preferences',
    SAVED: '/user-preferences/saved',
    COMMENTS: '/comments',
  },

  // Health
  HEALTH: '/health',
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