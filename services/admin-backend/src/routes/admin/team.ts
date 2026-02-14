import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken);

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

    const transformed = teamMembers.map((member: any) => ({
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
// TEAM INVITES ENDPOINTS
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
      invites: invites.map((i: any) => ({
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

export default router;
