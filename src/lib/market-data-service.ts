// Market Data Service
// Fetches real-time market data with caching

import { MarketIndex, Commodity, Currency, CryptoCurrency, MarketDataResponse } from '@/types/market';
import { ALL_INDICES, COMMODITIES, CURRENCY_PAIRS, CRYPTOCURRENCIES, getIndicesByCountry } from '@/config/market-indices';

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
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_MARKET_API_URL || '/api/market';

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
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: MarketDataResponse = await response.json();
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

      const indices: MarketIndex[] = await response.json();
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

      const commodities: Commodity[] = await response.json();
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

      const currencies: Currency[] = await response.json();
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

      const cryptos: CryptoCurrency[] = await response.json();
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
