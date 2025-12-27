// Market configuration from database - replaces hardcoded config files
// Admin can now manage indices/cryptos/commodities through UI
// @ts-nocheck - Prisma client types

import prisma from '@backend/config/database';

interface MarketIndexConfig {
  symbol: string;
  name: string;
  country: string;
  region: string[];
  exchange: string;
  currency: string;
  timezone: string;
  marketHours: { open: string; close: string };
  isActive: boolean;
  isGlobal: boolean;
  sortOrder: number;
}

interface CryptoConfig {
  symbol: string;
  name: string;
  coinGeckoId: string;
  isActive: boolean;
  sortOrder: number;
}

interface CommodityConfig {
  symbol: string;
  name: string;
  category: string;
  unit: string;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

interface CurrencyPairConfig {
  pair: string;
  name: string;
  base: string;
  quote: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
}

// Cache configuration in memory for 5 minutes to reduce database queries
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let configCache: {
  indices?: { data: MarketIndexConfig[]; timestamp: number };
  cryptos?: { data: CryptoConfig[]; timestamp: number };
  commodities?: { data: CommodityConfig[]; timestamp: number };
  currencies?: { data: CurrencyPairConfig[]; timestamp: number };
} = {};

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Get all active market indices from database
 * Sorted by sortOrder, cached for 5 minutes
 */
export async function getMarketIndices(options?: {
  country?: string;
  region?: string;
  includeInactive?: boolean;
}): Promise<MarketIndexConfig[]> {
  const cacheKey = `${options?.country || ''}_${options?.region || ''}_${options?.includeInactive || false}`;
  
  if (configCache.indices && isCacheValid(configCache.indices.timestamp) && !options) {
    return configCache.indices.data;
  }

  try {
    const where: any = {};
    
    if (!options?.includeInactive) {
      where.isActive = true;
    }
    
    if (options?.country) {
      where.country = options.country;
    }
    
    if (options?.region) {
      where.region = { has: options.region };
    }

    const indices = await prisma.marketIndexConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const data = indices.map((idx) => ({
      symbol: idx.symbol,
      name: idx.name,
      country: idx.country,
      region: idx.region,
      exchange: idx.exchange,
      currency: idx.currency,
      timezone: idx.timezone,
      marketHours: idx.marketHours as { open: string; close: string },
      isActive: idx.isActive,
      isGlobal: idx.isGlobal,
      sortOrder: idx.sortOrder,
    }));

    // Cache only if no filters applied
    if (!options) {
      configCache.indices = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Error fetching market indices config:', error);
    // Return empty array instead of throwing to prevent breaking the app
    return [];
  }
}

/**
 * Get indices by country code
 */
export async function getIndicesByCountry(countryCode: string): Promise<MarketIndexConfig[]> {
  return getMarketIndices({ country: countryCode });
}

/**
 * Get global indices (shown in dashboard overview)
 */
export async function getGlobalIndices(): Promise<MarketIndexConfig[]> {
  try {
    const indices = await prisma.marketIndexConfig.findMany({
      where: { isActive: true, isGlobal: true },
      orderBy: { sortOrder: 'asc' },
    });

    return indices.map((idx) => ({
      symbol: idx.symbol,
      name: idx.name,
      country: idx.country,
      region: idx.region,
      exchange: idx.exchange,
      currency: idx.currency,
      timezone: idx.timezone,
      marketHours: idx.marketHours as { open: string; close: string },
      isActive: idx.isActive,
      isGlobal: idx.isGlobal,
      sortOrder: idx.sortOrder,
    }));
  } catch (error) {
    console.error('Error fetching global indices:', error);
    return [];
  }
}

/**
 * Get all active cryptocurrencies from database
 */
export async function getCryptocurrencies(includeInactive = false): Promise<CryptoConfig[]> {
  if (configCache.cryptos && isCacheValid(configCache.cryptos.timestamp) && !includeInactive) {
    return configCache.cryptos.data;
  }

  try {
    const where = includeInactive ? {} : { isActive: true };
    
    const cryptos = await prisma.cryptocurrencyConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const data = cryptos.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      coinGeckoId: c.coinGeckoId,
      isActive: c.isActive,
      sortOrder: c.sortOrder,
    }));

    if (!includeInactive) {
      configCache.cryptos = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Error fetching cryptocurrency config:', error);
    return [];
  }
}

/**
 * Get all active commodities from database
 */
export async function getCommodities(options?: {
  category?: string;
  includeInactive?: boolean;
}): Promise<CommodityConfig[]> {
  const cacheKey = `${options?.category || ''}_${options?.includeInactive || false}`;
  
  if (configCache.commodities && isCacheValid(configCache.commodities.timestamp) && !options) {
    return configCache.commodities.data;
  }

  try {
    const where: any = {};
    
    if (!options?.includeInactive) {
      where.isActive = true;
    }
    
    if (options?.category) {
      where.category = options.category;
    }

    const commodities = await prisma.commodityConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const data = commodities.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      category: c.category,
      unit: c.unit,
      currency: c.currency,
      isActive: c.isActive,
      sortOrder: c.sortOrder,
    }));

    if (!options) {
      configCache.commodities = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Error fetching commodity config:', error);
    return [];
  }
}

/**
 * Get all active currency pairs from database
 */
export async function getCurrencyPairs(options?: {
  type?: 'major' | 'cross' | 'emerging';
  includeInactive?: boolean;
}): Promise<CurrencyPairConfig[]> {
  const cacheKey = `${options?.type || ''}_${options?.includeInactive || false}`;
  
  if (configCache.currencies && isCacheValid(configCache.currencies.timestamp) && !options) {
    return configCache.currencies.data;
  }

  try {
    const where: any = {};
    
    if (!options?.includeInactive) {
      where.isActive = true;
    }
    
    if (options?.type) {
      where.type = options.type;
    }

    const pairs = await prisma.currencyPairConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const data = pairs.map((p) => ({
      pair: p.pair,
      name: p.name,
      base: p.base,
      quote: p.quote,
      type: p.type,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    }));

    if (!options) {
      configCache.currencies = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Error fetching currency pair config:', error);
    return [];
  }
}

/**
 * Clear configuration cache (call after admin updates)
 */
export function clearConfigCache() {
  configCache = {};
}

/**
 * Get all symbols that should be updated by auto-update service
 */
export async function getActiveSymbols() {
  const [indices, cryptos, commodities] = await Promise.all([
    getMarketIndices(),
    getCryptocurrencies(),
    getCommodities(),
  ]);

  return {
    indices: indices.map((i) => i.symbol),
    cryptos: cryptos.map((c) => c.symbol),
    commodities: commodities.map((c) => c.symbol),
  };
}
