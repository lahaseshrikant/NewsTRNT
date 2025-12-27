// Market Data Cache Service
// Fetches data from external APIs and stores in database
// Scheduled updates to avoid rate limits
// Now uses database configuration instead of hardcoded config files

// @ts-nocheck
import prisma from '@backend/config/database';
import {
  fetchIndexFromAlphaVantage,
  fetchIndexFromFinnhub,
  fetchIndexFromMarketStack,
  fetchIndexFromTwelveData,
  fetchIndexFromFMP,
  fetchCryptoFromCoinGecko,
  fetchExchangeRates,
  fetchCommodityPrice,
  CoinGeckoQuote,
  ExchangeRateSnapshot,
} from './real-market-data';
import { fetchIndexFromTradingView } from './tradingview-fallback';
import { 
  getMarketIndices, 
  getCryptocurrencies, 
  getCommodities 
} from './market-config';
import { getProviderPreference } from './provider-preferences';

// Cache durations (in minutes)
const CACHE_DURATION = {
  indices: 0.5,        // 30 minutes for stock indices
  crypto: 0.5,          // 5 minutes for cryptocurrencies
  currencies: 0.5,     // 1 hour for currency rates
  commodities: 2,    // 30 minutes for commodities
};

/**
 * Check if cached data is stale
 */
function isDataStale(lastUpdated: Date, durationMinutes: number): boolean {
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
  return diffMinutes >= durationMinutes;
}

function hasNumericValue(payload: any): payload is { value: number } {
  return payload && typeof payload.value === 'number' && Number.isFinite(payload.value);
}

const INDEX_PROVIDER_REGISTRY: Record<string, (symbol: string, context?: { name?: string }) => Promise<any>> = {
  alphavantage: (symbol) => fetchIndexFromAlphaVantage(symbol),
  finnhub: (symbol) => fetchIndexFromFinnhub(symbol),
  marketstack: (symbol) => fetchIndexFromMarketStack(symbol),
  twelvedata: (symbol) => fetchIndexFromTwelveData(symbol),
  fmp: (symbol) => fetchIndexFromFMP(symbol),
  tradingview: (symbol, context) => fetchIndexFromTradingView(symbol, context?.name),
};

const PROVIDER_LABELS: Record<string, string> = {
  alphavantage: 'Alpha Vantage',
  finnhub: 'Finnhub',
  marketstack: 'MarketStack',
  twelvedata: 'TwelveData',
  fmp: 'Financial Modeling Prep',
  tradingview: 'TradingView Fallback',
};

async function fetchIndexSnapshot(symbol: string, providerOrder: string[], context?: { name?: string }) {
  for (const providerId of providerOrder) {
    const fetcher = INDEX_PROVIDER_REGISTRY[providerId];
    if (!fetcher) {
      continue;
    }

    try {
      const result = await fetcher(symbol, context);
      if (hasNumericValue(result)) {
        return { provider: providerId, data: result };
      }
    } catch (error) {
      console.error(`[Market Cache] ${providerId} fetch failed for ${symbol}:`, error);
    }
  }

  return { provider: null as string | null, data: null as any };
}

/**
 * Update all stock indices in database
 * Now fetches active indices from database configuration
 */
export async function updateStockIndices() {
  console.log('[Market Cache] Starting stock indices update...');
  
  // Get active indices from database configuration
  const activeIndices = await getMarketIndices();
  const preference = await getProviderPreference('indices');
  const providerOrder = preference.providerOrder;
  const uniqueSymbols = activeIndices.map(idx => idx.symbol);
  const configMap = new Map(activeIndices.map((idx) => [idx.symbol, idx]));
  
  let successCount = 0;
  let failCount = 0;

  for (const symbol of uniqueSymbols) {
    try {
      const indexConfig = configMap.get(symbol);
      const { data, provider } = await fetchIndexSnapshot(symbol, providerOrder, {
        name: indexConfig?.name,
      });

      if (hasNumericValue(data)) {
        const name = indexConfig?.name ?? symbol.replace('^', '');
        const country = indexConfig?.country ?? 'US';
        const exchange = indexConfig?.exchange ?? 'Unknown';
        const timezone = indexConfig?.timezone ?? 'America/New_York';
        const currency = data.currency ?? indexConfig?.currency ?? 'USD';
        const sourceId = provider ?? 'unknown';

        // Upsert to database
        await prisma.marketIndex.upsert({
          where: { symbol },
          update: {
            name,
            country,
            exchange,
            value: data.value,
            previousClose: data.previousClose ?? data.value,
            change: data.change ?? (data.value - (data.previousClose ?? data.value)),
            changePercent:
              data.changePercent !== undefined
                ? data.changePercent
                : data.previousClose
                ? ((data.value - data.previousClose) / data.previousClose) * 100
                : 0,
            high: data.high ?? data.value,
            low: data.low ?? data.value,
            currency,
            timezone,
            lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
            lastSource: sourceId,
          },
          create: {
            symbol,
            name,
            country,
            exchange,
            value: data.value,
            previousClose: data.previousClose ?? data.value,
            change: data.change ?? (data.value - (data.previousClose ?? data.value)),
            changePercent:
              data.changePercent !== undefined
                ? data.changePercent
                : data.previousClose
                ? ((data.value - data.previousClose) / data.previousClose) * 100
                : 0,
            high: data.high ?? data.value,
            low: data.low ?? data.value,
            currency,
            timezone,
            lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
            lastSource: sourceId,
          },
        });
        
        successCount++;
        const providerDisplay = provider ? ` via ${PROVIDER_LABELS[provider] ?? provider}` : '';
        console.log(`[Market Cache] ✅ Updated ${symbol}${providerDisplay}: $${data.value}`);
      } else {
        failCount++;
        console.log(`[Market Cache] ❌ No data for ${symbol}`);
      }
      
      // Rate limiting: wait 15 seconds between calls (Alpha Vantage free tier)
      await new Promise(resolve => setTimeout(resolve, 15000));
      
    } catch (error) {
      failCount++;
      console.error(`[Market Cache] Error updating ${symbol}:`, error);
    }
  }
  
  console.log(`[Market Cache] Stock indices update complete: ${successCount} success, ${failCount} failed`);
  return { successCount, failCount };
}

