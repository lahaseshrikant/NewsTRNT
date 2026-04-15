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

async function resolveCategoryId(categoryIdOrName?: string | null): Promise<string | null> {
  if (!categoryIdOrName) return null;
  const value = categoryIdOrName.trim();
  if (!value) return null;

  if (looksLikeUUID(value)) {
    return value;
  }

  const normalized = value.toLowerCase();
  const foundCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: normalized },
        { name: { equals: value, mode: 'insensitive' } },
        { name: { equals: normalized, mode: 'insensitive' } },
      ],
    },
  });

  return foundCategory?.id || null;
}

// Helper: determine web story status
const getWebStoryStatus = (publishedAt: Date | null, status: string): string => {
  if (status === 'draft') return 'draft';
  if (status === 'archived') return 'archived';
  if (publishedAt && publishedAt > new Date()) return 'scheduled';
  return 'published';
};

const inferCoverImageFromSlides = (slides: any): string | null => {
  if (!slides) return null;
  let parsedSlides = Array.isArray(slides) ? slides : [];

  if (!Array.isArray(parsedSlides) && typeof slides === 'string') {
    try {
      parsedSlides = JSON.parse(slides);
    } catch {
      parsedSlides = [];
    }
  }
  if (!Array.isArray(parsedSlides) || parsedSlides.length === 0) return null;

  const firstSlide = parsedSlides[0];
  const imageUrl = firstSlide?.content?.image;
  if (typeof imageUrl === 'string' && imageUrl.trim()) return imageUrl.trim();

  const videoUrl = firstSlide?.content?.video;
  if (typeof videoUrl === 'string' && videoUrl.trim()) return videoUrl.trim();

  return null;
};

const sanitizeStoryText = (value: unknown, maxLength: number): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLength);
};

const sanitizeStoryUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const normalizeStorySlides = (input: any): any[] => {
  const slides = Array.isArray(input) ? input : [];

  return slides
    .map((slide: any, index: number) => {
      const headline = sanitizeStoryText(slide?.content?.headline, 120);
      const text = sanitizeStoryText(slide?.content?.text, 320);
      const image = sanitizeStoryUrl(slide?.content?.image);
      const video = sanitizeStoryUrl(slide?.content?.video);
      const alt = sanitizeStoryText(slide?.content?.alt, 140);
      const caption = sanitizeStoryText(slide?.content?.caption, 180);
      const attribution = sanitizeStoryText(slide?.content?.attribution, 120);
      const poster = sanitizeStoryUrl(slide?.content?.poster);

      const ctaText = sanitizeStoryText(slide?.content?.cta?.text, 40);
      const ctaUrl = sanitizeStoryUrl(slide?.content?.cta?.url);

      const requestedType = typeof slide?.type === 'string' ? slide.type : '';
      let normalizedType: 'image' | 'video' | 'text' = 'text';
      if (requestedType === 'video' && video) normalizedType = 'video';
      else if (requestedType === 'image' && image) normalizedType = 'image';
      else if (video) normalizedType = 'video';
      else if (image) normalizedType = 'image';

      const durationRaw = Number(slide?.duration);
      const duration = Number.isFinite(durationRaw)
        ? Math.min(Math.max(Math.round(durationRaw), 3000), 15000)
        : 5000;

      const background = sanitizeStoryText(slide?.background, 120) || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';

      return {
        id: sanitizeStoryText(slide?.id, 64) || `slide-${index + 1}`,
        type: normalizedType,
        background,
        duration,
        content: {
          ...(headline ? { headline } : {}),
          ...(text ? { text } : {}),
          ...(image ? { image } : {}),
          ...(video ? { video } : {}),
          ...(alt ? { alt } : {}),
          ...(caption ? { caption } : {}),
          ...(attribution ? { attribution } : {}),
          ...(poster ? { poster } : {}),
          ...(ctaText && ctaUrl ? { cta: { text: ctaText, url: ctaUrl } } : {}),
        },
      };
    })
    .filter((slide: any) => {
      const hasHeadline = !!slide?.content?.headline;
      const hasText = !!slide?.content?.text;
      const hasImage = !!slide?.content?.image;
      const hasVideo = !!slide?.content?.video;
      return hasHeadline || hasText || hasImage || hasVideo;
    })
    .slice(0, 30);
};

const estimateStoryDurationSeconds = (slides: any[]): number => {
  if (!Array.isArray(slides) || slides.length === 0) return 0;
  const totalMs = slides.reduce((sum, slide) => sum + (Number(slide?.duration) || 0), 0);
  return Math.max(1, Math.round(totalMs / 1000));
};

type StoryQualityIssue = {
  level: 'warning' | 'error';
  code: string;
  message: string;
};

