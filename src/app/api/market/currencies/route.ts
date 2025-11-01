// Market Data API - Currencies Endpoint
// GET /api/market/currencies

import { NextRequest, NextResponse } from 'next/server';
import { CURRENCY_PAIRS } from '@/config/market-indices';
import { fetchExchangeRates } from '@/lib/real-market-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pairsParam = searchParams.get('pairs');
    const pairs = pairsParam ? pairsParam.split(',') : null;
    const baseCurrency = searchParams.get('base') || 'USD';

    // Try to fetch real exchange rates
    const realRates = await fetchExchangeRates(baseCurrency);
    
    if (realRates && realRates.length > 0) {
      // Filter by requested pairs if provided
      const currencies = pairs
        ? realRates.filter(r => pairs.includes(r.pair))
        : realRates;
        
      return NextResponse.json(currencies, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    // Fallback to mock data
    const filtered = pairs
      ? CURRENCY_PAIRS.filter(c => pairs.includes(c.pair))
      : CURRENCY_PAIRS;

    const currencies = filtered.map((config, index) => {
      const rate = 1 + Math.random() * 0.5;
      const previousRate = rate * (1 + (Math.random() - 0.5) * 0.01);
      const change = rate - previousRate;
      const changePercent = (change / previousRate) * 100;

      return {
        id: `${config.pair}_${Date.now()}_${index}`,
        pair: config.pair,
        baseCurrency: config.base,
        quoteCurrency: config.quote,
        rate,
        change,
        changePercent,
        lastUpdated: new Date().toISOString(),
      };
    });

    return NextResponse.json(currencies, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Currencies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}
