// Market Data Hook
// React hook for accessing market data based on user location

'use client';

import { useState, useEffect } from 'react';
import { MarketIndex, Commodity, Currency, CryptoCurrency, LocationData } from '@/types/market';
import { getUserLocation } from '@/lib/location-service';
import { getMarketDataByCountry, getIndicesBySymbols, getCommodities, getCurrencies, getCryptocurrencies } from '@/lib/market-data-service';

interface UseMarketDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  includeGlobal?: boolean; // Include global indices
}

interface UseMarketDataReturn {
  indices: MarketIndex[];
  commodities: Commodity[];
  currencies: Currency[];
  cryptocurrencies: CryptoCurrency[];
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching market data based on user location
 */
export function useMarketData(options: UseMarketDataOptions = {}): UseMarketDataReturn {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute default
    includeGlobal = true,
  } = options;

  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [cryptocurrencies, setCryptocurrencies] = useState<CryptoCurrency[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user location
      const userLocation = await getUserLocation();
      
      setLocation(userLocation);
      
      // Fetch market data for user's country
      const marketData = await getMarketDataByCountry(userLocation.country);
      console.log('[useMarketData] Market data received:', {
        country: userLocation.country,
        indicesCount: marketData?.indices?.length ?? 0,
        indices: (marketData?.indices || []).map(i => i.symbol),
      });

      setIndices(marketData?.indices || []);
      setCommodities(marketData?.commodities || []);
      setCurrencies(marketData?.currencies || []);
      setCryptocurrencies(marketData?.cryptocurrencies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      console.error('Market data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return {
    indices,
    commodities,
    currencies,
    cryptocurrencies,
    location,
    isLoading,
    error,
    refresh: fetchData,
  };
}

/**
 * Hook for fetching specific indices by symbols
 */
export function useIndices(symbols: string[], autoRefresh = true, refreshInterval = 60000) {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getIndicesBySymbols(symbols);
      setIndices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch indices');
      console.error('Indices fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (symbols.length === 0) return;
    fetchData();
  }, [JSON.stringify(symbols)]);

  useEffect(() => {
    if (!autoRefresh || symbols.length === 0) return;
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, JSON.stringify(symbols)]);

  return { indices, isLoading, error, refresh: fetchData };
}

/**
 * Hook for fetching commodities
 */
export function useCommodities(category?: string, autoRefresh = true, refreshInterval = 60000) {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCommodities(category);
      setCommodities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch commodities');
      console.error('Commodities fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return { commodities, isLoading, error, refresh: fetchData };
}

/**
 * Hook for fetching currencies
 */
export function useCurrencies(pairs?: string[], autoRefresh = true, refreshInterval = 60000) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCurrencies(pairs);
      setCurrencies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch currencies');
      console.error('Currencies fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(pairs)]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return { currencies, isLoading, error, refresh: fetchData };
}

/**
 * Hook for fetching cryptocurrencies
 */
export function useCryptocurrencies(symbols?: string[], autoRefresh = true, refreshInterval = 60000) {
  const [cryptocurrencies, setCryptocurrencies] = useState<CryptoCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCryptocurrencies(symbols);
      setCryptocurrencies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cryptocurrencies');
      console.error('Cryptocurrencies fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(symbols)]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return { cryptocurrencies, isLoading, error, refresh: fetchData };
}

/**
 * Hook for getting user location only
 */
export function useUserLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userLocation = await getUserLocation();
        setLocation(userLocation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
        console.error('Location fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, isLoading, error };
}
