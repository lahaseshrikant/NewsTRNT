import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';
import Security from '../lib/security';

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
      sortOrder = 'desc',
      contentType
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      isDeleted: false // Only show non-deleted articles by default
    };

    // Filter by content type
    if (contentType && contentType !== 'all') {
      where.contentType = contentType as string;
    }

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

    // Map frontend sort fields to actual Prisma fields
    const sortFieldMap: Record<string, string> = {
      'date': 'updatedAt',
      'title': 'title',
      'views': 'viewCount',
      'status': 'isPublished'
    };
    
    const actualSortField = sortFieldMap[sortBy as string] || 'updatedAt';

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
        [actualSortField]: sortOrder
      },
      skip,
      take: limitNum
    });

    // Get total count for pagination
    const total = await prisma.article.count({ where });

    // Transform the response
    const transformedArticles = articles.map((article: any) => ({
      ...article,
      status: getArticleStatus(article.publishedAt, article.isPublished),
      author: article.createdByUser || { fullName: 'Unknown' },
      tags: article.tags.map((articleTag: any) => articleTag.tag.name),
      contentType: article.contentType || 'article',
      authorType: article.authorType || 'staff'
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

    // Map frontend sort fields to actual Prisma fields (for drafts route)
    const sortFieldMap: Record<string, string> = {
      'date': 'updatedAt',
      'title': 'title', 
      'views': 'viewCount',
      'status': 'isPublished'
    };
    
    const actualSortField = sortFieldMap[sortBy as string] || 'updatedAt';

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
        [actualSortField]: sortOrder
      },
      skip,
      take: limitNum
    });

    const total = await prisma.article.count({ where });

    const transformedArticles = articles.map((article: any) => ({
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
      subCategoryId,
      imageUrl,
      tags = [],
      isPublished = false,
      publishedAt = null,
      isFeatured = false,
      isTrending = false,
      isBreaking = false,
      contentType = 'article',
      authorType = 'staff',
      author,
      shortContent
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
        content: content ? Security.sanitizeHTML(content) : content,
        summary,
        categoryId,
        subCategoryId,
        imageUrl,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        isFeatured,
        isTrending,
        isBreaking,
        contentType,
        authorType,
        author,
        shortContent,
        ...createdByData,
      },
      include: {
        category: true,
        subCategory: true,
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
      isBreaking = false,
      contentType,
      authorType,
      author,
      shortContent
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
        content: content ? Security.sanitizeHTML(content) : content,
        summary,
        categoryId,
        imageUrl,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        isFeatured,
        isTrending,
        isBreaking,
        ...(contentType !== undefined && { contentType }),
        ...(authorType !== undefined && { authorType }),
        ...(author !== undefined && { author }),
        ...(shortContent !== undefined && { shortContent }),
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
    // More verbose logging for debugging — includes stack and request context in dev
    console.error('Error updating article:', {
      message: error?.message ?? String(error),
      stack: error?.stack,
      articleId: id,
      bodyPreview: {
        title: title?.slice?.(0, 120),
        categoryId,
        tags: Array.isArray(tags) ? tags.slice(0, 10) : tags
      }
    });

    const prismaCode = error?.code;
    if (prismaCode === 'P2003') {
      res.status(400).json({ error: 'Invalid user reference for updatedBy/createdBy (foreign key)' });
      return;
    }

    const devMsg = process.env.NODE_ENV !== 'production' ? ` | ${error?.message ?? 'internal'}` : '';
    res.status(500).json({ error: `Failed to update article${devMsg}` });
  }
});

// GET /api/articles/admin/trash - Get soft deleted articles (Admin only)
router.get('/admin/trash', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const {
      page = '1',
      limit = '20',
      category,
      search,
      sortBy = 'deletedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for deleted articles
    const where: any = {
      isDeleted: true
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

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
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
          }
        },
        orderBy: {
          [sortBy as string]: sortOrder as string
        }
      }),
      prisma.article.count({ where })
    ]);

    const transformedArticles = articles.map((article: any) => ({
      ...article,
      author: article.createdByUser,
      tags: article.tags.map((t: any) => t.tag),
      status: getArticleStatus(article.publishedAt, article.isPublished),
      wordCount: article.content ? article.content.split(' ').filter((word: string) => word.length > 0).length : 0
    }));

    res.json({
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
    console.error('Error fetching deleted articles:', error);
    res.status(500).json({ error: 'Failed to fetch deleted articles' });
  }
});

