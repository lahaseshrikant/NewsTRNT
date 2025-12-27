// Real Market Data Integration
// Fetches live data from multiple market data APIs

import { MarketIndex, Commodity } from '@/types/market';
import { loadTradingViewSnapshot } from './tradingview-fallback';

// API Configuration
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';
const EXCHANGE_RATE_KEY = process.env.EXCHANGE_RATE_API_KEY || '';
const MARKETSTACK_KEY = process.env.MARKETSTACK_API_KEY || '';
const TWELVE_DATA_KEY =
  process.env.TWELVE_DATA_API_KEY || process.env.TWELVEDATA_API_KEY || '';
const FMP_API_KEY =
  process.env.FMP_API_KEY || process.env.FINANCIAL_MODELING_PREP_API_KEY || '';
const ENABLE_REAL_DATA = process.env.ENABLE_REAL_MARKET_DATA === 'true';

// Rate limiting cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

/**
 * Get cached data or fetch new
 */
function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached.data);
  }

  return fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Fetch stock/index data from Finnhub
 * Finnhub doesn't support index symbols well, so we'll skip it for indices
 */
export async function fetchIndexFromFinnhub(symbol: string): Promise<Partial<MarketIndex> | null> {
  if (!FINNHUB_KEY) {
    console.log(`[Finnhub] No API key configured`);
    return null;
  }
  
  if (!ENABLE_REAL_DATA) {
    console.log(`[Finnhub] Real data disabled (ENABLE_REAL_MARKET_DATA=${ENABLE_REAL_DATA})`);
    return null;
  }
  
  // Finnhub doesn't support index symbols well (those starting with ^)
  // Skip to Alpha Vantage for indices
  if (symbol.startsWith('^')) {
    console.log(`[Finnhub] Skipping index symbol ${symbol}, will try Alpha Vantage`);
    return null;
  }

  try {
    console.log(`[Finnhub] Fetching ${symbol}...`);
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`)
    ]);

    if (!quoteRes.ok || !profileRes.ok) {
      console.log(`[Finnhub] API response not OK for ${symbol}: ${quoteRes.status}/${profileRes.status}`);
      return null;
    }

    const quote = await quoteRes.json();
    const profile = await profileRes.json();
    
    console.log(`[Finnhub] Quote for ${symbol}:`, JSON.stringify(quote).substring(0, 100));

    if (quote.c === 0) {
      console.log(`[Finnhub] No data for ${symbol} (price = 0)`);
      return null;
    } // No data

    return {
      value: quote.c, // current price
      previousClose: quote.pc,
      change: quote.d,
      changePercent: quote.dp,
      high: quote.h,
      low: quote.l,
      lastUpdated: new Date(quote.t * 1000),
    };
  } catch (error) {
    console.error(`Finnhub fetch error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch stock data from Alpha Vantage
 */
export async function fetchIndexFromAlphaVantage(symbol: string): Promise<Partial<MarketIndex> | null> {
  if (!ALPHA_VANTAGE_KEY) {
    console.log(`[Alpha Vantage] No API key configured`);
    return null;
  }
  
  if (!ENABLE_REAL_DATA) {
    console.log(`[Alpha Vantage] Real data disabled`);
    return null;
  }

  try {
    const cacheKey = `av_${symbol}`;
    return getCached(cacheKey, async () => {
      console.log(`[Alpha Vantage] Fetching ${symbol}...`);
      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
      );

      if (!res.ok) {
        console.log(`[Alpha Vantage] API response not OK for ${symbol}: ${res.status}`);
        return null;
      }

      const data = await res.json();
      console.log(`[Alpha Vantage] Response for ${symbol}:`, JSON.stringify(data).substring(0, 150));
      const quote = data['Global Quote'];

      if (!quote || !quote['05. price']) {
        console.log(`[Alpha Vantage] No quote data for ${symbol}`);
        return null;
      }

      const value = toNumber(quote['05. price']);
      if (value === null) {
        return null;
      }

      const previousClose = toNumber(quote['08. previous close']) ?? value;
      const change = toNumber(quote['09. change']) ?? value - previousClose;
      const changePercentRaw = quote['10. change percent']
        ? String(quote['10. change percent']).replace('%', '')
        : null;
      const changePercent = changePercentRaw !== null ? toNumber(changePercentRaw) ?? 0 : 0;

      return {
        value,
        previousClose,
        change,
        changePercent,
        high: toNumber(quote['03. high']) ?? undefined,
        low: toNumber(quote['04. low']) ?? undefined,
        lastUpdated: quote['07. latest trading day']
          ? new Date(`${quote['07. latest trading day']}T00:00:00Z`)
          : new Date(),
      };
    });
  } catch (error) {
    console.error(`Alpha Vantage fetch error for ${symbol}:`, error);
    return null;
  }
}

export async function fetchIndexFromMarketStack(symbol: string): Promise<Partial<MarketIndex> | null> {
  if (!MARKETSTACK_KEY || !ENABLE_REAL_DATA) {
    return null;
  }

  try {
    const cacheKey = `marketstack_${symbol}`;
    return getCached(cacheKey, async () => {
      const encodedSymbol = encodeURIComponent(symbol);
      const url = `https://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_KEY}&symbols=${encodedSymbol}&limit=2`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`[MarketStack] API response not OK for ${symbol}: ${res.status}`);
        return null;
      }

      const data = await res.json();
      const entries = Array.isArray(data?.data) ? data.data : [];
      const latest = entries[0];
      if (!latest) {
        return null;
      }

      const close = toNumber(latest.close);
      if (close === null) {
        return null;
      }

      const previous = entries[1];
      const previousClose = previous ? toNumber(previous.close) ?? close : close;
      const diff = close - previousClose;
      const diffPercent = previousClose !== 0 ? (diff / previousClose) * 100 : 0;

      return {
        value: close,
        previousClose,
        change: diff,
        changePercent: diffPercent,
        high: toNumber(latest.high) ?? close,
        low: toNumber(latest.low) ?? close,
        lastUpdated: latest.date ? new Date(latest.date) : new Date(),
      };
    });
  } catch (error) {
    console.error(`[MarketStack] fetch error for ${symbol}:`, error);
    return null;
  }
}

