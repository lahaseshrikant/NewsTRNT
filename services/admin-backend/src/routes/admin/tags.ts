/**
 * Tags Admin Routes
 * Full CRUD for tag management in admin CMS
 * Mounted under /api/admin via admin/index.ts
 */
import { Router, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

/**
 * GET /api/admin/tags — List all tags
 * Query params: search, status (all|active|deleted), sort (name|usage|created), order (asc|desc)
 */
router.get('/tags', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      search = '',
      status = 'active',
      sort = 'name',
      order = 'asc',
    } = req.query as Record<string, string>;

    const where: any = {};

    // Status filter
    if (status === 'active') {
      where.isDeleted = false;
    } else if (status === 'deleted') {
      where.isDeleted = true;
    }
    // 'all' → no isDeleted filter

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sort options
    const orderBy: any = {};
    if (sort === 'usage') {
      orderBy.usageCount = order;
    } else if (sort === 'created') {
      orderBy.createdAt = order;
    } else {
      orderBy.name = order;
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    const transformed = tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      usageCount: tag._count?.articles ?? tag.usageCount,
      isDeleted: tag.isDeleted,
      createdAt: tag.createdAt,
      deletedAt: tag.deletedAt,
    }));

    res.json({ tags: transformed, total: transformed.length });
  } catch (error) {
    console.error('[Tags] Error listing:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

/**
 * POST /api/admin/tags — Create a new tag
 */
router.post('/tags', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Tag name is required' });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for existing tag (including soft-deleted)
    const existing = await prisma.tag.findFirst({
      where: { OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }] },
    });

    if (existing) {
      if (existing.isDeleted) {
        // Restore soft-deleted tag
        const restored = await prisma.tag.update({
          where: { id: existing.id },
          data: { isDeleted: false, deletedAt: null, deletedBy: null },
        });
        res.status(200).json({ tag: restored, restored: true });
        return;
      }
      res.status(409).json({ error: 'A tag with this name already exists' });
      return;
    }

    const tag = await prisma.tag.create({
      data: { name: name.trim(), slug },
    });

    res.status(201).json({ tag });
  } catch (error) {
    console.error('[Tags] Error creating:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

/**
 * PUT /api/admin/tags/:id — Update a tag
 */
router.put('/tags/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Tag name is required' });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for duplicate name (excluding self)
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }],
        NOT: { id },
      },
    });

    if (existing) {
      res.status(409).json({ error: 'A tag with this name already exists' });
      return;
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: { name: name.trim(), slug },
    });

    res.json({ tag });
  } catch (error) {
    console.error('[Tags] Error updating:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

/**
 * DELETE /api/admin/tags/:id — Soft-delete a tag
 */
router.delete('/tags/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    await prisma.tag.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?.id || null,
      },
    });

    // Remove article associations
    await prisma.articleTag.deleteMany({ where: { tagId: id } });

    res.json({ success: true });
  } catch (error) {
    console.error('[Tags] Error deleting:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

/**
 * POST /api/admin/tags/:id/restore — Restore a soft-deleted tag
 */
router.post('/tags/:id/restore', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null, deletedBy: null },
    });

    res.json({ tag });
  } catch (error) {
    console.error('[Tags] Error restoring:', error);
    res.status(500).json({ error: 'Failed to restore tag' });
  }
});

export default router;
