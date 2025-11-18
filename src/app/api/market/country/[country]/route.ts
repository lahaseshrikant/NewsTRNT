// Market Data API - Country Endpoint
// GET /api/market/country/[country]
// Returns data from database cache

import { NextRequest, NextResponse } from 'next/server';
import { getIndicesByCountry } from '@/config/market-indices';
import {
  getCachedIndices,
  getCachedCryptocurrencies,
  getCachedCurrencyRates,
  getCachedCommodities,
} from '@/lib/market-cache';

type CachedIndices = Awaited<ReturnType<typeof getCachedIndices>>;
type CachedCryptos = Awaited<ReturnType<typeof getCachedCryptocurrencies>>;
type CachedRates = Awaited<ReturnType<typeof getCachedCurrencyRates>>;
type CachedCommodities = Awaited<ReturnType<typeof getCachedCommodities>>;

type MarketIndexRecord = CachedIndices extends Array<infer T> ? T : never;
type CryptocurrencyRecord = CachedCryptos extends Array<infer T> ? T : never;
type CurrencyRateRecord = CachedRates extends Array<infer T> ? T : never;
type CommodityRecord = CachedCommodities extends Array<infer T> ? T : never;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params;
    const countryCode = country.toUpperCase();

    // Get indices configuration for the country
    const indicesConfig = getIndicesByCountry(countryCode);
    const symbols = indicesConfig.map(config => config.symbol);

    // Fetch from database cache (auto-updates in background)
    const [dbIndices, dbCryptocurrencies, dbCurrencyRates, dbCommodities] = await Promise.all([
      getCachedIndices(symbols),
      getCachedCryptocurrencies(),
      getCachedCurrencyRates(),
      getCachedCommodities(),
    ]);

    // Transform database indices to API format
    const indexConfigMap = new Map(indicesConfig.map(config => [config.symbol, config]));

    const indices = dbIndices.map((idx: MarketIndexRecord) => {
      const config = indexConfigMap.get(idx.symbol);

      return {
        id: idx.id,
        symbol: idx.symbol,
        name: idx.name,
        type: 'stock' as const,
        region: config?.region ?? ['GLOBAL'],
        country: idx.country,
        value: idx.value,
        previousClose: idx.previousClose ?? undefined,
        change: idx.change,
        changePercent: idx.changePercent,
        high: idx.high ?? undefined,
        low: idx.low ?? undefined,
        volume: idx.volume ?? undefined,
        currency: idx.currency,
        lastUpdated: idx.lastUpdated.toISOString(),
        isOpen: isMarketOpen(idx.timezone),
        marketHours: {
          open: config?.marketHours.open ?? '09:30',
          close: config?.marketHours.close ?? '16:00',
          timezone: idx.timezone,
        },
      };
    });

    // Transform cryptocurrencies
    const cryptocurrencies = dbCryptocurrencies.map((crypto: CryptocurrencyRecord) => ({
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      type: 'crypto' as const,
      region: ['GLOBAL'],
      country: 'US',
      value: crypto.value,
      previousClose: crypto.previousClose ?? undefined,
      change: crypto.change,
      changePercent: crypto.changePercent,
      high: crypto.high24h ?? undefined,
      low: crypto.low24h ?? undefined,
      volume: crypto.volume24h ?? undefined,
      currency: crypto.currency,
      lastUpdated: crypto.lastUpdated.toISOString(),
      isOpen: true,
      marketCap: crypto.marketCap ? crypto.marketCap.toString() : undefined,
    }));

    // Transform currency rates to API format
    const currencies = dbCurrencyRates.map((rate: CurrencyRateRecord) => {
      if (isUsdBaseRate(rate)) {
        return {
          id: rate.id,
          pair: `USD/${rate.currency}`,
          baseCurrency: 'USD',
          quoteCurrency: rate.currency,
          rate: rate.rateToUSD,
          change: 0,
          changePercent: 0,
          lastUpdated: rate.lastUpdated.toISOString(),
          name: rate.currencyName ?? undefined,
          symbol: rate.symbol ?? undefined,
        };
      }

      const pair = rate.pair ?? `${rate.fromCurrency}/${rate.toCurrency}`;
      const [baseCurrency = 'USD', quoteCurrency = 'USD'] = pair.split('/');

      return {
        id: rate.id,
        pair,
        baseCurrency,
        quoteCurrency,
        rate: rate.rate,
        change: 0,
        changePercent: 0,
        lastUpdated: rate.lastUpdated.toISOString(),
      };
    });

    // Transform commodities
    const commodities = dbCommodities.map((comm: CommodityRecord) => ({
      id: comm.id,
      symbol: comm.symbol,
      name: comm.name,
      type: 'commodity' as const,
      region: ['GLOBAL'],
      country: 'US',
      value: comm.value,
      previousClose: comm.previousClose ?? undefined,
      change: comm.change ?? 0,
      changePercent: comm.changePercent ?? 0,
      high: comm.high ?? undefined,
      low: comm.low ?? undefined,
      currency: comm.unit,
      lastUpdated: comm.lastUpdated.toISOString(),
      isOpen: true,
      unit: comm.unit,
      category: comm.category,
    }));

    const response = {
      indices,
      commodities,
      currencies,
      cryptocurrencies,
      lastUpdated: new Date().toISOString(),
      region: countryCode,
      cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[Market API] Database cache error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data from cache' },
      { status: 500 }
    );
  }
}

// Helper function to check if market is open
function isMarketOpen(timezone: string): boolean {
  try {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const hours = localTime.getHours();
    const day = localTime.getDay();

    // Simplified: markets are open Mon-Fri between 9 AM and 5 PM local time
    return day >= 1 && day <= 5 && hours >= 9 && hours < 17;
  } catch (error) {
    console.error('Error checking market hours:', error);
    return false;
  }
}

function isUsdBaseRate(
  rate: CurrencyRateRecord
): rate is CurrencyRateRecord & {
  currency: string;
  rateToUSD: number;
  currencyName?: string | null;
  symbol?: string | null;
} {
  const candidate = rate as Record<string, unknown>;
  return (
    typeof candidate.currency === 'string' &&
    typeof candidate.rateToUSD === 'number'
  );
}
