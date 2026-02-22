/**
 * Market Data Admin Routes
 * Admin-only market data management: live data, providers, auto-update, connectivity
 * Mounted at: /api/market
 */
import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getServiceStatus } from '../lib/market-auto-update';
import {
  updateStockIndices,
  updateCryptocurrencies,
  updateCurrencyRates,
  updateCommodities,
} from '../lib/market-cache';

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

// ── Auto-Update Management (deprecated) ─────────────────────────────────────
// These endpoints traditionally managed the market_auto_update setting. The
// service no longer uses that flag; auto-update is controlled globally via the
// `site_maintenance` system setting. The routes remain for backward
// compatibility (and because the UI still points here) but they simply toggle
// maintenance mode now.

/**
 * GET /api/market/auto-update — Get auto-update (maintenance) status
 */
router.get('/auto-update', async (req: Request, res: Response) => {
  try {
    const maintenance = await prisma.systemSetting.findUnique({
      where: { key: 'site_maintenance' },
    });
    const enabled = maintenance ? (!!maintenance.value && maintenance.value !== 'false') : false;
    const status = await getServiceStatus();

    res.json({
      success: true,
      data: {
        enabled,
        note: 'auto-update follows global maintenance flag',
        intervals: status.intervalsMinutes,
        isRunning: status.isRunning,
      },
    });
  } catch (error) {
    console.error('[Market] Auto-update status error:', error);
    res.status(500).json({ error: 'Failed to fetch auto-update status' });
  }
});

/**
 * POST /api/market/auto-update — Enable maintenance (disables updates)
 */
router.post('/auto-update', async (req: AuthRequest, res: Response) => {
  try {
    const { action, intervals } = req.body as any;

    switch (action) {
      case 'start':
        // disable maintenance
        await prisma.systemSetting.upsert({
          where: { key: 'site_maintenance' },
          update: { value: false, updatedBy: req.user?.id },
          create: {
            key: 'site_maintenance',
            value: false,
            category: 'general',
            description: 'Global maintenance mode (disables background jobs)',
            updatedBy: req.user?.id,
          },
        });
        break;

      case 'stop':
        // enable maintenance
        await prisma.systemSetting.upsert({
          where: { key: 'site_maintenance' },
          update: { value: true, updatedBy: req.user?.id },
          create: {
            key: 'site_maintenance',
            value: true,
            category: 'general',
            description: 'Global maintenance mode (disables background jobs)',
            updatedBy: req.user?.id,
          },
        });
        break;

      case 'update-intervals':
        if (intervals && typeof intervals === 'object') {
          // apply intervals to running service
          const { updateIntervals } = await import('../lib/market-auto-update');
          await updateIntervals(intervals);
        }
        break;

      case 'run-tradingview-scraper':
        // trigger scraper service via runner helper
        const { runTradingViewScraper } = await import('../lib/tradingview-runner');
        await runTradingViewScraper();
        break;

      default:
        // default: treat as enable maintenance for backwards compat
        await prisma.systemSetting.upsert({
          where: { key: 'site_maintenance' },
          update: {
            value: true,
            updatedBy: req.user?.id,
          },
          create: {
            key: 'site_maintenance',
            value: true,
            category: 'general',
            description: 'Global maintenance mode (disables background jobs)',
            updatedBy: req.user?.id,
          },
        });
    }

    const status = await getServiceStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('[Market] Auto-update config error:', error);
    res.status(500).json({ error: 'Failed to update auto-update configuration' });
  }
});

/**
 * PUT /api/market/auto-update — Trigger manual update for specific data type
 * (kept for backward-compatibility; does not touch maintenance)
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

    // perform requested update(s)
    let result: any = {};
    if (!type || type === 'all' || type === 'crypto') {
      result.crypto = await updateCryptocurrencies();
    }
    if (!type || type === 'all' || type === 'currencies') {
      result.currencies = await updateCurrencyRates();
    }
    if (!type || type === 'all' || type === 'commodities') {
      result.commodities = await updateCommodities();
    }
    if (!type || type === 'all' || type === 'indices') {
      result.indices = await updateStockIndices();
    }

    res.json({
      success: true,
      message: `Manual update triggered for: ${type || 'all'}`,
      triggeredAt: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('[Market] Manual update trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger manual update' });
  }
});

/**
 * DELETE /api/market/auto-update — Disable maintenance (reenables updates)
 */