/**
 * Update all cryptocurrencies in database
 * Now fetches active cryptocurrencies from database configuration
 */
export async function updateCryptocurrencies() {
  console.log('[Market Cache] Starting cryptocurrencies update...');
  
  // Get active cryptocurrencies from database configuration
  const activeCryptos = await getCryptocurrencies();
  const cryptoList = activeCryptos.map(c => ({
    id: c.coinGeckoId,
    symbol: c.symbol,
    name: c.name,
  }));
  
  const cryptoSymbols = cryptoList.map(c => c.id);
  
  try {
  const cryptoData: CoinGeckoQuote[] = await fetchCryptoFromCoinGecko(cryptoSymbols);
    
    if (!cryptoData || cryptoData.length === 0) {
      console.log('[Market Cache] No crypto data received');
      return { successCount: 0, failCount: cryptoSymbols.length };
    }
    
    let successCount = 0;
    
    for (const crypto of cryptoData) {
      // Find matching crypto in our list so catch blocks can reference it safely
      const cryptoInfo = cryptoList.find(c => c.id === crypto.id);

      if (!cryptoInfo) {
        console.warn(`[Market Cache] Skipping unknown crypto id: ${crypto.id}`);
        continue;
      }

      try {
        await prisma.cryptocurrency.upsert({
          where: { symbol: cryptoInfo.symbol },
          update: {
            value: crypto.value,
            previousClose: crypto.previousClose,
            change: crypto.change,
            changePercent: crypto.changePercent,
            // Note: high24h, low24h, volume24h, marketCap need to be in API response
            lastUpdated: crypto.lastUpdated,
          },
          create: {
            symbol: cryptoInfo.symbol,
            name: cryptoInfo.name,
            coinGeckoId: cryptoInfo.id,
            value: crypto.value,
            previousClose: crypto.previousClose,
            change: crypto.change,
            changePercent: crypto.changePercent,
            lastUpdated: crypto.lastUpdated,
          },
        });
        
        successCount++;
        console.log(`[Market Cache] ✅ Updated ${cryptoInfo.symbol}: $${crypto.value}`);
      } catch (error) {
        console.error(`[Market Cache] Error upserting ${cryptoInfo.symbol}:`, error);
      }
    }
    
    console.log(`[Market Cache] Cryptocurrencies update complete: ${successCount} success`);
    return { successCount, failCount: cryptoSymbols.length - successCount };
    
  } catch (error) {
    console.error('[Market Cache] Crypto update failed:', error);
    return { successCount: 0, failCount: cryptoSymbols.length };
  }
}

/**
 * Update currency exchange rates in database
 * Optimized: Store all rates against USD as base
 * Any other conversion calculated: EUR to GBP = (EUR/USD) / (GBP/USD)
 */
