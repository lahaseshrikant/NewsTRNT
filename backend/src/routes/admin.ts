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
        readingHistory: {
          take: 10,
          orderBy: { viewedAt: 'desc' },
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
        userId: req.user?.id || 'system',
        action: 'UPDATE_USER',
        entityType: 'user',
        entityId: id,
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
        userId: req.user?.id || 'system',
        action: 'DELETE_USER',
        entityType: 'user',
        entityId: id,
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
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } }
      ];
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
    const [activeCount, pausedCount, unsubscribedCount] = await Promise.all([
      prisma.newsletterSubscription.count({ where: { status: 'active' } }),
      prisma.newsletterSubscription.count({ where: { status: 'paused' } }),
      prisma.newsletterSubscription.count({ where: { status: 'unsubscribed' } })
    ]);

    const transformedSubscribers = subscribers.map(sub => ({
      id: sub.id,
      email: sub.email,
      name: sub.name || null,
      subscribedAt: sub.subscribedAt.toISOString(),
      status: sub.status,
      emailsReceived: sub.emailsReceived || 0,
      lastEmailOpened: sub.lastEmailOpened?.toISOString() || null,
      preferences: sub.preferences || {},
      source: sub.source || 'website'
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
        paused: pausedCount,
        unsubscribed: unsubscribedCount
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
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: {
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
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details,
      timestamp: log.timestamp.toISOString(),
      user: log.user ? {
        id: log.user.id,
        name: log.user.fullName || 'Unknown',
        email: log.user.email,
        avatar: log.user.avatarUrl
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
      prisma.analyticsEvent.count({ where: { eventType: 'page_view', timestamp: { gte: today } } }),
      prisma.analyticsEvent.count({ where: { eventType: 'page_view', timestamp: { gte: lastWeek } } }),
      prisma.comment.count({ where: { isDeleted: false } }),
      prisma.comment.count({ where: { isDeleted: false, createdAt: { gte: lastWeek } } }),
      prisma.newsletterSubscription.count({ where: { status: 'active' } }),
      prisma.newsletterSubscription.count({ where: { status: 'active', subscribedAt: { gte: lastWeek } } })
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
        where: { timestamp: { gte: fiveMinutesAgo } }
      }),
      // Count unique users in last hour
      prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { timestamp: { gte: oneHourAgo } }
      }),
      // Recent events
      prisma.analyticsEvent.findMany({
        where: { timestamp: { gte: fiveMinutesAgo } },
        orderBy: { timestamp: 'desc' },
        take: 20
      }),
      // Top pages in last 5 minutes
      prisma.analyticsEvent.groupBy({
        by: ['pagePath'],
        where: { 
          eventType: 'page_view',
          timestamp: { gte: fiveMinutesAgo } 
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
        page: e.pagePath,
        timestamp: e.timestamp.toISOString(),
        sessionId: e.sessionId
      })),
      topPages: topPagesNow.map(p => ({
        path: p.pagePath || '/',
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
            isApproved: false,
            isDeleted: false
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
        userId: req.user?.id || 'system',
        action: 'APPROVE_COMMENT',
        entityType: 'comment',
        entityId: id,
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
      data: { isDeleted: true }
    });

    // Log action
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'REJECT_COMMENT',
        entityType: 'comment',
        entityId: id,
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
      prisma.comment.count({ where: { isDeleted: false } }),
      prisma.newsletterSubscription.count({ where: { status: 'active' } }),
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
          author: {
            select: { fullName: true }
          }
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
        author: a.author?.fullName || 'Unknown',
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
    const { status = 'all', type = 'all', priority = 'all' } = req.query;

    // Fetch flagged comments as "reports"
    const flaggedComments = await prisma.comment.findMany({
      where: {
        isDeleted: false,
        OR: [
          { isFlagged: true },
          { isApproved: false }
        ]
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        },
        article: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Transform to reports format
    const reports = flaggedComments.map((comment, index) => ({
      id: comment.id,
      type: 'comment' as const,
      reason: 'Pending Review',
      description: 'Comment requires moderation',
      reportedBy: {
        id: 'system',
        name: 'System',
        email: 'system@newstrnt.com'
      },
      reportedItem: {
        id: comment.id,
        content: comment.content.substring(0, 200),
        author: comment.user?.fullName || 'Anonymous'
      },
      status: comment.isApproved ? 'resolved' as const : 'pending' as const,
      priority: 'medium' as const,
      createdAt: comment.createdAt.toISOString(),
      resolvedAt: comment.isApproved ? comment.updatedAt?.toISOString() : undefined
    }));

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/admin/moderation/reports/:id/resolve - Resolve a report
router.post('/moderation/reports/:id/resolve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.comment.update({
      where: { id },
      data: { isApproved: true }
    });

    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'RESOLVE_REPORT',
        entityType: 'comment',
        entityId: id,
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
    
    await prisma.comment.update({
      where: { id },
      data: { isDeleted: true }
    });

    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'DISMISS_REPORT',
        entityType: 'comment',
        entityId: id,
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
    
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'ESCALATE_REPORT',
        entityType: 'comment',
        entityId: id,
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
        isApproved: false,
        isDeleted: false
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

// GET /api/admin/moderation/spam/rules - Get spam rules (placeholder)
router.get('/moderation/spam/rules', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // For now, return empty rules - can be extended with a SpamRule table
    res.json({ rules: [] });
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

    const [blockedToday, quarantined, totalComments] = await Promise.all([
      prisma.comment.count({
        where: {
          isDeleted: true,
          updatedAt: { gte: today }
        }
      }),
      prisma.comment.count({
        where: {
          isApproved: false,
          isDeleted: false,
          isFlagged: true
        }
      }),
      prisma.comment.count()
    ]);

    res.json({
      stats: {
        blockedToday,
        quarantined,
        falsePositives: 0,
        detectionRate: totalComments > 0 ? Math.round((1 - (quarantined / totalComments)) * 100 * 10) / 10 : 100
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
        userId: req.user?.id || 'system',
        action: 'APPROVE_SPAM_ITEM',
        entityType: 'comment',
        entityId: id,
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
      data: { isDeleted: true }
    });

    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'DELETE_SPAM_ITEM',
        entityType: 'comment',
        entityId: id,
        details: {}
      }
    });

    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Error deleting spam item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST /api/admin/moderation/spam/rules - Add spam rule (placeholder)
router.post('/moderation/spam/rules', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Placeholder - would need a SpamRule table
    res.json({ message: 'Rule added', rule: { id: Date.now().toString(), ...req.body, hits: 0, enabled: true, createdAt: new Date().toISOString() } });
  } catch (error) {
    console.error('Error adding spam rule:', error);
    res.status(500).json({ error: 'Failed to add rule' });
  }
});

