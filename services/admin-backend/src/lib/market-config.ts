// Market configuration — reads directly from Prisma database
// No HTTP calls — this is backend code with direct DB access

import prisma from '../config/database';

/**
 * Get all active market indices from DB
 */
export async function getMarketIndices(options?: {
  country?: string;
  region?: string;
  includeInactive?: boolean;
}) {
  const where: any = {};
  if (!options?.includeInactive) where.isActive = true;
  if (options?.country) where.country = options.country;
  if (options?.region) where.region = { has: options.region };

  return prisma.marketIndexConfig.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Get indices grouped by country
 */
export async function getIndicesByCountry() {
  const indices = await getMarketIndices();
  const byCountry: Record<string, typeof indices> = {};
  for (const idx of indices) {
    if (!byCountry[idx.country]) byCountry[idx.country] = [];
    byCountry[idx.country].push(idx);
  }
  return byCountry;
}

/**
 * Get all active cryptocurrencies from DB
 */
export async function getCryptocurrencies(options?: { includeInactive?: boolean }) {
  const where: any = {};
  if (!options?.includeInactive) where.isActive = true;
  return prisma.cryptocurrencyConfig.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Get all active commodities from DB
 */
export async function getCommodities(options?: { category?: string; includeInactive?: boolean }) {
  const where: any = {};
  if (!options?.includeInactive) where.isActive = true;
  if (options?.category) where.category = options.category;
  return prisma.commodityConfig.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Get all active currency pairs from DB
 */
export async function getCurrencyPairs(options?: { type?: string; includeInactive?: boolean }) {
  const where: any = {};
  if (!options?.includeInactive) where.isActive = true;
  if (options?.type) where.type = options.type;
  return prisma.currencyPairConfig.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Get all market configuration in one call
 */
export async function getAllMarketConfig() {
  const [indices, cryptos, commodities, currencies] = await Promise.all([
    getMarketIndices(),
    getCryptocurrencies(),
    getCommodities(),
    getCurrencyPairs(),
  ]);
  return { indices, cryptos, commodities, currencies };
}

/**
 * Get active symbols for each market type
 * Used by market-auto-update to know what to fetch
 */
export async function getActiveSymbols() {
  const config = await getAllMarketConfig();
  return {
    indices: config.indices.map((i: any) => i.symbol),
    cryptos: config.cryptos.map((c: any) => c.symbol),
    commodities: config.commodities.map((c: any) => c.symbol),
    currencies: config.currencies.map((c: any) => c.pair),
  };
}

/**
 * Clear config cache — no-op now (Prisma handles caching at connection level)
 */
export function clearConfigCache(): void {
  // no-op — direct DB queries, no in-memory cache needed
}