// POST /api/articles/admin/:id/restore - Restore soft deleted article (Admin only)
router.post('/admin/:id/restore', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    if (!article.isDeleted) {
      res.status(400).json({ error: 'Article is not deleted' });
      return;
    }

    const restoredArticle = await prisma.article.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      }
    });

    res.json({ 
      success: true,
      message: 'Article restored successfully',
      article: restoredArticle
    });
  } catch (error) {
    console.error('Error restoring article:', error);
    res.status(500).json({ error: 'Failed to restore article' });
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
    const { permanent = 'false' } = req.query;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    if (permanent === 'true') {
      // Permanent deletion
      await prisma.articleTag.deleteMany({
        where: { articleId: id }
      });

      await prisma.article.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Article permanently deleted successfully'
      });
    } else {
      // Soft delete
      const updatedArticle = await prisma.article.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id
        }
      });

      res.json({
        success: true,
        message: 'Article moved to trash successfully',
        article: updatedArticle
      });
    }

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

    const transformedArticles = articles.map((article: any) => ({
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
      skip,
      take: limitNum
    });

    const total = await prisma.article.count({ where });

    const transformedArticles = articles.map((article: any) => ({
      ...article,
      status: 'published',
      author: article.createdByUser?.fullName || article.author || 'NewsTRNT Staff',
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

    const transformedArticles = articles.map((article: any) => ({
      ...article,
      status: 'published',
      author: article.createdByUser?.fullName || article.author || 'NewsTRNT Staff',
      authorType: article.authorType || 'staff',
      contentType: article.contentType || 'article',
      tags: article.tags.map((at: any) => at.tag)
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

    const transformedArticles = articles.map((article: any) => ({
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

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    const transformedArticle = {
      ...article,
      status: 'published',
      author: article.author || article.createdByUser?.fullName || 'NewsTRNT Staff',
      tags: article.tags.map((articleTag: any) => articleTag.tag.name),
      views: article.viewCount + 1
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

// ═════════════════════════════════════════════════════════════════════════════
// CONTENT ENGINE INGEST / SCRAPED ARTICLE SUPPORT
// ═════════════════════════════════════════════════════════════════════════════

// helper to check whether scraped items should be promoted automatically
async function isAutoPromoteEnabled(): Promise<boolean> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'scraped_auto_promote' },
    });
    if (setting && typeof setting.value === 'boolean') {
      return setting.value;
    }
  } catch (err) {
    console.error('[Scraped] failed to read auto‑promote setting', err);
  }
  return false;
}

// dispatcher for promoting based on type
async function promoteScrapedItem(item: any) {
  switch (item.itemType) {
    case 'article':
      await promoteScrapedArticle(item.payload);
      break;
    // other types can be added here, e.g. 'webstory', 'newsletter', etc.
    default:
      console.warn('[Scraped] unknown itemType during promotion:', item.itemType);
  }
}

// article-specific promotion helper (unchanged)
async function promoteScrapedArticle(scraped: any) {
  // build the same payload used by the old ingest logic
  const slug = scraped.slug || scraped.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 200) + '-' + Date.now();

  // resolve category if necessary
  let categoryId: string | null = scraped.categoryId || null;
  if (scraped.categorySlug || scraped.category) {
    const catSlug = (scraped.categorySlug || scraped.category)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const cat = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: catSlug },
          { name: { equals: scraped.categorySlug || scraped.category, mode: 'insensitive' } },
        ],
      },
    });
    categoryId = cat?.id || categoryId;
  }

  const articleData: any = {
    title: scraped.title,
    summary: scraped.summary || scraped.shortContent || null,
    content: scraped.content ? Security.sanitizeHTML(scraped.content) : null,
    shortContent: scraped.shortContent || scraped.summary || null,
    excerpt: scraped.excerpt || (scraped.summary || '').slice(0, 200) || null,
    author: scraped.author || scraped.sourceName || 'Content Engine',
    sourceName: scraped.sourceName || null,
    sourceUrl: scraped.sourceUrl || null,
    imageUrl: scraped.imageUrl || null,
    categoryId,
    publishedAt: scraped.publishedAt ? new Date(scraped.publishedAt) : new Date(),
    isPublished: false, // always start unpublished; approval implies publication
    isFeatured: scraped.isFeatured ?? false,
    isTrending: scraped.isTrending ?? false,
    isBreaking: scraped.isBreaking ?? false,
    contentType: scraped.contentType || 'news',
    authorType: scraped.authorType || 'ai',
    aiGenerated: true,
    aiSummary: !!(scraped.summary || scraped.shortContent),
    aiMetadata: scraped.aiMetadata || {},
    seoTitle: scraped.seoTitle || scraped.title,
    seoDescription: scraped.seoDescription || scraped.summary?.slice(0, 160) || null,
    seoKeywords: scraped.seoKeywords || [],
    is_original: false,
    news_source: scraped.sourceName || 'content-engine',
    priority: scraped.priority || 'normal',
    readingTime: scraped.readingTime || Math.ceil((scraped.content || '').split(/\s+/).length / 200) || 1,
  };

  const existing = await prisma.article.findUnique({ where: { slug } });
  let articleId: string;
  if (existing) {
    await prisma.article.update({ where: { id: existing.id }, data: { ...articleData, slug: existing.slug } });
    articleId = existing.id;
  } else {
    const newArt = await prisma.article.create({ data: { ...articleData, slug } });
    articleId = newArt.id;
  }

  // transfer tags (stored as json array)
  const tags: string[] = scraped.tags || [];
  for (const tagName of tags.slice(0, 10)) {
    try {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!tagSlug) continue;
      let tag = await prisma.tag.findUnique({ where: { name: tagName } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
      }
      await prisma.articleTag.create({ data: { articleId, tagId: tag.id } }).catch(() => {});
    } catch {}
  }

  // mark scraped copy approved/promoted
  await prisma.scrapedArticle.update({
    where: { id: scraped.id },
    data: { isApproved: true, approvedAt: new Date(), approvedBy: 'system' },
  });
}


