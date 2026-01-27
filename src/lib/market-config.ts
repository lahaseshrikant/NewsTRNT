// Market configuration - fetches from backend API
// Admin can manage indices/cryptos/commodities through UI

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// Cache configuration in memory for 5 minutes to reduce API calls
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
 * Clear the config cache - useful after updates
 */
export function clearConfigCache(): void {
  configCache = {};
}

/**
 * Get all active market indices from backend API
 * Sorted by sortOrder, cached for 5 minutes
 */
export async function getMarketIndices(options?: {
  country?: string;
  region?: string;
  includeInactive?: boolean;
}): Promise<MarketIndexConfig[]> {
  if (configCache.indices && isCacheValid(configCache.indices.timestamp) && !options) {
    return configCache.indices.data;
  }

  try {
    const params = new URLSearchParams();
    if (options?.includeInactive) params.set('includeInactive', 'true');
    if (options?.country) params.set('country', options.country);
    if (options?.region) params.set('region', options.region);

    const response = await fetch(
      `${BACKEND_API_URL}/market/config/indices?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.warn('Backend indices config unavailable, using empty array');
      return [];
    }

    const result = await response.json();
    const data = result.indices || result.data || [];

    // Cache only if no filters applied
    if (!options) {
      configCache.indices = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Error fetching market indices config:', error);
    return [];
  }
}

/**
 * Get indices grouped by country
 */
export async function getIndicesByCountry(): Promise<Record<string, MarketIndexConfig[]>> {
  const indices = await getMarketIndices();
  const byCountry: Record<string, MarketIndexConfig[]> = {};

  for (const idx of indices) {
    if (!byCountry[idx.country]) {
      byCountry[idx.country] = [];
    }
    byCountry[idx.country].push(idx);
  }

  return byCountry;
}

/**
 * Get all active cryptocurrencies from backend API
 */
export async function getCryptocurrencies(options?: {
  includeInactive?: boolean;
}): Promise<CryptoConfig[]> {
  if (configCache.cryptos && isCacheValid(configCache.cryptos.timestamp) && !options) {
    return configCache.cryptos.data;
  }

  try {
    const params = new URLSearchParams();
    if (options?.includeInactive) params.set('includeInactive', 'true');

    const response = await fetch(
      `${BACKEND_API_URL}/market/config/cryptos?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.warn('Backend crypto config unavailable, using empty array');
      return [];
    }

    const result = await response.json();
    const data = result.cryptos || result.data || [];

    if (!options) {
      configCache.cryptos = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Error fetching crypto config:', error);
    return [];
  }
}

/**
 * Get all active commodities from backend API
 */
export async function getCommodities(options?: {
  category?: string;
  includeInactive?: boolean;
}): Promise<CommodityConfig[]> {
  if (configCache.commodities && isCacheValid(configCache.commodities.timestamp) && !options) {
    return configCache.commodities.data;
  }

  try {
    const params = new URLSearchParams();
    if (options?.includeInactive) params.set('includeInactive', 'true');
    if (options?.category) params.set('category', options.category);

    const response = await fetch(
      `${BACKEND_API_URL}/market/config/commodities?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.warn('Backend commodities config unavailable, using empty array');
      return [];
    }

    const result = await response.json();
    const data = result.commodities || result.data || [];

    if (!options) {
      configCache.commodities = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Error fetching commodities config:', error);
    return [];
  }
}

/**
 * Get all active currency pairs from backend API
 */
export async function getCurrencyPairs(options?: {
  type?: string;
  includeInactive?: boolean;
}): Promise<CurrencyPairConfig[]> {
  if (configCache.currencies && isCacheValid(configCache.currencies.timestamp) && !options) {
    return configCache.currencies.data;
  }

  try {
    const params = new URLSearchParams();
    if (options?.includeInactive) params.set('includeInactive', 'true');
    if (options?.type) params.set('type', options.type);

    const response = await fetch(
      `${BACKEND_API_URL}/market/config/currencies?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.warn('Backend currencies config unavailable, using empty array');
      return [];
    }

    const result = await response.json();
    const data = result.currencies || result.data || [];

    if (!options) {
      configCache.currencies = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Error fetching currency pairs config:', error);
    return [];
  }
}

/**
 * Get all market configuration in one call
 */
export async function getAllMarketConfig(): Promise<{
  indices: MarketIndexConfig[];
  cryptos: CryptoConfig[];
  commodities: CommodityConfig[];
  currencies: CurrencyPairConfig[];
}> {
  const [indices, cryptos, commodities, currencies] = await Promise.all([
    getMarketIndices(),
    getCryptocurrencies(),
    getCommodities(),
    getCurrencyPairs(),
  ]);

  return { indices, cryptos, commodities, currencies };
}

/**
 * Get active symbols for each market type
 * Used by auto-update service to know what to fetch
 */
export async function getActiveSymbols(): Promise<{
  indices: string[];
  cryptos: string[];
  commodities: string[];
  currencies: string[];
}> {
  const config = await getAllMarketConfig();
  
  return {
    indices: config.indices.map(i => i.symbol),
    cryptos: config.cryptos.map(c => c.symbol),
    commodities: config.commodities.map(c => c.symbol),
    currencies: config.currencies.map(c => c.pair),
  };
}