export async function updateCurrencyRates() {
  console.log('[Market Cache] Starting currency rates update...');
  
  // Currency metadata
  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  ];
  
  try {
  const rateSnapshots: Record<string, ExchangeRateSnapshot> = await fetchExchangeRates('USD');

    if (!rateSnapshots || Object.keys(rateSnapshots).length === 0) {
      console.log('[Market Cache] No rates received from API');
      return { successCount: 0 };
    }

    let successCount = 0;
    const usdTimestamp = rateSnapshots['USD']?.lastUpdated ?? new Date();

    await prisma.currencyRate.upsert({
      where: { currency: 'USD' },
      update: {
        rateToUSD: 1.0,
        lastUpdated: usdTimestamp,
      },
      create: {
        currency: 'USD',
        currencyName: 'US Dollar',
        rateToUSD: 1.0,
        symbol: '$',
        lastUpdated: usdTimestamp,
      },
    });
    successCount++;

    for (const curr of currencies) {
      try {
        const snapshot: ExchangeRateSnapshot | undefined = rateSnapshots[curr.code];

        if (!snapshot || snapshot.rate === 0) {
          console.log(`[Market Cache] No rate found for ${curr.code}`);
          continue;
        }

        const rateToUSD = 1 / snapshot.rate;
        if (!Number.isFinite(rateToUSD)) {
          console.log(`[Market Cache] Invalid rate for ${curr.code}`);
          continue;
        }

        await prisma.currencyRate.upsert({
          where: { currency: curr.code },
          update: {
            rateToUSD,
            lastUpdated: snapshot.lastUpdated,
          },
          create: {
            currency: curr.code,
            currencyName: curr.name,
            rateToUSD,
            symbol: curr.symbol,
            lastUpdated: snapshot.lastUpdated,
          },
        });

        successCount++;
        console.log(`[Market Cache] ✅ ${curr.code}: 1 ${curr.code} = $${rateToUSD.toFixed(4)} USD`);
      } catch (error) {
        console.error(`[Market Cache] Error upserting ${curr.code}:`, error);
      }
    }

    console.log(`[Market Cache] Currency rates update complete: ${successCount} currencies`);
    return { successCount };
  } catch (error) {
    console.error('[Market Cache] Currency rates update failed:', error);
    return { successCount: 0 };
  }
}

/**
 * Update all commodities in database
 * Now fetches active commodities from database configuration
 */
export async function updateCommodities() {
  console.log('[Market Cache] Starting commodities update...');
  
  // Get active commodities from database configuration
  const activeCommodities = await getCommodities();
  const commodityPreference = await getProviderPreference('commodities');
  const commodityProviderOrder = commodityPreference.providerOrder;
  const commodities = activeCommodities.map(c => ({
    symbol: c.symbol,
    name: c.name,
    category: c.category.toLowerCase(),
    unit: c.unit,
  }));
  
  let successCount = 0;
  let failCount = 0;

  for (const commodity of commodities) {
    try {
      const data = await fetchCommodityPrice(commodity.symbol, commodity.category, commodityProviderOrder);
      
      if (hasNumericValue(data)) {
        const providerId = (data as any)?.provider as string | undefined;
        const providerDisplay = providerId ? ` via ${PROVIDER_LABELS[providerId] ?? providerId}` : '';
        // Upsert to database
        await prisma.commodity.upsert({
          where: { symbol: commodity.symbol },
          update: {
            value: data.value,
            previousClose: data.previousClose ?? data.value,
            change: data.change ?? (data.value - (data.previousClose ?? data.value)),
            changePercent:
              data.changePercent !== undefined && data.changePercent !== null
                ? data.changePercent
                : data.previousClose
                ? ((data.value - data.previousClose) / data.previousClose) * 100
                : 0,
            high: data.high ?? undefined,
            low: data.low ?? undefined,
            lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
          },
          create: {
            symbol: commodity.symbol,
            name: commodity.name,
            value: data.value,
            unit: commodity.unit || 'USD',
            previousClose: data.previousClose ?? data.value,
            change: data.change ?? (data.value - (data.previousClose ?? data.value)),
            changePercent:
              data.changePercent !== undefined && data.changePercent !== null
                ? data.changePercent
                : data.previousClose
                ? ((data.value - data.previousClose) / data.previousClose) * 100
                : 0,
            high: data.high ?? undefined,
            low: data.low ?? undefined,
            category: commodity.category,
            lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
          },
        });
        
        successCount++;
        console.log(`[Market Cache] ✅ Updated ${commodity.name} (${commodity.symbol})${providerDisplay}: $${data.value}`);
      } else {
        failCount++;
        console.log(`[Market Cache] ❌ No data for ${commodity.name}`);
      }
      
      // Rate limiting: wait 15 seconds between calls
      await new Promise(resolve => setTimeout(resolve, 15000));
      
    } catch (error) {
      failCount++;
      console.error(`[Market Cache] Error updating ${commodity.name}:`, error);
    }
  }
  
  console.log(`[Market Cache] Commodities update complete: ${successCount} success, ${failCount} failed`);
  return { successCount, failCount };
}

/**
 * Get cached stock indices or fetch if stale
 */