export async function fetchIndexFromTwelveData(symbol: string): Promise<Partial<MarketIndex> | null> {
  if (!TWELVE_DATA_KEY || !ENABLE_REAL_DATA) {
    return null;
  }

  try {
    const cacheKey = `twelvedata_${symbol}`;
    return getCached(cacheKey, async () => {
      const encodedSymbol = encodeURIComponent(symbol);
      const url = `https://api.twelvedata.com/time_series?symbol=${encodedSymbol}&interval=1min&outputsize=2&apikey=${TWELVE_DATA_KEY}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`[TwelveData] API response not OK for ${symbol}: ${res.status}`);
        return null;
      }

      const data = await res.json();
      if (data?.status && data.status !== 'ok') {
        console.log(`[TwelveData] Status not ok for ${symbol}: ${data?.message}`);
        return null;
      }

      const entries = Array.isArray(data?.values) ? data.values : [];
      const latest = entries[0];
      if (!latest) {
        return null;
      }

      const close = toNumber(latest.close);
      if (close === null) {
        return null;
      }

      const previous = entries[1];
      const previousClose = previous ? toNumber(previous.close) ?? close : close;
      const diff = close - previousClose;
      const diffPercent = previousClose !== 0 ? (diff / previousClose) * 100 : 0;

      return {
        value: close,
        previousClose,
        change: diff,
        changePercent: diffPercent,
        high: toNumber(latest.high) ?? close,
        low: toNumber(latest.low) ?? close,
        lastUpdated: latest.datetime ? new Date(`${latest.datetime}Z`) : new Date(),
      };
    });
  } catch (error) {
    console.error(`[TwelveData] fetch error for ${symbol}:`, error);
    return null;
  }
}

export async function fetchIndexFromFMP(symbol: string): Promise<Partial<MarketIndex> | null> {
  if (!FMP_API_KEY || !ENABLE_REAL_DATA) {
    return null;
  }

  try {
    const cacheKey = `fmp_${symbol}`;
    return getCached(cacheKey, async () => {
      const encodedSymbol = encodeURIComponent(symbol);
      const url = `https://financialmodelingprep.com/api/v3/quote/${encodedSymbol}?apikey=${FMP_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`[FMP] API response not OK for ${symbol}: ${res.status}`);
        return null;
      }

      const data = await res.json();
      const quote = Array.isArray(data) ? data[0] : null;
      if (!quote) {
        return null;
      }

      const price = toNumber(quote.price ?? quote.close ?? quote.regularMarketPrice);
      if (price === null) {
        return null;
      }

      const previousClose = toNumber(quote.previousClose) ?? price;
      const diff = price - previousClose;
      const changePercent = previousClose !== 0 ? (diff / previousClose) * 100 : 0;

      return {
        value: price,
        previousClose,
        change: diff,
        changePercent,
        high: toNumber(quote.dayHigh) ?? price,
        low: toNumber(quote.dayLow) ?? price,
        lastUpdated: quote.timestamp ? new Date(quote.timestamp * 1000) : new Date(),
      };
    });
  } catch (error) {
    console.error(`[FMP] fetch error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch cryptocurrency data from CoinGecko (Free, no API key needed)
 */
interface CoinGeckoMarketResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number | null;
  low_24h: number | null;
  last_updated: string;
}

export interface CoinGeckoQuote {
  id: string;
  value: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high: number | null;
  low: number | null;
  lastUpdated: Date;
}

export async function fetchCryptoFromCoinGecko(ids: string[]): Promise<CoinGeckoQuote[]> {
  if (!ENABLE_REAL_DATA) {
    return [];
  }

  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return [];
  }

  try {
    const cacheKey = `coingecko_${uniqueIds.join(',')}`;
    return getCached(cacheKey, async () => {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${uniqueIds.join(',')}&price_change_percentage=24h`;
      const res = await fetch(url);

      if (!res.ok) {
        console.log(`[CoinGecko] API response not OK: ${res.status}`);
        return [];
      }

      const data: CoinGeckoMarketResponse[] = await res.json();

      return data.map((item) => {
        const value = item.current_price ?? 0;
        const change = item.price_change_24h ?? 0;
        const previousClose = value - change;
        return {
          id: item.id,
          value,
          previousClose: previousClose || value,
          change,
          changePercent: item.price_change_percentage_24h ?? 0,
          high: item.high_24h ?? null,
          low: item.low_24h ?? null,
          lastUpdated: item.last_updated ? new Date(item.last_updated) : new Date(),
        };
      });
    });
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    return [];
  }
}

