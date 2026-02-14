import { Router } from 'express';
import prisma from '../config/database';
import { optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../types/auth';

const router = Router();

// UUID detection helper
function looksLikeUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// ============================================================================
// USER-FACING ROUTES ONLY - All admin/CMS routes are in admin-backend
// ============================================================================

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
