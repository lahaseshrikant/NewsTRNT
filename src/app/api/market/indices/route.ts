// Market Data API - Indices Endpoint
// POST /api/market/indices

import { NextRequest, NextResponse } from 'next/server';
import { ALL_INDICES } from '@/config/market-indices';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Invalid symbols array' },
        { status: 400 }
      );
    }

    // Filter indices by requested symbols
    const requestedIndices = ALL_INDICES.filter(idx => 
      symbols.includes(idx.symbol)
    );

    // Generate mock data
    const indices = requestedIndices.map((config, index) => {
      const value = 10000 + Math.random() * 5000;
      const previousClose = value * (1 + (Math.random() - 0.5) * 0.02);
      const change = value - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        id: `${config.symbol}_${Date.now()}_${index}`,
        symbol: config.symbol,
        name: config.name,
        type: 'stock' as const,
        region: config.region,
        country: config.country,
        value,
        previousClose,
        change,
        changePercent,
        high: value * 1.02,
        low: value * 0.98,
        volume: Math.floor(Math.random() * 10000000),
        currency: config.currency,
        lastUpdated: new Date().toISOString(),
        isOpen: isMarketOpen(config.timezone),
        marketHours: {
          open: config.marketHours.open,
          close: config.marketHours.close,
          timezone: config.timezone,
        },
      };
    });

    return NextResponse.json(indices, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Indices API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch indices' },
      { status: 500 }
    );
  }
}

function isMarketOpen(timezone: string): boolean {
  try {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const hours = localTime.getHours();
    const day = localTime.getDay();
    return day >= 1 && day <= 5 && hours >= 9 && hours < 17;
  } catch {
    return false;
  }
}
