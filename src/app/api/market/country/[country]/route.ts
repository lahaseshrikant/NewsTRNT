// Market Data API - Country Endpoint
// GET /api/market/country/[country]
// Returns data from database cache with priority ordering:
// 1. Local indices first
// 2. Global popular indices
// 3. Regional indices

import { NextRequest, NextResponse } from 'next/server';
import { getIndicesByCountry, COUNTRY_INDICES_MAP } from '@/config/market-indices';
import {
  getCachedIndices,
  getCachedCryptocurrencies,
  getCachedCurrencyRates,
  getCachedCommodities,
  convertCurrency,
} from '@/lib/market-cache';

// Global popular indices everyone should see
const GLOBAL_POPULAR_SYMBOLS = ['^GSPC', '^DJI', '^IXIC']; // S&P 500, Dow Jones, NASDAQ

// Regional important indices by area
const REGIONAL_INDICES: Record<string, string[]> = {
  // For Asian countries, show other major Asian indices
  ASIA: ['^N225', '^HSI', '^NSEI', '^BSESN'],
  // For European countries, show major European indices
  EUROPE: ['^FTSE', '^GDAXI', '^FCHI', '^STOXX50E'],
  // For Americas, show major American indices
  AMERICAS: ['^GSPC', '^DJI', '^IXIC', '^GSPTSE', '^BVSP'],
  // Middle East
  MIDDLE_EAST: ['^TASI', '^TA125'],
};