export async function getCachedIndices(symbols: string[]) {
  const indices = await prisma.marketIndex.findMany({
    where: { symbol: { in: symbols } },
  });
  
  // Check if data is stale
  const needsUpdate = indices.length === 0 || 
    indices.some(idx => isDataStale(idx.lastUpdated, CACHE_DURATION.indices));
  
  if (needsUpdate) {
    console.log('[Market Cache] Indices cache stale, triggering background update...');
    // Trigger update in background (non-blocking)
    updateStockIndices().catch(console.error);
  }
  
  return indices;
}

/**
 * Get cached cryptocurrencies or fetch if stale
 */
export async function getCachedCryptocurrencies() {
  const cryptos = await prisma.cryptocurrency.findMany({
    orderBy: { marketCap: 'desc' },
    take: 20,
  });
  
  // Check if data is stale
  const needsUpdate = cryptos.length === 0 || 
    (cryptos[0] && isDataStale(cryptos[0].lastUpdated, CACHE_DURATION.crypto));
  
  if (needsUpdate) {
    console.log('[Market Cache] Crypto cache stale, triggering background update...');
    updateCryptocurrencies().catch(console.error);
  }
  
  return cryptos;
}

/**
 * Get cached currency rates or fetch if stale
 * Returns all currency rates (stored as rate to USD)
 */
export async function getCachedCurrencyRates() {
  const rates = await prisma.currencyRate.findMany();
  
  // Check if data is stale
  const needsUpdate = rates.length === 0 || 
    (rates[0] && isDataStale(rates[0].lastUpdated, CACHE_DURATION.currencies));
  
  if (needsUpdate) {
    console.log('[Market Cache] Currency cache stale, triggering background update...');
    updateCurrencyRates().catch(console.error);
  }
  
  return rates;
}

/**
 * Get cached commodities or fetch if stale
 */
export async function getCachedCommodities() {
  const commodities = await prisma.commodity.findMany({
    orderBy: { symbol: 'asc' },
  });
  
  // Check if data is stale
  const needsUpdate = commodities.length === 0 || 
    (commodities[0] && isDataStale(commodities[0].lastUpdated, CACHE_DURATION.commodities));
  
  if (needsUpdate) {
    console.log('[Market Cache] Commodities cache stale, triggering background update...');
    updateCommodities().catch(console.error);
  }
  
  return commodities;
}

/**
 * Convert amount from one currency to another
 * Uses cached rates stored in database
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  // Get both currency rates
  const [fromRate, toRate] = await Promise.all([
    prisma.currencyRate.findUnique({ where: { currency: fromCurrency } }),
    prisma.currencyRate.findUnique({ where: { currency: toCurrency } }),
  ]);
  
  if (!fromRate || !toRate) {
    console.warn(`[Market Cache] Missing rate for ${fromCurrency} or ${toCurrency}`);
    return amount; // Return original if rates not found
  }
  
  // Convert: amount in FROM -> USD -> TO
  // Example: 100 EUR to GBP
  // 1 EUR = 1.09 USD, 1 GBP = 1.27 USD
  // 100 EUR = 100 * 1.09 = 109 USD
  // 109 USD = 109 / 1.27 = 85.83 GBP
  const amountInUSD = amount * fromRate.rateToUSD;
  const amountInTarget = amountInUSD / toRate.rateToUSD;
  
  return amountInTarget;
}

/**
 * Update all market data (can be called by cron job)
 */
export async function updateAllMarketData() {
  console.log('[Market Cache] ========================================');
  console.log('[Market Cache] Starting full market data update...');
  console.log('[Market Cache] ========================================');
  
  const startTime = Date.now();
  
  // Update in sequence to avoid overwhelming APIs
  const cryptoResult = await updateCryptocurrencies();
  const currencyResult = await updateCurrencyRates();
  const indicesResult = await updateStockIndices();
  const commoditiesResult = await updateCommodities();
  
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
  
  console.log('[Market Cache] ========================================');
  console.log('[Market Cache] Full update complete!');
  console.log(`[Market Cache] Duration: ${duration} minutes`);
  console.log(`[Market Cache] Crypto: ${cryptoResult.successCount}/${cryptoResult.successCount + cryptoResult.failCount}`);
  console.log(`[Market Cache] Currencies: ${currencyResult.successCount}`);
  console.log(`[Market Cache] Indices: ${indicesResult.successCount}/${indicesResult.successCount + indicesResult.failCount}`);
  console.log(`[Market Cache] Commodities: ${commoditiesResult.successCount}/${commoditiesResult.successCount + commoditiesResult.failCount}`);
  console.log('[Market Cache] ========================================');
  
  return {
    crypto: cryptoResult,
    currencies: currencyResult,
    indices: indicesResult,
    commodities: commoditiesResult,
    duration,
  };
}

export { prisma };
