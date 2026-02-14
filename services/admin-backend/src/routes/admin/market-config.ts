/**
 * Market Configuration Admin Routes
 * CRUD for indices, cryptos, currencies, commodities configs
 * Mounted at: /api/admin (via barrel index.ts)
 * Paths: /market-config, /market-config/indices, /market-config/cryptos,
 *        /market-config/currencies, /market-config/commodities
 */
import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../../middleware/auth';

const router = Router();

// All routes require authentication + admin
router.use(authenticateToken, requireAdmin);

// ── Overview ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/market-config — Overview of all configs
 */
router.get('/market-config', async (req: Request, res: Response) => {
  try {
    const [indices, cryptos, commodities, currencies] = await Promise.all([
      prisma.marketIndexConfig.count(),
      prisma.cryptocurrencyConfig.count(),
      prisma.commodityConfig.count(),
      prisma.currencyPairConfig.count(),
    ]);

    const [activeIndices, activeCryptos, activeCommodities, activeCurrencies] = await Promise.all([
      prisma.marketIndexConfig.count({ where: { isActive: true } }),
      prisma.cryptocurrencyConfig.count({ where: { isActive: true } }),
      prisma.commodityConfig.count({ where: { isActive: true } }),
      prisma.currencyPairConfig.count({ where: { isActive: true } }),
    ]);

    res.json({
      success: true,
      data: {
        indices: { total: indices, active: activeIndices },
        cryptos: { total: cryptos, active: activeCryptos },
        commodities: { total: commodities, active: activeCommodities },
        currencies: { total: currencies, active: activeCurrencies },
      },
    });
  } catch (error) {
    console.error('[MarketConfig] Overview error:', error);
    res.status(500).json({ error: 'Failed to fetch market config overview' });
  }
});

// ── INDICES ──────────────────────────────────────────────────────────────────

router.get('/market-config/indices', async (req: Request, res: Response) => {
  try {
    const { country, active } = req.query;
    const where: any = {};
    if (country) where.country = country;
    if (active !== undefined) where.isActive = active === 'true';

    const indices = await prisma.marketIndexConfig.findMany({
      where,
      orderBy: [{ country: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json({ success: true, data: indices, count: indices.length });
  } catch (error) {
    console.error('[MarketConfig] Indices list error:', error);
    res.status(500).json({ error: 'Failed to fetch index configs' });
  }
});

router.post('/market-config/indices', async (req: AuthRequest, res: Response) => {
  try {
    const { symbol, name, country, region, exchange, currency, timezone, marketHours, isActive, isGlobal, sortOrder } =
      req.body;

    if (!symbol || !name || !country || !exchange) {
      res.status(400).json({ error: 'symbol, name, country, and exchange are required' });
      return;
    }

    const config = await prisma.marketIndexConfig.create({
      data: {
        symbol,
        name,
        country,
        region: region || [],
        exchange,
        currency: currency || 'USD',
        timezone: timezone || 'America/New_York',
        marketHours: marketHours || { open: '09:30', close: '16:00' },
        isActive: isActive ?? true,
        isGlobal: isGlobal ?? false,
        sortOrder: sortOrder ?? 0,
      },
    });
    res.status(201).json({ success: true, data: config });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Index with this symbol already exists' });
      return;
    }
    console.error('[MarketConfig] Create index error:', error);
    res.status(500).json({ error: 'Failed to create index config' });
  }
});

router.put('/market-config/indices/:id', async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.marketIndexConfig.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: config });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Index config not found' });
      return;
    }
    console.error('[MarketConfig] Update index error:', error);
    res.status(500).json({ error: 'Failed to update index config' });
  }
});

router.delete('/market-config/indices/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.marketIndexConfig.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Index config deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Index config not found' });
      return;
    }
    console.error('[MarketConfig] Delete index error:', error);
    res.status(500).json({ error: 'Failed to delete index config' });
  }
});

// ── CRYPTOCURRENCIES ─────────────────────────────────────────────────────────

router.get('/market-config/cryptos', async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    const where: any = {};
    if (active !== undefined) where.isActive = active === 'true';

    const cryptos = await prisma.cryptocurrencyConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: cryptos, count: cryptos.length });
  } catch (error) {
    console.error('[MarketConfig] Cryptos list error:', error);
    res.status(500).json({ error: 'Failed to fetch crypto configs' });
  }
});

