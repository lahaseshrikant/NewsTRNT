// Database connection utility for NewsNerve
import { createClient } from '@supabase/supabase-js'

// Supabase configuration (we'll use Neon instead for better PostgreSQL features)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// For now, let's create a simple database interface that works with any PostgreSQL
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
  category?: {
    name: string
    slug: string
    color: string
    icon?: string
  }
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

// Mock data API (we'll replace this with real database calls)
export const dbApi = {
  // Articles
  async getArticles(limit = 20, offset = 0): Promise<{ data: Article[] | null; error: any }> {
    // For now, return mock data with proper structure
    const mockArticles: Article[] = [
      {
        id: '1',
        title: 'AI Revolution Continues: New Breakthrough in Machine Learning',
        slug: 'ai-revolution-continues-new-breakthrough-machine-learning',
        summary: 'Researchers announce a major breakthrough in machine learning algorithms that could dramatically improve AI efficiency and real-world applications.',
        content: 'In a groundbreaking development that promises to accelerate the AI revolution, researchers have unveiled a new approach to machine learning...',
        author: 'Tech Reporter',
        source_name: 'NewsNerve Tech',
        source_url: 'https://example.com/ai-news',
        image_url: '/api/placeholder/800/400',
        category_id: 'tech-1',
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_published: true,
        is_featured: true,
        reading_time: 3,
        view_count: 1250,
        like_count: 89,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: {
          name: 'Technology',
          slug: 'technology',
          color: '#3182CE',
          icon: '💻'
        }
      },
      {
        id: '2',
        title: 'Global Climate Summit Reaches Historic Agreement',
        slug: 'global-climate-summit-reaches-historic-agreement',
        summary: 'World leaders sign historic climate agreement with ambitious carbon reduction targets at Global Climate Summit.',
        content: 'In a historic moment for environmental policy, world leaders at the Global Climate Summit have reached a comprehensive agreement...',
        author: 'Environmental Correspondent',
        source_name: 'NewsNerve World',
        source_url: 'https://example.com/climate-news',
        image_url: '/api/placeholder/800/400',
        category_id: 'world-1',
        published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        is_published: true,
        is_featured: false,
        reading_time: 4,
        view_count: 2100,
        like_count: 156,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: {
          name: 'World',
          slug: 'world',
          color: '#E53E3E',
          icon: '🌍'
        }
      },
      {
        id: '3',
        title: 'Market Rally Continues as Tech Stocks Surge',
        slug: 'market-rally-continues-tech-stocks-surge',
        summary: 'Technology stocks lead market gains as investors show confidence in AI and renewable energy sectors.',
        content: 'The stock market continued its upward trajectory today, with technology stocks leading the charge...',
        author: 'Business Reporter',
        source_name: 'NewsNerve Business',
        source_url: 'https://example.com/business-news',
        image_url: '/api/placeholder/800/400',
        category_id: 'business-1',
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        is_published: true,
        is_featured: false,
        reading_time: 2,
        view_count: 890,
        like_count: 67,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: {
          name: 'Business',
          slug: 'business',
          color: '#38A169',
          icon: '💼'
        }
      }
    ]

    return { data: mockArticles.slice(offset, offset + limit), error: null }
  },

  async getFeaturedArticles(): Promise<{ data: Article[] | null; error: any }> {
    const { data } = await this.getArticles(10, 0)
    const featured = data?.filter(article => article.is_featured) || []
    return { data: featured, error: null }
  },

  async getArticleBySlug(slug: string): Promise<{ data: Article | null; error: any }> {
    const { data } = await this.getArticles(100, 0)
    const article = data?.find(a => a.slug === slug) || null
    return { data: article, error: null }
  },

  async searchArticles(query: string): Promise<{ data: Article[] | null; error: any }> {
    const { data } = await this.getArticles(100, 0)
    const results = data?.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.summary.toLowerCase().includes(query.toLowerCase())
    ) || []
    return { data: results, error: null }
  },

  // Categories
  async getCategories(): Promise<{ data: Category[] | null; error: any }> {
    const mockCategories: Category[] = [
      {
        id: 'tech-1',
        name: 'Technology',
        slug: 'technology',
        description: 'Tech news, startups, and innovation',
        color: '#3182CE',
        icon: '💻',
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'world-1',
        name: 'World',
        slug: 'world',
        description: 'International news and global affairs',
        color: '#E53E3E',
        icon: '🌍',
        is_active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'business-1',
        name: 'Business',
        slug: 'business',
        description: 'Business news, markets, and economy',
        color: '#38A169',
        icon: '💼',
        is_active: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'politics-1',
        name: 'Politics',
        slug: 'politics',
        description: 'Political news and government affairs',
        color: '#E53E3E',
        icon: '🏛️',
        is_active: true,
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'sports-1',
        name: 'Sports',
        slug: 'sports',
        description: 'Sports news and updates',
        color: '#D69E2E',
        icon: '⚽',
        is_active: true,
        sort_order: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'health-1',
        name: 'Health',
        slug: 'health',
        description: 'Health and medical news',
        color: '#ED8936',
        icon: '🏥',
        is_active: true,
        sort_order: 6,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    return { data: mockCategories, error: null }
  },

  async getCategoryBySlug(slug: string): Promise<{ data: Category | null; error: any }> {
    const { data } = await this.getCategories()
    const category = data?.find(c => c.slug === slug) || null
    return { data: category, error: null }
  },

  async getArticlesByCategory(categorySlug: string, limit = 20): Promise<{ data: Article[] | null; error: any }> {
    const { data } = await this.getArticles(100, 0)
    const results = data?.filter(article => article.category?.slug === categorySlug) || []
    return { data: results.slice(0, limit), error: null }
  },

  // User interactions
  async incrementViewCount(articleId: string): Promise<{ error: any }> {
    // Mock implementation - in real database this would update the count
    console.log(`Incrementing view count for article: ${articleId}`)
    return { error: null }
  },

  async likeArticle(articleId: string, userId: string): Promise<{ error: any }> {
    // Mock implementation - in real database this would track the like
    console.log(`User ${userId} liked article: ${articleId}`)
    return { error: null }
  },

  // Analytics
  async getPopularArticles(limit = 10): Promise<{ data: Article[] | null; error: any }> {
    const { data } = await this.getArticles(50, 0)
    const sorted = data?.sort((a, b) => b.view_count - a.view_count) || []
    return { data: sorted.slice(0, limit), error: null }
  },

  async getTrendingArticles(): Promise<{ data: Article[] | null; error: any }> {
    // Mock trending logic - articles with high engagement in last 24 hours
    const { data } = await this.getArticles(20, 0)
    const trending = data?.sort((a, b) => 
      (b.view_count + b.like_count * 10) - (a.view_count + a.like_count * 10)
    ) || []
    return { data: trending.slice(0, 10), error: null }
  }
}

export default dbApi
