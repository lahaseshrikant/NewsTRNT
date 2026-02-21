// Market Data Service
// Thin API client — all market logic lives in the backend.
// The user-frontend NEVER calls third-party market APIs directly.

import { MarketIndex, Commodity, Currency, CryptoCurrency, MarketDataResponse } from '@/types/market';
import { API_CONFIG } from '@/config/api';

interface CachedMarketData {
  data: MarketDataResponse;
  timestamp: number;
}

/**
 * Market Data Service
 * Handles fetching and caching of market data from various sources
 */
class MarketDataService {
  private cache: Map<string, CachedMarketData> = new Map();
  private readonly CACHE_DURATION_MARKET_HOURS = 30 * 1000; // 30 seconds during market hours
  private readonly CACHE_DURATION_OFF_HOURS = 5 * 60 * 1000; // 5 minutes off-hours
  // Use the frontend proxy for client-side calls to keep routing consistent
  // (server-side will call backend directly via API_CONFIG.baseURL)
  private readonly API_BASE_URL =
    typeof window === 'undefined'
      ? `${API_CONFIG.baseURL}/market`
      : '/api/market';
  

  /**
   * Get market data for a specific country
   */
  async getMarketDataByCountry(countryCode: string): Promise<MarketDataResponse> {
    const cacheKey = `country_${countryCode}`;
    
    // Check cache
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('[MarketDataService] Returning cached data for:', countryCode, 'indices:', cached.data.indices?.length);
      return cached.data;
    }

    try {
      // Fetch from API
      const url = `${this.API_BASE_URL}/country/${countryCode}`;
      console.log('[MarketDataService] Fetching from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        console.error('[MarketDataService] API error:', response.status, response.statusText);

        // Client-side defensive fallback: if backend path doesn't exist (404)
        // try the frontend proxy route which maps to the correct backend path.
        if (response.status === 404 && typeof window !== 'undefined' && this.API_BASE_URL !== '/api/market') {
          const proxyUrl = `/api/market/country/${countryCode}`;
          // eslint-disable-next-line no-console
          console.warn('[MarketDataService] 404 from backend; retrying via proxy:', proxyUrl);
          const proxyRes = await fetch(proxyUrl);
          if (proxyRes.ok) {
            const proxyData: MarketDataResponse = await proxyRes.json();
            this.cacheData(cacheKey, proxyData);
            return proxyData;
          }
        }

        throw new Error(`API error: ${response.statusText}`);
      }

      const raw = await response.json();

      // Normalize payloads coming from backend/proxy — backend returns
      // { success: true, data: { indices, commodities, currencies, cryptos } }
      const data = this.normalizeMarketResponse(raw, countryCode);

      console.log('[MarketDataService] Received data:', {
        indicesCount: data.indices?.length,
        commoditiesCount: data.commodities?.length,
        currenciesCount: data.currencies?.length,
        cryptoCount: data.cryptocurrencies?.length,
      });
      
      // Cache the result
      this.cacheData(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      
      // Return empty data structure instead of mock data
      return {
        indices: [],
        commodities: [],
        currencies: [],
        cryptocurrencies: [],
        lastUpdated: new Date(),
        region: countryCode,
        cacheExpiry: new Date(Date.now() + this.CACHE_DURATION_OFF_HOURS),
      };
    }
  }

  /**
   * Get multiple indices by symbols
   */
  async getIndicesBySymbols(symbols: string[]): Promise<MarketIndex[]> {
    const cacheKey = `symbols_${symbols.join(',')}`;
    
    // Check cache
    const cached = this.getCachedData(cacheKey);
    if (cached?.data.indices) {
      return cached.data.indices.filter(idx => symbols.includes(idx.symbol));
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/indices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const raw = await response.json();
      const indices: MarketIndex[] = this.unwrapArrayResponse<MarketIndex>(raw);
      return indices;
    } catch (error) {
      console.error('Failed to fetch indices:', error);
      return []; // Return empty array instead of mock data
    }
  }

