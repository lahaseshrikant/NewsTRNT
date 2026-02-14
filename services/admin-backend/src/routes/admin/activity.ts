import { Router, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken);

// =============================================================================
// AUDIT LOGS / ACTIVITY ENDPOINTS
// =============================================================================

// GET /api/admin/activity - Get admin activity logs
router.get('/activity', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '50',
      action,
      userId,
      entityType,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (action) where.action = action;
    if (userId) where.adminId = userId;
    if (entityType) where.targetType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true
            }
          }
        }
      }),
      prisma.adminLog.count({ where })
    ]);

    const transformedLogs = logs.map((log: any) => ({
      id: log.id,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details,
      timestamp: log.createdAt.toISOString(),
      user: log.admin ? {
        id: log.admin.id,
        name: log.admin.fullName || 'Unknown',
        email: log.admin.email,
        avatar: log.admin.avatarUrl
      } : null
    }));

    res.json({
      logs: transformedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

export default router;