/**
 * Fetch currency exchange rates from Exchange Rate API
 */
export interface ExchangeRateSnapshot {
  quote: string;
  rate: number;
  lastUpdated: Date;
}

export async function fetchExchangeRates(baseCurrency: string): Promise<Record<string, ExchangeRateSnapshot>> {
  if (!ENABLE_REAL_DATA) {
    return {};
  }

  try {
    const cacheKey = `exchange_${baseCurrency}`;
    return getCached(cacheKey, async () => {
      const apiUrl = EXCHANGE_RATE_KEY
        ? `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_KEY}/latest/${baseCurrency}`
        : `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;

      const res = await fetch(apiUrl);

      if (!res.ok) {
        console.log(`[ExchangeRate] API response not OK for ${baseCurrency}: ${res.status}`);
        return {};
      }

      const data = await res.json();
      const rates = data.conversion_rates || data.rates;
      if (!rates) {
        return {};
      }

      const timestamp = data.time_last_update_unix
        ? new Date(data.time_last_update_unix * 1000)
        : new Date();

      const snapshots: Record<string, ExchangeRateSnapshot> = {};

      for (const [quote, rateValue] of Object.entries(rates)) {
        const rateNumber = toNumber(rateValue);
        if (rateNumber === null) continue;
        snapshots[quote] = {
          quote,
          rate: rateNumber,
          lastUpdated: timestamp,
        };
      }

      return snapshots;
    });
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return {};
  }
}

/**
 * Fetch commodity prices from Alpha Vantage
 */
async function fetchCommodityFromAlphaVantage(symbol: string): Promise<Partial<Commodity> | null> {
  if (!ALPHA_VANTAGE_KEY || !ENABLE_REAL_DATA) {
    return null;
  }

  // Alpha Vantage commodity functions
  const functionMap: Record<string, string> = {
    WTI: 'WTI',
    BRENT: 'BRENT',
    NATURAL_GAS: 'NATURAL_GAS',
    COPPER: 'COPPER',
    ALUMINUM: 'ALUMINUM',
    WHEAT: 'WHEAT',
    CORN: 'CORN',
    COTTON: 'COTTON',
    SUGAR: 'SUGAR',
    COFFEE: 'COFFEE',
  };

  const apiFunction = functionMap[symbol];
  if (!apiFunction) {
    return null;
  }

  const url = `https://www.alphavantage.co/query?function=${apiFunction}&interval=daily&apikey=${ALPHA_VANTAGE_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.log(`[Alpha Vantage] Commodity response not OK for ${symbol}: ${res.status}`);
    return null;
  }

  const data = await res.json();
  const entries = Array.isArray(data?.data) ? data.data : [];
  const latest = entries[0];
  if (!latest) {
    return null;
  }

  const price = toNumber(latest.value);
  if (price === null) {
    return null;
  }

  const previous = entries[1];
  const previousClose = previous ? toNumber(previous.value) ?? price : price;
  const diff = price - previousClose;
  const changePercent = previousClose !== 0 ? (diff / previousClose) * 100 : 0;

  return {
    value: price,
    previousClose,
    change: diff,
    changePercent,
    lastUpdated: latest.date ? new Date(latest.date) : new Date(),
  };
}

async function fetchCommodityFromFMP(symbol: string): Promise<Partial<Commodity> | null> {
  if (!FMP_API_KEY || !ENABLE_REAL_DATA) {
    return null;
  }

  const url = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${FMP_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`[FMP] Commodity response not OK for ${symbol}: ${res.status}`);
    return null;
  }

  const data = await res.json();
  const quote = Array.isArray(data) ? data[0] : null;
  if (!quote) {
    return null;
  }

  const price = toNumber(quote.price ?? quote.close ?? quote.regularMarketPrice);
  if (price === null) {
    return null;
  }

  const previousClose = toNumber(quote.previousClose) ?? price;
  const diff = price - previousClose;
  const changePercent = previousClose !== 0 ? (diff / previousClose) * 100 : 0;

  return {
    value: price,
    previousClose,
    change: diff,
    changePercent,
    high: toNumber(quote.dayHigh) ?? undefined,
    low: toNumber(quote.dayLow) ?? undefined,
    lastUpdated: quote.timestamp ? new Date(quote.timestamp * 1000) : new Date(),
  };
}

async function fetchCommodityFromTwelveData(symbol: string): Promise<Partial<Commodity> | null> {
  if (!TWELVE_DATA_KEY || !ENABLE_REAL_DATA) {
    return null;
  }

  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=2&apikey=${TWELVE_DATA_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`[TwelveData] Commodity response not OK for ${symbol}: ${res.status}`);
    return null;
  }

  const data = await res.json();
  if (data?.status && data.status !== 'ok') {
    console.log(`[TwelveData] Commodity status not ok for ${symbol}: ${data?.message}`);
    return null;
  }

  const entries = Array.isArray(data?.values) ? data.values : [];
  const latest = entries[0];
  if (!latest) {
    return null;
  }

  const price = toNumber(latest.close);
  if (price === null) {
    return null;
  }

  const previous = entries[1];
  const previousClose = previous ? toNumber(previous.close) ?? price : price;
  const diff = price - previousClose;
  const changePercent = previousClose !== 0 ? (diff / previousClose) * 100 : 0;

  return {
    value: price,
    previousClose,
    change: diff,
    changePercent,
    high: toNumber(latest.high) ?? undefined,
    low: toNumber(latest.low) ?? undefined,
    lastUpdated: latest.datetime ? new Date(`${latest.datetime}Z`) : new Date(),
  };
}

