// Market Data API - Commodities Endpoint
// GET /api/market/commodities

import { NextRequest, NextResponse } from 'next/server';
import { COMMODITIES } from '@/config/market-indices';

// Currency conversion rates (mock - in production, use a real API)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.12,
  GBP: 0.79,
  EUR: 0.92,
  JPY: 149.50,
  CNY: 7.24,
  AUD: 1.53,
  CAD: 1.36,
  BRL: 4.98,
  MXN: 17.15,
  RUB: 92.50,
  KRW: 1310.50,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34,
  SAR: 3.75,
  AED: 3.67,
  ZAR: 18.20,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const targetCurrency = searchParams.get('currency') || 'USD';

    // Filter by category if provided
    const filtered = category
      ? COMMODITIES.filter(c => c.category === category)
      : COMMODITIES;

    // Generate mock data
    const commodities = filtered.map((config, index) => {
      const valueUSD = 50 + Math.random() * 100;
      
      // Convert to target currency
      const conversionRate = CURRENCY_RATES[targetCurrency] || 1;
      const value = valueUSD * conversionRate;
      const previousClose = value * (1 + (Math.random() - 0.5) * 0.03);
      const change = value - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        id: `${config.symbol}_${Date.now()}_${index}`,
        symbol: config.symbol,
        name: config.name,
        type: 'commodity' as const,
        region: ['GLOBAL'],
        country: 'US',
        value,
        previousClose,
        change,
        changePercent,
        high: value * 1.03,
        low: value * 0.97,
        currency: targetCurrency,
        lastUpdated: new Date().toISOString(),
        isOpen: true,
        unit: config.unit,
      };
    });

    return NextResponse.json(commodities, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Commodities API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commodities' },
      { status: 500 }
    );
  }
}
