// Database connection utility for NewsNerve
// Supports both local development and production

import { createClient } from '@supabase/supabase-js'

// Database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database tables interface
export interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  short_content?: string
  author: string
  source_name: string
  source_url?: string
  image_url?: string
  category_id: string
  published_at: string
  is_published: boolean
  is_featured: boolean
  reading_time: number
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  is_verified: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

// API functions
export const dbApi = {
  // Articles
  async getArticles(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug, color, icon)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  async getFeaturedArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug, color, icon)
      `)
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(5)
    
    return { data, error }
  },

  async getArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug, color, icon)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    
    return { data, error }
  },

  async searchArticles(query: string) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug, color, icon)
      `)
      .textSearch('title', query)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    
    return { data, error }
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    return { data, error }
  },

  async getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  },

  async getArticlesByCategory(categorySlug: string, limit = 20) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories!inner(name, slug, color, icon)
      `)
      .eq('categories.slug', categorySlug)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  // User interactions
  async incrementViewCount(articleId: string) {
    const { error } = await supabase
      .from('articles')
      .update({ 
        view_count: supabase.sql`view_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)
    
    return { error }
  },

  async likeArticle(articleId: string, userId: string) {
    // Add user interaction
    const { error: interactionError } = await supabase
      .from('user_interactions')
      .upsert({ 
        user_id: userId,
        article_id: articleId,
        interaction_type: 'like'
      })
    
    if (interactionError) return { error: interactionError }
    
    // Increment like count
    const { error } = await supabase
      .from('articles')
      .update({ 
        like_count: supabase.sql`like_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)
    
    return { error }
  },

  // Analytics
  async getPopularArticles(limit = 10) {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug, color, icon)
      `)
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  async getTrendingArticles() {
    // Articles with high engagement in last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(name, slug, color, icon)
      `)
      .eq('is_published', true)
      .gte('published_at', yesterday.toISOString())
      .order('view_count', { ascending: false })
      .limit(10)
    
    return { data, error }
  }
}

export default dbApi
