import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken);

// =============================================================================
// ── Comment Moderation ──
// =============================================================================

// GET /api/admin/moderation/queue - Get moderation queue
router.get('/moderation/queue', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type = 'all', status = 'pending' } = req.query;

    // Get pending comments
    const pendingComments = type === 'all' || type === 'comments' 
      ? await prisma.comment.findMany({
          where: { 
            isApproved: false
          },
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatarUrl: true }
            },
            article: {
              select: { id: true, title: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        })
      : [];

    // Get reported articles (flagged)
    const reportedArticles = type === 'all' || type === 'articles'
      ? await prisma.article.findMany({
          where: {
            isDeleted: false,
            // Add any flagging logic here if you have it
          },
          take: 20,
          orderBy: { updatedAt: 'desc' }
        })
      : [];

    res.json({
      comments: pendingComments.map((c: any) => ({
        id: c.id,
        type: 'comment',
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        user: c.user ? {
          id: c.user.id,
          name: c.user.fullName,
          email: c.user.email,
          avatar: c.user.avatarUrl
        } : null,
        article: c.article ? {
          id: c.article.id,
          title: c.article.title
        } : null
      })),
      articles: reportedArticles.map((a: any) => ({
        id: a.id,
        type: 'article',
        title: a.title,
        createdAt: a.createdAt.toISOString()
      })),
      stats: {
        pendingComments: pendingComments.length,
        pendingArticles: 0
      }
    });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

// POST /api/admin/moderation/comments/:id/approve - Approve comment
router.post('/moderation/comments/:id/approve', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.comment.update({
      where: { id },
      data: { isApproved: true }
    });

    // Log action
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'APPROVE_COMMENT',
        targetType: 'comment',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Comment approved' });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({ error: 'Failed to approve comment' });
  }
});

// POST /api/admin/moderation/comments/:id/reject - Reject comment
router.post('/moderation/comments/:id/reject', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.comment.update({
      where: { id },
      data: { isFlagged: true, isApproved: false }
    });

    // Log action
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'REJECT_COMMENT',
        targetType: 'comment',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Comment rejected' });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({ error: 'Failed to reject comment' });
  }
});

// =============================================================================
// ── Content Reports ──
// =============================================================================

// GET /api/admin/moderation/reports - Get content reports
router.get('/moderation/reports', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status = 'all', type = 'all' } = req.query;

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.contentType = type;
    }

    // Fetch moderation reports
    const reports = await prisma.moderationReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/admin/moderation/reports - Create a report