export async function fetchCommodityPrice(
  symbol: string,
  _commodityType: string,
  providerOrder?: string[],
): Promise<Partial<Commodity> | null> {
  if (!ENABLE_REAL_DATA) {
    return null;
  }

  const cacheKey = `commodity_${symbol}`;
  return getCached(cacheKey, async () => {
    const providers: Array<{
      id: string;
      name: string;
      fetcher: () => Promise<Partial<Commodity> | null>;
    }> = [
      { id: 'alphavantage', name: 'Alpha Vantage', fetcher: () => fetchCommodityFromAlphaVantage(symbol) },
      { id: 'fmp', name: 'FMP', fetcher: () => fetchCommodityFromFMP(symbol) },
      { id: 'twelvedata', name: 'TwelveData', fetcher: () => fetchCommodityFromTwelveData(symbol) },
    ];

    const orderedProviders = providerOrder && providerOrder.length > 0
      ? providerOrder
      : providers.map((provider) => provider.id);

    for (const providerId of orderedProviders) {
      const provider = providers.find((candidate) => candidate.id === providerId);
      if (!provider) {
        continue;
      }

      try {
        const result = await provider.fetcher();
        if (result && typeof result.value === 'number') {
          return { ...result, provider: provider.id };
        }
      } catch (error) {
        console.error(`[${provider.name}] Commodity fetch error for ${symbol}:`, error);
      }
    }

    return null;
  });
}

