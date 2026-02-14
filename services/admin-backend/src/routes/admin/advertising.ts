import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken);

// =============================================================================
// ADVERTISING ENDPOINTS
// =============================================================================

// GET /api/admin/advertising/requests - Get ad requests
router.get('/advertising/requests', requireAdmin, async (req: Request, res: Response) => {
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
router.post('/advertising/requests', requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.put('/advertising/requests/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.get('/advertising/campaigns', requireAdmin, async (req: Request, res: Response) => {
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
router.post('/advertising/campaigns', requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.put('/advertising/campaigns/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.get('/advertising/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalCampaigns, activeCampaigns, pendingRequests, campaigns] = await Promise.all([
      prisma.adCampaign.count(),
      prisma.adCampaign.count({ where: { status: 'active' } }),
      prisma.adRequest.count({ where: { status: 'pending' } }),
      prisma.adCampaign.findMany({
        select: { impressions: true, clicks: true, revenue: true }
      })
    ]);
    
    const totalImpressions = campaigns.reduce((sum: any, c: any) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum: any, c: any) => sum + c.clicks, 0);
    const totalRevenue = campaigns.reduce((sum: any, c: any) => sum + c.revenue, 0);
    
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

export default router;