router.post('/moderation/reports', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { contentType, contentId, reason, description } = req.body;
    
    const report = await prisma.moderationReport.create({
      data: {
        contentType,
        contentId,
        reason,
        description,
        reportedBy: req.user?.id
      }
    });

    res.json({ message: 'Report created', report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// POST /api/admin/moderation/reports/:id/resolve - Resolve a report
router.post('/moderation/reports/:id/resolve', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    
    const report = await prisma.moderationReport.update({
      where: { id },
      data: {
        status: 'resolved',
        resolution: resolution || 'reviewed',
        reviewedBy: req.user?.id,
        reviewedAt: new Date()
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'RESOLVE_REPORT',
        targetType: 'report',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Report resolved' });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// POST /api/admin/moderation/reports/:id/dismiss - Dismiss a report
router.post('/moderation/reports/:id/dismiss', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.moderationReport.update({
      where: { id },
      data: {
        status: 'dismissed',
        resolution: 'cleared',
        reviewedBy: req.user?.id,
        reviewedAt: new Date()
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DISMISS_REPORT',
        targetType: 'report',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Report dismissed' });
  } catch (error) {
    console.error('Error dismissing report:', error);
    res.status(500).json({ error: 'Failed to dismiss report' });
  }
});

// POST /api/admin/moderation/reports/:id/escalate - Escalate a report
router.post('/moderation/reports/:id/escalate', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.moderationReport.update({
      where: { id },
      data: {
        status: 'reviewed'
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'ESCALATE_REPORT',
        targetType: 'report',
        targetId: id,
        details: { escalated: true }
      }
    });

    res.json({ message: 'Report escalated' });
  } catch (error) {
    console.error('Error escalating report:', error);
    res.status(500).json({ error: 'Failed to escalate report' });
  }
});

// =============================================================================
// ── Spam Filter ──
// =============================================================================

// GET /api/admin/moderation/spam/queue - Get spam queue
router.get('/moderation/spam/queue', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get flagged/spam comments
    const spamComments = await prisma.comment.findMany({
      where: {
        OR: [
          { isFlagged: true },
          { content: { contains: 'http', mode: 'insensitive' } }
        ],
        isApproved: false
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const queue = spamComments.map((comment: any) => ({
      id: comment.id,
      type: 'comment' as const,
      content: comment.content.substring(0, 200),
      author: comment.user?.fullName || 'Anonymous',
      authorEmail: comment.user?.email || 'unknown',
      authorIp: 'N/A',
      reason: comment.isFlagged ? 'Flagged by user' : 'Contains links',
      confidence: comment.isFlagged ? 90 : 60,
      detectedAt: comment.createdAt.toISOString(),
      status: 'quarantined' as const
    }));

    res.json({ queue });
  } catch (error) {
    console.error('Error fetching spam queue:', error);
    res.status(500).json({ error: 'Failed to fetch spam queue' });
  }
});

// GET /api/admin/moderation/spam/rules - Get spam rules
router.get('/moderation/spam/rules', requireAdmin, async (req: Request, res: Response) => {
  try {
    const rules = await prisma.spamRule.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ rules });
  } catch (error) {
    console.error('Error fetching spam rules:', error);
    res.status(500).json({ error: 'Failed to fetch spam rules' });
  }
});

// GET /api/admin/moderation/spam/stats - Get spam stats
router.get('/moderation/spam/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [flaggedToday, quarantined, totalComments, rulesCount] = await Promise.all([
      prisma.comment.count({
        where: {
          isFlagged: true,
          updatedAt: { gte: today }
        }
      }),
      prisma.comment.count({
        where: {
          isApproved: false,
          isFlagged: true
        }
      }),
      prisma.comment.count(),
      prisma.spamRule.count({ where: { isActive: true } })
    ]);

    res.json({
      stats: {
        blockedToday: flaggedToday,
        quarantined,
        falsePositives: 0,
        detectionRate: totalComments > 0 ? Math.round((1 - (quarantined / totalComments)) * 100 * 10) / 10 : 100,
        activeRules: rulesCount
      }
    });
  } catch (error) {
    console.error('Error fetching spam stats:', error);
    res.status(500).json({ error: 'Failed to fetch spam stats' });
  }
});

// POST /api/admin/moderation/spam/:id/approve - Approve spam item
router.post('/moderation/spam/:id/approve', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.comment.update({
      where: { id },
      data: { isApproved: true, isFlagged: false }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'APPROVE_SPAM_ITEM',
        targetType: 'comment',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Item approved' });
  } catch (error) {
    console.error('Error approving spam item:', error);
    res.status(500).json({ error: 'Failed to approve item' });
  }
});

// POST /api/admin/moderation/spam/:id/delete - Delete spam item
router.post('/moderation/spam/:id/delete', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.comment.update({
      where: { id },
      data: { isFlagged: true, isApproved: false }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DELETE_SPAM_ITEM',
        targetType: 'comment',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Error deleting spam item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST /api/admin/moderation/spam/rules - Add spam rule
router.post('/moderation/spam/rules', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, pattern, action = 'block' } = req.body;
    
    const rule = await prisma.spamRule.create({
      data: {
        name,
        type,
        pattern,
        action,
        createdBy: req.user?.id
      }
    });
    
    res.json({ message: 'Rule added', rule });
  } catch (error) {
    console.error('Error adding spam rule:', error);
    res.status(500).json({ error: 'Failed to add rule' });
  }
});

// POST /api/admin/moderation/spam/rules/:id/toggle - Toggle spam rule
router.post('/moderation/spam/rules/:id/toggle', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rule = await prisma.spamRule.findUnique({ where: { id } });
    if (!rule) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }
    
    const updated = await prisma.spamRule.update({
      where: { id },
      data: { isActive: !rule.isActive }
    });
    
    res.json({ message: 'Rule toggled', rule: updated });
  } catch (error) {
    console.error('Error toggling spam rule:', error);
    res.status(500).json({ error: 'Failed to toggle rule' });
  }
});

export default router;
