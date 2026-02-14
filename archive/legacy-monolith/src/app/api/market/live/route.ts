import { NextRequest, NextResponse } from 'next/server';
// Database access moved to backend - use API calls instead
import {
  ProviderCategory,
  getProviderPreference,
  getValidProviders,
  getDefaultProviderOrder,
} from '@/lib/provider-preferences';
import { loadTradingViewSnapshot, fetchIndexFromTradingView } from '@/lib/tradingview-fallback';

export const runtime = 'nodejs';

const ENABLE_REAL_DATA = process.env.ENABLE_REAL_MARKET_DATA === 'true';
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';
const EXCHANGE_RATE_KEY = process.env.EXCHANGE_RATE_API_KEY || '';
const MARKETSTACK_KEY = process.env.MARKETSTACK_API_KEY || '';
const TWELVE_DATA_KEY =
  process.env.TWELVE_DATA_API_KEY || process.env.TWELVEDATA_API_KEY || '';
const FMP_API_KEY =
  process.env.FMP_API_KEY || process.env.FINANCIAL_MODELING_PREP_API_KEY || '';

const DEFAULT_SYMBOLS = {
  alphavantage: '^NSEI',
  finnhub: '^NSEI',
  marketstack: 'NIFTY50',
  twelvedata: 'NIFTY50',
  fmp: '^NSEI',
};

const PROVIDER_LABELS: Record<string, string> = {
  'exchange-rate': 'ExchangeRateAPI',
  coingecko: 'CoinGecko',
  alphavantage: 'AlphaVantage',
  finnhub: 'Finnhub',
  marketstack: 'MarketStack',
  twelvedata: 'TwelveData',
  'twelve-data': 'TwelveData',
  fmp: 'FinancialModelingPrep',
  financialmodelingprep: 'FinancialModelingPrep',
  tradingview: 'TradingViewFallback',
};

const PROVIDERS_ALLOWED_WHEN_DISABLED = new Set(['tradingview', 'auto', 'list']);

type ProviderResult = {
  ok: boolean;
  status: number;
  body: Record<string, unknown>;
};

function normalizeCategory(value: string | null): ProviderCategory | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return ['indices', 'cryptocurrencies', 'currencies', 'commodities'].includes(normalized)
    ? (normalized as ProviderCategory)
    : null;
}

function sanitizeProviderList(category: ProviderCategory, commaSeparated: string | null) {
  if (!commaSeparated) return null;
  const valid = new Set(getValidProviders(category));
  const order = commaSeparated
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => valid.has(value));
  return order.length > 0 ? order : null;
}

