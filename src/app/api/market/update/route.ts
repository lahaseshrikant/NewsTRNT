// Manual Market Data Update API
// POST /api/market/update -> runs full update now
// GET /api/market/update -> returns lastUpdated snapshots for verification

import { NextRequest, NextResponse } from 'next/server';
import { updateAllMarketData } from '@/lib/market-cache';
// Side-effect import to auto-start background updater when this route is first loaded
import '@/lib/market-auto-update';
import prisma from '@backend/config/database';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    const result = await updateAllMarketData();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Market Update] Failed to run full update:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Get counts and latest records for each table
    const [
      indexCount,
      cryptoCount,
      currencyCount,
      commodityCount,
      latestIndex,
      latestCrypto,
      latestCurrency,
      latestCommodity,
      // Also check config tables
      indexConfigCount,
      cryptoConfigCount,
      commodityConfigCount,
    ] = await Promise.all([
      prisma.marketIndex.count(),
      prisma.cryptocurrency.count(),
      prisma.currencyRate.count(),
      prisma.commodity.count(),
      prisma.marketIndex.findFirst({ orderBy: { lastUpdated: 'desc' } }),
      prisma.cryptocurrency.findFirst({ orderBy: { lastUpdated: 'desc' } }),
      prisma.currencyRate.findFirst({ orderBy: { lastUpdated: 'desc' } }),
      prisma.commodity.findFirst({ orderBy: { lastUpdated: 'desc' } }),
      prisma.marketIndexConfig.count({ where: { isActive: true } }),
      prisma.cryptocurrencyConfig.count({ where: { isActive: true } }),
      prisma.commodityConfig.count({ where: { isActive: true } }),
    ]);

    const now = new Date();

    return NextResponse.json({
      success: true,
      counts: {
        indices: indexCount,
        crypto: cryptoCount,
        currencies: currencyCount,
        commodities: commodityCount,
      },
      configCounts: {
        indicesConfig: indexConfigCount,
        cryptoConfig: cryptoConfigCount,
        commodityConfig: commodityConfigCount,
      },
      snapshots: {
        indices: latestIndex 
          ? { 
              symbol: latestIndex.symbol, 
              value: latestIndex.value,
              lastUpdated: latestIndex.lastUpdated,
              ageMinutes: Math.round((now.getTime() - latestIndex.lastUpdated.getTime()) / 60000),
            } 
          : null,
        crypto: latestCrypto 
          ? { 
              symbol: latestCrypto.symbol, 
              value: latestCrypto.value,
              lastUpdated: latestCrypto.lastUpdated,
              ageMinutes: Math.round((now.getTime() - latestCrypto.lastUpdated.getTime()) / 60000),
            } 
          : null,
        currencies: latestCurrency 
          ? { 
              currency: latestCurrency.currency, 
              rateToUSD: latestCurrency.rateToUSD,
              lastUpdated: latestCurrency.lastUpdated,
              ageMinutes: Math.round((now.getTime() - latestCurrency.lastUpdated.getTime()) / 60000),
            } 
          : null,
        commodities: latestCommodity 
          ? { 
              symbol: latestCommodity.symbol, 
              value: latestCommodity.value,
              lastUpdated: latestCommodity.lastUpdated,
              ageMinutes: Math.round((now.getTime() - latestCommodity.lastUpdated.getTime()) / 60000),
            } 
          : null,
      },
      env: {
        ENABLE_REAL_MARKET_DATA: process.env.ENABLE_REAL_MARKET_DATA,
        hasAlphaVantageKey: !!process.env.ALPHA_VANTAGE_API_KEY,
        hasFinnhubKey: !!process.env.FINNHUB_API_KEY,
        hasExchangeRateKey: !!process.env.EXCHANGE_RATE_API_KEY,
      },
      message: indexConfigCount === 0 
        ? 'No market index configs found. Run seed-market-config.ts first!'
        : indexCount === 0
        ? 'No market data yet. Trigger POST /api/market/update to populate.'
        : 'Market data is available.',
    });
  } catch (error) {
    console.error('[Market Update] Failed to read snapshots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read lastUpdated snapshots', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
