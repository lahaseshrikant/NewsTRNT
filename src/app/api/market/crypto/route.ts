// Market Data API - Cryptocurrencies Endpoint
// GET /api/market/crypto

import { NextRequest, NextResponse } from 'next/server';
import { CRYPTOCURRENCIES } from '@/config/market-indices';
import { fetchCryptoFromCoinGecko } from '@/lib/real-market-data';

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
    const symbolsParam = searchParams.get('symbols');
    const symbols = symbolsParam ? symbolsParam.split(',') : null;
    const targetCurrency = searchParams.get('currency') || 'USD';

    // Filter by symbols if provided
    const filtered = symbols
      ? CRYPTOCURRENCIES.filter(c => symbols.includes(c.symbol))
      : CRYPTOCURRENCIES;

    const requestedSymbols = filtered.map(c => c.symbol);

    // Try to fetch real data from CoinGecko
    let cryptocurrencies;
    const realData = await fetchCryptoFromCoinGecko(requestedSymbols);
    
    if (realData && realData.length > 0) {
      // Use real data and convert to target currency if needed
      const conversionRate = CURRENCY_RATES[targetCurrency] || 1;
      
      cryptocurrencies = realData.map((crypto, index) => ({
        ...crypto,
        value: crypto.value * conversionRate,
        previousClose: (crypto.previousClose || crypto.value) * conversionRate,
        change: (crypto.change || 0) * conversionRate,
        currency: targetCurrency,
        lastUpdated: crypto.lastUpdated.toISOString(),
      }));
    } else {
      // Fallback to mock data
      cryptocurrencies = filtered.map((config, index) => {
        const valueUSD = 1000 + Math.random() * 50000;
        
        // Convert to target currency
        const conversionRate = CURRENCY_RATES[targetCurrency] || 1;
        const value = valueUSD * conversionRate;
        const previousClose = value * (1 + (Math.random() - 0.5) * 0.05);
        const change = value - previousClose;
        const changePercent = (change / previousClose) * 100;

        return {
          id: `${config.symbol}_${Date.now()}_${index}`,
          symbol: config.symbol,
          name: config.name,
          type: 'crypto' as const,
          region: ['GLOBAL'],
          country: 'US',
          value,
          previousClose,
          change,
          changePercent,
          high: value * 1.08,
          low: value * 0.92,
          volume: Math.floor(Math.random() * 1000000000),
          currency: targetCurrency,
          lastUpdated: new Date().toISOString(),
          isOpen: true, // Crypto markets are always open
          circulatingSupply: Math.random() * 1000000000,
          totalSupply: Math.random() * 1500000000,
          maxSupply: Math.random() * 2000000000,
          rank: index + 1,
        };
      });
    }

    return NextResponse.json(cryptocurrencies, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Cryptocurrencies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrencies' },
      { status: 500 }
    );
  }
}