router.delete('/auto-update', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: 'site_maintenance' },
    });

    if (existing) {
      await prisma.systemSetting.update({
        where: { key: 'site_maintenance' },
        data: {
          value: false,
          updatedBy: req.user?.id,
        },
      });
    }

    res.json({ success: true, message: 'Maintenance disabled' });
  } catch (error) {
    console.error('[Market] Disable auto-update error:', error);
    res.status(500).json({ error: 'Failed to disable maintenance' });
  }
});

// ============================================
// INGESTION / SCRAPER ROUTES
// ============================================

/**
 * POST /api/market/ingest
 * Ingest market data sent by an external scraper (TradingView, etc.).
 * Requires either valid admin auth or a bearer key matching
 * process.env.MARKET_INGEST_API_KEY.
 */
router.post('/ingest', async (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (req.user == null && apiKey !== process.env.MARKET_INGEST_API_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { scraperName, dataType, items, generatedAt } = req.body as any;
  if (!dataType || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'dataType and items are required' });
  }

  // start a scraper run log
  const run = await prisma.scraperRun.create({
    data: {
      scraperName: scraperName || 'unknown',
      dataType,
      status: 'running',
      itemsFound: items.length,
      metadata: { generatedAt },
    },
  });

  let inserted = 0;
  let failed = 0;

  try {
    for (const item of items) {
      try {
        switch (dataType) {
          case 'indices': {
            const symbol = item.symbol;
            if (!symbol) throw new Error('missing symbol');
            const previousClose =
              typeof item.previousClose === 'number'
                ? item.previousClose
                : item.last - (item.change || 0);
            await prisma.marketIndex.upsert({
              where: { symbol },
              update: {
                name: item.name ?? symbol,
                country: item.country ?? item.country ?? 'US',
                exchange: item.exchange ?? '',
                value: item.last,
                previousClose,
                change: item.change ?? 0,
                changePercent: item.change_percent ?? 0,
                high: item.high ?? item.last,
                low: item.low ?? item.last,
                currency: item.currency ?? 'USD',
                timezone: item.timezone ?? 'UTC',
                lastUpdated: item.generatedAt ? new Date(item.generatedAt) : new Date(),
                lastSource: item.source || scraperName || 'scraper',
                isStale: false,
              },
              create: {
                symbol,
                name: item.name ?? symbol,
                country: item.country ?? 'US',
                exchange: item.exchange ?? '',
                value: item.last,
                previousClose,
                change: item.change ?? 0,
                changePercent: item.change_percent ?? 0,
                high: item.high ?? item.last,
                low: item.low ?? item.last,
                currency: item.currency ?? 'USD',
                timezone: item.timezone ?? 'UTC',
                lastUpdated: item.generatedAt ? new Date(item.generatedAt) : new Date(),
                lastSource: item.source || scraperName || 'scraper',
              },
            });
            inserted++;
            break;
          }
          case 'crypto':
            // similar upsert logic could be added here if needed
            // for now only indices are expected via scraper
            failed++;
            break;
          case 'currencies':
            failed++;
            break;
          case 'commodities':
            failed++;
            break;
          default:
            failed++;
            break;
        }
      } catch (e) {
        console.error('[Market Ingest] item error', e);
        failed++;
      }
    }

    await prisma.scraperRun.update({
      where: { id: run.id },
      data: {
        status: 'success',
        completedAt: new Date(),
        itemsInserted: inserted,
        itemsFailed: failed,
      },
    });

    return res.json({ success: true, inserted, failed });
  } catch (err) {
    console.error('[Market Ingest] failure:', err);
    await prisma.scraperRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: String(err),
      },
    });
    return res.status(500).json({ success: false, error: 'Ingestion failed', details: err });
  }
});

/**
 * GET /api/market/ingest/stats — return recent scraper runs
 */
router.get('/ingest/stats', async (req: Request, res: Response) => {
  try {
    const runs = await prisma.scraperRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, runs });
  } catch (error) {
    console.error('[Market] ingest stats error', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ingest stats' });
  }
});

export default router;