const parseWidthHintFromUrl = (value?: string): number | null => {
  if (!value) return null;
  try {
    const parsed = new URL(value.startsWith('//') ? `https:${value}` : value);
    const widthParam = parsed.searchParams.get('w') || parsed.searchParams.get('width');
    if (!widthParam) return null;
    const width = Number(widthParam);
    return Number.isFinite(width) ? width : null;
  } catch {
    return null;
  }
};

const getStoryQualityIssues = (title: string, slides: any[]): StoryQualityIssue[] => {
  const issues: StoryQualityIssue[] = [];
  const cleanTitle = sanitizeStoryText(title, 160) || '';

  if (cleanTitle.length < 18) {
    issues.push({
      level: 'warning',
      code: 'weak_title',
      message: 'Title is too short. Use a stronger, benefit-driven headline for better engagement.',
    });
  }

  if (cleanTitle.length > 95) {
    issues.push({
      level: 'warning',
      code: 'title_too_long',
      message: 'Title is very long. Keep it under 90 characters for better readability and SEO.',
    });
  }

  slides.forEach((slide, index) => {
    const slideIndex = index + 1;
    const image = slide?.content?.image as string | undefined;
    const video = slide?.content?.video as string | undefined;
    const alt = sanitizeStoryText(slide?.content?.alt, 140);
    const mediaUrl = image || video;

    if (mediaUrl && !alt) {
      issues.push({
        level: 'warning',
        code: 'missing_alt_text',
        message: `Slide ${slideIndex}: Missing alt text for media.`,
      });
    }

    if (typeof mediaUrl === 'string' && mediaUrl.includes('placeholder')) {
      issues.push({
        level: 'error',
        code: 'placeholder_media',
        message: `Slide ${slideIndex}: Placeholder media detected. Replace with production-ready assets.`,
      });
    }

    const widthHint = parseWidthHintFromUrl(mediaUrl);
    if (widthHint !== null && widthHint < 720) {
      issues.push({
        level: 'warning',
        code: 'low_res_image',
        message: `Slide ${slideIndex}: Media width appears low (${widthHint}px). Prefer 720px+ for AMP stories.`,
      });
    }
  });

  return issues;
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
      coverImage: story.coverImage || '/api/placeholder/400/600',
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
        imageUrl: story.coverImage || '/api/placeholder/400/600',
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
      category,
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

    let resolvedCategoryId: string | undefined;
    const categoryInput = (categoryId || category || '').toString().trim();
    if (categoryInput) {
      resolvedCategoryId = (await resolveCategoryId(categoryInput)) ?? undefined;
    }

    let parsedSlides: any = [];
    try {
      parsedSlides = Array.isArray(slides)
        ? slides
        : slides
          ? JSON.parse(typeof slides === 'string' ? slides : JSON.stringify(slides))
          : [];
    } catch (parseError) {
      console.error('[WebStories] Invalid slides data on create:', parseError);
      res.status(400).json({ error: 'Invalid slides data format' });
      return;
    }

    const normalizedSlides = normalizeStorySlides(parsedSlides);
    if (normalizedSlides.length === 0) {
      res.status(400).json({ error: 'At least one valid slide is required' });
      return;
    }

    const effectiveCoverImage = (coverImage && typeof coverImage === 'string' && coverImage.trim())
      ? coverImage.trim()
      : inferCoverImageFromSlides(normalizedSlides);

    const requestedDuration = Number(duration);
    const effectiveDuration = Number.isFinite(requestedDuration) && requestedDuration > 0
      ? requestedDuration
      : estimateStoryDurationSeconds(normalizedSlides);

    const qualityIssues = getStoryQualityIssues(title, normalizedSlides);
    const blockingIssues = status === 'published'
      ? qualityIssues.filter(issue => issue.level === 'error')
      : [];
    if (blockingIssues.length > 0) {
      res.status(400).json({
        error: 'Story quality checks failed',
        qualityIssues,
      });
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
        slides: normalizedSlides,
        categoryId: resolvedCategoryId,
        coverImage: effectiveCoverImage ?? undefined,
        author: author || req.user?.email,
        duration: effectiveDuration,
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

    res.status(201).json({ success: true, webStory, qualityIssues });
  } catch (error) {
    console.error('[WebStories] Error creating:', error);
    const message = error instanceof Error ? error.message : 'Failed to create web story';
    res.status(500).json({ error: 'Failed to create web story', details: message });
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
      category,
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

    if (slides !== undefined) {
      try {
        const parsedSlides = Array.isArray(slides)
          ? slides
          : slides
            ? JSON.parse(typeof slides === 'string' ? slides : JSON.stringify(slides))
            : [];

        const normalizedSlides = normalizeStorySlides(parsedSlides);
        if (normalizedSlides.length === 0) {
          res.status(400).json({ error: 'At least one valid slide is required' });
          return;
        }

        updateData.slides = normalizedSlides;
      } catch (error) {
        console.error('[WebStories] Invalid slides data on update:', error);
        res.status(400).json({ error: 'Invalid slides data format' });
        return;
      }
    }

    const categoryInput = (categoryId || category || '').toString().trim();
    if (categoryInput !== '') {
      const resolvedCategoryId = await resolveCategoryId(categoryInput);
      if (resolvedCategoryId) {
        updateData.categoryId = resolvedCategoryId;
      } else {
        // decided to clear category if explicit category known but not found
        updateData.categoryId = null;
      }
    }

    const existingCover = existing.coverImage?.toString().trim();
    let finalCoverImage: string | null | undefined = undefined;
    if (coverImage !== undefined) {
      const coverRaw = typeof coverImage === 'string' ? coverImage.trim() : '';
      finalCoverImage = coverRaw || null;
    }

    if (finalCoverImage === undefined && !existingCover) {
      const slideSource = updateData.slides ?? existing.slides;
      const inferred = inferCoverImageFromSlides(slideSource);
      if (inferred) finalCoverImage = inferred;
    }

    if (finalCoverImage !== undefined) {
      updateData.coverImage = finalCoverImage;
    }

    if (author !== undefined) updateData.author = author;
    if (duration !== undefined) {
      const parsedDuration = Number(duration);
      updateData.duration = Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : estimateStoryDurationSeconds((updateData.slides ?? existing.slides) as any[]);
    }
    if (isFeature !== undefined) updateData.isFeature = isFeature;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;

    // Set updatedBy
    if (req.user?.id && looksLikeUUID(req.user.id)) {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true } });
      if (dbUser) updateData.updatedBy = dbUser.id;
    }

    // Set updatedAt when content actually changes (removed @updatedAt from schema)
    updateData.updatedAt = new Date();

    // If publishing for the first time, set publishedAt
    if (status === 'published' && !existing.publishedAt && !publishedAt) {
      updateData.publishedAt = new Date();
    }

    const resolvedTitle = (updateData.title ?? existing.title) as string;
    const resolvedSlides = (updateData.slides ?? existing.slides) as any[];
    const resolvedStatus = (updateData.status ?? existing.status) as string;
    const qualityIssues = getStoryQualityIssues(resolvedTitle, resolvedSlides);
    const blockingIssues = resolvedStatus === 'published'
      ? qualityIssues.filter(issue => issue.level === 'error')
      : [];
    if (blockingIssues.length > 0) {
      res.status(400).json({
        error: 'Story quality checks failed',
        qualityIssues,
      });
      return;
    }

    const webStory = await prisma.webStory.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    res.json({ success: true, webStory, qualityIssues });
  } catch (error) {
    console.error('[WebStories] Error updating:', error);
    const message = error instanceof Error ? error.message : 'Failed to update web story';
    res.status(500).json({ error: 'Failed to update web story', details: message });
  }
});