/**
 * POST /api/articles/ingest
 *
 * Bulk-ingest articles sent by the Content Engine service.
 * In order to support manual review/approval the incoming items are written to a
 * dedicated `scraped_articles` table rather than the live `articles` table.  The
 * admin dashboard may choose to automatically promote (copy + transform) these
 * records based on a system setting (`scraped_auto_promote`); otherwise editors
 * can inspect and approve individual items via the new admin endpoints.
 *
 * Auth: Bearer token matching CONTENT_ENGINE_API_KEY env var, OR valid admin JWT.
 *
 * Body: { articles: Array<ArticlePayload>, pipelineRunId?: string }
 *
 * Each ArticlePayload should contain at minimum: title, content/summary, sourceUrl.
 * Optional: category (slug), tags[], imageUrl, sentiment, seoTitle, seoDescription,
 *           seoKeywords[], aiMetadata, publishedAt, sourceName, author, priority.
 *
 * Duplicate detection: upserts by matching slug (generated from title).
 * Returns: { success, inserted, updated, failed, errors[] }
 */
router.post('/ingest', async (req: AuthRequest, res) => {
  // ── Auth: API key OR admin JWT ──────────────────────────────────────────
  const authHeader = req.headers.authorization;
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const engineKey = process.env.CONTENT_ENGINE_API_KEY || process.env.MARKET_INGEST_API_KEY;

  if (!req.user?.isAdmin && bearerKey !== engineKey) {
    res.status(401).json({ success: false, error: 'Unauthorized — valid API key or admin token required' });
    return;
  }

  const { items, pipelineRunId } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: '`items` array is required and must not be empty' });
    return;
  }

  // log the pipeline run
  const run = await prisma.scraperRun.create({
    data: {
      scraperName: 'content-engine',
      dataType: 'articles', // still articles in metadata for compatibility
      status: 'running',
      itemsFound: items.length,
      metadata: { pipelineRunId: pipelineRunId || null },
    },
  });

  let inserted = 0;
  let updated = 0;
  let failed = 0;
  const errors: { index: number; type?: string; error: string }[] = [];

  const autoPromote = await isAutoPromoteEnabled();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      if (!item.title) throw new Error('title is required');

      // determine type (default article)
      const type = item.itemType || 'article';

      // build payload: keep everything except control fields
      const payload = { ...item };
      delete payload.itemType;

      // store raw in generic table
      const existing = await prisma.scrapedItem.findFirst({
        where: {
          itemType: type,
          payload: payload, // this may not work for JSON comparison; you could match on slug sourced separately
        },
      });
      let row;
      if (existing) {
        row = await prisma.scrapedItem.update({ where: { id: existing.id }, data: { payload, pipelineRunId: pipelineRunId || null } });
        updated++;
      } else {
        row = await prisma.scrapedItem.create({ data: { itemType: type, payload, pipelineRunId: pipelineRunId || null } });
        inserted++;
      }

      if (autoPromote) {
        await promoteScrapedItem(row);
      }
    } catch (err: any) {
      failed++;
      errors.push({ index: i, error: err.message || String(err) });
      console.error(`[Item Ingest] item ${i} error:`, err.message || err);
    }
  }

  // Update scraper run
  await prisma.scraperRun.update({
    where: { id: run.id },
    data: {
      status: failed === articles.length ? 'failed' : failed > 0 ? 'partial' : 'success',
      completedAt: new Date(),
      itemsInserted: inserted + updated,
      itemsFailed: failed,
      metadata: { pipelineRunId: pipelineRunId || null, updated },
    },
  });

  console.log(`[Article Ingest] Done: ${inserted} inserted, ${updated} updated, ${failed} failed`);

  res.json({
    success: true,
    inserted,
    updated,
    failed,
    total: articles.length,
    scraperRunId: run.id,
    ...(errors.length > 0 ? { errors: errors.slice(0, 20) } : {}),
  });
});

/**
 * GET /api/articles/ingest/stats — return recent content engine pipeline runs
 */
router.get('/ingest/stats', async (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization;
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const engineKey = process.env.CONTENT_ENGINE_API_KEY || process.env.MARKET_INGEST_API_KEY;

  if (!req.user?.isAdmin && bearerKey !== engineKey) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  try {
    const runs = await prisma.scraperRun.findMany({
      where: { scraperName: 'content-engine' },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, runs, total: runs.length });
  } catch (error) {
    console.error('[Article Ingest] stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ingest stats' });
  }
});

// helpers are exported so admin routes or other modules can invoke them
export { promoteScrapedArticle, isAutoPromoteEnabled };

export default router;