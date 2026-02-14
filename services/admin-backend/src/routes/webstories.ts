/**
 * Web Stories Admin Routes
 * Full CRUD for web stories management in admin CMS
 * Mounted at: /api/webstories
 */
import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Simple UUID v4 format check
const looksLikeUUID = (id: string | undefined): boolean =>
  !!id && /^[0-9a-fA-F-]{36}$/.test(id);

// Helper: determine web story status
const getWebStoryStatus = (publishedAt: Date | null, status: string): string => {
  if (status === 'draft') return 'draft';
  if (status === 'archived') return 'archived';
  if (publishedAt && publishedAt > new Date()) return 'scheduled';
  return 'published';
};

// ── Admin CRUD (all require auth + admin) ────────────────────────────────────

/**
 * GET /api/webstories/admin — List all web stories for admin
 */
router.get('/admin', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      status,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isDeleted: false };

    if (category && category !== 'all') {
      where.category = { slug: category };
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderByField = sortBy as string;
    if (sortBy === 'date') orderByField = 'publishedAt';
    if (sortBy === 'views') orderByField = 'viewCount';
    if (sortBy === 'performance') orderByField = 'likeCount';

    const [webStories, total] = await Promise.all([
      prisma.webStory.findMany({
        where,
        orderBy: { [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true, slug: true, color: true } },
          createdByUser: { select: { id: true, fullName: true, username: true } },
        },
      }),
      prisma.webStory.count({ where }),
    ]);

    const transformedWebStories = webStories.map((story: any) => ({
      id: story.id,
      title: story.title,
      slug: story.slug,
      category: story.category?.name || 'Uncategorized',
      categorySlug: story.category?.slug || 'uncategorized',
      slides: Array.isArray(story.slides) ? (story.slides as any[]).length : 0,
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
      updatedAt: story.updatedAt.toISOString(),
    }));

    res.json({
      webStories: transformedWebStories,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error('[WebStories] Error listing:', error);
    res.status(500).json({ error: 'Failed to fetch web stories' });
  }
});

/**
 * GET /api/webstories/admin/drafts
 */
router.get('/admin/drafts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isDeleted: false, status: 'draft' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderByField = sortBy as string;
    if (sortBy === 'date') orderByField = 'updatedAt';

    const [webStories, total] = await Promise.all([
      prisma.webStory.findMany({
        where,
        orderBy: { [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          createdByUser: { select: { fullName: true } },
        },
      }),
      prisma.webStory.count({ where }),
    ]);

    res.json({
      success: true,
      webstories: webStories.map((story: any) => ({
        id: story.id,
        title: story.title,
        category: story.category,
        author: story.createdByUser || { fullName: story.author || 'Unknown' },
        updatedAt: story.updatedAt.toISOString(),
        createdAt: story.createdAt.toISOString(),
        status: 'draft',
        imageUrl: story.coverImage,
        type: 'webstory',
        slides: Array.isArray(story.slides) ? (story.slides as any[]).length : 0,
        duration: story.duration,
        priority: story.priority,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('[WebStories] Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch draft web stories' });
  }
});

/**
 * GET /api/webstories/admin/trash
 */
router.get('/admin/trash', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, sortBy = 'deletedAt', sortOrder = 'desc' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isDeleted: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [webStories, total] = await Promise.all([
      prisma.webStory.findMany({
        where,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true, slug: true, color: true } },
          createdByUser: { select: { id: true, fullName: true, username: true } },
        },
      }),
      prisma.webStory.count({ where }),
    ]);

    res.json({
      webStories: webStories.map((story: any) => ({
        id: story.id,
        title: story.title,
        slug: story.slug,
        category: story.category?.name || 'Uncategorized',
        categorySlug: story.category?.slug || 'uncategorized',
        slides: Array.isArray(story.slides) ? (story.slides as any[]).length : 0,
        status: story.status,
        author: story.author || story.createdByUser?.fullName || 'Unknown',
        deletedAt: story.deletedAt?.toISOString(),
        createdAt: story.createdAt.toISOString(),
        updatedAt: story.updatedAt.toISOString(),
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error('[WebStories] Error fetching trash:', error);
    res.status(500).json({ error: 'Failed to fetch deleted web stories' });
  }
});

/**
 * POST /api/webstories/admin — Create a new web story
 */
router.post('/admin', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slides = [],
      categoryId,
      coverImage,
      author,
      duration = 0,
      isFeature = false,
      priority = 'normal',
      status = 'draft',
      publishedAt,
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now();

    // Only set createdBy if user exists in DB
    let createdByData: { createdBy?: string } = {};
    if (req.user?.id && looksLikeUUID(req.user.id)) {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true } });
      if (dbUser) createdByData.createdBy = dbUser.id;
    }

    const webStory = await prisma.webStory.create({
      data: {
        title,
        slug,
        slides: JSON.parse(typeof slides === 'string' ? slides : JSON.stringify(slides)),
        categoryId: categoryId || undefined,
        coverImage,
        author: author || req.user?.email,
        duration,
        isFeature,
        priority,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : status === 'published' ? new Date() : null,
        ...createdByData,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(201).json({ success: true, webStory });
  } catch (error) {
    console.error('[WebStories] Error creating:', error);
    res.status(500).json({ error: 'Failed to create web story' });
  }
});

/**
 * GET /api/webstories/admin/:id — Get single web story for editing
 */
router.get('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!looksLikeUUID(id)) {
      res.status(400).json({ error: 'Invalid web story ID' });
      return;
    }

    const webStory = await prisma.webStory.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
        createdByUser: { select: { id: true, fullName: true, username: true } },
      },
    });

    if (!webStory) {
      res.status(404).json({ error: 'Web story not found' });
      return;
    }

    res.json({ success: true, webStory });
  } catch (error) {
    console.error('[WebStories] Error fetching:', error);
    res.status(500).json({ error: 'Failed to fetch web story' });
  }
});

