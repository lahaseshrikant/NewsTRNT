// Database connection helper for NewsTRNT with Neon
import { sql } from '@vercel/postgres';

// Article interface
export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  short_content?: string;
  author: string;
  source_name: string;
  image_url?: string;
  category_id: string;
  published_at: string;
  is_published: boolean;
  is_featured: boolean;
  reading_time: number;
  view_count: number;
  like_count: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
}

// Database API functions
export const db = {
  // Get all published articles
  async getArticles(limit = 20, offset = 0): Promise<Article[]> {
    try {
      const { rows } = await sql`
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.is_published = true
        ORDER BY a.published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows as Article[];
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },

  // Get featured articles for homepage
  async getFeaturedArticles(): Promise<Article[]> {
    try {
      const { rows } = await sql`
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.is_published = true AND a.is_featured = true
        ORDER BY a.published_at DESC
        LIMIT 5
      `;
      return rows as Article[];
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      return [];
    }
  },

  // Get article by slug
  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const { rows } = await sql`
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.slug = ${slug} AND a.is_published = true
        LIMIT 1
      `;
      return rows[0] as Article || null;
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      return null;
    }
  },

  // Search articles
  async searchArticles(query: string): Promise<Article[]> {
    try {
      const { rows } = await sql`
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.is_published = true
        AND (a.title ILIKE ${'%' + query + '%'} OR a.summary ILIKE ${'%' + query + '%'})
        ORDER BY a.published_at DESC
        LIMIT 50
      `;
      return rows as Article[];
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  },

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const { rows } = await sql`
        SELECT * FROM categories
        WHERE is_active = true
        ORDER BY sort_order
      `;
      return rows as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get articles by category
  async getArticlesByCategory(categorySlug: string, limit = 20): Promise<Article[]> {
    try {
      const { rows } = await sql`
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM articles a
        INNER JOIN categories c ON a.category_id = c.id
        WHERE c.slug = ${categorySlug} AND a.is_published = true
        ORDER BY a.published_at DESC
        LIMIT ${limit}
      `;
      return rows as Article[];
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      return [];
    }
  },

  // Get trending articles (most viewed recently)
  async getTrendingArticles(): Promise<Article[]> {
    try {
      const { rows } = await sql`
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.is_published = true
        AND a.published_at >= NOW() - INTERVAL '7 days'
        ORDER BY a.view_count DESC, a.like_count DESC
        LIMIT 10
      `;
      return rows as Article[];
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  },

  // Increment view count
  async incrementViewCount(articleId: string): Promise<boolean> {
    try {
      await sql`
        UPDATE articles 
        SET view_count = view_count + 1, updated_at = NOW()
        WHERE id = ${articleId}
      `;
      return true;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return false;
    }
  },

  // Get article statistics for admin
  async getArticleStats() {
    try {
      const { rows } = await sql`
        SELECT 
          COUNT(*) as total_articles,
          COUNT(*) FILTER (WHERE is_published = true) as published_articles,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_articles,
          AVG(view_count) as avg_views,
          SUM(view_count) as total_views
        FROM articles
      `;
      return rows[0];
    } catch (error) {
      console.error('Error fetching article stats:', error);
      return null;
    }
  }
};

export default db;
