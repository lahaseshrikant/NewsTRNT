// Market Cache — Database write operations for auto-update service
// These functions write fresh market data into the Prisma database.
// The route handlers then read from the same tables to serve users.

import prisma from '../config/database';
import {
  fetchIndexFromAlphaVantage,
  fetchIndexFromFinnhub,
  fetchIndexFromMarketStack,
  fetchIndexFromTwelveData,
  fetchIndexFromFMP,
  fetchCryptoFromCoinGecko,
  fetchExchangeRates,
  fetchCommodityPrice,
} from './real-market-data';
// The backend no longer performs any TradingView scraping itself.  When
// providers fail we notify the external scraper service via
// SCRAPER_SERVICE_URL.
import { getProviderPreference } from './provider-preferences';

interface UpdateResult {
  successCount: number;
  failCount?: number;
}

/**
 * Update stock indices in DB
 * Called by market-auto-update on a 5-minute interval
 * Actual external API fetching is handled by the scraper or TradingView
 */
async function notifyScraper(symbol: string, type = 'indices') {
  const url = process.env.SCRAPER_SERVICE_URL;
  if (!url) {
    return;
  }
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, type }),
    });
    console.log(`[market-cache] notified scraper for ${symbol}`);
  } catch (err) {
    console.warn(`[market-cache] failed to notify scraper for ${symbol}:`, err);
  }
}

export async function updateStockIndices(): Promise<UpdateResult> {
  try {
    const configs = await prisma.marketIndexConfig.findMany({
      where: { isActive: true },
    });

    const pref = await getProviderPreference('indices');
    let successCount = 0;
    let failCount = 0;

    // threshold to consider an existing quote fresh (5 minutes)
    const STALE_MS = 5 * 60 * 1000;

    if (!process.env.ENABLE_REAL_MARKET_DATA || process.env.ENABLE_REAL_MARKET_DATA !== 'true') {
      console.warn('[market-cache] ENABLE_REAL_MARKET_DATA is false; provider calls will be skipped');
    }

    for (const cfg of configs) {
      // skip if we already have a recent value
      const existing = await prisma.marketIndex.findUnique({
        where: { symbol: cfg.symbol },
        select: { lastUpdated: true, lastSource: true },
      });
      if (existing && Date.now() - existing.lastUpdated.getTime() < STALE_MS) {
        continue;
      }

      let quote: any = null;

      // compute temporary order; place last successful provider first to save
      // subsequent calls
      let providersToTry = [...pref.providerOrder];
      if (existing?.lastSource) {
        const idx = providersToTry.indexOf(existing.lastSource);
        if (idx > 0) {
          providersToTry.splice(idx, 1);
          providersToTry.unshift(existing.lastSource);
        }
      }

      // try providers in computed order
      for (const providerId of providersToTry) {
        console.log(`[market-cache] trying provider ${providerId} for ${cfg.symbol}`);
        try {
          switch (providerId) {
            case 'alphavantage':
              quote = await fetchIndexFromAlphaVantage(cfg.symbol);
              break;
            case 'finnhub':
              quote = await fetchIndexFromFinnhub(cfg.symbol);
              break;
            case 'marketstack':
              quote = await fetchIndexFromMarketStack(cfg.symbol);
              break;
            case 'twelvedata':
              quote = await fetchIndexFromTwelveData(cfg.symbol);
              break;
            case 'fmp':
              quote = await fetchIndexFromFMP(cfg.symbol);
              break;
            case 'tradingview':
              // external scraper will handle this symbol; notify and continue
              await notifyScraper(cfg.symbol, 'indices');
              break;
            default:
              // unknown provider, skip
              break;
          }
        } catch (err) {
          console.error(`[market-cache] provider ${providerId} failed for ${cfg.symbol}:`, err);
        }

        if (quote && typeof quote.value === 'number') {
          quote.lastSource = quote.provider || providerId;
          break; // stop at first successful provider
        }
      }

      if (!quote || typeof quote.value !== 'number') {
        console.log(`[market-cache] providers produced no quote for ${cfg.symbol}`);
        // if we have a scraper service configured, ask it to scrape this symbol
        await notifyScraper(cfg.symbol, 'indices');
      } else {
        // successful provider, update lastSource column to help future runs
        await prisma.marketIndex.update({
          where: { symbol: cfg.symbol },
          data: { lastSource: quote.lastSource || quote.provider || providersToTry[0] },
        }).catch(() => {});
      }

      if (quote && typeof quote.value === 'number') {
        const previousClose =
          typeof quote.previousClose === 'number'
            ? quote.previousClose
            : quote.value - (quote.change || 0);

        await prisma.marketIndex.upsert({
          where: { symbol: cfg.symbol },
          update: {
            name: quote.name ?? cfg.symbol,
            country: quote.country ?? cfg.country ?? 'US',
            exchange: quote.exchange ?? cfg.exchange ?? '',
            value: quote.value,
            previousClose,
            change: quote.change ?? 0,
            changePercent: quote.changePercent ?? 0,
            high: quote.high ?? quote.value,
            low: quote.low ?? quote.value,
            currency: quote.currency ?? cfg.currency ?? 'USD',
            timezone: quote.timezone ?? cfg.timezone ?? 'UTC',
            lastUpdated: quote.lastUpdated ? new Date(quote.lastUpdated) : new Date(),
            lastSource: quote.lastSource || 'provider',
            isStale: false,
          },
          create: {
            symbol: cfg.symbol,
            name: quote.name ?? cfg.symbol,
            country: quote.country ?? cfg.country ?? 'US',
            exchange: quote.exchange ?? cfg.exchange ?? '',
            value: quote.value,
            previousClose,
            change: quote.change ?? 0,
            changePercent: quote.changePercent ?? 0,
            high: quote.high ?? quote.value,
            low: quote.low ?? quote.value,
            currency: quote.currency ?? cfg.currency ?? 'USD',
            timezone: quote.timezone ?? cfg.timezone ?? 'UTC',
            lastUpdated: quote.lastUpdated ? new Date(quote.lastUpdated) : new Date(),
            lastSource: quote.lastSource || 'provider',
          },
        });

        successCount++;
      } else {
        failCount++;
      }
    }

    return { successCount, failCount };
  } catch (error) {
    console.error('[market-cache] updateStockIndices failed:', error);
    return { successCount: 0, failCount: 1 };
  }
}

