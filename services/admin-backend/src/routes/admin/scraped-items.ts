import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../../middleware/auth';
import { promoteScrapedArticle } from '../articles';

const router = Router();

// GET /api/admin/scraped-items?status=pending|approved&type=article|...&limit&offset
router.get('/scraped-items', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, type, limit = '20', offset = '0' } = req.query as any;
    const where: any = {};
    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }
    if (type) {
      where.itemType = type;
    }

    const items = await prisma.scrapedItem.findMany({
      where,
      orderBy: { scrapedAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    const total = await prisma.scrapedItem.count({ where });
    res.json({ success: true, items, total });
  } catch (error) {
    console.error('[Admin Scraped] list error', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scraped items' });
  }
});

// POST /api/admin/scraped-items/:id/approve
router.post('/scraped-items/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const scraped = await prisma.scrapedItem.findUnique({ where: { id } });
    if (!scraped) {
      return res.status(404).json({ success: false, error: 'Scraped item not found' });
    }
    if (scraped.isApproved) {
      return res.json({ success: true, message: 'Already approved' });
    }

    await promoteScrapedItem(scraped);

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'APPROVE_SCRAPED',
        targetType: 'scraped_item',
        targetId: id,
        details: { itemType: scraped.itemType },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[Admin Scraped] approve error', error);
    res.status(500).json({ success: false, error: 'Failed to approve scraped item' });
  }
});

export default router;