// Country to region mapping
const COUNTRY_REGION: Record<string, string> = {
  // Asia
  JP: 'ASIA', CN: 'ASIA', HK: 'ASIA', IN: 'ASIA', KR: 'ASIA', TW: 'ASIA', SG: 'ASIA',
  MY: 'ASIA', TH: 'ASIA', ID: 'ASIA', PH: 'ASIA', VN: 'ASIA', PK: 'ASIA', BD: 'ASIA', LK: 'ASIA',
  // Europe
  GB: 'EUROPE', DE: 'EUROPE', FR: 'EUROPE', IT: 'EUROPE', ES: 'EUROPE', NL: 'EUROPE',
  CH: 'EUROPE', BE: 'EUROPE', SE: 'EUROPE', NO: 'EUROPE', DK: 'EUROPE', RU: 'EUROPE', PL: 'EUROPE', EU: 'EUROPE',
  // Americas
  US: 'AMERICAS', CA: 'AMERICAS', BR: 'AMERICAS', MX: 'AMERICAS', AR: 'AMERICAS', CL: 'AMERICAS',
  // Middle East
  SA: 'MIDDLE_EAST', AE: 'MIDDLE_EAST', QA: 'MIDDLE_EAST', KW: 'MIDDLE_EAST', IL: 'MIDDLE_EAST', TR: 'MIDDLE_EAST', EG: 'MIDDLE_EAST',
  // Africa
  ZA: 'AFRICA', NG: 'AFRICA', KE: 'AFRICA', MA: 'AFRICA',
  // Oceania
  AU: 'OCEANIA', NZ: 'OCEANIA',
};

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
    const userRegion = COUNTRY_REGION[countryCode] || 'GLOBAL';

    // Get local indices configuration for the country
    const localIndicesConfig = getIndicesByCountry(countryCode);
    const localSymbols = localIndicesConfig.map(config => config.symbol);
    
    // Get global popular indices (exclude if already in local)
    const globalSymbols = GLOBAL_POPULAR_SYMBOLS.filter(s => !localSymbols.includes(s));
    
    // Get regional indices (exclude if already in local or global)
    const regionalSymbols = (REGIONAL_INDICES[userRegion] || [])
      .filter(s => !localSymbols.includes(s) && !globalSymbols.includes(s));
    
    // Combine all symbols
    const allSymbols = [...localSymbols, ...globalSymbols, ...regionalSymbols];
    
    console.log(`[Country API] Country: ${countryCode}, Region: ${userRegion}`);
    console.log(`[Country API] Local: ${localSymbols.length}, Global: ${globalSymbols.length}, Regional: ${regionalSymbols.length}`);

    // Fetch from database cache (auto-updates in background)
    const [dbIndices, dbCryptocurrencies, dbCurrencyRates, dbCommodities] = await Promise.all([
      getCachedIndices(allSymbols),
      getCachedCryptocurrencies(),
      getCachedCurrencyRates(),
      getCachedCommodities(),
    ]);
    
    console.log(`[Country API] DB returned ${dbIndices.length} indices:`, dbIndices.map((i: any) => i.symbol));

    // Get user's local currency rate for conversion
    const localCurrencyMap: Record<string, string> = {
      US: 'USD', CA: 'CAD', GB: 'GBP', EU: 'EUR', JP: 'JPY', CN: 'CNY',
      IN: 'INR', AU: 'AUD', BR: 'BRL', MX: 'MXN', RU: 'RUB', KR: 'KRW',
      CH: 'CHF', HK: 'HKD', SG: 'SGD', SA: 'SAR', AE: 'AED', ZA: 'ZAR',
      DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
    };
    const userCurrency = localCurrencyMap[countryCode] || 'USD';
    const userCurrencyRate = dbCurrencyRates.find((r: any) => r.currency === userCurrency);
    const usdToLocalRate = userCurrencyRate?.rateToUSD ? (1 / userCurrencyRate.rateToUSD) : 1;

    // Build priority map for sorting
    const localSymbolSet = new Set(localSymbols);
    const globalSymbolSet = new Set(globalSymbols);
    
    // Transform database indices to API format with priority
    const indexConfigMap = new Map(localIndicesConfig.map(config => [config.symbol, config]));

    const indices = dbIndices.map((idx: MarketIndexRecord) => {
      const config = indexConfigMap.get(idx.symbol);
      const isLocal = localSymbolSet.has(idx.symbol);
      const isGlobal = globalSymbolSet.has(idx.symbol);
      
      // Assign priority: 1 = local, 2 = global popular, 3 = regional
      const priority = isLocal ? 1 : (isGlobal ? 2 : 3);

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
        // New fields for priority display
        priority,
        isLocal,
        isGlobalPopular: isGlobal,
      };
    })
    // Sort by priority (local first, then global, then regional)
    .sort((a, b) => a.priority - b.priority);

    // Popular cryptocurrencies - sorted by importance/trading volume
    const CRYPTO_PRIORITY: Record<string, number> = {
      'BTC': 1,   // Bitcoin - most famous
      'ETH': 2,   // Ethereum - second most famous
      'USDT': 3,  // Tether - most used stablecoin
      'BNB': 4,   // Binance Coin
      'XRP': 5,   // Ripple
      'SOL': 6,   // Solana
      'USDC': 7,  // USD Coin
      'ADA': 8,   // Cardano
      'DOGE': 9,  // Dogecoin - popular meme coin
      'TRX': 10,  // Tron
    };

    // Transform cryptocurrencies with local currency conversion and priority sorting
    const cryptocurrencies = dbCryptocurrencies.map((crypto: CryptocurrencyRecord) => {
      // Convert USD value to local currency
      const valueInLocalCurrency = crypto.value * usdToLocalRate;
      const priority = CRYPTO_PRIORITY[crypto.symbol] || 99;
      const isPopular = priority <= 10;
      
      return {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        type: 'crypto' as const,
        region: ['GLOBAL'],
        country: 'US',
        value: crypto.value,
        valueLocal: valueInLocalCurrency,
        localCurrency: userCurrency,
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
        priority,
        isPopular,
      };
    })
    // Sort by priority (BTC first, ETH second, etc.)
    .sort((a, b) => a.priority - b.priority);

    // Popular currencies for conversion - major trading pairs
    const CURRENCY_PRIORITY: Record<string, number> = {
      'USD': 1,   // US Dollar - world reserve
      'EUR': 2,   // Euro
      'GBP': 3,   // British Pound
      'JPY': 4,   // Japanese Yen
      'CNY': 5,   // Chinese Yuan
      'INR': 6,   // Indian Rupee
      'AUD': 7,   // Australian Dollar
      'CAD': 8,   // Canadian Dollar
      'CHF': 9,   // Swiss Franc
      'HKD': 10,  // Hong Kong Dollar
      'SGD': 11,  // Singapore Dollar
      'KRW': 12,  // Korean Won
    };

    // Transform currency rates - show conversions FROM local currency
    const currencies = dbCurrencyRates
      .filter((rate: CurrencyRateRecord) => {
        const r = rate as any;
        return r.currency && typeof r.rateToUSD === 'number' && r.rateToUSD !== 0;
      })
      .map((rate: CurrencyRateRecord) => {
        const r = rate as any;
        const priority = CURRENCY_PRIORITY[r.currency] || 99;
        const isPopular = priority <= 12;
        
        // Calculate rate FROM user's local currency TO this currency
        // If user is in India (INR), show INR -> USD, INR -> EUR, etc.
        let displayPair = `${userCurrency}/${r.currency}`;
        let displayRate = r.rateToUSD;
        
        // Skip if it's the same currency
        if (r.currency === userCurrency) {
          displayPair = `${r.currency}/USD`;
          displayRate = r.rateToUSD;
        } else {
          // Convert: userCurrency -> USD -> targetCurrency
          // Rate = (1 USD in target) / (1 USD in userCurrency)
          // userCurrencyRate is already fetched: how many USD for 1 unit of userCurrency
          const userRateToUSD = userCurrencyRate?.rateToUSD || 1;
          // displayRate = how many target currency units for 1 unit of user's local currency
          displayRate = r.rateToUSD > 0 ? userRateToUSD / r.rateToUSD : 0;
        }
        
        return {
          id: r.id,
          pair: displayPair,
          baseCurrency: userCurrency,
          quoteCurrency: r.currency,
          rate: displayRate,
          rateToUSD: r.rateToUSD,
          change: 0,
          changePercent: 0,
          lastUpdated: r.lastUpdated instanceof Date 
            ? r.lastUpdated.toISOString() 
            : new Date(r.lastUpdated).toISOString(),
          name: r.currencyName ?? undefined,
          symbol: r.symbol ?? undefined,
          priority,
          isPopular,
        };
      })
      // Sort by priority (USD first, EUR second, etc.)
      .sort((a, b) => a.priority - b.priority);

    // Transform commodities with local currency conversion
    const commodities = dbCommodities.map((comm: CommodityRecord) => {
      // Convert USD value to local currency
      const valueInLocalCurrency = comm.value * usdToLocalRate;
      
      return {
        id: comm.id,
        symbol: comm.symbol,
        name: comm.name,
        type: 'commodity' as const,
        region: ['GLOBAL'],
        country: 'US',
        value: comm.value,
        valueLocal: valueInLocalCurrency,
        localCurrency: userCurrency,
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
      };
    });

    const response = {
      indices,
      commodities,
      currencies,
      cryptocurrencies,
      // User context for display
      userContext: {
        country: countryCode,
        region: userRegion,
        currency: userCurrency,
        currencySymbol: getCurrencySymbol(userCurrency),
        exchangeRate: usdToLocalRate, // USD to local
      },
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

// Helper to get currency symbol
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹',
    AUD: 'A$', CAD: 'C$', CHF: 'CHF', HKD: 'HK$', SGD: 'S$',
    KRW: '₩', BRL: 'R$', MXN: 'MX$', RUB: '₽', ZAR: 'R',
    AED: 'د.إ', SAR: 'SR',
  };
  return symbols[currency] || currency;
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