/**
 * PUT /api/webstories/admin/:id — Update a web story
 */
router.put('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!looksLikeUUID(id)) {
      res.status(400).json({ error: 'Invalid web story ID' });
      return;
    }

    const existing = await prisma.webStory.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Web story not found' });
      return;
    }

    const {
      title,
      slides,
      categoryId,
      coverImage,
      author,
      duration,
      isFeature,
      priority,
      status,
      publishedAt,
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
      // Re-generate slug only if title changed
      if (title !== existing.title) {
        updateData.slug =
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') +
          '-' +
          Date.now();
      }
    }
    if (slides !== undefined) updateData.slides = typeof slides === 'string' ? JSON.parse(slides) : slides;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (author !== undefined) updateData.author = author;
    if (duration !== undefined) updateData.duration = duration;
    if (isFeature !== undefined) updateData.isFeature = isFeature;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;

    // Set updatedBy
    if (req.user?.id && looksLikeUUID(req.user.id)) {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true } });
      if (dbUser) updateData.updatedBy = dbUser.id;
    }

    // If publishing for the first time, set publishedAt
    if (status === 'published' && !existing.publishedAt && !publishedAt) {
      updateData.publishedAt = new Date();
    }

    const webStory = await prisma.webStory.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    res.json({ success: true, webStory });
  } catch (error) {
    console.error('[WebStories] Error updating:', error);
    res.status(500).json({ error: 'Failed to update web story' });
  }
});

/**
 * POST /api/webstories/admin/:id/restore — Restore from trash
 */
router.post('/admin/:id/restore', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!looksLikeUUID(id)) {
      res.status(400).json({ error: 'Invalid web story ID' });
      return;
    }

    const webStory = await prisma.webStory.findUnique({ where: { id } });
    if (!webStory) {
      res.status(404).json({ error: 'Web story not found' });
      return;
    }
    if (!webStory.isDeleted) {
      res.status(400).json({ error: 'Web story is not deleted' });
      return;
    }

    const restored = await prisma.webStory.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null, deletedBy: null },
    });

    res.json({ message: 'Web story restored successfully', webStory: restored });
  } catch (error) {
    console.error('[WebStories] Error restoring:', error);
    res.status(500).json({ error: 'Failed to restore web story' });
  }
});

/**
 * DELETE /api/webstories/admin/:id — Soft or hard delete
 * Query: ?permanent=true for hard delete
 */
router.delete('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent = 'false' } = req.query;

    if (!looksLikeUUID(id)) {
      res.status(400).json({ error: 'Invalid web story ID' });
      return;
    }

    const webStory = await prisma.webStory.findUnique({ where: { id } });
    if (!webStory) {
      res.status(404).json({ error: 'Web story not found' });
      return;
    }

    if (permanent === 'true') {
      await prisma.webStory.delete({ where: { id } });
      res.json({ message: 'Web story permanently deleted' });
    } else {
      await prisma.webStory.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), deletedBy: req.user?.id },
      });
      res.json({ message: 'Web story moved to trash' });
    }
  } catch (error) {
    console.error('[WebStories] Error deleting:', error);
    res.status(500).json({ error: 'Failed to delete web story' });
  }
});

export default router;