/**
 * POST /api/webstories/admin/bulk — Bulk operation for web stories
 */
router.post('/admin/bulk', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { action, ids } = req.body as { action: string; ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing ids' });
    }

    const validActions = ['publish', 'draft', 'archive', 'delete', 'restore'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const where = {
      id: { in: ids.filter(id => looksLikeUUID(id)) },
    } as any;

    let updateData: any = {};
    switch (action) {
      case 'publish':
        updateData = { status: 'published', publishedAt: new Date(), updatedAt: new Date() };
        break;
      case 'draft':
        updateData = { status: 'draft', updatedAt: new Date() };
        break;
      case 'archive':
        updateData = { status: 'archived', updatedAt: new Date() };
        break;
      case 'delete':
        updateData = { isDeleted: true, deletedAt: new Date() };
        break;
      case 'restore':
        updateData = { isDeleted: false, deletedAt: null, updatedAt: new Date() };
        break;
    }

    await prisma.webStory.updateMany({ where, data: updateData });

    return res.json({ success: true, action, count: ids.length });
  } catch (error) {
    console.error('[WebStories] Error bulk action:', error);
    return res.status(500).json({ error: 'Failed to perform bulk action', details: (error as Error).message });
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
      data: { isDeleted: false, deletedAt: null, deletedBy: null, updatedAt: new Date() },
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
        data: { isDeleted: true, deletedAt: new Date(), deletedBy: req.user?.id, updatedAt: new Date() },
      });
      res.json({ message: 'Web story moved to trash' });
    }
  } catch (error) {
    console.error('[WebStories] Error deleting:', error);
    res.status(500).json({ error: 'Failed to delete web story' });
  }
});

export default router;
