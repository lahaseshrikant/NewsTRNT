// Market Data API - Cryptocurrencies Endpoint
// GET /api/market/crypto
// Returns data from database cache

import { NextRequest, NextResponse } from 'next/server';
import { getCachedCryptocurrencies } from '@/lib/market-cache';

export async function GET(request: NextRequest) {
  try {
    // Fetch from database cache (auto-updates in background)
    const dbCryptocurrencies = await getCachedCryptocurrencies();

    // Transform to API format
    const cryptocurrencies = dbCryptocurrencies.map((crypto: any) => ({
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      value: crypto.value,
      previousClose: crypto.previousClose,
      change: crypto.change,
      changePercent: crypto.changePercent,
      high: crypto.high,
      low: crypto.low,
      currency: 'USD',
      lastUpdated: crypto.lastUpdated.toISOString(),
      circulatingSupply: Number(crypto.circulatingSupply),
      totalSupply: Number(crypto.totalSupply),
      maxSupply: Number(crypto.maxSupply),
      rank: crypto.rank,
    }));

    return NextResponse.json(cryptocurrencies, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[Crypto API] Database cache error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrencies from cache' },
      { status: 500 }
    );
  }
}
