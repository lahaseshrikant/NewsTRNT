import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';

const router = Router();

// Type alias — will resolve after `prisma generate` once ContactMessage migration is applied
const db = prisma as any;

// GET /api/contact - List contact messages (admin only)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {};

    // Filter by status
    if (status && ['unread', 'read', 'replied', 'archived'].includes(status)) {
      where.status = status;
    }

    // Search by name, email, or subject
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [messages, total] = await Promise.all([
      db.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.contactMessage.count({ where }),
    ]);

    // Count by status for sidebar/filters
    const counts = await db.contactMessage.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = {
      unread: 0,
      read: 0,
      replied: 0,
      archived: 0,
      ...Object.fromEntries(counts.map((c: any) => [c.status, c._count])),
    };

    return res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
    });
  } catch (error) {
    console.error('[Contact] Error listing messages:', error);
    return res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

// GET /api/contact/:id - Get a single message (admin only)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await db.contactMessage.findUnique({ where: { id } });

    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    // Auto-mark as read if unread
    if (message.status === 'unread') {
      await db.contactMessage.update({
        where: { id },
        data: { status: 'read' },
      });
      message.status = 'read';
    }

    return res.json(message);
  } catch (error) {
    console.error('[Contact] Error fetching message:', error);
    return res.status(500).json({ error: 'Failed to fetch contact message' });
  }
});

// PATCH /api/contact/:id - Update message status (admin only)
const updateSchema = z.object({
  status: z.enum(['unread', 'read', 'replied', 'archived']).optional(),
  repliedAt: z.string().datetime().optional(),
});

router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    const data: any = {};

    if (parsed.data.status) {
      data.status = parsed.data.status;

      // Auto-set repliedAt and repliedBy when marking as replied
      if (parsed.data.status === 'replied') {
        data.repliedAt = new Date();
        data.repliedBy = req.user?.email || req.user?.id || 'admin';
      }
    }

    if (parsed.data.repliedAt) {
      data.repliedAt = new Date(parsed.data.repliedAt);
    }

    const updated = await db.contactMessage.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (error) {
    console.error('[Contact] Error updating message:', error);
    return res.status(500).json({ error: 'Failed to update contact message' });
  }
});

// DELETE /api/contact/:id - Delete a message (admin only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    await db.contactMessage.delete({ where: { id } });

    return res.json({ success: true, message: 'Contact message deleted' });
  } catch (error) {
    console.error('[Contact] Error deleting message:', error);
    return res.status(500).json({ error: 'Failed to delete contact message' });
  }
});

export default router;
