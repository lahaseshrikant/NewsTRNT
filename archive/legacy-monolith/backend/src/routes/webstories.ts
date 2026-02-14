import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';

const router = Router();

// Simple UUID v4 format check
const looksLikeUUID = (id: string | undefined): boolean => !!id && /^[0-9a-fA-F-]{36}$/.test(id);

// Helper function to determine web story status
const getWebStoryStatus = (publishedAt: Date | null, status: string): string => {
  if (status === 'draft') return 'draft';
  if (status === 'archived') return 'archived';
  if (publishedAt && publishedAt > new Date()) return 'scheduled';
  return 'published';
};

// GET /api/webstories/admin - Get all web stories for admin - Admin only
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
    const where: any = {
      isDeleted: false // Only show non-deleted web stories by default
    };

    if (category && category !== 'all') {
      where.category = {
        slug: category
      };
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Handle sortBy field mapping
    let orderByField = sortBy as string;
    if (sortBy === 'date') orderByField = 'publishedAt';
    if (sortBy === 'views') orderByField = 'viewCount';
    if (sortBy === 'performance') orderByField = 'likeCount'; // or engagement score

    const orderBy = {
      [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc'
    };

    const [webStories, total] = await Promise.all([
      prisma.webStory.findMany({
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
              username: true
            }
          }
        }
      }),
      prisma.webStory.count({ where })
    ]);

    // Transform data to match expected format
    const transformedWebStories = webStories.map(story => ({
      id: story.id,
      title: story.title,
      slug: story.slug,
      category: story.category?.name || 'Uncategorized',
      categorySlug: story.category?.slug || 'uncategorized',
      slides: Array.isArray(story.slides) ? story.slides.length : 0,
      status: getWebStoryStatus(story.publishedAt, story.status),
      author: story.author || story.createdByUser?.fullName || 'Unknown',
      duration: story.duration,
      coverImage: story.coverImage,
      isFeature: story.isFeature,
      priority: story.priority,
      viewCount: story.viewCount,
      likeCount: story.likeCount,
      shareCount: story.shareCount,
      publishedAt: story.publishedAt?.toISOString(),
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString()
    }));

    res.json({
      webStories: transformedWebStories,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching web stories:', error);
    res.status(500).json({ error: 'Failed to fetch web stories' });
  }
});

// GET /api/webstories/admin/drafts - Get draft web stories for admin - Admin only
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

    // Only get draft web stories
    const where: any = { 
      isDeleted: false,
      status: 'draft'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Handle sortBy field mapping
    let orderByField = sortBy as string;
    if (sortBy === 'date') orderByField = 'updatedAt';
    if (sortBy === 'views') orderByField = 'viewCount';

    const orderBy = {
      [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc'
    };

    const [webStories, total] = await Promise.all([
      prisma.webStory.findMany({
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
            }
          },
          createdByUser: {
            select: {
              fullName: true
            }
          }
        }
      }),
      prisma.webStory.count({ where })
    ]);

    // Transform data to match expected format similar to articles
    const transformedWebStories = webStories.map(story => ({
      id: story.id,
      title: story.title,
      content: null, // Web stories don't have content field like articles
      summary: null, // Web stories don't have summary field like articles
      category: story.category,
      tags: [], // Web stories don't have tags in current schema
      author: story.createdByUser || { fullName: story.author || 'Unknown' },
      updatedAt: story.updatedAt.toISOString(),
      createdAt: story.createdAt.toISOString(),
      status: 'draft',
      imageUrl: story.coverImage,
      type: 'webstory', // Add type to distinguish from articles
      slides: Array.isArray(story.slides) ? story.slides.length : 0,
      duration: story.duration,
      priority: story.priority
    }));

    res.json({
      success: true,
      webstories: transformedWebStories,
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
    console.error('Error fetching draft web stories:', error);
    res.status(500).json({ error: 'Failed to fetch draft web stories' });
  }
});

// GET /api/webstories/admin/trash - Get soft deleted web stories (Admin only)
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

    // Build where clause for deleted web stories
    const where: any = {
      isDeleted: true
    };

    if (category && category !== 'all') {
      where.category = {
        slug: category
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Handle sortBy field mapping
    let orderByField = sortBy as string;
    if (sortBy === 'date') orderByField = 'deletedAt';

    const orderBy = {
      [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc'
    };

    const [webStories, total] = await Promise.all([
      prisma.webStory.findMany({
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
              username: true
            }
          }
        }
      }),
      prisma.webStory.count({ where })
    ]);

    // Transform data to match expected format
    const transformedWebStories = webStories.map(story => ({
      id: story.id,
      title: story.title,
      slug: story.slug,
      category: story.category?.name || 'Uncategorized',
      categorySlug: story.category?.slug || 'uncategorized',
      slides: Array.isArray(story.slides) ? story.slides.length : 0,
      status: story.status,
      author: story.author || story.createdByUser?.fullName || 'Unknown',
      duration: story.duration,
      coverImage: story.coverImage,
      isFeature: story.isFeature,
      priority: story.priority,
      viewCount: story.viewCount,
      likeCount: story.likeCount,
      shareCount: story.shareCount,
      publishedAt: story.publishedAt?.toISOString(),
      deletedAt: story.deletedAt?.toISOString(),
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString()
    }));

    res.json({
      webStories: transformedWebStories,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching deleted web stories:', error);
    res.status(500).json({ error: 'Failed to fetch deleted web stories' });
  }
});

