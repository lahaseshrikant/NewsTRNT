// Market Data Routes - All database operations for market data
// This handles caching, fetching from external APIs, and serving data

import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

// Cache durations (in minutes)
const CACHE_DURATION = {
  indices: 30,
  crypto: 5,
  currencies: 60,
  commodities: 30,
};

/**
 * Check if cached data is stale
 */
function isDataStale(lastUpdated: Date, durationMinutes: number): boolean {
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
  return diffMinutes >= durationMinutes;
}

// ============================================
// GET ROUTES - Fetch cached market data
// ============================================

/**
 * GET /api/market/indices
 * Get all cached stock indices
 */
router.get('/indices', async (req: Request, res: Response) => {
  try {
    const { symbols } = req.query;
    
    let whereClause = {};
    if (symbols && typeof symbols === 'string') {
      const symbolList = symbols.split(',').map(s => s.trim());
      whereClause = { symbol: { in: symbolList } };
    }
    
    const indices = await prisma.marketIndex.findMany({
      where: whereClause,
      orderBy: { symbol: 'asc' },
    });
    
    // Check if data needs refresh
    const needsUpdate = indices.length === 0 || 
      indices.some(idx => isDataStale(idx.lastUpdated, CACHE_DURATION.indices));
    
    res.json({
      success: true,
      data: indices,
      needsUpdate,
      count: indices.length,
    });
  } catch (error) {
    console.error('[Market API] Error fetching indices:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch indices' 
    });
  }
});

/**
 * GET /api/market/crypto
 * Get all cached cryptocurrencies
 */
router.get('/crypto', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const cryptos = await prisma.cryptocurrency.findMany({
      orderBy: { marketCap: 'desc' },
      take: limit,
    });
    
    // Check if data needs refresh
    const needsUpdate = cryptos.length === 0 || 
      (cryptos[0] && isDataStale(cryptos[0].lastUpdated, CACHE_DURATION.crypto));
    
    res.json({
      success: true,
      data: cryptos,
      needsUpdate,
      count: cryptos.length,
    });
  } catch (error) {
    console.error('[Market API] Error fetching cryptocurrencies:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch cryptocurrencies' 
    });
  }
});

/**
 * GET /api/market/currencies
 * Get all cached currency rates
 */
router.get('/currencies', async (req: Request, res: Response) => {
  try {
    const rates = await prisma.currencyRate.findMany({
      orderBy: { currency: 'asc' },
    });
    
    // Check if data needs refresh
    const needsUpdate = rates.length === 0 || 
      (rates[0] && isDataStale(rates[0].lastUpdated, CACHE_DURATION.currencies));
    
    res.json({
      success: true,
      data: rates,
      needsUpdate,
      count: rates.length,
    });
  } catch (error) {
    console.error('[Market API] Error fetching currency rates:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch currency rates' 
    });
  }
});

/**
 * GET /api/market/commodities
 * Get all cached commodities
 */
router.get('/commodities', async (req: Request, res: Response) => {
  try {
    const commodities = await prisma.commodity.findMany({
      orderBy: { symbol: 'asc' },
    });
    
    // Check if data needs refresh
    const needsUpdate = commodities.length === 0 || 
      (commodities[0] && isDataStale(commodities[0].lastUpdated, CACHE_DURATION.commodities));
    
    res.json({
      success: true,
      data: commodities,
      needsUpdate,
      count: commodities.length,
    });
  } catch (error) {
    console.error('[Market API] Error fetching commodities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch commodities' 
    });
  }
});

/**
 * GET /api/market/convert
 * Convert currency amounts
 */
