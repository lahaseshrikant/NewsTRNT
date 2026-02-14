// Market Data API - Currencies Endpoint
// GET /api/market/currencies
// Returns data from database cache

import { NextRequest, NextResponse } from 'next/server';
import { getCachedCurrencyRates } from '@/lib/market-cache';

type CurrencyRateRecord = {
  id: string;
  currency: string;
  currencyName: string | null;
  rateToUSD: number;
  symbol: string | null;
  lastUpdated: Date | string;
};

function sanitizeCurrencyCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const trimmed = code.trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const baseParam = sanitizeCurrencyCode(searchParams.get('base')) ?? 'USD';
    const quotesParam = searchParams.get('quotes');
    const requestedQuotes = quotesParam
      ? Array.from(
          new Set(
            quotesParam
              .split(',')
              .map((code) => sanitizeCurrencyCode(code))
              .filter((code): code is string => Boolean(code)),
          ),
        )
      : null;

    const rawRates = (await getCachedCurrencyRates()) as CurrencyRateRecord[];

    const validRates = rawRates
      .map((rate) => {
        const currency = sanitizeCurrencyCode(rate.currency);
        if (!currency || !Number.isFinite(rate.rateToUSD) || rate.rateToUSD === 0) {
          return null;
        }
        return {
          ...rate,
          currency,
        };
      })
      .filter((rate): rate is CurrencyRateRecord => rate !== null);

  const rateMap = new Map<string, CurrencyRateRecord>();
    for (const record of validRates) {
      rateMap.set(record.currency, record);
    }

    const baseRecord = rateMap.get(baseParam);
    if (!baseRecord) {
      return NextResponse.json(
        {
          error: `Base currency ${baseParam} is not available. Ensure it exists in the currency cache.`,
        },
        { status: 404 },
      );
    }

  const targetCurrencies = requestedQuotes ?? Array.from(rateMap.keys()).sort();
    const responsePayload = targetCurrencies
      .map((quote) => {
        const quoteRecord = rateMap.get(quote);
        if (!quoteRecord) return null;

        const rate = quote === baseRecord.currency ? 1 : baseRecord.rateToUSD / quoteRecord.rateToUSD;
        if (!Number.isFinite(rate) || rate <= 0) {
          return null;
        }

        return {
          id: `${baseRecord.currency}-${quoteRecord.currency}`,
          pair: `${baseRecord.currency}/${quoteRecord.currency}`,
          baseCurrency: baseRecord.currency,
          quoteCurrency: quoteRecord.currency,
          rate,
          inverseRate: rate !== 0 ? 1 / rate : null,
          change: 0,
          changePercent: 0,
          lastUpdated: quoteRecord.lastUpdated instanceof Date
            ? quoteRecord.lastUpdated.toISOString()
            : new Date(quoteRecord.lastUpdated).toISOString(),
          name: quoteRecord.currencyName,
          symbol: quoteRecord.symbol,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[Currencies API] Database cache error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies from cache' },
      { status: 500 },
    );
  }
}