router.post('/market-config/cryptos', async (req: AuthRequest, res: Response) => {
  try {
    const { symbol, name, coinGeckoId, isActive, sortOrder } = req.body;

    if (!symbol || !name || !coinGeckoId) {
      res.status(400).json({ error: 'symbol, name, and coinGeckoId are required' });
      return;
    }

    const config = await prisma.cryptocurrencyConfig.create({
      data: {
        symbol,
        name,
        coinGeckoId,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    res.status(201).json({ success: true, data: config });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Crypto with this symbol or coinGeckoId already exists' });
      return;
    }
    console.error('[MarketConfig] Create crypto error:', error);
    res.status(500).json({ error: 'Failed to create crypto config' });
  }
});

router.put('/market-config/cryptos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.cryptocurrencyConfig.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: config });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Crypto config not found' });
      return;
    }
    console.error('[MarketConfig] Update crypto error:', error);
    res.status(500).json({ error: 'Failed to update crypto config' });
  }
});

router.delete('/market-config/cryptos/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.cryptocurrencyConfig.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Crypto config deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Crypto config not found' });
      return;
    }
    console.error('[MarketConfig] Delete crypto error:', error);
    res.status(500).json({ error: 'Failed to delete crypto config' });
  }
});

// ── CURRENCIES ───────────────────────────────────────────────────────────────

router.get('/market-config/currencies', async (req: Request, res: Response) => {
  try {
    const { type, active } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (active !== undefined) where.isActive = active === 'true';

    const currencies = await prisma.currencyPairConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: currencies, count: currencies.length });
  } catch (error) {
    console.error('[MarketConfig] Currencies list error:', error);
    res.status(500).json({ error: 'Failed to fetch currency configs' });
  }
});

router.post('/market-config/currencies', async (req: AuthRequest, res: Response) => {
  try {
    const { pair, name, base, quote, type, isActive, sortOrder } = req.body;

    if (!pair || !name || !base || !quote) {
      res.status(400).json({ error: 'pair, name, base, and quote are required' });
      return;
    }

    const config = await prisma.currencyPairConfig.create({
      data: {
        pair,
        name,
        base,
        quote,
        type: type || 'major',
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    res.status(201).json({ success: true, data: config });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Currency pair already exists' });
      return;
    }
    console.error('[MarketConfig] Create currency error:', error);
    res.status(500).json({ error: 'Failed to create currency config' });
  }
});

router.put('/market-config/currencies/:id', async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.currencyPairConfig.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: config });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Currency config not found' });
      return;
    }
    console.error('[MarketConfig] Update currency error:', error);
    res.status(500).json({ error: 'Failed to update currency config' });
  }
});

router.delete('/market-config/currencies/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.currencyPairConfig.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Currency config deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Currency config not found' });
      return;
    }
    console.error('[MarketConfig] Delete currency error:', error);
    res.status(500).json({ error: 'Failed to delete currency config' });
  }
});

// ── COMMODITIES ──────────────────────────────────────────────────────────────

router.get('/market-config/commodities', async (req: Request, res: Response) => {
  try {
    const { category, active } = req.query;
    const where: any = {};
    if (category) where.category = category;
    if (active !== undefined) where.isActive = active === 'true';

    const commodities = await prisma.commodityConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: commodities, count: commodities.length });
  } catch (error) {
    console.error('[MarketConfig] Commodities list error:', error);
    res.status(500).json({ error: 'Failed to fetch commodity configs' });
  }
});

router.post('/market-config/commodities', async (req: AuthRequest, res: Response) => {
  try {
    const { symbol, name, category, unit, currency, isActive, sortOrder } = req.body;

    if (!symbol || !name || !category) {
      res.status(400).json({ error: 'symbol, name, and category are required' });
      return;
    }

    const config = await prisma.commodityConfig.create({
      data: {
        symbol,
        name,
        category,
        unit: unit || 'USD',
        currency: currency || 'USD',
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    res.status(201).json({ success: true, data: config });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Commodity with this symbol already exists' });
      return;
    }
    console.error('[MarketConfig] Create commodity error:', error);
    res.status(500).json({ error: 'Failed to create commodity config' });
  }
});

router.put('/market-config/commodities/:id', async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.commodityConfig.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: config });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Commodity config not found' });
      return;
    }
    console.error('[MarketConfig] Update commodity error:', error);
    res.status(500).json({ error: 'Failed to update commodity config' });
  }
});

router.delete('/market-config/commodities/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.commodityConfig.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Commodity config deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Commodity config not found' });
      return;
    }
    console.error('[MarketConfig] Delete commodity error:', error);
    res.status(500).json({ error: 'Failed to delete commodity config' });
  }
});

export default router;