/**
 * Update cryptocurrency prices in DB
 * In production this would call CoinGecko or similar API
 */
export async function updateCryptocurrencies(): Promise<UpdateResult> {
  try {
    const configs = await prisma.cryptocurrencyConfig.findMany({
      where: { isActive: true },
    });

    const ids = configs.map((c) => c.coinGeckoId).filter(Boolean);
    const quotes = await fetchCryptoFromCoinGecko(ids);
    const quoteMap = new Map(quotes.map((q) => [q.id, q]));

    let successCount = 0;
    let failCount = 0;

    const STALE_MS = 2 * 60 * 1000; // crypto updated every 2min

    for (const cfg of configs) {
      const existing = await prisma.cryptocurrency.findUnique({
        where: { symbol: cfg.symbol },
        select: { lastUpdated: true },
      });
      if (existing && Date.now() - existing.lastUpdated.getTime() < STALE_MS) {
        continue;
      }

      const q = quoteMap.get(cfg.coinGeckoId);
      if (q && typeof q.value === 'number') {
        await prisma.cryptocurrency.upsert({
          where: { symbol: cfg.symbol },
          update: {
            // name not provided by CoinGecko, retain existing or config
            value: q.value,
            previousClose: q.previousClose ?? q.value,
            change: q.change ?? 0,
            changePercent: q.changePercent ?? 0,
            high24h: q.high ?? undefined,
            low24h: q.low ?? undefined,
            lastUpdated: q.lastUpdated ? new Date(q.lastUpdated) : new Date(),
            lastSource: 'coingecko',
            isStale: false,
          },
          create: {
            symbol: cfg.symbol,
            name: cfg.name ?? cfg.symbol,
            coinGeckoId: cfg.coinGeckoId,
            value: q.value,
            previousClose: q.previousClose ?? q.value,
            change: q.change ?? 0,
            changePercent: q.changePercent ?? 0,
            high24h: q.high ?? undefined,
            low24h: q.low ?? undefined,
            lastUpdated: q.lastUpdated ? new Date(q.lastUpdated) : new Date(),
            lastSource: 'coingecko',
          },
        });
        successCount++;
      } else {
        failCount++;
      }
    }

    return { successCount, failCount };
  } catch (error) {
    console.error('[market-cache] updateCryptocurrencies failed:', error);
    return { successCount: 0, failCount: 1 };
  }
}

/**
 * Update currency exchange rates in DB
 */
