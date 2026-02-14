import { Router, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken);

// =============================================================================
// ANALYTICS ENDPOINTS
// =============================================================================

// GET /api/admin/analytics/overview - Get analytics overview
router.get('/analytics/overview', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      totalArticles,
      publishedArticles,
      articlesThisWeek,
      totalViews,
      viewsToday,
      viewsThisWeek,
      totalComments,
      commentsThisWeek,
      totalSubscribers,
      newSubscribersThisWeek
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.article.count({ where: { isDeleted: false } }),
      prisma.article.count({ where: { isDeleted: false, isPublished: true } }),
      prisma.article.count({ where: { isDeleted: false, createdAt: { gte: lastWeek } } }),
      prisma.article.aggregate({ _sum: { viewCount: true }, where: { isDeleted: false } }),
      prisma.analyticsEvent.count({ where: { eventType: 'page_view', createdAt: { gte: today } } }),
      prisma.analyticsEvent.count({ where: { eventType: 'page_view', createdAt: { gte: lastWeek } } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.newsletterSubscription.count({ where: { isActive: true } }),
      prisma.newsletterSubscription.count({ where: { isActive: true, subscribedAt: { gte: lastWeek } } })
    ]);

    res.json({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek
      },
      articles: {
        total: totalArticles,
        published: publishedArticles,
        newThisWeek: articlesThisWeek
      },
      views: {
        total: totalViews._sum.viewCount || 0,
        today: viewsToday,
        thisWeek: viewsThisWeek
      },
      engagement: {
        totalComments: totalComments,
        commentsThisWeek: commentsThisWeek
      },
      subscribers: {
        total: totalSubscribers,
        newThisWeek: newSubscribersThisWeek
      },
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/analytics/realtime - Get realtime analytics
router.get('/analytics/realtime', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      activeUsersNow,
      activeUsersLastHour,
      recentEvents,
      topPagesNow
    ] = await Promise.all([
      // Count unique users in last 5 minutes
      prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: fiveMinutesAgo } }
      }),
      // Count unique users in last hour
      prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: oneHourAgo } }
      }),
      // Recent events
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: fiveMinutesAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      // Top pages in last 5 minutes
      prisma.analyticsEvent.groupBy({
        by: ['pageUrl'],
        where: { 
          eventType: 'page_view',
          createdAt: { gte: fiveMinutesAgo } 
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      activeUsers: {
        now: activeUsersNow.length,
        lastHour: activeUsersLastHour.length
      },
      recentEvents: recentEvents.map((e: any) => ({
        id: e.id,
        type: e.eventType,
        page: e.pageUrl || '/',
        timestamp: e.createdAt.toISOString(),
        sessionId: e.sessionId
      })),
      topPages: topPagesNow.map((p: any) => ({
        path: p.pageUrl || '/',
        views: p._count.id
      })),
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching realtime analytics:', error);
    res.status(500).json({ error: 'Failed to fetch realtime analytics' });
  }
});

// =============================================================================
// DASHBOARD STATS ENDPOINTS
// =============================================================================

// GET /api/admin/stats/dashboard - Get dashboard statistics
router.get('/stats/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalArticles,
      publishedArticles,
      totalCategories,
      totalComments,
      totalSubscribers,
      totalViews,
      recentArticles,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.article.count({ where: { isDeleted: false } }),
      prisma.article.count({ where: { isDeleted: false, isPublished: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.comment.count(),
      prisma.newsletterSubscription.count({ where: { isActive: true } }),
      prisma.article.aggregate({ _sum: { viewCount: true }, where: { isDeleted: false } }),
      prisma.article.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          viewCount: true,
          isPublished: true,
          author: true
        }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true
        }
      })
    ]);

    res.json({
      overview: {
        totalUsers,
        totalArticles,
        publishedArticles,
        draftArticles: totalArticles - publishedArticles,
        totalCategories,
        totalComments,
        totalSubscribers,
        totalViews: totalViews._sum.viewCount || 0
      },
      recentArticles: recentArticles.map((a: any) => ({
        id: a.id,
        title: a.title,
        author: a.author || 'Unknown',
        createdAt: a.createdAt.toISOString(),
        views: a.viewCount,
        status: a.isPublished ? 'published' : 'draft'
      })),
      recentUsers: recentUsers.map((u: any) => ({
        id: u.id,
        name: u.fullName || 'Unknown',
        email: u.email,
        joinedAt: u.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/admin/stats — Alias for /stats/dashboard (backward compat)
router.get('/stats', async (req: AuthRequest, res: Response) => {
  // Forward to the dashboard handler
  req.url = '/stats/dashboard';
  (router as any).handle(req, res, () => {
    res.status(404).json({ error: 'Stats route not found' });
  });
});

export default router;