router.get('/convert', async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.query;
    
    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: amount, from, to',
      });
    }
    
    const numAmount = parseFloat(amount as string);
    const fromCurrency = (from as string).toUpperCase();
    const toCurrency = (to as string).toUpperCase();
    
    if (fromCurrency === toCurrency) {
      return res.json({
        success: true,
        data: { 
          amount: numAmount, 
          from: fromCurrency, 
          to: toCurrency, 
          result: numAmount 
        },
      });
    }
    
    // Get both currency rates
    const [fromRate, toRate] = await Promise.all([
      prisma.currencyRate.findUnique({ where: { currency: fromCurrency } }),
      prisma.currencyRate.findUnique({ where: { currency: toCurrency } }),
    ]);
    
    if (!fromRate || !toRate) {
      return res.status(404).json({
        success: false,
        error: `Missing rate for ${!fromRate ? fromCurrency : toCurrency}`,
      });
    }
    
    // Convert: amount in FROM -> USD -> TO
    const amountInUSD = numAmount * fromRate.rateToUSD;
    const result = amountInUSD / toRate.rateToUSD;
    
    return res.json({
      success: true,
      data: {
        amount: numAmount,
        from: fromCurrency,
        to: toCurrency,
        result,
        fromRate: fromRate.rateToUSD,
        toRate: toRate.rateToUSD,
      },
    });
  } catch (error) {
    console.error('[Market API] Error converting currency:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to convert currency' 
    });
  }
});

/**
 * GET /api/market/by-country/:country
 * Get market data for a specific country
 */
router.get('/by-country/:country', async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    
    const [indices, commodities, currencies, cryptos] = await Promise.all([
      prisma.marketIndex.findMany({
        where: { country: { equals: country, mode: 'insensitive' } },
        orderBy: { symbol: 'asc' },
      }),
      prisma.commodity.findMany({
        orderBy: { symbol: 'asc' },
      }),
      prisma.currencyRate.findMany({
        orderBy: { currency: 'asc' },
      }),
      prisma.cryptocurrency.findMany({
        orderBy: { marketCap: 'desc' },
        take: 10,
      }),
    ]);
    
    res.json({
      success: true,
      data: {
        indices,
        commodities,
        currencies,
        cryptos,
      },
      country,
    });
  } catch (error) {
    console.error('[Market API] Error fetching country data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch country market data' 
    });
  }
});

// ============================================
// CONFIG ROUTES - Market configuration
// ============================================

/**
 * GET /api/market/config/indices
 * Get configured market indices
 */
router.get('/config/indices', async (req: Request, res: Response) => {
  try {
    const indices = await prisma.marketIndexConfig.findMany({
      where: { isActive: true },
      orderBy: [{ country: 'asc' }, { sortOrder: 'asc' }],
    });
    
    res.json({
      success: true,
      data: indices,
      count: indices.length,
    });
  } catch (error) {
    console.error('[Market API] Error fetching index config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch index configuration' 
    });
  }
});

/**
 * GET /api/market/config/cryptos
 * Get configured cryptocurrencies
 */
router.get('/config/cryptos', async (req: Request, res: Response) => {
  try {
    const cryptos = await prisma.cryptocurrencyConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    
    res.json({
      success: true,
      data: cryptos,
      count: cryptos.length,
    });
  } catch (error) {
    console.error('[Market API] Error fetching crypto config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch crypto configuration' 
    });
  }
});

/**
 * GET /api/market/config/commodities
 * Get configured commodities
 */
router.get('/config/commodities', async (req: Request, res: Response) => {
  try {
    const commodities = await prisma.commodityConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    
    res.json({
      success: true,
      data: commodities,
      count: commodities.length,
    });
  } catch (error) {
    console.error('[Market API] Error fetching commodity config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch commodity configuration' 
    });
  }
});

/**
 * GET /api/market/config/currencies
 * Get configured currencies
 */
router.get('/config/currencies', async (req: Request, res: Response) => {
  try {
    const currencies = await prisma.currencyPairConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    
    res.json({
      success: true,
      data: currencies,
      count: currencies.length,
    });
  } catch (error) {
    console.error('[Market API] Error fetching currency config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch currency configuration' 
    });
  }
});

// ============================================
// UPDATE ROUTES - Trigger data refresh (admin only)
// ============================================

/**
 * POST /api/market/update/indices
 * Update stock index from external provider
 */
