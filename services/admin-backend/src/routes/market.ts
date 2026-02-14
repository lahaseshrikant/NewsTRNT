/**
 * Market Data Admin Routes
 * Admin-only market data management: live data, providers, auto-update, connectivity
 * Mounted at: /api/market
 */
import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);

// ── Live Data ────────────────────────────────────────────────────────────────

/**
 * GET /api/market/live — Get all live market data (cached from DB)
 */
router.get('/live', async (req: Request, res: Response) => {
  try {
    const [indices, cryptos, currencies, commodities] = await Promise.all([
      prisma.marketIndex.findMany({ orderBy: { symbol: 'asc' } }),
      prisma.cryptocurrency.findMany({ orderBy: { marketCap: 'desc' }, take: 20 }),
      prisma.currencyRate.findMany({ orderBy: { currency: 'asc' } }),
      prisma.commodity.findMany({ orderBy: { symbol: 'asc' } }),
    ]);

    res.json({
      success: true,
      data: { indices, cryptos, currencies, commodities },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Market] Live data error:', error);
    res.status(500).json({ error: 'Failed to fetch live market data' });
  }
});

/**
 * GET /api/market/crypto — Get cached cryptocurrencies
 */
router.get('/crypto', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const cryptos = await prisma.cryptocurrency.findMany({
      orderBy: { marketCap: 'desc' },
      take: limit,
    });
    res.json({ success: true, data: cryptos, count: cryptos.length });
  } catch (error) {
    console.error('[Market] Crypto error:', error);
    res.status(500).json({ error: 'Failed to fetch cryptocurrencies' });
  }
});

/**
 * GET /api/market/currencies — Get cached currency rates
 */
router.get('/currencies', async (req: Request, res: Response) => {
  try {
    const rates = await prisma.currencyRate.findMany({ orderBy: { currency: 'asc' } });
    res.json({ success: true, data: rates, count: rates.length });
  } catch (error) {
    console.error('[Market] Currencies error:', error);
    res.status(500).json({ error: 'Failed to fetch currency rates' });
  }
});

/**
 * GET /api/market/country/:code — Get market data by country
 */
router.get('/country/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const indices = await prisma.marketIndex.findMany({
      where: { country: { equals: code, mode: 'insensitive' } },
      orderBy: { symbol: 'asc' },
    });
    res.json({ success: true, data: { indices }, country: code });
  } catch (error) {
    console.error('[Market] Country data error:', error);
    res.status(500).json({ error: 'Failed to fetch country market data' });
  }
});

// ── Connectivity Test ────────────────────────────────────────────────────────

/**
 * GET /api/market/test-connectivity — Test database and external API connectivity
 */
router.get('/test-connectivity', async (req: Request, res: Response) => {
  try {
    const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

    // Database check
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', latency: Date.now() - dbStart };
    } catch (e: any) {
      checks.database = { status: 'error', error: e.message };
    }

    // Market data freshness check
    try {
      const latestIndex = await prisma.marketIndex.findFirst({ orderBy: { lastUpdated: 'desc' } });
      const latestCrypto = await prisma.cryptocurrency.findFirst({ orderBy: { lastUpdated: 'desc' } });

      checks.marketData = {
        status: 'ok',
        latency: 0,
      };

      if (latestIndex) {
        const ageMinutes = (Date.now() - latestIndex.lastUpdated.getTime()) / 60000;
        checks.indices = {
          status: ageMinutes < 60 ? 'ok' : ageMinutes < 720 ? 'stale' : 'outdated',
          latency: Math.round(ageMinutes),
        };
      } else {
        checks.indices = { status: 'empty' };
      }

      if (latestCrypto) {
        const ageMinutes = (Date.now() - latestCrypto.lastUpdated.getTime()) / 60000;
        checks.crypto = {
          status: ageMinutes < 15 ? 'ok' : ageMinutes < 120 ? 'stale' : 'outdated',
          latency: Math.round(ageMinutes),
        };
      } else {
        checks.crypto = { status: 'empty' };
      }
    } catch (e: any) {
      checks.marketData = { status: 'error', error: e.message };
    }

    const overallStatus = Object.values(checks).every((c) => c.status === 'ok') ? 'healthy' : 'degraded';
    res.json({ success: true, status: overallStatus, checks });
  } catch (error) {
    console.error('[Market] Connectivity test error:', error);
    res.status(500).json({ error: 'Connectivity test failed' });
  }
});

// ── Provider Management ──────────────────────────────────────────────────────

/**
 * GET /api/market/providers — Get configured market data providers
 */
