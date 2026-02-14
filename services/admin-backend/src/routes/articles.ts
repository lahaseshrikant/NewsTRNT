import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';
import { Security } from '../lib/security';

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
    console.error('Error updating article:', error);
    const prismaCode = error?.code;
    if (prismaCode === 'P2003') {
      res.status(400).json({ error: 'Invalid user reference for updatedBy/createdBy (foreign key)' });
      return;
    }
    res.status(500).json({ error: 'Failed to update article' });
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

export default router;