// Market Data API - Country Endpoint
// GET /api/market/country/[country]

import { NextRequest, NextResponse } from 'next/server';
import { getIndicesByCountry, COMMODITIES, CURRENCY_PAIRS, CRYPTOCURRENCIES } from '@/config/market-indices';

// Currency conversion rates (mock - in production, use a real API)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1, INR: 83.12, GBP: 0.79, EUR: 0.92, JPY: 149.50, CNY: 7.24,
  AUD: 1.53, CAD: 1.36, BRL: 4.98, MXN: 17.15, RUB: 92.50, KRW: 1310.50,
  CHF: 0.88, HKD: 7.82, SGD: 1.34, SAR: 3.75, AED: 3.67, ZAR: 18.20,
};

// Map country to currency
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: 'USD', CA: 'CAD', GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
  JP: 'JPY', CN: 'CNY', IN: 'INR', AU: 'AUD', BR: 'BRL', MX: 'MXN',
  RU: 'RUB', KR: 'KRW', CH: 'CHF', HK: 'HKD', SG: 'SGD', SA: 'SAR', AE: 'AED', ZA: 'ZAR',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  try {
    const countryCode = params.country.toUpperCase();
    const targetCurrency = COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
    const conversionRate = CURRENCY_RATES[targetCurrency] || 1;

    // Get indices for the country
    const indicesConfig = getIndicesByCountry(countryCode);

    // Generate mock data (in production, this would call real market data APIs)
    const indices = indicesConfig.map((config, index) => {
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

    // Add some commodities (always global, converted to local currency)
    const commodities = COMMODITIES.slice(0, 5).map((config, index) => {
      const valueUSD = 50 + Math.random() * 100;
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
        currency: targetCurrency,
        lastUpdated: new Date().toISOString(),
        isOpen: true,
        unit: config.unit,
      };
    });

    // Add some currencies (relevant to country)
    const currencies = CURRENCY_PAIRS.slice(0, 5).map((config, index) => {
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

    // Add some cryptocurrencies (converted to local currency)
    const cryptocurrencies = CRYPTOCURRENCIES.slice(0, 5).map((config, index) => {
      const valueUSD = 1000 + Math.random() * 50000;
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
        currency: targetCurrency,
        lastUpdated: new Date().toISOString(),
        isOpen: true,
        circulatingSupply: Math.random() * 1000000000,
        totalSupply: Math.random() * 1500000000,
        maxSupply: Math.random() * 2000000000,
        rank: index + 1,
      };
    });

    const response = {
      indices,
      commodities,
      currencies,
      cryptocurrencies,
      lastUpdated: new Date().toISOString(),
      region: countryCode,
      cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

// Helper function to check if market is open
function isMarketOpen(timezone: string): boolean {
  try {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const hours = localTime.getHours();
    const day = localTime.getDay();

    // Simplified: markets are open Mon-Fri between 9 AM and 5 PM local time
    return day >= 1 && day <= 5 && hours >= 9 && hours < 17;
  } catch (error) {
    console.error('Error checking market hours:', error);
    return false;
  }
}