router.get('/providers', async (req: Request, res: Response) => {
  try {
    // Read provider config from system settings
    const providerSettings = await prisma.systemSetting.findMany({
      where: {
        key: { startsWith: 'market_provider_' },
      },
    });

    const providers = providerSettings.map((s: any) => ({
      key: s.key.replace('market_provider_', ''),
      config: s.value,
      updatedAt: s.updatedAt,
    }));

    // If no settings exist, return defaults
    if (providers.length === 0) {
      res.json({
        success: true,
        data: [
          { key: 'indices', provider: 'tradingview', enabled: true, apiKey: null },
          { key: 'crypto', provider: 'coingecko', enabled: true, apiKey: null },
          { key: 'currencies', provider: 'exchangerate', enabled: true, apiKey: null },
          { key: 'commodities', provider: 'tradingview', enabled: true, apiKey: null },
        ],
      });
      return;
    }

    res.json({ success: true, data: providers });
  } catch (error) {
    console.error('[Market] Providers error:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

/**
 * PUT /api/market/providers — Update provider configuration
 */
router.put('/providers', async (req: AuthRequest, res: Response) => {
  try {
    const { providers } = req.body;

    if (!providers || !Array.isArray(providers)) {
      res.status(400).json({ error: 'providers array is required' });
      return;
    }

    const results = [];
    for (const provider of providers) {
      const result = await prisma.systemSetting.upsert({
        where: { key: `market_provider_${provider.key}` },
        update: {
          value: provider.config || provider,
          updatedBy: req.user?.id,
        },
        create: {
          key: `market_provider_${provider.key}`,
          value: provider.config || provider,
          category: 'market',
          description: `Market data provider config for ${provider.key}`,
          updatedBy: req.user?.id,
        },
      });
      results.push(result);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('[Market] Update providers error:', error);
    res.status(500).json({ error: 'Failed to update providers' });
  }
});

// ── Auto-Update Management ───────────────────────────────────────────────────

/**
 * GET /api/market/auto-update — Get auto-update status and configuration
 */
router.get('/auto-update', async (req: Request, res: Response) => {
  try {
    const autoUpdateSetting = await prisma.systemSetting.findUnique({
      where: { key: 'market_auto_update' },
    });

    const defaultConfig = {
      enabled: false,
      intervalMinutes: 30,
      indices: true,
      crypto: true,
      currencies: true,
      commodities: true,
      lastRun: null,
      nextRun: null,
    };

    res.json({
      success: true,
      data: autoUpdateSetting ? autoUpdateSetting.value : defaultConfig,
    });
  } catch (error) {
    console.error('[Market] Auto-update status error:', error);
    res.status(500).json({ error: 'Failed to fetch auto-update status' });
  }
});

/**
 * POST /api/market/auto-update — Enable/configure auto-update
 */
router.post('/auto-update', async (req: AuthRequest, res: Response) => {
  try {
    const config = req.body;

    const result = await prisma.systemSetting.upsert({
      where: { key: 'market_auto_update' },
      update: {
        value: config,
        updatedBy: req.user?.id,
      },
      create: {
        key: 'market_auto_update',
        value: config,
        category: 'market',
        description: 'Market data auto-update configuration',
        updatedBy: req.user?.id,
      },
    });

    res.json({ success: true, data: result.value });
  } catch (error) {
    console.error('[Market] Auto-update config error:', error);
    res.status(500).json({ error: 'Failed to update auto-update config' });
  }
});

/**
 * PUT /api/market/auto-update — Trigger manual update for specific data type
 */
router.put('/auto-update', async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.body; // 'indices', 'crypto', 'currencies', 'commodities', 'all'

    // Log the manual trigger
    if (req.user?.id) {
      await prisma.adminLog.create({
        data: {
          adminId: req.user.id === 'glass-breaker' ? null : req.user.id,
          action: 'MARKET_MANUAL_UPDATE',
          targetType: 'market',
          targetId: type || 'all',
          details: { type, triggeredBy: req.user.email },
          ipAddress: req.ip || req.socket?.remoteAddress || null,
        },
      });
    }

    // TODO: Trigger actual market data fetch from providers
    // For now, return acknowledgment
    res.json({
      success: true,
      message: `Manual update triggered for: ${type || 'all'}`,
      triggeredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Market] Manual update trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger manual update' });
  }
});

/**
 * DELETE /api/market/auto-update — Disable auto-update
 */
router.delete('/auto-update', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: 'market_auto_update' },
    });

    if (existing) {
      await prisma.systemSetting.update({
        where: { key: 'market_auto_update' },
        data: {
          value: { ...(existing.value as any), enabled: false },
          updatedBy: req.user?.id,
        },
      });
    }

    res.json({ success: true, message: 'Auto-update disabled' });
  } catch (error) {
    console.error('[Market] Disable auto-update error:', error);
    res.status(500).json({ error: 'Failed to disable auto-update' });
  }
});

export default router;