export async function updateCurrencyRates(): Promise<UpdateResult> {
  try {
    const configs = await prisma.currencyPairConfig.findMany({
      where: { isActive: true },
    });

    const snapshot = await fetchExchangeRates('USD');

    let successCount = 0;
    let failCount = 0;

    const STALE_MS = 15 * 60 * 1000; // 15min

    for (const cfg of configs) {
      const existing = await prisma.currencyRate.findUnique({
        where: { currency: cfg.quote },
        select: { lastUpdated: true },
      });
      if (existing && Date.now() - existing.lastUpdated.getTime() < STALE_MS) {
        continue;
      }

      const quoteCurrency = cfg.quote;
      const rateSnapshot = snapshot[quoteCurrency];
      if (rateSnapshot && typeof rateSnapshot.rate === 'number') {
        const rateToUSD = rateSnapshot.rate;
        const rateFromUSD = rateToUSD !== 0 ? 1 / rateToUSD : null;
        await prisma.currencyRate.upsert({
          where: { currency: quoteCurrency },
          update: {
            currencyName: cfg.name ?? quoteCurrency,
            rateToUSD,
            rateFromUSD,
            lastUpdated: rateSnapshot.lastUpdated,
            lastSource: 'exchangerate',
            isStale: false,
          },
          create: {
            currency: quoteCurrency,
            currencyName: cfg.name ?? quoteCurrency,
            rateToUSD,
            rateFromUSD,
            country: cfg.base || null,
            lastUpdated: rateSnapshot.lastUpdated,
            lastSource: 'exchangerate',
          },
        });
        successCount++;
      } else {
        failCount++;
      }
    }

    return { successCount, failCount };
  } catch (error) {
    console.error('[market-cache] updateCurrencyRates failed:', error);
    return { successCount: 0, failCount: 1 };
  }
}

/**
 * Update commodity prices in DB
 */
export async function updateCommodities(): Promise<UpdateResult> {
  try {
    const configs = await prisma.commodityConfig.findMany({
      where: { isActive: true },
    });

    const pref = await getProviderPreference('commodities');

    let successCount = 0;
    let failCount = 0;

    const STALE_MS = 30 * 60 * 1000; // 30min

    for (const cfg of configs) {
      const existing = await prisma.commodity.findUnique({
        where: { symbol: cfg.symbol },
        select: { lastUpdated: true, lastSource: true },
      });
      if (existing && Date.now() - existing.lastUpdated.getTime() < STALE_MS) {
        continue;
      }

      // build order giving preference to lastSource when present
      let order = [...pref.providerOrder];
      if (existing?.lastSource) {
        const i = order.indexOf(existing.lastSource);
        if (i > 0) {
          order.splice(i, 1);
          order.unshift(existing.lastSource);
        }
      }
      const quote = await fetchCommodityPrice(cfg.symbol, cfg.category, order);
      if (quote && typeof quote.value === 'number') {
        const previousClose =
          typeof quote.previousClose === 'number'
            ? quote.previousClose
            : quote.value - (quote.change || 0);

        await prisma.commodity.upsert({
          where: { symbol: cfg.symbol },
          update: {
            name: quote.name ?? cfg.name,
            category: cfg.category,
            value: quote.value,
            previousClose,
            change: quote.change ?? 0,
            changePercent: quote.changePercent ?? 0,
            high: quote.high,
            low: quote.low,
            currency: quote.currency ?? cfg.currency ?? 'USD',
            lastUpdated: quote.lastUpdated ? new Date(quote.lastUpdated) : new Date(),
            lastSource: (quote as any).provider ?? 'provider',
            isStale: false,
          },
          create: {
            symbol: cfg.symbol,
            name: quote.name ?? cfg.name ?? cfg.symbol,
            category: cfg.category,
            unit: cfg.unit ?? 'USD',
            currency: quote.currency ?? cfg.currency ?? 'USD',
            value: quote.value,
            previousClose,
            change: quote.change ?? 0,
            changePercent: quote.changePercent ?? 0,
            high: quote.high,
            low: quote.low,
            lastUpdated: quote.lastUpdated ? new Date(quote.lastUpdated) : new Date(),
            lastSource: (quote as any).provider ?? 'provider',
          },
        });

        successCount++;
      } else {
        failCount++;
      }
    }

    return { successCount, failCount };
  } catch (error) {
    console.error('[market-cache] updateCommodities failed:', error);
    return { successCount: 0, failCount: 1 };
  }
}
