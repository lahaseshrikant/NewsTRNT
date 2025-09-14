import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';

const router = Router();

// Simple UUID v4 format check (lenient – accepts any 36-char hex+hyphen pattern)
const looksLikeUUID = (id: string | undefined): boolean => !!id && /^[0-9a-fA-F-]{36}$/.test(id);

// Helper function to determine article status
const getArticleStatus = (publishedAt: Date | null, isPublished: boolean): string => {
  if (!isPublished) {
    return 'draft';
  }
  if (publishedAt && publishedAt > new Date()) {
    return 'scheduled';
  }
  return 'published';
};

// GET /api/articles/admin - Get all articles for admin (including drafts) - Admin only
router.get('/admin', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const {
      page = '1',
      limit = '20',
      category,
      status,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (category && category !== 'all') {
      where.category = {
        slug: category as string
      };
    }

    if (status && status !== 'all') {
      if (status === 'draft') {
        where.isPublished = false;
      } else if (status === 'published') {
        where.AND = [
          { isPublished: true },
          { publishedAt: { lte: new Date() } }
        ];
      } else if (status === 'scheduled') {
        where.AND = [
          { isPublished: true },
          { publishedAt: { gt: new Date() } }
        ];
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { summary: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get articles with relations
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

    // Get total count for pagination
    const total = await prisma.article.count({ where });

    // Transform the response
    const transformedArticles = articles.map(article => ({
      ...article,
      status: getArticleStatus(article.publishedAt, article.isPublished),
      author: article.createdByUser || { fullName: 'Unknown' },
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

// GET /api/articles/admin/drafts - Get draft articles for admin - Admin only
router.get('/admin/drafts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const {
      page = '1',
      limit = '20',
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Only get unpublished articles (drafts)
    const where: any = { isPublished: false };

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
      status: 'draft',
      author: article.createdByUser || { fullName: 'Unknown' },
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
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// POST /api/articles/admin - Create new article - Admin only
router.post('/admin', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const {
      title,
      content,
      summary,
      categoryId,
      imageUrl,
      tags = [],
      isPublished = false,
      publishedAt = null,
      isFeatured = false,
      isTrending = false,
      isBreaking = false
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    // Only set createdBy if the authenticated user exists in DB (avoid FK error when using dev fallback tokens)
    let createdByData: { createdBy?: string } = {};
    if (req.user?.id && looksLikeUUID(req.user.id)) {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true } });
      if (dbUser) {
        createdByData.createdBy = dbUser.id;
      } else {
        console.warn('[articles:create] Skipping createdBy – user id not found in DB:', req.user.id);
      }
    } else if (req.user?.id) {
      console.warn('[articles:create] Skipping createdBy – token user id not valid UUID:', req.user.id);
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        summary,
        categoryId,
        imageUrl,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        isFeatured,
        isTrending,
        isBreaking,
        ...createdByData,
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

    // Handle tags if provided
    if (tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        });

        if (!tag) {
          const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagSlug
            }
          });
        }

        // Create article-tag relationship
        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id
          }
        });
      }
    }

    const transformedArticle = {
      ...article,
      status: getArticleStatus(article.publishedAt, article.isPublished),
      author: article.createdByUser,
      tags: tags
    };

    res.status(201).json({
      success: true,
      article: transformedArticle
    });

  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// PUT /api/articles/admin/:id - Update article - Admin only
router.put('/admin/:id', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const {
      title,
      content,
      summary,
      categoryId,
      imageUrl,
      tags = [],
      isPublished = false,
      publishedAt = null,
      isFeatured = false,
      isTrending = false,
      isBreaking = false
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Update slug if title changed
    let slug = existingArticle.slug;
    if (existingArticle.title !== title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    // Guard updatedBy similar to createdBy
    let updatedByData: { updatedBy?: string } = {};
    if (req.user?.id && looksLikeUUID(req.user.id)) {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true } });
      if (dbUser) {
        updatedByData.updatedBy = dbUser.id;
      } else {
        console.warn('[articles:update] Skipping updatedBy – user id not found in DB:', req.user.id);
      }
    } else if (req.user?.id) {
      console.warn('[articles:update] Skipping updatedBy – token user id not valid UUID:', req.user.id);
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        summary,
        categoryId,
        imageUrl,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        isFeatured,
        isTrending,
        isBreaking,
        ...updatedByData,
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

    // Update tags - remove existing and add new ones
    await prisma.articleTag.deleteMany({
      where: { articleId: id }
    });

    if (tags.length > 0) {
      for (const tagName of tags) {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        });

        if (!tag) {
          const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagSlug
            }
          });
        }

        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id
          }
        });
      }
    }

    const transformedArticle = {
      ...article,
      status: getArticleStatus(article.publishedAt, article.isPublished),
      author: article.createdByUser,
      tags: tags
    };

    res.json({
      success: true,
      article: transformedArticle
    });

  } catch (error: any) {
    console.error('Error updating article:', error);
    const prismaCode = error?.code;
    if (prismaCode === 'P2003') {
      res.status(400).json({ error: 'Invalid user reference for updatedBy/createdBy (foreign key)' });
      return;
    }
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// GET /api/articles/admin/:id - Get single article by ID - Admin only
router.get('/admin/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
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

    const transformedArticle = {
      ...article,
      status: getArticleStatus(article.publishedAt, article.isPublished),
      author: article.createdByUser,
      tags: article.tags.map((articleTag: any) => articleTag.tag.name)
    };

    res.json({
      success: true,
      article: transformedArticle
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// DELETE /api/articles/admin/:id - Delete article - Admin only
router.delete('/admin/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Delete associated tags first
    await prisma.articleTag.deleteMany({
      where: { articleId: id }
    });

    // Delete the article
    await prisma.article.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// GET /api/articles - Get published articles for public (no auth required)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      category,
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
      publishedAt: { lte: new Date() }
    };

    if (category && category !== 'all') {
      where.category = {
        slug: category as string
      };
    }

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
      author: article.createdByUser || { fullName: 'Unknown' },
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

// GET /api/articles/:slug - Get single published article by slug (no auth required)
router.get('/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { 
        slug,
        isPublished: true,
        publishedAt: { lte: new Date() }
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

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    const transformedArticle = {
      ...article,
      status: 'published',
      author: article.createdByUser,
      tags: article.tags.map((articleTag: any) => articleTag.tag.name)
    };

    res.json({
      success: true,
      article: transformedArticle
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

export default router;