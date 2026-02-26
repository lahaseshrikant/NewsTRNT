/**
 * Market Data Admin Routes
 * Admin-only market data management: live data, providers, auto-update, connectivity
 * Mounted at: /api/market
 */
import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getServiceStatus } from '../lib/market/auto-update';
import {
  updateStockIndices,
  updateCryptocurrencies,
  updateCurrencyRates,
  updateCommodities,
} from '../lib/market/cache';
import { resolveIndexSymbol } from '../lib/market/symbol-aliases';

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

// (connectivity test endpoint removed; available in git history if needed)

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
          const { updateIntervals } = await import('../lib/market/auto-update');
          await updateIntervals(intervals);
        }
        break;

      case 'run-tradingview-scraper':
        // trigger scraper service via runner helper
        const { runTradingViewScraper } = await import('../lib/market/tradingview-runner');
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
  // authenticate either admin user or ingest key.
  // the Content Engine also delivers so accept its shared key too.
  const validIngestKey = process.env.MARKET_INGEST_API_KEY;
  const validEngineKey = process.env.CONTENT_ENGINE_API_KEY;
  if (
    req.user == null &&
    apiKey !== validIngestKey &&
    apiKey !== validEngineKey
  ) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { scraperName, dataType, items, generatedAt } = req.body as any;
  console.log(`[Market Ingest] received ${items?.length || 0} items type=${dataType} from=${scraperName}`);
  if (!dataType || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'dataType and items are required' });
  }

  // Load the full config so we can:
  //   1. Resolve scraper symbols to canonical ^ -prefixed symbols
  //   2. Override ALL dimension metadata (country, exchange, currency, timezone)
  //      with config values — providers/scrapers only supply live facts (value, change…)
  const configRows = await prisma.marketIndexConfig.findMany({
    select: { symbol: true, country: true, exchange: true, currency: true, timezone: true, name: true },
  });
  const configSymbolSet = new Set<string>(configRows.map(r => r.symbol));
  const configMap = new Map<string, typeof configRows[0]>();
  for (const cfg of configRows) {
    configMap.set(cfg.symbol, cfg);
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

  // History retention: keep this many days of daily history
  const HISTORY_RETENTION_DAYS = 90;

  let inserted = 0;
  let failed = 0;

  try {
    for (const item of items) {
      try {
        switch (dataType) {
          case 'indices': {
            // Resolve scraper symbol to canonical config symbol using alias map
            const rawSymbol: string = item.symbol;
            if (!rawSymbol) throw new Error('missing symbol');
            const canonicalSymbol = resolveIndexSymbol(rawSymbol, configSymbolSet);

            // Config metadata always wins — scrapers/providers only supply live facts
            const cfg = configMap.get(canonicalSymbol);

            const previousClose =
              typeof item.previousClose === 'number'
                ? item.previousClose
                : (item.last ?? 0) - (item.change ?? 0);

            await prisma.marketIndex.upsert({
              where: { symbol: canonicalSymbol },
              update: {
                // name: config display name wins; fall back to scraper name
                name: cfg?.name ?? item.name ?? canonicalSymbol,
                // Use config metadata, fallback to item data
                country: cfg?.country ?? item.country ?? 'US',
                exchange: cfg?.exchange ?? item.exchange ?? '',
                currency: cfg?.currency ?? item.currency ?? 'USD',
                timezone: cfg?.timezone ?? item.timezone ?? 'UTC',
                value: item.last,
                previousClose,
                change: item.change ?? 0,
                changePercent: item.change_percent ?? 0,
                high: item.high ?? item.last,
                low: item.low ?? item.last,
                lastUpdated: item.generatedAt ? new Date(item.generatedAt) : new Date(),
                lastSource: item.source || scraperName || 'scraper',
                isStale: false,
              },
              create: {
                symbol: canonicalSymbol,
                // name: config display name wins; fall back to scraper name
                name: cfg?.name ?? item.name ?? canonicalSymbol,
                country: cfg?.country ?? item.country ?? 'US',
                exchange: cfg?.exchange ?? item.exchange ?? '',
                currency: cfg?.currency ?? item.currency ?? 'USD',
                timezone: cfg?.timezone ?? item.timezone ?? 'UTC',
                value: item.last,
                previousClose,
                change: item.change ?? 0,
                changePercent: item.change_percent ?? 0,
                high: item.high ?? item.last,
                low: item.low ?? item.last,
                lastUpdated: item.generatedAt ? new Date(item.generatedAt) : new Date(),
                lastSource: item.source || scraperName || 'scraper',
              },
            });

            // Write daily history record (upsert to avoid duplicates within same day)
            const dayTs = new Date();
            dayTs.setUTCHours(0, 0, 0, 0);
            await prisma.marketIndexHistory.upsert({
              where: {
                symbol_timestamp_interval: {
                  symbol: canonicalSymbol,
                  timestamp: dayTs,
                  interval: '1d',
                },
              },
              update: {
                value: item.last,
                open: item.open ?? null,
                high: item.high ?? item.last,
                low: item.low ?? item.last,
                close: item.last,
                volume: item.volume ?? null,
                changePercent: item.change_percent ?? 0,
                source: item.source || scraperName || 'scraper',
              },
              create: {
                symbol: canonicalSymbol,
                value: item.last,
                open: item.open ?? null,
                high: item.high ?? item.last,
                low: item.low ?? item.last,
                close: item.last,
                volume: item.volume ?? null,
                changePercent: item.change_percent ?? 0,
                timestamp: dayTs,
                interval: '1d',
                source: item.source || scraperName || 'scraper',
              },
            });

            inserted++;
            break;
          }
          case 'crypto':
            // similar upsert logic could be added here if needed
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

    // Prune history older than the retention window to keep storage lean
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - HISTORY_RETENTION_DAYS);
    const pruned = await prisma.marketIndexHistory.deleteMany({
      where: { timestamp: { lt: cutoff } },
    });
    if (pruned.count > 0) {
      console.log(`[Market Ingest] pruned ${pruned.count} history records older than ${HISTORY_RETENTION_DAYS} days`);
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

    console.log(`[Market Ingest] completed inserted=${inserted} failed=${failed}`);
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
