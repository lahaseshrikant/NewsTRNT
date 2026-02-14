import { Router } from 'express';
import prisma from '../config/database';
import { optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';

const router = Router();

// ============================================================================
// USER-FACING ROUTES ONLY - All admin/CMS routes are in admin-backend
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const { 
      includeStats = 'false', 
      includeInactive = 'false',
      includeDeleted = 'false'
    } = req.query;
    
    const categories = await prisma.category.findMany({
      where: {
        // Filter by soft delete status
        ...(includeDeleted !== 'true' && { isDeleted: false }),
        // Only filter by isActive if includeInactive is not true
        ...(includeInactive !== 'true' && { isActive: true })
      },
      orderBy: {
        sortOrder: 'asc'
      },
      ...(includeStats === 'true' && {
        include: {
          subCategories: {
            where: {
              isDeleted: false,
              isActive: true
            },
            orderBy: {
              sortOrder: 'asc'
            }
          },
          _count: {
            select: {
              articles: {
                where: {
                  isDeleted: false // Only count non-deleted articles
                }
              }
            }
          }
        }
      })
    });

    const transformedCategories = categories.map((category: any) => ({
      ...category,
      ...(includeStats === 'true' && {
        articleCount: category._count?.articles || 0
      })
    }));

    return res.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug/info - Get category info only (without articles)
router.get('/:slug/info', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { 
        slug,
        isDeleted: false,
        isActive: true
      },
      include: {
        subCategories: {
          where: {
            isDeleted: false,
            isActive: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json(category);

  } catch (error) {
    console.error('Error fetching category info:', error);
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// GET /api/categories/:slug - Get single category with articles
router.get('/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const {
      page = '1',
      limit = '20',
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          categoryId: category.id,
          isPublished: true
        },
        skip,
        take: limitNum,
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
              fullName: true,
              avatarUrl: true
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
          _count: {
            select: {
              comments: true,
              savedByUsers: true,
              interactions: true
            }
          }
        },
        orderBy: {
          [sortBy as string]: sortOrder as string
        }
      }),
      prisma.article.count({
        where: {
          categoryId: category.id,
          isPublished: true
        }
      })
    ]);

    const transformedArticles = articles.map((article: any) => ({
      ...article,
      author: article.createdByUser,
      tags: article.tags.map((t: any) => t.tag),
      commentCount: article._count.comments,
      saveCount: article._count.savedByUsers,
      interactionCount: article._count.interactions
    }));

    return res.json({
      category,
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
    console.error('Error fetching category:', error);
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;
