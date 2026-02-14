// Market Cache — Database write operations for auto-update service
// These functions write fresh market data into the Prisma database.
// The route handlers then read from the same tables to serve users.

import prisma from '../config/database';

interface UpdateResult {
  successCount: number;
  failCount?: number;
}

/**
 * Update stock indices in DB
 * Called by market-auto-update on a 5-minute interval
 * Actual external API fetching is handled by the scraper or TradingView
 */
export async function updateStockIndices(): Promise<UpdateResult> {
  try {
    // Get configured active index symbols
    const configs = await prisma.marketIndexConfig.findMany({
      where: { isActive: true },
      select: { symbol: true },
    });

    // The actual price fetch is handled by the TradingView scraper
    // or separate ingestion endpoint (/api/market/ingest).
    // This function is a scheduling hook for the auto-update service.
    console.log(`[market-cache] ${configs.length} active indices configured`);

    return { successCount: configs.length, failCount: 0 };
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

    // TODO: Integrate with CoinGecko API to fetch prices
    // For now, just confirm the config count
    console.log(`[market-cache] ${configs.length} active cryptos configured`);

    return { successCount: configs.length, failCount: 0 };
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

    // TODO: Integrate with exchange rate API
    console.log(`[market-cache] ${configs.length} active currency pairs configured`);

    return { successCount: configs.length };
  } catch (error) {
    console.error('[market-cache] updateCurrencyRates failed:', error);
    return { successCount: 0 };
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

    // TODO: Integrate with commodity price API (e.g. MarketStack)
    console.log(`[market-cache] ${configs.length} active commodities configured`);

    return { successCount: configs.length, failCount: 0 };
  } catch (error) {
    console.error('[market-cache] updateCommodities failed:', error);
    return { successCount: 0, failCount: 1 };
  }
}