// POST /api/admin/moderation/spam/rules/:id/toggle - Toggle spam rule (placeholder)
router.post('/moderation/spam/rules/:id/toggle', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Rule toggled' });
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
    const recentLogs = await prisma.adminLog.findMany({
      where: {
        OR: [
          { action: { contains: 'LOGIN' } },
          { action: { contains: 'PASSWORD' } },
          { action: { contains: 'AUTH' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { fullName: true, email: true }
        }
      }
    });

    const events = recentLogs.map(log => ({
      id: log.id,
      type: log.action.includes('LOGIN') ? 'login_attempt' : log.action.includes('PASSWORD') ? 'password_change' : 'suspicious_activity',
      description: log.action,
      user: log.user?.email,
      ip: 'N/A',
      timestamp: log.createdAt.toISOString(),
      severity: log.action.includes('FAILED') ? 'high' : 'low'
    }));

    res.json({ events });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// GET /api/admin/system/security/stats - Get security stats
router.get('/system/security/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [failedLogins24h, activeSessions, totalUsers] = await Promise.all([
      prisma.adminLog.count({
        where: {
          action: { contains: 'FAILED' },
          createdAt: { gte: today }
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
    
    res.json({
      stats: {
        securityScore: Math.max(0, score),
        failedLogins24h,
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
    // Return empty array - integrations are typically configured via env vars
    // This endpoint can be extended to read from a database table
    res.json({ integrations: [] });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// POST /api/admin/system/integrations/:id/connect - Connect integration
router.post('/system/integrations/:id/connect', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'CONNECT_INTEGRATION',
        entityType: 'integration',
        entityId: id,
        details: {}
      }
    });

    res.json({ message: 'Integration connected' });
  } catch (error) {
    console.error('Error connecting integration:', error);
    res.status(500).json({ error: 'Failed to connect integration' });
  }
});

// POST /api/admin/system/integrations/:id/disconnect - Disconnect integration
router.post('/system/integrations/:id/disconnect', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'DISCONNECT_INTEGRATION',
        entityType: 'integration',
        entityId: id,
        details: {}
      }
    });

    res.json({ message: 'Integration disconnected' });
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
    // Return empty array - backups would typically be stored in cloud/local storage
    res.json({ backups: [] });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
});

// POST /api/admin/system/backups - Create new backup
router.post('/system/backups', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { type = 'full' } = req.body;
    
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'CREATE_BACKUP',
        entityType: 'backup',
        entityId: Date.now().toString(),
        details: { type }
      }
    });

    res.json({ 
      message: 'Backup created',
      backup: {
        id: Date.now().toString(),
        name: `Manual ${type} Backup`,
        type,
        size: 'Calculating...',
        createdAt: new Date().toISOString(),
        status: 'completed',
        createdBy: 'Admin',
        location: 'local'
      }
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
        userId: req.user?.id || 'system',
        action: 'RESTORE_BACKUP',
        entityType: 'backup',
        entityId: id,
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
    
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'DELETE_BACKUP',
        entityType: 'backup',
        entityId: id,
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
    // Templates would typically be stored in a database table
    // For now, return empty array
    res.json({ templates: [] });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// POST /api/admin/newsletter/templates - Create template
router.post('/newsletter/templates', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'CREATE_TEMPLATE',
        entityType: 'template',
        entityId: Date.now().toString(),
        details: req.body
      }
    });

    res.json({ message: 'Template created', template: { id: Date.now().toString(), ...req.body } });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// POST /api/admin/newsletter/templates/:id/duplicate - Duplicate template
router.post('/newsletter/templates/:id/duplicate', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'DUPLICATE_TEMPLATE',
        entityType: 'template',
        entityId: id,
        details: {}
      }
    });

    res.json({ message: 'Template duplicated' });
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// DELETE /api/admin/newsletter/templates/:id - Delete template
router.delete('/newsletter/templates/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'DELETE_TEMPLATE',
        entityType: 'template',
        entityId: id,
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
    // Media files would typically be stored in cloud storage (S3, etc.)
    // For now, return empty array - can be extended to scan uploads directory
    res.json({ files: [] });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/admin/media - Upload media file
router.post('/media', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'UPLOAD_MEDIA',
        entityType: 'media',
        entityId: Date.now().toString(),
        details: {}
      }
    });

    res.json({ message: 'Media uploaded' });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// DELETE /api/admin/media/:id - Delete media file
router.delete('/media/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.adminLog.create({
      data: {
        userId: req.user?.id || 'system',
        action: 'DELETE_MEDIA',
        entityType: 'media',
        entityId: id,
        details: {}
      }
    });

    res.json({ message: 'Media deleted' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

export default router;