/**
 * Fetch gold/silver prices (special commodity endpoint)
 */
export async function fetchMetalPrice(metal: 'XAU' | 'XAG'): Promise<Partial<Commodity> | null> {
  if (!ENABLE_REAL_DATA) {
    return null;
  }

  try {
    const cacheKey = `metal_${metal}`;
    return getCached(cacheKey, async () => {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${metal}&to_currency=USD&apikey=${ALPHA_VANTAGE_KEY}`
      );

      if (!res.ok) {
        console.log(`[Alpha Vantage] Metal response not OK for ${metal}: ${res.status}`);
        return null;
      }

      const data = await res.json();
      const rate = data['Realtime Currency Exchange Rate'];

      if (!rate) {
        return null;
      }

      const price = parseFloat(rate['5. Exchange Rate']);
      if (!Number.isFinite(price)) {
        return null;
      }

      return {
        value: price,
        previousClose: price,
        change: 0,
        changePercent: 0,
        lastUpdated: rate['6. Last Refreshed'] ? new Date(rate['6. Last Refreshed']) : new Date(),
      };
    });
  } catch (error) {
    console.error(`Metal price fetch error for ${metal}:`, error);
    return null;
  }
}

/**
 * Test API connectivity
 */
const PROBE_SYMBOLS = {
  alphavantage: 'NSEI',
  finnhub: '^NSEI',
  marketstack: 'NIFTY50',
  twelvedata: 'NIFTY50',
  fmp: '^NSEI',
} as const;

export async function testAPIConnectivity() {
  const statuses = {
    alphaVantage: false,
    finnhub: false,
    coingecko: false,
    exchangeRate: false,
    marketstack: false,
    twelveData: false,
    fmp: false,
    tradingview: false,
  };
  const errors: Record<string, string> = {};

  // Test Alpha Vantage
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(PROBE_SYMBOLS.alphavantage)}&apikey=${ALPHA_VANTAGE_KEY}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      statuses.alphaVantage = true;
    } else {
      errors.alphaVantage = `HTTP ${res.status}`;
    }
  } catch (error) {
    console.error('Alpha Vantage test failed:', error);
    errors.alphaVantage = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test Finnhub
  if (FINNHUB_KEY) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(PROBE_SYMBOLS.finnhub)}&token=${FINNHUB_KEY}`,
        {
          cache: 'no-store',
        }
      );
      if (res.ok) {
        statuses.finnhub = true;
      } else {
        errors.finnhub = `HTTP ${res.status}`;
      }
    } catch (error) {
      console.error('Finnhub test failed:', error);
      errors.finnhub = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Test CoinGecko
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/ping', { cache: 'no-store' });
    if (res.ok) {
      statuses.coingecko = true;
    } else {
      errors.coingecko = `HTTP ${res.status}`;
    }
  } catch (error) {
    console.error('CoinGecko test failed:', error);
    errors.coingecko = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test Exchange Rate API
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' });
    if (res.ok) {
      statuses.exchangeRate = true;
    } else {
      errors.exchangeRate = `HTTP ${res.status}`;
    }
  } catch (error) {
    console.error('Exchange Rate API test failed:', error);
    errors.exchangeRate = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test MarketStack (requires API key)
  if (MARKETSTACK_KEY) {
    try {
      const res = await fetch(
        `https://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_KEY}&symbols=${encodeURIComponent(PROBE_SYMBOLS.marketstack)}&limit=1`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        statuses.marketstack = true;
      } else {
        errors.marketstack = `HTTP ${res.status}`;
      }
    } catch (error) {
      console.error('MarketStack test failed:', error);
      errors.marketstack = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Test TwelveData (requires API key)
  if (TWELVE_DATA_KEY) {
    try {
      const res = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(PROBE_SYMBOLS.twelvedata)}&interval=1min&outputsize=1&apikey=${TWELVE_DATA_KEY}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        statuses.twelveData = true;
      } else {
        errors.twelveData = `HTTP ${res.status}`;
      }
    } catch (error) {
      console.error('TwelveData test failed:', error);
      errors.twelveData = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Test Financial Modeling Prep (requires API key)
  if (FMP_API_KEY) {
    try {
      const res = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(PROBE_SYMBOLS.fmp)}?apikey=${FMP_API_KEY}`,
        { cache: 'no-store' }
      );

      if (res.ok) {
        statuses.fmp = true;
      } else {
        let details = `HTTP ${res.status}`;
        try {
          const payload = await res.json();
          const message = typeof payload?.error === 'string'
            ? payload.error
            : typeof payload?.Error === 'string'
            ? payload.Error
            : Array.isArray(payload) && payload.length === 0
            ? 'No data returned - verify symbol access'
            : null;
          if (message) {
            details = `${details} – ${message}`;
          }
        } catch {
          // ignore JSON parse errors
        }
        errors.fmp = details;
      }
    } catch (error) {
      console.error('FMP test failed:', error);
      errors.fmp = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Test TradingView fallback snapshot
  try {
    const snapshot = await loadTradingViewSnapshot();
    if (snapshot && Array.isArray(snapshot.items) && snapshot.items.length > 0) {
      statuses.tradingview = true;
    } else {
      errors.tradingview = 'Snapshot missing or empty. Trigger scraper refresh.';
    }
  } catch (error) {
    console.error('TradingView snapshot test failed:', error);
    errors.tradingview = error instanceof Error ? error.message : 'Unknown error';
  }

  return { statuses, errors };
}
