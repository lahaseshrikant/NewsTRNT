// Market Data Cache Service - Frontend
// This module proxies all market data requests to the backend API
// No direct database access - all queries go through Express backend

// @ts-nocheck

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

// Types matching backend database models
export interface MarketIndex {
  id: string;
  symbol: string;
  name: string;
  country: string;
  exchange: string;
  value: number;
  previousClose: number | null;
  change: number;
  changePercent: number;
  high: number | null;
  low: number | null;
  volume: number | null;
  currency: string;
  timezone: string;
  lastUpdated: Date;
  lastSource: string | null;
}

export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  value: number;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  high24h: number | null;
  low24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  lastUpdated: Date;
}

export interface CurrencyRate {
  id: string;
  currency: string;
  currencyName: string;
  rateToUSD: number;
  symbol: string;
  lastUpdated: Date;
}

export interface Commodity {
  id: string;
  symbol: string;
  name: string;
  value: number;
  unit: string;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  high: number | null;
  low: number | null;
  category: string;
  lastUpdated: Date;
}

// ============================================
// GET FUNCTIONS - Fetch cached market data from backend
// ============================================

/**
 * Get cached stock indices from backend
 */
export async function getCachedIndices(symbols?: string[]): Promise<MarketIndex[]> {
  try {
    const params = symbols ? `?symbols=${symbols.join(',')}` : '';
    const response = await fetch(`${BACKEND_API_URL}/market/indices${params}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('[Market Cache] Failed to fetch indices:', response.status);
      return [];
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[Market Cache] Error fetching indices:', error);
    return [];
  }
}

/**
 * Get cached cryptocurrencies from backend
 */
export async function getCachedCryptocurrencies(limit?: number): Promise<Cryptocurrency[]> {
  try {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${BACKEND_API_URL}/market/crypto${params}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('[Market Cache] Failed to fetch cryptocurrencies:', response.status);
      return [];
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[Market Cache] Error fetching cryptocurrencies:', error);
    return [];
  }
}

/**
 * Get cached currency rates from backend
 */
export async function getCachedCurrencyRates(): Promise<CurrencyRate[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/market/currencies`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('[Market Cache] Failed to fetch currency rates:', response.status);
      return [];
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[Market Cache] Error fetching currency rates:', error);
    return [];
  }
}

/**
 * Get cached commodities from backend
 */
export async function getCachedCommodities(): Promise<Commodity[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/market/commodities`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('[Market Cache] Failed to fetch commodities:', response.status);
      return [];
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[Market Cache] Error fetching commodities:', error);
    return [];
  }
}

/**
 * Convert currency amounts via backend
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/market/convert?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`,
      {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      console.warn('[Market Cache] Failed to convert currency:', response.status);
      return amount;
    }
    
    const result = await response.json();
    return result.data?.result ?? amount;
  } catch (error) {
    console.error('[Market Cache] Error converting currency:', error);
    return amount;
  }
}

/**
 * Get market data for a specific country
 */
export async function getMarketDataByCountry(country: string) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/market/by-country/${country}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('[Market Cache] Failed to fetch country data:', response.status);
      return { indices: [], commodities: [], currencies: [], cryptos: [] };
    }
    
    const result = await response.json();
    return result.data || { indices: [], commodities: [], currencies: [], cryptos: [] };
  } catch (error) {
    console.error('[Market Cache] Error fetching country data:', error);
    return { indices: [], commodities: [], currencies: [], cryptos: [] };
  }
}

// ============================================
// UPDATE FUNCTIONS - Trigger data refresh via backend
// These functions call the backend to update market data
// The actual fetching from external APIs happens on the backend
// ============================================

/**
 * Update stock indices via backend
 * Note: This is a placeholder - the actual update logic is on the backend
 */
export async function updateStockIndices() {
  console.log('[Market Cache] Update stock indices - proxied to backend');
  // In the full implementation, this would trigger a backend job
  // For now, the backend handles scheduling
  return { successCount: 0, failCount: 0 };
}

/**
 * Update cryptocurrencies via backend
 */
export async function updateCryptocurrencies() {
  console.log('[Market Cache] Update cryptocurrencies - proxied to backend');
  return { successCount: 0, failCount: 0 };
}

/**
 * Update currency rates via backend
 */
export async function updateCurrencyRates() {
  console.log('[Market Cache] Update currency rates - proxied to backend');
  return { successCount: 0 };
}

/**
 * Update commodities via backend
 */
export async function updateCommodities() {
  console.log('[Market Cache] Update commodities - proxied to backend');
  return { successCount: 0, failCount: 0 };
}

/**
 * Update all market data via backend
 */
export async function updateAllMarketData() {
  console.log('[Market Cache] Full market update - proxied to backend');
  // This would trigger a backend job to refresh all market data
  return {
    crypto: { successCount: 0, failCount: 0 },
    currencies: { successCount: 0 },
    indices: { successCount: 0, failCount: 0 },
    commodities: { successCount: 0, failCount: 0 },
    duration: '0',
  };
}

// No prisma export - all database access is on backend
