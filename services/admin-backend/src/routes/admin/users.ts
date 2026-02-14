import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken);

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
    const transformedUsers = users.map((user: any) => ({
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
// EXTENDED USER MANAGEMENT — System Users Page
// =============================================================================

// POST /api/admin/users — Create a new user (admin action)
router.post('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { email, fullName, username, password, role, status } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        fullName: fullName || null,
        username: username || email.split('@')[0],
        passwordHash,
        isAdmin: role === 'admin',
        isVerified: status === 'active',
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        isAdmin: true,
        isVerified: true,
        createdAt: true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id === 'glass-breaker' ? null : req.user?.id,
        action: 'CREATE_USER',
        targetType: 'user',
        targetId: user.id,
        details: { email, role: role || 'subscriber' },
        ipAddress: req.ip || req.socket?.remoteAddress || null,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { ...user, role: user.isAdmin ? 'admin' : 'subscriber', status: user.isVerified ? 'active' : 'inactive' },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/admin/users/:id — Full update (System Users page)
router.put('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, fullName, username, password, role, status, interests } = req.body;

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (username !== undefined) updateData.username = username;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);
    if (role !== undefined) updateData.isAdmin = role === 'admin';
    if (status !== undefined) updateData.isVerified = status === 'active';
    if (interests !== undefined) updateData.interests = interests;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, username: true, fullName: true, isAdmin: true, isVerified: true },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id === 'glass-breaker' ? null : req.user?.id,
        action: 'UPDATE_USER',
        targetType: 'user',
        targetId: id,
        details: { changes: Object.keys(req.body) },
        ipAddress: req.ip || req.socket?.remoteAddress || null,
      },
    });

    res.json({
      message: 'User updated successfully',
      user: { ...user, role: user.isAdmin ? 'admin' : 'subscriber', status: user.isVerified ? 'active' : 'inactive' },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// PATCH /api/admin/users/:id/role — Update user role
router.patch('/users/:id/role', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'subscriber'].includes(role)) {
      res.status(400).json({ error: 'Valid role required: admin or subscriber' });
      return;
    }

    // Prevent removing your own admin
    if (req.user?.id === id && role !== 'admin') {
      res.status(400).json({ error: 'Cannot demote yourself' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin: role === 'admin' },
      select: { id: true, email: true, isAdmin: true },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id === 'glass-breaker' ? null : req.user?.id,
        action: 'UPDATE_USER_ROLE',
        targetType: 'user',
        targetId: id,
        details: { newRole: role },
        ipAddress: req.ip || req.socket?.remoteAddress || null,
      },
    });

    res.json({ message: `Role updated to ${role}`, user });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// PATCH /api/admin/users/:id/status — Update user active status
router.patch('/users/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Valid status required: active, inactive, or suspended' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: status === 'active' },
      select: { id: true, email: true, isVerified: true },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id === 'glass-breaker' ? null : req.user?.id,
        action: 'UPDATE_USER_STATUS',
        targetType: 'user',
        targetId: id,
        details: { newStatus: status },
        ipAddress: req.ip || req.socket?.remoteAddress || null,
      },
    });

    res.json({ message: `Status updated to ${status}`, user });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// POST /api/admin/users/bulk — Bulk user operations
router.post('/users/bulk', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { action, userIds } = req.body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ error: 'action and userIds[] are required' });
      return;
    }

    const validActions = ['activate', 'deactivate', 'delete', 'make_admin', 'remove_admin'];
    if (!validActions.includes(action)) {
      res.status(400).json({ error: `Invalid action. Valid: ${validActions.join(', ')}` });
      return;
    }

    // Prevent self-modification
    if (req.user?.id && userIds.includes(req.user.id)) {
      res.status(400).json({ error: 'Cannot include yourself in bulk operations' });
      return;
    }

    let result;
    switch (action) {
      case 'activate':
        result = await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { isVerified: true } });
        break;
      case 'deactivate':
        result = await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { isVerified: false } });
        break;
      case 'delete':
        result = await prisma.user.deleteMany({ where: { id: { in: userIds } } });
        break;
      case 'make_admin':
        result = await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { isAdmin: true } });
        break;
      case 'remove_admin':
        result = await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { isAdmin: false } });
        break;
    }

    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id === 'glass-breaker' ? null : req.user?.id,
        action: 'BULK_USER_ACTION',
        targetType: 'user',
        details: { action, userIds, affectedCount: (result as any)?.count },
        ipAddress: req.ip || req.socket?.remoteAddress || null,
      },
    });

    res.json({
      message: `Bulk ${action} completed`,
      affectedCount: (result as any)?.count || 0,
    });
  } catch (error) {
    console.error('Error in bulk user operation:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation' });
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

    const transformedSubscribers = subscribers.map((sub: any) => ({
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

export default router;
