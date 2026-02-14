// Market Data API - Commodities Endpoint
// GET /api/market/commodities
// Returns data from database cache

import { NextRequest, NextResponse } from 'next/server';
import { getCachedCommodities } from '@/lib/market-cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Fetch from database cache (auto-updates in background)
    let dbCommodities = await getCachedCommodities();

    // Filter by category if requested
    if (category) {
      dbCommodities = dbCommodities.filter((c: any) => c.category === category);
    }

    // Transform to API format
    const commodities = dbCommodities.map((comm: any) => ({
      id: comm.id,
      symbol: comm.symbol,
      name: comm.name,
      type: 'commodity' as const,
      region: ['GLOBAL'],
      country: 'US',
      value: comm.value,
      previousClose: comm.previousClose,
      change: comm.change,
      changePercent: comm.changePercent,
      high: comm.high,
      low: comm.low,
      currency: comm.unit,
      lastUpdated: comm.lastUpdated.toISOString(),
      isOpen: true,
      unit: comm.unit,
      category: comm.category,
    }));

    return NextResponse.json(commodities, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[Commodities API] Database cache error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commodities from cache' },
      { status: 500 }
    );
  }
}
