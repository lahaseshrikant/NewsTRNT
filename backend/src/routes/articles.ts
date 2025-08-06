import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createArticleSchema = z.object({
  title: z.string().min(10).max(200),
  content: z.string().min(100),
  summary: z.string().min(50).max(500),
  categoryId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  isBreaking: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true)
});

const updateArticleSchema = createArticleSchema.partial();

// GET /api/articles - Get all articles with filtering and pagination
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      tags,
      search,
      breaking,
      trending,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      isPublished: true
    };

    if (category) {
      where.category = {
        slug: category as string
      };
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      where.tags = {
        some: {
          tag: {
            slug: {
              in: tagArray
            }
          }
        }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { summary: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (breaking === 'true') {
      where.isBreaking = true;
    }

    // Build orderBy clause
    let orderBy: any = {};
    if (trending === 'true') {
      orderBy = [
        { viewCount: 'desc' },
        { publishedAt: 'desc' }
      ];
    } else {
      orderBy[sortBy as string] = sortOrder as string;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy,
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
        }
      }),
      prisma.article.count({ where })
    ]);

    // Transform the data
    const transformedArticles = articles.map((article: any) => ({
      ...article,
      author: article.createdByUser,
      tags: article.tags.map((t: any) => t.tag),
      commentCount: article._count.comments,
      saveCount: article._count.savedByUsers,
      interactionCount: article._count.interactions
    }));

    return res.json({
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
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:id - Get single article
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
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
            username: true,
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
        comments: {
          take: 10,
          where: {
            isApproved: true,
            parentId: null
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true
              }
            },
            replies: {
              take: 5,
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    username: true,
                    avatarUrl: true
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            comments: true,
            savedByUsers: true,
            interactions: true
          }
        }
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (!article.isPublished && (!req.user || !req.user.isAdmin)) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Track view if user is authenticated
    if (req.user) {
      await prisma.userInteraction.upsert({
        where: {
          userId_articleId_interactionType: {
            userId: req.user.id,
            articleId: article.id,
            interactionType: 'VIEW'
          }
        },
        update: {},
        create: {
          userId: req.user.id,
          articleId: article.id,
          interactionType: 'VIEW'
        }
      });

      // Update reading history
      await prisma.readingHistory.upsert({
        where: {
          userId_articleId: {
            userId: req.user.id,
            articleId: article.id
          }
        },
        update: {
          readAt: new Date(),
          scrollPercentage: 100
        },
        create: {
          userId: req.user.id,
          articleId: article.id,
          readingTime: 0,
          scrollPercentage: 0
        }
      });
    }

    // Increment view count
    await prisma.article.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    // Get related articles
    const relatedArticles = await prisma.article.findMany({
      take: 5,
      where: {
        AND: [
          { id: { not: article.id } },
          { isPublished: true },
          {
            OR: [
              { categoryId: article.categoryId },
              {
                tags: {
                  some: {
                    tag: {
                      slug: {
                        in: article.tags.map((t: any) => t.tag.slug)
                      }
                    }
                  }
                }
              }
            ]
          }
        ]
      },
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
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    const transformedArticle = {
      ...article,
      author: article.createdByUser,
      tags: article.tags.map((t: any) => t.tag),
      commentCount: article._count.comments,
      saveCount: article._count.savedByUsers,
      interactionCount: article._count.interactions,
      relatedArticles
    };

    return res.json(transformedArticle);

  } catch (error) {
    console.error('Error fetching article:', error);
    return res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/articles - Create new article (Admin only)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const validatedData = createArticleSchema.parse(req.body);
    const { tags, ...articleData } = validatedData; // Separate tags from article data
    
    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    });

    if (existingArticle) {
      return res.status(400).json({ error: 'An article with this title already exists' });
    }

    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary,
        slug,
        categoryId: articleData.categoryId,
        imageUrl: articleData.imageUrl,
        isBreaking: articleData.isBreaking || false,
        isPublished: articleData.isPublished !== false, // Default to true
        createdBy: req.user.id,
        readingTime: Math.ceil(validatedData.content.length / 1000),
        publishedAt: articleData.isPublished !== false ? new Date() : null
      },
      include: {
        category: true,
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        
        // Find or create tag
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {
            usageCount: {
              increment: 1
            }
          },
          create: {
            name: tagName,
            slug: tagSlug,
            usageCount: 1
          }
        });

        // Link tag to article
        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id
          }
        });
      }
    }

    return res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create article' });
  }
});

// PUT /api/articles/:id - Update article (Admin only)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const validatedData = updateArticleSchema.parse(req.body);

    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updateData: any = {
      ...validatedData,
      updatedBy: req.user.id
    };

    if (validatedData.title && validatedData.title !== existingArticle.title) {
      updateData.slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);
    }

    if (validatedData.content) {
      updateData.readingTime = Math.ceil(validatedData.content.length / 1000);
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    return res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /api/articles/:id - Delete article (Admin only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await prisma.article.delete({
      where: { id }
    });

    return res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return res.status(500).json({ error: 'Failed to delete article' });
  }
});

// POST /api/articles/:id/save - Save/unsave article
router.post('/:id/save', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const article = await prisma.article.findUnique({
      where: { id, isPublished: true }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const existingSave = await prisma.savedArticle.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: id
        }
      }
    });

    if (existingSave) {
      // Unsave article
      await prisma.savedArticle.delete({
        where: {
          userId_articleId: {
            userId,
            articleId: id
          }
        }
      });
      return res.json({ saved: false, message: 'Article removed from saved list' });
    } else {
      // Save article
      await prisma.savedArticle.create({
        data: {
          userId,
          articleId: id
        }
      });
      return res.json({ saved: true, message: 'Article saved successfully' });
    }
  } catch (error) {
    console.error('Error saving/unsaving article:', error);
    return res.status(500).json({ error: 'Failed to save/unsave article' });
  }
});

// POST /api/articles/:id/interact - Record user interaction (like, share, etc.)
router.post('/:id/interact', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // LIKE, SHARE, COMMENT
    const userId = req.user!.id;

    if (!['LIKE', 'SHARE', 'COMMENT'].includes(type)) {
      return res.status(400).json({ error: 'Invalid interaction type' });
    }

    const article = await prisma.article.findUnique({
      where: { id, isPublished: true }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await prisma.userInteraction.upsert({
      where: {
        userId_articleId_interactionType: {
          userId,
          articleId: id,
          interactionType: type
        }
      },
      update: {},
      create: {
        userId,
        articleId: id,
        interactionType: type
      }
    });

    return res.json({ message: 'Interaction recorded successfully' });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return res.status(500).json({ error: 'Failed to record interaction' });
  }
});

export default router;
