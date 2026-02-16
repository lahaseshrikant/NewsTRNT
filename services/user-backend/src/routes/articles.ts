import { Router } from 'express';
import prisma from '../config/database';
import { optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';

const router = Router();

// ============================================================================
// USER-FACING ROUTES ONLY â€” All admin/CMS routes are in admin-backend
// ============================================================================

// GET /api/articles - Get published articles for public (no auth required)
// GET /api/articles - Get published articles for public (no auth required)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      category,
      contentType,
      isBreaking,
      isFeatured,
      isTrending,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Only show published articles that are not scheduled
    const where: any = {
      isPublished: true,
      publishedAt: { lte: new Date() },
      isDeleted: false
    };

    // Filter by content type
    if (contentType) {
      where.contentType = contentType as string;
    }

    // Filter by category
    if (category && category !== 'all') {
      where.category = {
        slug: category as string
      };
    }

    // Filter by breaking news
    if (isBreaking !== undefined) {
      where.isBreaking = isBreaking === 'true';
    }

    // Filter by featured
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    // Filter by trending
    if (isTrending !== undefined) {
      where.isTrending = isTrending === 'true';
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { summary: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy as string]: sortOrder
      },
      skip,
      take: limitNum
    });

    const total = await prisma.article.count({ where });

    const transformedArticles = articles.map(article => ({
      ...article,
      status: 'published',
      author: article.createdByUser?.fullName || article.author || 'Unknown',
      authorType: article.authorType || 'staff',
      contentType: article.contentType || 'article',
      tags: article.tags.map((articleTag: any) => articleTag.tag.name)
    }));

    res.json({
      success: true,
      articles: transformedArticles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/type/:contentType - Get articles by content type (public)
router.get('/type/:contentType', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { contentType } = req.params;
    const {
      page = '1',
      limit = '20',
      category
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      contentType,
      isDeleted: false,
      isPublished: true,
      publishedAt: { lte: new Date() }
    };

    // Optional category filter
    if (category && category !== 'all') {
      where.category = {
        slug: category as string
      };
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        // createdByUser: {
        //   select: {
        //     id: true,
        //     fullName: true
        //   }
        // }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limitNum
    });

    const total = await prisma.article.count({ where });

    const transformedArticles = articles.map(article => ({
      ...article,
      status: 'published',
      author: article.author || 'NewsTRNT Staff',
      authorType: article.authorType || 'staff',
      contentType: article.contentType || 'article'
    }));

    res.json({
      success: true,
      articles: transformedArticles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching articles by content type:', error);
    res.status(500).json({ error: 'Failed to fetch articles by content type' });
  }
});

// GET /api/articles/category/:slug - Get articles by category (public)
router.get('/category/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const {
      limit = '20',
      contentType
    } = req.query;

    const limitNum = parseInt(limit as string);

    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      res.json({
        success: true,
        articles: []
      });
      return;
    }

    // Build where clause
    const where: any = {
      categoryId: category.id,
      isDeleted: false,
      isPublished: true,
      publishedAt: { lte: new Date() }
    };

    if (contentType && contentType !== 'all') {
      where.contentType = contentType as string;
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limitNum
    });

    const transformedArticles = articles.map(article => ({
      ...article,
      status: 'published',
      author: article.createdByUser?.fullName || article.author || 'NewsTRNT Staff',
      authorType: article.authorType || 'staff',
      contentType: article.contentType || 'article',
      tags: article.tags.map(at => at.tag)
    }));

    res.json(transformedArticles);

  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({ error: 'Failed to fetch articles by category' });
  }
});

// GET /api/articles/search - Search articles (public)
router.get('/search', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      q = '',
      limit = '20',
      contentType
    } = req.query;

    const limitNum = parseInt(limit as string);
    const searchQuery = (q as string).trim();

    if (!searchQuery) {
      res.json({
        success: true,
        articles: []
      });
      return;
    }

    // Build where clause
    const where: any = {
      isDeleted: false,
      isPublished: true,
      publishedAt: { lte: new Date() },
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { content: { contains: searchQuery, mode: 'insensitive' } },
        { summary: { contains: searchQuery, mode: 'insensitive' } }
      ]
    };

    if (contentType && contentType !== 'all') {
      where.contentType = contentType as string;
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limitNum
    });

    const transformedArticles = articles.map(article => ({
      ...article,
      status: 'published',
      author: article.createdByUser?.fullName || article.author || 'NewsTRNT Staff',
      authorType: article.authorType || 'staff',
      contentType: article.contentType || 'article'
    }));

    res.json(transformedArticles);

  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Failed to search articles' });
  }
});

// GET /api/articles/:slug - Get single published article by slug (no auth required)
router.get('/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findFirst({
      where: { 
        slug,
        isPublished: true,
        publishedAt: { lte: new Date() },
        isDeleted: false
      },
      include: {
        category: true,
        createdByUser: { 
          select: { 
            id: true, 
            fullName: true 
          } 
        },
        tags: {
          include: {
            tag: { 
              select: { 
                name: true 
              } 
            }
          }
        }
      }
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Increment view count (non-fatal: log error but still return article)
    try {
      await prisma.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } }
      });
    } catch (incErr) {
      console.error('Failed to increment viewCount for article', article.id, incErr);
    }

    const transformedArticle = {
      ...article,
      status: 'published',
      author: article.author || article.createdByUser?.fullName || 'NewsTRNT Staff',
      tags: Array.isArray(article.tags) ? article.tags.map((articleTag: any) => articleTag.tag?.name).filter(Boolean) : [],
      views: (typeof article.viewCount === 'number' ? article.viewCount : 0) + 1
    };

    res.json({
      success: true,
      article: transformedArticle
    });

  } catch (error: any) {
    console.error('Error fetching article:', error?.stack || error);
    const payload: any = { error: 'Failed to fetch article' };
    if (process.env.NODE_ENV !== 'production') payload.details = error?.message || String(error);
    res.status(500).json(payload);
  }
});

export default router;