async function processProvider(providerId: string, params: URLSearchParams): Promise<ProviderResult> {
  const provider = providerId.toLowerCase();

  switch (provider) {
    case 'exchange-rate': {
      const base = (params.get('base') || 'USD').toUpperCase();
      const url = EXCHANGE_RATE_KEY
        ? `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_KEY}/latest/${base}`
        : `https://api.exchangerate-api.com/v4/latest/${base}`;

      if (!ENABLE_REAL_DATA) {
        return {
          ok: false,
          status: 409,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Real market data is disabled. Enable ENABLE_REAL_MARKET_DATA and restart the server.',
          },
        };
      }

      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: `Exchange Rate API responded with status ${response.status}`,
            endpoint: url,
          },
        };
      }

      const payload = await response.json();
      return {
        ok: true,
        status: 200,
        body: {
          provider: PROVIDER_LABELS[provider],
          baseCurrency: base,
          endpoint: url,
          source: 'external',
          success: true,
          data: payload,
        },
      };
    }

    case 'coingecko': {
      if (!ENABLE_REAL_DATA) {
        return {
          ok: false,
          status: 409,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Real market data is disabled. Enable ENABLE_REAL_MARKET_DATA and restart the server.',
          },
        };
      }

      const idsParam = params.get('ids');
      const ids = idsParam
        ? idsParam
            .split(',')
            .map((id) => id.trim().toLowerCase())
            .filter(Boolean)
        : ['bitcoin', 'ethereum'];

      if (ids.length === 0) {
        return {
          ok: false,
          status: 400,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Provide at least one CoinGecko id via ?ids=bitcoin,ethereum',
          },
        };
      }

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(
        ',',
      )}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: `CoinGecko responded with status ${response.status}`,
            endpoint: url,
          },
        };
      }

      const payload = await response.json();
      return {
        ok: true,
        status: 200,
        body: {
          provider: PROVIDER_LABELS[provider],
          ids,
          endpoint: url,
          source: 'external',
          success: true,
          data: payload,
        },
      };
    }

    case 'alphavantage': {
      if (!ENABLE_REAL_DATA) {
        return {
          ok: false,
          status: 409,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Real market data is disabled. Enable ENABLE_REAL_MARKET_DATA and restart the server.',
          },
        };
      }

      if (!ALPHA_VANTAGE_KEY) {
        return {
          ok: false,
          status: 400,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Set ALPHA_VANTAGE_API_KEY in your environment to call Alpha Vantage.',
          },
        };
      }

      const providerParams = new URLSearchParams(params);
      if (!providerParams.get('symbol')) {
        providerParams.set('symbol', DEFAULT_SYMBOLS.alphavantage);
      }

      const symbol = providerParams.get('symbol')!;
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
        symbol,
      )}&apikey=${ALPHA_VANTAGE_KEY}`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: `Alpha Vantage responded with status ${response.status}`,
            endpoint: url,
            symbol,
          },
        };
      }

      const payload = await response.json();
      return {
        ok: true,
        status: 200,
        body: {
          provider: PROVIDER_LABELS[provider],
          symbol,
          endpoint: url,
          source: 'external',
          success: true,
          data: payload,
        },
      };
    }

    case 'finnhub': {
      if (!ENABLE_REAL_DATA) {
        return {
          ok: false,
          status: 409,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Real market data is disabled. Enable ENABLE_REAL_MARKET_DATA and restart the server.',
          },
        };
      }

      if (!FINNHUB_KEY) {
        return {
          ok: false,
          status: 400,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Set FINNHUB_API_KEY in your environment to call Finnhub.',
          },
        };
      }

      const providerParams = new URLSearchParams(params);
      if (!providerParams.get('symbol')) {
        providerParams.set('symbol', DEFAULT_SYMBOLS.finnhub);
      }
      const symbol = providerParams.get('symbol')!;

      const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`;
      const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`;

      const [quoteRes, profileRes] = await Promise.all([
        fetch(quoteUrl, { cache: 'no-store' }),
        fetch(profileUrl, { cache: 'no-store' }),
      ]);

      if (!quoteRes.ok || !profileRes.ok) {
        return {
          ok: false,
          status: Math.max(quoteRes.status, profileRes.status),
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: `Finnhub responded with status ${quoteRes.status}/${profileRes.status}`,
            symbol,
            endpoints: { quote: quoteUrl, profile: profileUrl },
          },
        };
      }

      const [quote, profile] = await Promise.all([quoteRes.json(), profileRes.json()]);
      return {
        ok: true,
        status: 200,
        body: {
          provider: PROVIDER_LABELS[provider],
          symbol,
          endpoints: { quote: quoteUrl, profile: profileUrl },
          source: 'external',
          success: true,
          data: { quote, profile },
        },
      };
    }

    case 'marketstack': {
      if (!ENABLE_REAL_DATA) {
        return {
          ok: false,
          status: 409,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Real market data is disabled. Enable ENABLE_REAL_MARKET_DATA and restart the server.',
          },
        };
      }

      if (!MARKETSTACK_KEY) {
        return {
          ok: false,
          status: 400,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: 'Set MARKETSTACK_API_KEY in your environment to call MarketStack.',
          },
        };
      }

      const providerParams = new URLSearchParams(params);
      if (!providerParams.get('symbol')) {
        providerParams.set('symbol', DEFAULT_SYMBOLS.marketstack);
      }
      const symbol = providerParams.get('symbol')!;
      const url = `https://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_KEY}&symbols=${encodeURIComponent(
        symbol,
      )}&limit=1`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          body: {
            success: false,
            provider: PROVIDER_LABELS[provider],
            error: `MarketStack responded with status ${response.status}`,
            endpoint: url,
            symbol,
          },
        };
      }

      const payload = await response.json();
      return {
        ok: true,
        status: 200,
        body: {
          provider: PROVIDER_LABELS[provider],
          symbol,
          endpoint: url,
          source: 'external',
          success: true,
          data: payload,
        },
      };
    }

    case 'twelvedata':
    case 'twelve-data': {
      if (!ENABLE_REAL_DATA) {
        return {
          ok: false,
          status: 409,
          body: {
            success: false,
            provider: PROVIDER_LABELS['twelvedata'],
            error: 'Real market data is disabled. Enable ENABLE_REAL_MARKET_DATA and restart the server.',
          },
        };
      }

      if (!TWELVE_DATA_KEY) {
        return {
          ok: false,
          status: 400,
          body: {
            success: false,
            provider: PROVIDER_LABELS['twelvedata'],
            error: 'Set TWELVE_DATA_API_KEY in your environment to call TwelveData.',
          },
        };
      }

      const providerParams = new URLSearchParams(params);
      if (!providerParams.get('symbol')) {
        providerParams.set('symbol', DEFAULT_SYMBOLS.twelvedata);
      }
      const symbol = providerParams.get('symbol')!;
      const interval = providerParams.get('interval') || '1min';
      const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
        symbol,
      )}&interval=${encodeURIComponent(interval)}&outputsize=30&apikey=${TWELVE_DATA_KEY}`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          body: {
            success: false,
            provider: PROVIDER_LABELS['twelvedata'],
            error: `TwelveData responded with status ${response.status}`,
            endpoint: url,
            symbol,
          },
        };
      }

      const payload = await response.json();
      return {
        ok: true,
        status: 200,
        body: {
          provider: PROVIDER_LABELS['twelvedata'],
          symbol,
          interval,
          endpoint: url,
          source: 'external',
          success: true,
          data: payload,
        },
      };
    }

    case 'fmp':
    case 'financialmodelingprep': {
      if (!ENABLE_REAL_DATA) {
        return {
          ok: false,
          status: 409,
          body: {
            success: false,
            provider: PROVIDER_LABELS.fmp,
            error: 'Real market data is disabled. Enable ENABLE_REAL_MARKET_DATA and restart the server.',
          },
        };
      }

      if (!FMP_API_KEY) {
        return {
          ok: false,
          status: 400,
          body: {
            success: false,
            provider: PROVIDER_LABELS.fmp,
            error: 'Set FMP_API_KEY in your environment to call Financial Modeling Prep.',
          },
        };
      }

      const providerParams = new URLSearchParams(params);
      if (!providerParams.get('symbol')) {
        providerParams.set('symbol', DEFAULT_SYMBOLS.fmp);
      }
      const symbol = providerParams.get('symbol')!;
      const url = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${FMP_API_KEY}`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          body: {
            success: false,
            provider: PROVIDER_LABELS.fmp,
            error: `Financial Modeling Prep responded with status ${response.status}`,
            endpoint: url,
            symbol,
          },
        };
      }

      const payload = await response.json();
      return {
        ok: true,
        status: 200,
        body: {
          provider: PROVIDER_LABELS.fmp,
          symbol,
          endpoint: url,
          source: 'external',
          success: true,
          data: payload,
        },
      };
    }

    case 'tradingview': {
      const category = normalizeCategory(params.get('category')) ?? 'indices';
      if (category !== 'indices') {
        return {
          ok: false,
          status: 400,
          body: {
            success: false,
            provider: PROVIDER_LABELS.tradingview,
            error: 'TradingView fallback is currently available for stock indices only.',
          },
        };
      }

      const symbol = params.get('symbol');
      if (symbol) {
        const quote = await fetchIndexFromTradingView(symbol);
        if (!quote) {
          return {
            ok: false,
            status: 404,
            body: {
              success: false,
              provider: PROVIDER_LABELS.tradingview,
              error: `No TradingView quote found for ${symbol}. Run the scraper to refresh data.`,
            },
          };
        }

        return {
          ok: true,
          status: 200,
          body: {
            provider: PROVIDER_LABELS.tradingview,
            symbol,
            source: 'scraper',
            success: true,
            data: quote,
          },
        };
      }

      const snapshot = await loadTradingViewSnapshot();
      if (!snapshot) {
        return {
          ok: false,
          status: 404,
          body: {
            success: false,
            provider: PROVIDER_LABELS.tradingview,
            error: 'TradingView snapshot not found. Run the scraper to generate tradingview_indices.json.',
          },
        };
      }

      // Database cache access moved to backend
      const cachedRows: unknown[] = [];

      return {
        ok: true,
        status: 200,
        body: {
          provider: PROVIDER_LABELS.tradingview,
          source: 'scraper',
          success: true,
          snapshot,
          cached: cachedRows,
        },
      };
    }

    default:
      return {
        ok: false,
        status: 400,
        body: {
          success: false,
          error: `Unknown provider "${providerId}".`,
        },
      };
  }
}

function buildError(message: string, status = 400) {
  return NextResponse.json(
    {
      error: message,
      source: 'external',
      success: false,
    },
    { status },
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const providerParam = (searchParams.get('provider') || 'exchange-rate').toLowerCase();

  if (providerParam === 'list') {
    const category = normalizeCategory(searchParams.get('category')) ?? 'indices';
    const preference = await getProviderPreference(category);
    return NextResponse.json({
      category,
      configuredOrder: preference.providerOrder,
      defaultOrder: getDefaultProviderOrder(category),
      availableProviders: getValidProviders(category),
    });
  }

  if (providerParam === 'auto') {
    const category = normalizeCategory(searchParams.get('category')) ?? 'indices';
    const preference = await getProviderPreference(category);
    const overrideOrder = sanitizeProviderList(category, searchParams.get('providers'));
    const order = overrideOrder ?? preference.providerOrder;

    const failures: Array<{ provider: string; status: number; error: string }> = [];

    for (const providerId of order) {
      if (!ENABLE_REAL_DATA && !PROVIDERS_ALLOWED_WHEN_DISABLED.has(providerId)) {
        failures.push({
          provider: providerId,
          status: 409,
          error: 'Skipped because real data is disabled.',
        });
        continue;
      }

      const result = await processProvider(providerId, new URLSearchParams(searchParams));
      if (result.ok) {
        return NextResponse.json(
          {
            ...result.body,
            fallback: {
              category,
              attempts: order,
              selected: providerId,
              failures,
            },
          },
          { status: 200 },
        );
      }

      failures.push({
        provider: providerId,
        status: result.status,
        error: String(result.body?.error ?? 'Unknown error'),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'No providers returned data successfully.',
        category,
        attempts: order,
        failures,
      },
      { status: 502 },
    );
  }

  if (!ENABLE_REAL_DATA && !PROVIDERS_ALLOWED_WHEN_DISABLED.has(providerParam)) {
    return buildError(
      'Real market data is disabled. Set ENABLE_REAL_MARKET_DATA="true" and restart the server.',
      409,
    );
  }

  try {
    const result = await processProvider(providerParam, searchParams);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('[Market Live API] External provider error:', error);
    return buildError('Failed to reach the external provider. Check logs for details.', 502);
  }
}
