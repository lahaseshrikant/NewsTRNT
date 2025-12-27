import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProviderPreferences,
  getValidProviders,
  updateProviderPreference,
  ProviderCategory,
  getDefaultProviderOrder,
} from '@/lib/provider-preferences';

export const runtime = 'nodejs';

const PROVIDER_CATALOG: Record<ProviderCategory, Array<{ id: string; label: string; type: 'api' | 'scraper'; description: string }>> = {
  indices: [
    { id: 'marketstack', label: 'MarketStack', type: 'api', description: 'End-of-day equity and index data (API key required).' },
    { id: 'twelvedata', label: 'TwelveData', type: 'api', description: 'Intraday price series with generous free tier.' },
    { id: 'alphavantage', label: 'Alpha Vantage', type: 'api', description: 'Global quotes via free API (rate limited).' },
    { id: 'fmp', label: 'Financial Modeling Prep', type: 'api', description: 'Quote and fundamentals endpoint (API key required).' },
    { id: 'finnhub', label: 'Finnhub', type: 'api', description: 'Real-time quotes (works best for equities).' },
    { id: 'tradingview', label: 'TradingView Scraper', type: 'scraper', description: 'Fallback scraper saved to tradingview_indices.json.' },
  ],
  cryptocurrencies: [
    { id: 'coingecko', label: 'CoinGecko', type: 'api', description: 'Primary cryptocurrency source (no API key).' },
  ],
  currencies: [
    { id: 'exchange-rate', label: 'Exchange Rate API', type: 'api', description: 'Free FX rates API with USD base.' },
  ],
  commodities: [
    { id: 'alphavantage', label: 'Alpha Vantage', type: 'api', description: 'Commodity endpoints (WTI, metals, agriculture).' },
    { id: 'fmp', label: 'Financial Modeling Prep', type: 'api', description: 'Commodity quotes with API key.' },
    { id: 'twelvedata', label: 'TwelveData', type: 'api', description: 'Time series coverage for select commodities.' },
  ],
};

function isProviderCategory(value: string): value is ProviderCategory {
  return ['indices', 'cryptocurrencies', 'currencies', 'commodities'].includes(value);
}

export async function GET() {
  const preferences = await getAllProviderPreferences();
  const payload = {
    preferences,
    catalog: PROVIDER_CATALOG,
    defaults: {
      indices: getDefaultProviderOrder('indices'),
      cryptocurrencies: getDefaultProviderOrder('cryptocurrencies'),
      currencies: getDefaultProviderOrder('currencies'),
      commodities: getDefaultProviderOrder('commodities'),
    },
  };

  return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, providerOrder, fallbackStrategy, metadata } = body ?? {};

    if (!isProviderCategory(category)) {
      return NextResponse.json({ error: 'Invalid provider category.' }, { status: 400 });
    }

    if (!Array.isArray(providerOrder) || providerOrder.length === 0) {
      return NextResponse.json({ error: 'providerOrder must be a non-empty array.' }, { status: 400 });
    }

    const validProviders = getValidProviders(category);
    const invalid = providerOrder.filter((id: string) => !validProviders.includes(String(id).toLowerCase()));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid providers for ${category}: ${invalid.join(', ')}` },
        { status: 400 },
      );
    }

    const updated = await updateProviderPreference({
      category,
      providerOrder: providerOrder.map((id: string) => id.toLowerCase()),
      fallbackStrategy,
      metadata,
    });

    return NextResponse.json({
      success: true,
      preference: updated,
      catalog: PROVIDER_CATALOG,
    });
  } catch (error) {
    console.error('[Market Providers] Failed to update preferences:', error);
    return NextResponse.json({ error: 'Failed to update provider preferences.' }, { status: 500 });
  }
}
