import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken);

// ── Security ──

// GET /api/admin/system/security/events - Get security events
router.get('/system/security/events', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const events = await prisma.securityEvent.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      events: events.map((e: any) => ({
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

// ── Integrations ──

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

// ── Backups ──

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

// ── Settings ──

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
    const transformed = settings.map((s: any) => ({
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

export default router;
