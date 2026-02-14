import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();

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

export default router;
