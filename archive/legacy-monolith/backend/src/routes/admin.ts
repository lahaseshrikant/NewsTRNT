import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();

// =============================================================================
// USER MANAGEMENT ENDPOINTS
// =============================================================================

// GET /api/admin/users - Get all users with pagination and filtering
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      role, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (role && role !== 'all') {
      if (role === 'admin') {
        where.isAdmin = true;
      } else if (role === 'subscriber') {
        where.isAdmin = false;
      }
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        where.isVerified = true;
      } else if (status === 'inactive') {
        where.isVerified = false;
      }
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { username: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          isAdmin: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
          preferences: true,
          interests: true,
          _count: {
            select: {
              articles: true,
              comments: true,
              savedArticles: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.user.count({ where })
    ]);

    // Transform users to expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.fullName || user.username || 'Unknown',
      email: user.email,
      avatar: user.avatarUrl,
      role: user.isAdmin ? 'admin' : 'subscriber',
      status: user.isVerified ? 'active' : 'inactive',
      joinDate: user.createdAt.toISOString(),
      lastLogin: user.lastLoginAt?.toISOString() || null,
      articlesCount: user._count.articles,
      commentsCount: user._count.comments,
      savedArticlesCount: user._count.savedArticles,
      interests: user.interests || []
    }));

    res.json({
      users: transformedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      stats: {
        total,
        active: await prisma.user.count({ where: { ...where, isVerified: true } }),
        admins: await prisma.user.count({ where: { ...where, isAdmin: true } }),
        subscribers: await prisma.user.count({ where: { ...where, isAdmin: false } })
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/users/:id - Get single user details
router.get('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            comments: true,
            savedArticles: true
          }
        },
        articles: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            createdAt: true,
            isPublished: true
          }
        },
        readingHistoryRecords: {
          take: 10,
          orderBy: { readAt: 'desc' },
          include: {
            article: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      ...user,
      role: user.isAdmin ? 'admin' : 'subscriber',
      status: user.isVerified ? 'active' : 'inactive'
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/admin/users/:id - Update user
router.patch('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, role, status, interests } = req.body;

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (role !== undefined) updateData.isAdmin = role === 'admin';
    if (status !== undefined) updateData.isVerified = status === 'active';
    if (interests !== undefined) updateData.interests = interests;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        isAdmin: true,
        isVerified: true
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'UPDATE_USER',
        targetType: 'user',
        targetId: id,
        details: { changes: req.body }
      }
    });

    res.json({
      message: 'User updated successfully',
      user: {
        ...user,
        role: user.isAdmin ? 'admin' : 'subscriber',
        status: user.isVerified ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (req.user?.id === id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DELETE_USER',
        targetType: 'user',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// =============================================================================
// NEWSLETTER SUBSCRIBERS ENDPOINTS
// =============================================================================

// GET /api/admin/subscribers - Get newsletter subscribers
router.get('/subscribers', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      status,
      search,
      sortBy = 'subscribedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (search) {
      where.email = { contains: search as string, mode: 'insensitive' };
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.newsletterSubscription.count({ where })
    ]);

    // Get stats
    const [activeCount, inactiveCount] = await Promise.all([
      prisma.newsletterSubscription.count({ where: { isActive: true } }),
      prisma.newsletterSubscription.count({ where: { isActive: false } })
    ]);

    const transformedSubscribers = subscribers.map(sub => ({
      id: sub.id,
      email: sub.email,
      name: sub.email.split('@')[0],
      subscribedAt: sub.subscribedAt.toISOString(),
      status: sub.isActive ? 'active' : 'inactive',
      frequency: sub.frequency,
      categories: sub.categories,
      source: 'website'
    }));

    res.json({
      subscribers: transformedSubscribers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      stats: {
        total,
        active: activeCount,
        inactive: inactiveCount
      }
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// PATCH /api/admin/subscribers/:id - Update subscriber status
router.patch('/subscribers/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, preferences } = req.body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (preferences !== undefined) updateData.preferences = preferences;

    const subscriber = await prisma.newsletterSubscription.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Subscriber updated successfully',
      subscriber
    });
  } catch (error) {
    console.error('Error updating subscriber:', error);
    res.status(500).json({ error: 'Failed to update subscriber' });
  }
});

// DELETE /api/admin/subscribers/:id - Delete subscriber
router.delete('/subscribers/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.newsletterSubscription.delete({ where: { id } });

    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

// =============================================================================
// TEAM MANAGEMENT ENDPOINTS
// =============================================================================

// GET /api/admin/team - Get admin team members
router.get('/team', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const where: any = {
      isAdmin: true
    };

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { fullName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const teamMembers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        isAdmin: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const transformed = teamMembers.map(member => ({
      id: member.id,
      name: member.fullName || member.username || 'Unknown',
      email: member.email,
      avatar: member.avatarUrl,
      role: 'admin',
      status: member.isVerified ? 'active' : 'inactive',
      joinDate: member.createdAt.toISOString(),
      lastLogin: member.lastLoginAt?.toISOString() || null,
      articlesCount: member._count.articles
    }));

    res.json({
      team: transformed,
      total: transformed.length
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// =============================================================================
// AUDIT LOGS / ACTIVITY ENDPOINTS
// =============================================================================

// GET /api/admin/activity - Get admin activity logs
router.get('/activity', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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

    const transformedLogs = logs.map(log => ({
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

// =============================================================================
// ANALYTICS ENDPOINTS
// =============================================================================

// GET /api/admin/analytics/overview - Get analytics overview
router.get('/analytics/overview', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
router.get('/analytics/realtime', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
      recentEvents: recentEvents.map(e => ({
        id: e.id,
        type: e.eventType,
        page: e.pageUrl || '/',
        timestamp: e.createdAt.toISOString(),
        sessionId: e.sessionId
      })),
      topPages: topPagesNow.map(p => ({
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
// MODERATION ENDPOINTS
// =============================================================================

// GET /api/admin/moderation/queue - Get moderation queue
router.get('/moderation/queue', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
      comments: pendingComments.map(c => ({
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
      articles: reportedArticles.map(a => ({
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
router.post('/moderation/comments/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.post('/moderation/comments/:id/reject', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
// SYSTEM STATS ENDPOINTS
// =============================================================================

// GET /api/admin/stats/dashboard - Get dashboard stats
router.get('/stats/dashboard', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
      recentArticles: recentArticles.map(a => ({
        id: a.id,
        title: a.title,
        author: a.author || 'Unknown',
        createdAt: a.createdAt.toISOString(),
        views: a.viewCount,
        status: a.isPublished ? 'published' : 'draft'
      })),
      recentUsers: recentUsers.map(u => ({
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

// =============================================================================
// CONTENT REPORTS ENDPOINTS
// =============================================================================

// GET /api/admin/moderation/reports - Get content reports
router.get('/moderation/reports', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
router.post('/moderation/reports', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.post('/moderation/reports/:id/resolve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.post('/moderation/reports/:id/dismiss', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.post('/moderation/reports/:id/escalate', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
// SPAM FILTER ENDPOINTS
// =============================================================================

// GET /api/admin/moderation/spam/queue - Get spam queue
router.get('/moderation/spam/queue', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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

    const queue = spamComments.map(comment => ({
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
router.get('/moderation/spam/rules', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
router.get('/moderation/spam/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
router.post('/moderation/spam/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.post('/moderation/spam/:id/delete', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.post('/moderation/spam/rules', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.post('/moderation/spam/rules/:id/toggle', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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

// =============================================================================
// SYSTEM SECURITY ENDPOINTS
// =============================================================================

// GET /api/admin/system/security/events - Get security events
router.get('/system/security/events', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const events = await prisma.securityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ events });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// POST /api/admin/system/security/events - Log a security event
router.post('/system/security/events', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { eventType, severity = 'info', details } = req.body;
    
    const event = await prisma.securityEvent.create({
      data: {
        eventType,
        severity,
        userId: req.user?.id,
        details: details || {}
      }
    });
    
    res.json({ message: 'Security event logged', event });
  } catch (error) {
    console.error('Error logging security event:', error);
    res.status(500).json({ error: 'Failed to log security event' });
  }
});

// GET /api/admin/system/security/stats - Get security stats
router.get('/system/security/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [failedLogins24h, criticalEvents, activeSessions, totalUsers] = await Promise.all([
      prisma.securityEvent.count({
        where: {
          eventType: 'failed_login',
          createdAt: { gte: today }
        }
      }),
      prisma.securityEvent.count({
        where: {
          severity: 'critical',
          resolved: false
        }
      }),
      prisma.user.count({
        where: {
          lastLoginAt: { gte: new Date(Date.now() - 30 * 60 * 1000) }
        }
      }),
      prisma.user.count()
    ]);

    // Calculate security score based on various factors
    let score = 100;
    if (failedLogins24h > 10) score -= 20;
    else if (failedLogins24h > 5) score -= 10;
    if (criticalEvents > 0) score -= 30;
    
    res.json({
      stats: {
        securityScore: Math.max(0, score),
        failedLogins24h,
        criticalEvents,
        blockedIps: 0,
        activeSessions
      }
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({ error: 'Failed to fetch security stats' });
  }
});

// GET /api/admin/system/security/settings - Get security settings
router.get('/system/security/settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Return default settings - would normally come from a settings table
    res.json({
      settings: {
        mfaRequired: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 12,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordExpiry: 90,
        ipWhitelistEnabled: false,
        rateLimiting: true,
        bruteForceProtection: true
      }
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ error: 'Failed to fetch security settings' });
  }
});

// =============================================================================
// SYSTEM INTEGRATIONS ENDPOINTS
// =============================================================================

// GET /api/admin/system/integrations - Get all integrations
router.get('/system/integrations', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const integrations = await prisma.integration.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// POST /api/admin/system/integrations/:id/connect - Connect integration
router.post('/system/integrations/:id/connect', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { apiKey, config } = req.body;
    
    const integration = await prisma.integration.update({
      where: { id },
      data: {
        status: 'connected',
        isActive: true,
        apiKey: apiKey || undefined,
        config: config || undefined,
        lastSyncAt: new Date()
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'CONNECT_INTEGRATION',
        targetType: 'integration',
        targetId: id,
        details: { name: integration.name }
      }
    });

    res.json({ message: 'Integration connected', integration });
  } catch (error) {
    console.error('Error connecting integration:', error);
    res.status(500).json({ error: 'Failed to connect integration' });
  }
});

// POST /api/admin/system/integrations/:id/disconnect - Disconnect integration
router.post('/system/integrations/:id/disconnect', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const integration = await prisma.integration.update({
      where: { id },
      data: {
        status: 'disconnected',
        isActive: false
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DISCONNECT_INTEGRATION',
        targetType: 'integration',
        targetId: id,
        details: { name: integration.name }
      }
    });

    res.json({ message: 'Integration disconnected', integration });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

// =============================================================================
// SYSTEM BACKUP ENDPOINTS
// =============================================================================

// GET /api/admin/system/backups - Get all backups
router.get('/system/backups', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const backups = await prisma.systemBackup.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ backups });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
});

// POST /api/admin/system/backups - Create new backup
router.post('/system/backups', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { type = 'full' } = req.body;
    
    const backup = await prisma.systemBackup.create({
      data: {
        name: `Manual ${type} Backup - ${new Date().toLocaleDateString()}`,
        type,
        status: 'completed',
        size: 'N/A',
        createdBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'CREATE_BACKUP',
        targetType: 'backup',
        targetId: backup.id,
        details: { type }
      }
    });

    res.json({ 
      message: 'Backup created',
      backup
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// POST /api/admin/system/backups/:id/restore - Restore from backup
router.post('/system/backups/:id/restore', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'RESTORE_BACKUP',
        targetType: 'backup',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Restore initiated' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// DELETE /api/admin/system/backups/:id - Delete backup
router.delete('/system/backups/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.systemBackup.delete({ where: { id } });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DELETE_BACKUP',
        targetType: 'backup',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Backup deleted' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// =============================================================================
// NEWSLETTER TEMPLATES ENDPOINTS
// =============================================================================

// GET /api/admin/newsletter/templates - Get all templates
router.get('/newsletter/templates', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// POST /api/admin/newsletter/templates - Create template
router.post('/newsletter/templates', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, subject, type = 'newsletter', content } = req.body;
    
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        type,
        content: content || '',
        createdBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'CREATE_TEMPLATE',
        targetType: 'template',
        targetId: template.id,
        details: req.body
      }
    });

    res.json({ message: 'Template created', template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// POST /api/admin/newsletter/templates/:id/duplicate - Duplicate template
router.post('/newsletter/templates/:id/duplicate', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const original = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!original) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    
    const duplicate = await prisma.emailTemplate.create({
      data: {
        name: `${original.name} (Copy)`,
        subject: original.subject,
        type: original.type,
        content: original.content,
        createdBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DUPLICATE_TEMPLATE',
        targetType: 'template',
        targetId: duplicate.id,
        details: { originalId: id }
      }
    });

    res.json({ message: 'Template duplicated', template: duplicate });
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// DELETE /api/admin/newsletter/templates/:id - Delete template
router.delete('/newsletter/templates/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.emailTemplate.delete({ where: { id } });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DELETE_TEMPLATE',
        targetType: 'template',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// =============================================================================
// MEDIA LIBRARY ENDPOINTS
// =============================================================================

// GET /api/admin/media - Get all media files
router.get('/media', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const files = await prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ files });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/admin/media - Upload media file
router.post('/media', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { filename, originalName, mimeType, size, url, thumbnailUrl, folder, alt, caption } = req.body;
    
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: filename || `file_${Date.now()}`,
        originalName: originalName || 'unknown',
        mimeType: mimeType || 'application/octet-stream',
        size: size || 0,
        url: url || '',
        thumbnailUrl,
        folder: folder || 'uploads',
        alt,
        caption,
        uploadedBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'UPLOAD_MEDIA',
        targetType: 'media',
        targetId: mediaFile.id,
        details: { filename: mediaFile.filename }
      }
    });

    res.json({ message: 'Media uploaded', file: mediaFile });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// DELETE /api/admin/media/:id - Delete media file
router.delete('/media/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.mediaFile.delete({ where: { id } });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DELETE_MEDIA',
        targetType: 'media',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Media deleted' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// =============================================================================
// ADVERTISING ENDPOINTS
// =============================================================================

// GET /api/admin/advertising/requests - Get ad requests
router.get('/advertising/requests', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status = 'all' } = req.query;
    
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    
    const requests = await prisma.adRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching ad requests:', error);
    res.status(500).json({ error: 'Failed to fetch ad requests' });
  }
});

// POST /api/admin/advertising/requests - Create ad request
router.post('/advertising/requests', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, contactName, contactEmail, phone, adType, budget, duration, message } = req.body;
    
    const request = await prisma.adRequest.create({
      data: {
        companyName,
        contactName,
        contactEmail,
        phone,
        adType,
        budget: parseFloat(budget) || 0,
        duration,
        message
      }
    });
    
    res.json({ message: 'Ad request created', request });
  } catch (error) {
    console.error('Error creating ad request:', error);
    res.status(500).json({ error: 'Failed to create ad request' });
  }
});

// PUT /api/admin/advertising/requests/:id - Update ad request status
router.put('/advertising/requests/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const request = await prisma.adRequest.update({
      where: { id },
      data: {
        status,
        notes,
        processedBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: `UPDATE_AD_REQUEST_${status?.toUpperCase()}`,
        targetType: 'ad_request',
        targetId: id,
        details: { status, notes }
      }
    });
    
    res.json({ message: 'Ad request updated', request });
  } catch (error) {
    console.error('Error updating ad request:', error);
    res.status(500).json({ error: 'Failed to update ad request' });
  }
});

// GET /api/admin/advertising/campaigns - Get ad campaigns
router.get('/advertising/campaigns', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.adCampaign.findMany({
      orderBy: { startDate: 'desc' }
    });
    res.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// POST /api/admin/advertising/campaigns - Create campaign
router.post('/advertising/campaigns', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, advertiser, type, budget, startDate, endDate, targetUrl, bannerUrl } = req.body;
    
    const campaign = await prisma.adCampaign.create({
      data: {
        name,
        advertiser,
        type: type || 'banner',
        budget: parseFloat(budget) || 0,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        targetUrl,
        bannerUrl
      }
    });
    
    res.json({ message: 'Campaign created', campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PUT /api/admin/advertising/campaigns/:id - Update campaign
router.put('/advertising/campaigns/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, ...data } = req.body;
    
    const campaign = await prisma.adCampaign.update({
      where: { id },
      data: {
        ...data,
        status
      }
    });
    
    res.json({ message: 'Campaign updated', campaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// GET /api/admin/advertising/stats - Get advertising stats
router.get('/advertising/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalCampaigns, activeCampaigns, pendingRequests, campaigns] = await Promise.all([
      prisma.adCampaign.count(),
      prisma.adCampaign.count({ where: { status: 'active' } }),
      prisma.adRequest.count({ where: { status: 'pending' } }),
      prisma.adCampaign.findMany({
        select: { impressions: true, clicks: true, revenue: true }
      })
    ]);
    
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
    
    res.json({
      stats: {
        totalCampaigns,
        activeCampaigns,
        pendingRequests,
        totalImpressions,
        totalClicks,
        totalRevenue,
        avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching advertising stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// =============================================================================
// SYSTEM SETTINGS ENDPOINTS
// =============================================================================

// GET /api/admin/settings - Get all system settings
router.get('/settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    
    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }]
    });
    
    // Transform to a more usable format (hide secrets)
    const transformed = settings.map(s => ({
      id: s.id,
      key: s.key,
      value: s.isSecret ? '********' : s.value,
      category: s.category,
      description: s.description,
      isSecret: s.isSecret,
      updatedAt: s.updatedAt.toISOString()
    }));
    
    res.json({ settings: transformed });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings/:key - Update a system setting
router.put('/settings/:key', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description, category, isSecret } = req.body;
    
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        description,
        category,
        isSecret,
        updatedBy: req.user?.id
      },
      create: {
        key,
        value,
        description,
        category: category || 'general',
        isSecret: isSecret || false,
        updatedBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'UPDATE_SETTING',
        targetType: 'setting',
        targetId: key,
        details: { category }
      }
    });
    
    res.json({ message: 'Setting updated', setting });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// POST /api/admin/settings/bulk - Bulk update settings
router.post('/settings/bulk', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body;
    
    if (!Array.isArray(settings)) {
      res.status(400).json({ error: 'Settings must be an array' });
      return;
    }
    
    const results = await Promise.all(
      settings.map(async (s: { key: string; value: any; category?: string; description?: string }) => {
        return prisma.systemSetting.upsert({
          where: { key: s.key },
          update: {
            value: s.value,
            description: s.description,
            updatedBy: req.user?.id
          },
          create: {
            key: s.key,
            value: s.value,
            category: s.category || 'general',
            description: s.description,
            updatedBy: req.user?.id
          }
        });
      })
    );
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'BULK_UPDATE_SETTINGS',
        targetType: 'settings',
        targetId: 'bulk',
        details: { count: results.length }
      }
    });
    
    res.json({ message: 'Settings updated', count: results.length });
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// =============================================================================
// SITE CONFIG ENDPOINTS
// =============================================================================

// GET /api/site-config/public - Get public site configuration
// This endpoint returns only configs marked as isPublic=true
// Used by frontend for site branding, contact info, social links, etc.
router.get('/site-config/public', async (req: Request, res: Response) => {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: { isPublic: true }
    });
    
    const configObject: Record<string, any> = {};
    configs.forEach((c: { key: string; value: any }) => {
      configObject[c.key] = c.value;
    });
    
    res.json({ config: configObject });
  } catch (error) {
    console.error('Error fetching public site config:', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// GET /api/admin/site-config - Get site configuration
router.get('/site-config', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { group } = req.query;
    
    const where: any = {};
    if (group && group !== 'all') {
      where.group = group;
    }

    const configs = await prisma.siteConfig.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }]
    });
    
    // Convert to object format for easier consumption
    const configObject: Record<string, any> = {};
    configs.forEach((c: { key: string; value: any }) => {
      configObject[c.key] = c.value;
    });

    res.json({ config: configObject, items: configs });
  } catch (error) {
    console.error('Error fetching site config:', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// PUT /api/admin/site-config/:key - Update site config
router.put('/site-config/:key', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { value, type, label, group, isPublic } = req.body;

    const config = await prisma.siteConfig.upsert({
      where: { key },
      update: { value, type, label, group, isPublic },
      create: {
        key,
        value,
        type: type || 'string',
        label,
        group: group || 'general',
        isPublic: isPublic !== false
      }
    });

    // Note: Frontend cache will auto-refresh after 5 minutes
    // For immediate updates, frontend should refetch

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'UPDATE_SITE_CONFIG',
        targetType: 'site_config',
        targetId: key,
        details: { group }
      }
    });

    res.json({ message: 'Config updated', config });
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// =============================================================================
// TEAM INVITE ENDPOINTS
// =============================================================================

// POST /api/admin/team/invite - Invite a team member
router.post('/team/invite', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !role) {
      res.status(400).json({ error: 'Email and role are required' });
      return;
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }
    
    // Check for pending invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: { email, status: 'pending' }
    });
    if (existingInvite) {
      res.status(400).json({ error: 'Pending invite already exists for this email' });
      return;
    }
    
    // Create invite token
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const invite = await prisma.teamInvite.create({
      data: {
        email,
        role,
        token,
        invitedBy: req.user?.id || '',
        expiresAt
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'INVITE_TEAM_MEMBER',
        targetType: 'team_invite',
        targetId: invite.id,
        details: { email, role }
      }
    });
    
    // In production, send email here
    res.json({ 
      message: 'Invite sent', 
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

// GET /api/admin/team/invites - Get pending invites
router.get('/team/invites', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const invites = await prisma.teamInvite.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      invites: invites.map(i => ({
        id: i.id,
        email: i.email,
        role: i.role,
        status: i.status,
        expiresAt: i.expiresAt.toISOString(),
        createdAt: i.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching invites:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

// DELETE /api/admin/team/invites/:id - Cancel an invite
router.delete('/team/invites/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.teamInvite.update({
      where: { id },
      data: { status: 'cancelled' }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'CANCEL_TEAM_INVITE',
        targetType: 'team_invite',
        targetId: id,
        details: {}
      }
    });
    
    res.json({ message: 'Invite cancelled' });
  } catch (error) {
    console.error('Error cancelling invite:', error);
    res.status(500).json({ error: 'Failed to cancel invite' });
  }
});

// =============================================================================
// SECURITY ENDPOINTS
// =============================================================================

// GET /api/admin/system/security/events - Get security events
router.get('/system/security/events', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const events = await prisma.securityEvent.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      events: events.map(e => ({
        id: e.id,
        type: e.eventType,
        description: (e.details as any)?.description || e.eventType,
        user: e.userId,
        ip: e.ipAddress,
        timestamp: e.createdAt.toISOString(),
        severity: e.severity
      }))
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events', events: [] });
  }
});

// GET /api/admin/system/security/stats - Get security stats
router.get('/system/security/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [failedLogins, blockedIps, activeSessions] = await Promise.all([
      prisma.securityEvent.count({
        where: { eventType: 'login_attempt', createdAt: { gte: yesterday } }
      }),
      prisma.securityEvent.count({
        where: { eventType: 'ip_blocked' }
      }),
      prisma.user.count({
        where: { lastLoginAt: { gte: yesterday } }
      })
    ]);
    
    // Calculate security score based on settings
    let securityScore = 50;
    const settings = await prisma.systemSetting.findMany({
      where: { category: 'security' }
    });
    const settingsMap: Record<string, string> = {};
    settings.forEach((s: { key: string; value: any }) => { settingsMap[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value); });
    
    if (settingsMap['mfaRequired'] === 'true') securityScore += 15;
    if (settingsMap['bruteForceProtection'] === 'true') securityScore += 10;
    if (settingsMap['rateLimiting'] === 'true') securityScore += 10;
    if (settingsMap['ipWhitelistEnabled'] === 'true') securityScore += 5;
    if (parseInt(settingsMap['passwordMinLength'] || '8') >= 12) securityScore += 10;
    
    res.json({
      stats: {
        securityScore: Math.min(100, securityScore),
        failedLogins24h: failedLogins,
        blockedIps: blockedIps,
        activeSessions: activeSessions
      }
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({ 
      stats: { securityScore: 50, failedLogins24h: 0, blockedIps: 0, activeSessions: 0 }
    });
  }
});

// GET /api/admin/system/security/settings - Get security settings
router.get('/system/security/settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { category: 'security' }
    });
    
    const defaultSettings = {
      mfaRequired: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 12,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      passwordExpiry: 90,
      ipWhitelistEnabled: false,
      rateLimiting: true,
      bruteForceProtection: true
    };
    
    const settingsObj: Record<string, any> = { ...defaultSettings };
    settings.forEach((s: { key: string; value: any }) => {
      try {
        settingsObj[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
      } catch {
        settingsObj[s.key] = s.value;
      }
    });
    
    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ error: 'Failed to fetch security settings' });
  }
});

// PUT /api/admin/system/security/settings - Update security settings
router.put('/system/security/settings', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { 
          value: JSON.stringify(value),
          category: 'security',
          updatedBy: req.user?.id
        },
        create: {
          category: 'security',
          key,
          value: JSON.stringify(value),
          description: key.replace(/([A-Z])/g, ' $1').trim()
        }
      });
    }
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'UPDATE_SECURITY_SETTINGS',
        targetType: 'security_settings',
        details: { keys: Object.keys(settings) }
      }
    });
    
    res.json({ message: 'Security settings updated', settings });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

export default router;