router.post('/update/index', async (req: Request, res: Response) => {
  try {
    const { symbol, data } = req.body;
    
    if (!symbol || !data || typeof data.value !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: symbol and data.value required',
      });
    }
    
    const result = await prisma.marketIndex.upsert({
      where: { symbol },
      update: {
        value: data.value,
        previousClose: data.previousClose ?? data.value,
        change: data.change ?? 0,
        changePercent: data.changePercent ?? 0,
        high: data.high ?? data.value,
        low: data.low ?? data.value,
        currency: data.currency ?? 'USD',
        lastUpdated: new Date(),
        lastSource: data.source ?? 'api',
      },
      create: {
        symbol,
        name: data.name ?? symbol,
        country: data.country ?? 'US',
        exchange: data.exchange ?? 'Unknown',
        value: data.value,
        previousClose: data.previousClose ?? data.value,
        change: data.change ?? 0,
        changePercent: data.changePercent ?? 0,
        high: data.high ?? data.value,
        low: data.low ?? data.value,
        currency: data.currency ?? 'USD',
        timezone: data.timezone ?? 'America/New_York',
        lastUpdated: new Date(),
        lastSource: data.source ?? 'api',
      },
    });
    
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Market API] Error updating index:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update index' 
    });
  }
});

/**
 * POST /api/market/update/crypto
 * Update cryptocurrency from external provider
 */
router.post('/update/crypto', async (req: Request, res: Response) => {
  try {
    const { symbol, data } = req.body;
    
    if (!symbol || !data || typeof data.value !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: symbol and data.value required',
      });
    }
    
    const result = await prisma.cryptocurrency.upsert({
      where: { symbol },
      update: {
        value: data.value,
        previousClose: data.previousClose,
        change: data.change,
        changePercent: data.changePercent,
        lastUpdated: new Date(),
      },
      create: {
        symbol,
        name: data.name ?? symbol,
        coinGeckoId: data.coinGeckoId ?? symbol.toLowerCase(),
        value: data.value,
        previousClose: data.previousClose,
        change: data.change,
        changePercent: data.changePercent,
        lastUpdated: new Date(),
      },
    });
    
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Market API] Error updating crypto:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update crypto' 
    });
  }
});

/**
 * POST /api/market/update/currency
 * Update currency rate from external provider
 */
router.post('/update/currency', async (req: Request, res: Response) => {
  try {
    const { currency, data } = req.body;
    
    if (!currency || !data || typeof data.rateToUSD !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: currency and data.rateToUSD required',
      });
    }
    
    const result = await prisma.currencyRate.upsert({
      where: { currency },
      update: {
        rateToUSD: data.rateToUSD,
        lastUpdated: new Date(),
      },
      create: {
        currency,
        currencyName: data.name ?? currency,
        rateToUSD: data.rateToUSD,
        symbol: data.symbol ?? currency,
        lastUpdated: new Date(),
      },
    });
    
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Market API] Error updating currency:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update currency' 
    });
  }
});

/**
 * POST /api/market/update/commodity
 * Update commodity from external provider
 */
router.post('/update/commodity', async (req: Request, res: Response) => {
  try {
    const { symbol, data } = req.body;
    
    if (!symbol || !data || typeof data.value !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: symbol and data.value required',
      });
    }
    
    const result = await prisma.commodity.upsert({
      where: { symbol },
      update: {
        value: data.value,
        previousClose: data.previousClose ?? data.value,
        change: data.change ?? 0,
        changePercent: data.changePercent ?? 0,
        high: data.high,
        low: data.low,
        lastUpdated: new Date(),
      },
      create: {
        symbol,
        name: data.name ?? symbol,
        value: data.value,
        unit: data.unit ?? 'USD',
        previousClose: data.previousClose ?? data.value,
        change: data.change ?? 0,
        changePercent: data.changePercent ?? 0,
        high: data.high,
        low: data.low,
        category: data.category ?? 'commodity',
        lastUpdated: new Date(),
      },
    });
    
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Market API] Error updating commodity:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update commodity' 
    });
  }
});

export default router;