// POST /api/webstories/admin/:id/restore - Restore soft deleted web story (Admin only)
router.post('/admin/:id/restore', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    if (!looksLikeUUID(id)) {
      res.status(400).json({ error: 'Invalid web story ID format' });
      return;
    }

    // Check if web story exists and is deleted
    const webStory = await prisma.webStory.findUnique({
      where: { id }
    });

    if (!webStory) {
      res.status(404).json({ error: 'Web story not found' });
      return;
    }

    if (!webStory.isDeleted) {
      res.status(400).json({ error: 'Web story is not deleted' });
      return;
    }

    // Restore the web story
    const restoredWebStory = await prisma.webStory.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      }
    });

    res.json({
      message: 'Web story restored successfully',
      webStory: restoredWebStory
    });
  } catch (error) {
    console.error('Error restoring web story:', error);
    res.status(500).json({ error: 'Failed to restore web story' });
  }
});

// DELETE /api/webstories/admin/:id - Soft or hard delete web story (Admin only)
router.delete('/admin/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const { permanent = 'false' } = req.query;

    if (!looksLikeUUID(id)) {
      res.status(400).json({ error: 'Invalid web story ID format' });
      return;
    }

    const webStory = await prisma.webStory.findUnique({
      where: { id }
    });

    if (!webStory) {
      res.status(404).json({ error: 'Web story not found' });
      return;
    }

    if (permanent === 'true') {
      // Hard delete
      await prisma.webStory.delete({
        where: { id }
      });

      res.json({
        message: 'Web story permanently deleted successfully'
      });
    } else {
      // Soft delete
      const deletedWebStory = await prisma.webStory.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id
        }
      });

      res.json({
        message: 'Web story moved to trash successfully',
        webStory: deletedWebStory
      });
    }
  } catch (error) {
    console.error('Error deleting web story:', error);
    res.status(500).json({ error: 'Failed to delete web story' });
  }
});

// =============================================================================
// PUBLIC ROUTES (No authentication required)
// =============================================================================

// GET /api/webstories - Get published web stories for public (no auth required)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Only show published web stories
    const where: any = {
      isDeleted: false,
      status: 'published',
      publishedAt: { lte: new Date() }
    };

    if (category && category !== 'all') {
      where.category = {
        slug: category as string
      };
    }

    // Handle sortBy field mapping
    let orderByField = sortBy as string;
    if (sortBy === 'date') orderByField = 'publishedAt';
    if (sortBy === 'views') orderByField = 'viewCount';

    const orderBy = {
      [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc'
    };

    const [webStories, total] = await Promise.all([
      prisma.webStory.findMany({
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
          }
        }
      }),
      prisma.webStory.count({ where })
    ]);

    // Transform data to match expected frontend format
    const transformedWebStories = webStories.map(story => ({
      id: story.id,
      title: story.title,
      slug: story.slug,
      category: story.category?.name || 'Uncategorized',
      categorySlug: story.category?.slug || 'uncategorized',
      categoryColor: story.category?.color || '#000000',
      slides: story.slides,
      slidesCount: Array.isArray(story.slides) ? story.slides.length : 0,
      status: 'published',
      author: story.author || 'Unknown',
      duration: story.duration,
      coverImage: story.coverImage || '/api/placeholder/400/600',
      isFeature: story.isFeature,
      priority: story.priority,
      viewCount: story.viewCount,
      likeCount: story.likeCount,
      shareCount: story.shareCount,
      views: story.viewCount,
      isNew: story.publishedAt && (Date.now() - new Date(story.publishedAt).getTime()) < 24 * 60 * 60 * 1000,
      isTrending: story.viewCount > 1000 || story.isFeature,
      publishedAt: story.publishedAt?.toISOString(),
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString()
    }));

    res.json({
      success: true,
      webStories: transformedWebStories,
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
    console.error('Error fetching public web stories:', error);
    res.status(500).json({ error: 'Failed to fetch web stories' });
  }
});

// GET /api/webstories/:idOrSlug - Get single web story by ID or slug (no auth required)
router.get('/:idOrSlug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { idOrSlug } = req.params;

    // Determine if it's a UUID or slug
    const isUUID = looksLikeUUID(idOrSlug);

    const where = isUUID
      ? { id: idOrSlug, isDeleted: false, status: 'published' }
      : { slug: idOrSlug, isDeleted: false, status: 'published' };

    const webStory = await prisma.webStory.findFirst({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      }
    });

    if (!webStory) {
      res.status(404).json({ error: 'Web story not found' });
      return;
    }

    // Increment view count
    await prisma.webStory.update({
      where: { id: webStory.id },
      data: { viewCount: { increment: 1 } }
    });

    // Transform to frontend format
    const transformedWebStory = {
      id: webStory.id,
      title: webStory.title,
      slug: webStory.slug,
      category: webStory.category?.name || 'Uncategorized',
      categorySlug: webStory.category?.slug || 'uncategorized',
      categoryColor: webStory.category?.color || '#000000',
      slides: webStory.slides,
      author: webStory.author || 'Unknown',
      duration: webStory.duration,
      coverImage: webStory.coverImage || '/api/placeholder/400/600',
      isFeature: webStory.isFeature,
      viewCount: webStory.viewCount + 1,
      views: webStory.viewCount + 1,
      likeCount: webStory.likeCount,
      shareCount: webStory.shareCount,
      publishedAt: webStory.publishedAt?.toISOString(),
      createdAt: webStory.createdAt.toISOString()
    };

    res.json({
      success: true,
      webStory: transformedWebStory
    });

  } catch (error) {
    console.error('Error fetching web story:', error);
    res.status(500).json({ error: 'Failed to fetch web story' });
  }
});

export default router;
