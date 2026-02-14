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

export default router;