  /**
   * Get commodities data
   */
  async getCommodities(category?: string, currency?: string): Promise<Commodity[]> {
    const cacheKey = `commodities_${category || 'all'}_${currency || 'USD'}`;
    
    const cached = this.getCachedData(cacheKey);
    if (cached?.data.commodities) {
      return cached.data.commodities;
    }

    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (currency) params.append('currency', currency);
      
      const url = `${this.API_BASE_URL}/commodities?${params.toString()}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const raw = await response.json();
      const commodities: Commodity[] = this.unwrapArrayResponse<Commodity>(raw);
      return commodities;
    } catch (error) {
      console.error('Failed to fetch commodities:', error);
      return []; // Return empty array instead of mock data
    }
  }

  /**
   * Get currency pairs data
   */
  async getCurrencies(pairs?: string[]): Promise<Currency[]> {
    const cacheKey = `currencies_${pairs?.join(',') || 'all'}`;
    
    const cached = this.getCachedData(cacheKey);
    if (cached?.data.currencies) {
      return cached.data.currencies;
    }

    try {
      const url = pairs
        ? `${this.API_BASE_URL}/currencies?pairs=${pairs.join(',')}`
        : `${this.API_BASE_URL}/currencies`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const raw = await response.json();
      const currencies: Currency[] = this.unwrapArrayResponse<Currency>(raw);
      return currencies;
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      return []; // Return empty array instead of mock data
    }
  }

  /**
   * Get cryptocurrency data
   */
  async getCryptocurrencies(symbols?: string[], currency?: string): Promise<CryptoCurrency[]> {
    const cacheKey = `crypto_${symbols?.join(',') || 'all'}_${currency || 'USD'}`;
    
    const cached = this.getCachedData(cacheKey);
    if (cached?.data.cryptocurrencies) {
      return cached.data.cryptocurrencies;
    }

    try {
      const params = new URLSearchParams();
      if (symbols) params.append('symbols', symbols.join(','));
      if (currency) params.append('currency', currency);
      
      const url = `${this.API_BASE_URL}/crypto?${params.toString()}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const raw = await response.json();
      const cryptos: CryptoCurrency[] = this.unwrapArrayResponse<CryptoCurrency>(raw);
      return cryptos;
    } catch (error) {
      console.error('Failed to fetch cryptocurrencies:', error);
      return []; // Return empty array instead of mock data
    }
  }

  /**
   * Check if data is cached and valid
   */
  private getCachedData(key: string): CachedMarketData | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const cacheDuration = this.isMarketHours()
      ? this.CACHE_DURATION_MARKET_HOURS
      : this.CACHE_DURATION_OFF_HOURS;

    const isValid = Date.now() - cached.timestamp < cacheDuration;
    
    return isValid ? cached : null;
  }

  /**
   * Cache market data
   */
  private cacheData(key: string, data: MarketDataResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Helper: unwraps API wrapper responses or returns the value directly.
   * Backend/proxy often returns { success: true, data: ... }.
   */
  private unwrapArrayResponse<T>(raw: any): T[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    if (raw.success && raw.data) return (raw.data as T[]);
    return (raw.data || raw) as T[];
  }

  /**
   * Normalize market payloads from backend/proxy into MarketDataResponse
   */
  private normalizeMarketResponse(raw: any, fallbackRegion = 'GLOBAL'): MarketDataResponse {
    const payload = raw && raw.success && raw.data ? raw.data : raw || {};

    const indices = Array.isArray(payload.indices) ? payload.indices : [];
    const commodities = Array.isArray(payload.commodities) ? payload.commodities : [];
    const currencies = Array.isArray(payload.currencies) ? payload.currencies : [];
    // backend uses `cryptos` property; normalize to `cryptocurrencies`
    const cryptocurrencies = Array.isArray(payload.cryptos)
      ? payload.cryptos
      : Array.isArray(payload.cryptocurrencies)
      ? payload.cryptocurrencies
      : [];

    const lastUpdated = payload.lastUpdated ? new Date(payload.lastUpdated) : new Date();
    const region = payload.country || payload.region || fallbackRegion;
    const cacheExpiry = payload.cacheExpiry ? new Date(payload.cacheExpiry) : new Date(Date.now() + this.CACHE_DURATION_OFF_HOURS);

    return {
      indices,
      commodities,
      currencies,
      cryptocurrencies,
      lastUpdated,
      region,
      cacheExpiry,
    } as MarketDataResponse;
  }

  /**
   * Check if markets are currently open (simplified - checks US market hours)
   */
  private isMarketHours(): boolean {
    const now = new Date();
    const hours = now.getUTCHours();
    const day = now.getUTCDay();

    // US market hours: 14:30 - 21:00 UTC (9:30 AM - 4:00 PM ET)
    // Monday to Friday
    return day >= 1 && day <= 5 && hours >= 14 && hours < 21;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific key
   */
  clearCacheFor(key: string): void {
    this.cache.delete(key);
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();

// Export convenience functions
export const getMarketDataByCountry = (country: string) => 
  marketDataService.getMarketDataByCountry(country);

export const getIndicesBySymbols = (symbols: string[]) => 
  marketDataService.getIndicesBySymbols(symbols);

export const getCommodities = (category?: string) => 
  marketDataService.getCommodities(category);

export const getCurrencies = (pairs?: string[]) => 
  marketDataService.getCurrencies(pairs);

export const getCryptocurrencies = (symbols?: string[]) => 
  marketDataService.getCryptocurrencies(symbols);

export const clearMarketDataCache = () => 
  marketDataService.clearCache();
