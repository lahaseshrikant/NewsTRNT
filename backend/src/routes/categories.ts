import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(10).optional(),
  isActive: z.boolean().optional().default(true)
});

const updateCategorySchema = createCategorySchema.partial();

// GET /api/categories - List all categories
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

// GET /api/categories/trash - Get soft deleted categories (Admin only)
router.get('/trash', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const deletedCategories = await prisma.category.findMany({
      where: {
        isDeleted: true
      },
      orderBy: {
        deletedAt: 'desc'
      },
      include: {
        _count: {
          select: {
            articles: {
              where: {
                isDeleted: false // Count non-deleted articles
              }
            }
          }
        }
      }
    });

    const transformedCategories = deletedCategories.map((category: any) => ({
      ...category,
      articleCount: category._count?.articles || 0
    }));

    return res.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching deleted categories:', error);
    return res.status(500).json({ error: 'Failed to fetch deleted categories' });
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

// POST /api/categories - Create new category (Admin only)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const validatedData = createCategorySchema.parse(req.body);
    
    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color || '#000000',
        icon: validatedData.icon,
        isActive: validatedData.isActive !== false, // Default to true
        slug
      }
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - Update category (Admin only)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updateData: any = { ...validatedData };

    if (validatedData.name && validatedData.name !== existingCategory.name) {
      updateData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    return res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Soft delete category (Admin only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { permanent = 'false' } = req.query;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (permanent === 'true') {
      console.log(`🗑️ PERMANENT DELETE requested for category ${id}`);
      
      // Permanent deletion - check if category has active articles
      const articleCount = await prisma.article.count({
        where: { 
          categoryId: id,
          isDeleted: false
        }
      });

      console.log(`📊 Category ${id} has ${articleCount} active articles`);

      if (articleCount > 0) {
        console.log(`❌ Cannot delete - category has active articles`);
        return res.status(400).json({ 
          error: 'Cannot permanently delete category with existing articles. Please reassign or delete articles first.' 
        });
      }

      console.log(`💥 Performing permanent deletion of category ${id}`);
      await prisma.category.delete({
        where: { id }
      });

      console.log(`✅ Category ${id} permanently deleted successfully`);
      return res.json({ message: 'Category permanently deleted successfully' });
    } else {
      // Soft delete
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id
        }
      });

      return res.json({ 
        message: 'Category moved to trash successfully',
        category: updatedCategory
      });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

// POST /api/categories/:id/restore - Restore soft deleted category (Admin only)
router.post('/:id/restore', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!category.isDeleted) {
      return res.status(400).json({ error: 'Category is not deleted' });
    }

    const restoredCategory = await prisma.category.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      }
    });

    return res.json({ 
      message: 'Category restored successfully',
      category: restoredCategory
    });
  } catch (error) {
    console.error('Error restoring category:', error);
    return res.status(500).json({ error: 'Failed to restore category' });
  }
});

export default router;
