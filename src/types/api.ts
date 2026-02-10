// API Response Types

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | ApiError;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  includeEmpty?: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  excerpt?: string;
  imageUrl?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    name: string;
  };
  published_at?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  views?: number;
  likes?: number;
  readingTime?: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  articleCount?: number;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role: 'user' | 'editor' | 'admin' | 'superadmin';
  avatar?: string;
  createdAt: string;
}
