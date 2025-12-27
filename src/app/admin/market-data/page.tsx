'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface APITestResult {
  status: string;
  timestamp: string;
  apis: {
    alphaVantage: boolean;
    finnhub: boolean;
    coingecko: boolean;
    exchangeRate: boolean;
    marketstack: boolean;
    twelveData: boolean;
    fmp: boolean;
    tradingview: boolean;
  };
  recommendations: {
    alphaVantage: string;
    finnhub: string;
    coingecko: string;
    exchangeRate: string;
    marketstack: string;
    twelveData: string;
    fmp: string;
    tradingview: string;
  };
  errors?: Record<string, string>;
}

interface MarketDataSample {
  indices?: any[];
  cryptocurrencies?: any[];
  currencies?: any[];
  commodities?: any[];
}

type CountryPayload = {
  indices?: any[];
  commodities?: any[];
  [key: string]: unknown;
};

interface MarketIndexConfigOverview {
  id: string;
  symbol: string;
  name: string;
  country: string;
  exchange: string;
  currency: string;
  region: string[];
  isActive: boolean;
  isGlobal: boolean;
  sortOrder: number;
}

interface CryptoConfigOverview {
  id: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  isActive: boolean;
  sortOrder: number;
}

interface CommodityConfigOverview {
  id: string;
  symbol: string;
  name: string;
  category: string;
  unit: string;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

interface CurrencyPairConfigOverview {
  id: string;
  pair: string;
  name: string | null;
  base: string;
  quote: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
}

interface MarketConfigSnapshot {
  indices: MarketIndexConfigOverview[];
  cryptocurrencies: CryptoConfigOverview[];
  commodities: CommodityConfigOverview[];
  currencies: CurrencyPairConfigOverview[];
}

interface MarketConfigCounts {
  indices: number;
  cryptocurrencies: number;
  commodities: number;
  currencies: number;
  total: number;
}

interface AutoUpdateStatus {
  isRunning: boolean;
  intervals: {
    crypto: string;
    indices: string;
    currencies: string;
    commodities: string;
    scraper: string;
  };
  intervalsMinutes?: {
    crypto: number;
    indices: number;
    currencies: number;
    commodities: number;
    scraper: number;
  };
}

interface ProviderCatalogEntry {
  id: string;
  label: string;
  type: 'api' | 'scraper';
  description: string;
}

interface ApiResponseState {
  label: string;
  endpoint: string;
  ok: boolean;
  status?: number;
  timestamp: string;
  payload: unknown;
  error?: string;
}

const MARKET_API_ENDPOINTS: Array<{
  label: string;
  endpoint: string;
  description: string;
}> = [
  {
    label: 'Provider Preferences',
    endpoint: '/api/market/providers',
    description: 'Lists configured provider fallback order for indices, crypto, currencies, and commodities.',
  },
  {
    label: 'All Market Configurations',
    endpoint: '/api/admin/market-config?includeInactive=true',
    description: 'Aggregated admin snapshot of indices, currencies, commodities, and cryptocurrencies.',
  },
  {
    label: 'Cryptocurrencies',
    endpoint: '/api/market/crypto',
    description: 'Reads the cached crypto snapshot updated by CoinGecko when real data is enabled.',
  },
  {
    label: 'Currency Rates',
    endpoint: '/api/market/currencies?base=USD',
    description: 'USD based FX rates refreshed through Exchange Rate API when allowed.',
  },
  {
    label: 'US Market Overview',
    endpoint: '/api/market/country/US',
    description: 'Combined indices, commodities, and crypto data for the US dashboard view.',
  },
];

const NIFTY_LABEL = 'NIFTY 50';
const NIFTY_SYMBOL = '^NSEI';
const NIFTY_MARKETSTACK_SYMBOL = 'NIFTY50';

const LIVE_PROVIDER_ENDPOINTS: Array<{
  label: string;
  endpoint: string;
  description: string;
  provider: string;
}> = [
  {
    label: 'Auto Fallback (Indices)',
    endpoint: '/api/market/live?provider=auto&category=indices',
    description: 'Tries providers in configured order for stock indices until data is returned.',
    provider: 'AutoFallback',
  },
  {
    label: 'TradingView Snapshot (Indices)',
    endpoint: '/api/market/live?provider=tradingview&category=indices',
    description: 'Serves the latest TradingView scraped data stored in the database.',
    provider: 'TradingView Fallback',
  },
  {
    label: 'Exchange Rate API (USD base)',
    endpoint: '/api/market/live?provider=exchange-rate&base=USD',
    description: 'Direct call to the configured Exchange Rate service without touching the cache.',
    provider: 'ExchangeRateAPI',
  },
  {
    label: 'CoinGecko Spot Prices',
    endpoint: '/api/market/live?provider=coingecko&ids=bitcoin,ethereum',
    description: 'Fetches live BTC and ETH prices straight from CoinGecko.',
    provider: 'CoinGecko',
  },
  {
    label: 'Alpha Vantage Global Quote (^GSPC)',
    endpoint: '/api/market/live?provider=alphavantage&symbol=%5EGSPC',
    description: 'Retrieves the latest S&P 500 quote from Alpha Vantage.',
    provider: 'AlphaVantage',
  },
  {
    label: `Finnhub Snapshot (${NIFTY_LABEL})`,
    endpoint: `/api/market/live?provider=finnhub&symbol=${encodeURIComponent(NIFTY_SYMBOL)}`,
    description: `Queries Finnhub for ${NIFTY_LABEL} real-time levels.`,
    provider: 'Finnhub',
  },
  {
    label: `MarketStack EOD (${NIFTY_LABEL})`,
    endpoint: `/api/market/live?provider=marketstack&symbol=${encodeURIComponent(NIFTY_MARKETSTACK_SYMBOL)}`,
    description: `Fetches end-of-day index data for ${NIFTY_LABEL} directly from MarketStack.`,
    provider: 'MarketStack',
  },
  {
    label: `TwelveData Intraday (${NIFTY_LABEL}, 1min)`,
    endpoint: `/api/market/live?provider=twelvedata&symbol=${encodeURIComponent(NIFTY_MARKETSTACK_SYMBOL)}&interval=1min`,
    description: `Queries TwelveData for intraday ${NIFTY_LABEL} time series data.`,
    provider: 'TwelveData',
  },
  {
    label: `Financial Modeling Prep Quote (${NIFTY_LABEL})`,
    endpoint: `/api/market/live?provider=fmp&symbol=${encodeURIComponent(NIFTY_SYMBOL)}`,
    description: `Retrieves the latest Financial Modeling Prep ${NIFTY_LABEL} snapshot.`,
    provider: 'FinancialModelingPrep',
  },
];

export default function AdminMarketData() {
  const router = useRouter();
  const [sampleData, setSampleData] = useState<MarketDataSample | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [results, setResults] = useState<APITestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoUpdateStatus, setAutoUpdateStatus] = useState<AutoUpdateStatus | null>(null);
  const [loadingAutoUpdate, setLoadingAutoUpdate] = useState(false);
  const [runningScraper, setRunningScraper] = useState(false);
  const [showIntervalEditor, setShowIntervalEditor] = useState(false);
  const [intervalInputs, setIntervalInputs] = useState({
    crypto: 2,
    indices: 5,
    currencies: 15,
    commodities: 30,
    scraper: 60,
  });
  const [lastResponses, setLastResponses] = useState<Record<string, ApiResponseState>>({});
  const [endpointLoading, setEndpointLoading] = useState<Record<string, boolean>>({});
  const [configSnapshot, setConfigSnapshot] = useState<MarketConfigSnapshot | null>(null);
  const [configCounts, setConfigCounts] = useState<MarketConfigCounts | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [providerPreferences, setProviderPreferences] = useState<Record<string, string[]>>({});
  const [providerCatalog, setProviderCatalog] = useState<Record<string, ProviderCatalogEntry[]>>({});
  const [providerDefaults, setProviderDefaults] = useState<Record<string, string[]>>({});
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerSaving, setProviderSaving] = useState<Record<string, boolean>>({});

  const CONFIG_PREVIEW_LIMIT = 12;
  const formatNumber = (value: unknown, fractionDigits = 2, fallback = '—'): string => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toFixed(fractionDigits);
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed.toFixed(fractionDigits);
      }
    }

    return fallback;
  };

  const formatSignedPercent = (value: unknown, fractionDigits = 2): string => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      const sign = value >= 0 ? '↗' : '↘';
      return `${sign} ${Math.abs(value).toFixed(fractionDigits)}%`;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        const sign = parsed >= 0 ? '↗' : '↘';
        return `${sign} ${Math.abs(parsed).toFixed(fractionDigits)}%`;
      }
    }

    return '—';
  };

  useEffect(() => {
    async function testAPIs() {
      try {
        const res = await fetch('/api/market/test-connectivity');
        if (!res.ok) throw new Error('API test failed');
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    async function checkAutoUpdateStatus() {
      try {
        const res = await fetch('/api/market/auto-update');
        if (res.ok) {
          const data = await res.json();
          setAutoUpdateStatus(data.status);
        } else {
          console.warn('Auto-update API returned non-OK status:', res.status);
          // Set default status if API fails
          setAutoUpdateStatus({
            isRunning: false,
            intervals: { crypto: '0s', indices: '0s', currencies: '0s', commodities: '0s', scraper: '0s' },
            intervalsMinutes: { crypto: 0, indices: 0, currencies: 0, commodities: 0, scraper: 0 }
          });
        }
      } catch (err) {
        console.error('Failed to check auto-update status:', err);
        // Set default status on error
        setAutoUpdateStatus({
          isRunning: false,
          intervals: { crypto: '0s', indices: '0s', currencies: '0s', commodities: '0s', scraper: '0s' },
          intervalsMinutes: { crypto: 0, indices: 0, currencies: 0, commodities: 0, scraper: 0 }
        });
      }
    }
    
    testAPIs();
    checkAutoUpdateStatus();
    loadConfigSnapshot();
  loadProviderPreferences();
    
    // Check auto-update status every 30 seconds
    const interval = setInterval(checkAutoUpdateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const invokeMarketEndpoint = async (endpoint: string, label: string): Promise<ApiResponseState> => {
    const timestamp = new Date().toISOString();
    try {
      const res = await fetch(endpoint);
      const text = await res.text();
      let payload: unknown = null;

      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = text;
        }
      }

      const response: ApiResponseState = {
        label,
        endpoint,
        ok: res.ok,
        status: res.status,
        payload,
        timestamp,
      };

      if (!res.ok) {
        const message = typeof payload === 'object' && payload !== null && 'error' in (payload as Record<string, unknown>)
          ? String((payload as Record<string, unknown>).error)
          : `Request failed with status ${res.status}`;
        response.error = message;
      }

      setLastResponses(prev => ({ ...prev, [endpoint]: response }));
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const failure: ApiResponseState = {
        label,
        endpoint,
        ok: false,
        payload: null,
        timestamp,
        error: message,
      };
      setLastResponses(prev => ({ ...prev, [endpoint]: failure }));
      return failure;
    }
  };

  const loadConfigSnapshot = async () => {
    setConfigLoading(true);
    try {
      const response = await fetch('/api/admin/market-config?includeInactive=true');

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || `Failed to load market configurations (${response.status})`);
      }

      const payload = await response.json();
      const snapshot = payload?.data as MarketConfigSnapshot | undefined;
      const counts = payload?.counts as MarketConfigCounts | undefined;

      if (!snapshot) {
        throw new Error('Invalid market configuration payload received');
      }

      setConfigSnapshot(snapshot);
      setConfigCounts(counts ?? null);
      setConfigError(null);
    } catch (err) {
      console.error('[Admin Market Data] Failed to fetch market configuration snapshot:', err);
      setConfigSnapshot(null);
      setConfigCounts(null);
      setConfigError(err instanceof Error ? err.message : 'Failed to fetch market configuration snapshot');
    } finally {
      setConfigLoading(false);
    }
  };

  const loadProviderPreferences = async () => {
    setProviderLoading(true);
    try {
      const response = await fetch('/api/market/providers');
      if (!response.ok) {
        throw new Error(`Failed to load provider preferences (${response.status})`);
      }

      const payload = await response.json();
      const preferences = payload?.preferences as Record<string, { providerOrder: string[] }> | undefined;
      const catalog = payload?.catalog as Record<string, ProviderCatalogEntry[]> | undefined;
      const defaults = payload?.defaults as Record<string, string[]> | undefined;

      if (preferences) {
        const mapped: Record<string, string[]> = {};
        Object.entries(preferences).forEach(([category, value]) => {
          mapped[category] = Array.isArray(value.providerOrder) ? value.providerOrder : [];
        });
        setProviderPreferences(mapped);
      }

      if (catalog) {
        setProviderCatalog(catalog);
      }

      if (defaults) {
        setProviderDefaults(defaults);
      }
    } catch (err) {
      console.error('[Admin Market Data] Failed to load provider preferences:', err);
    } finally {
      setProviderLoading(false);
    }
  };

  const fetchSampleData = async () => {
    setLoadingData(true);
    try {
      const crypto = await invokeMarketEndpoint('/api/market/crypto', 'Cryptocurrencies');
      const currency = await invokeMarketEndpoint('/api/market/currencies?base=USD', 'Currency Rates');
      const country = await invokeMarketEndpoint('/api/market/country/US', 'US Market Overview');

      const cryptoData = crypto.ok && Array.isArray(crypto.payload) ? crypto.payload : [];
      const currencyData = currency.ok && Array.isArray(currency.payload) ? currency.payload : [];
  const countryPayload = country.ok && country.payload && typeof country.payload === 'object' ? (country.payload as CountryPayload) : null;
  const indices = countryPayload?.indices ?? [];
  const commodities = countryPayload?.commodities ?? [];

      setSampleData({
        cryptocurrencies: cryptoData,
        currencies: currencyData,
        indices,
        commodities,
      });
    } catch (err) {
      console.error('Failed to fetch sample data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDirectCall = async (endpoint: string, label: string) => {
    setEndpointLoading(prev => ({ ...prev, [endpoint]: true }));
    await invokeMarketEndpoint(endpoint, label);
    setEndpointLoading(prev => ({ ...prev, [endpoint]: false }));
  };

  const toggleAutoUpdate = async (action: 'start' | 'stop') => {
    setLoadingAutoUpdate(true);
    try {
      const res = await fetch('/api/market/auto-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        setAutoUpdateStatus(data.status);
      }
    } catch (err) {
      console.error(`Failed to ${action} auto-update:`, err);
    } finally {
      setLoadingAutoUpdate(false);
    }
  };

  const updateIntervals = async () => {
    setLoadingAutoUpdate(true);
    try {
      const res = await fetch('/api/market/auto-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update-intervals',
          intervals: intervalInputs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAutoUpdateStatus(data.status);
        setShowIntervalEditor(false);
        
        // Restart service to apply new intervals
        if (autoUpdateStatus?.isRunning) {
          await toggleAutoUpdate('stop');
          await new Promise(resolve => setTimeout(resolve, 1000));
          await toggleAutoUpdate('start');
        }
      }
    } catch (err) {
      console.error('Failed to update intervals:', err);
    } finally {
      setLoadingAutoUpdate(false);
    }
  };

  const runTradingViewScraper = async () => {
    setRunningScraper(true);
    try {
      const res = await fetch('/api/market/auto-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-tradingview-scraper' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setAutoUpdateStatus(data.status);
        }
        console.info('[Admin] TradingView fallback refreshed', data.result);
      } else {
        console.warn('[Admin] TradingView scrape failed with status', res.status);
      }
    } catch (error) {
      console.error('[Admin] TradingView scrape failed', error);
    } finally {
      setRunningScraper(false);
    }
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <span className="text-green-600 text-2xl">✅</span>
    ) : (
      <span className="text-red-600 text-2xl">❌</span>
    );
  };

  const moveProvider = (category: string, index: number, direction: number) => {
    setProviderPreferences((prev) => {
      const current = prev[category];
      if (!current) return prev;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return prev;
      }
      const next = [...current];
      const temp = next[targetIndex];
      next[targetIndex] = next[index];
      next[index] = temp;
      return { ...prev, [category]: next };
    });
  };

  const resetProviderOrder = (category: string) => {
    setProviderPreferences((prev) => {
      const defaults = providerDefaults[category];
      if (!defaults) return prev;
      return { ...prev, [category]: [...defaults] };
    });
  };

  const saveProviderOrder = async (category: string) => {
    const order = providerPreferences[category];
    if (!order) return;

    setProviderSaving((prev) => ({ ...prev, [category]: true }));
    try {
      const res = await fetch('/api/market/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, providerOrder: order }),
      });

      if (!res.ok) {
        console.error('[Admin] Failed to save provider order', res.status);
        return;
      }

      const payload = await res.json();
      const preference = payload?.preference as { providerOrder?: string[] } | undefined;
      if (preference?.providerOrder) {
        setProviderPreferences((prev) => ({ ...prev, [category]: preference.providerOrder! }));
      }
    } catch (error) {
      console.error('[Admin] Failed to save provider preference', error);
    } finally {
      setProviderSaving((prev) => ({ ...prev, [category]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-xl p-8 border border-border">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-center">Testing API Connections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-xl p-8 max-w-md border border-border">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const allConnected = Object.values(results.apis).every(v => v);
  const connectedCount = Object.values(results.apis).filter(v => v).length;
  const totalCount = Object.keys(results.apis).length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-xl p-8 mb-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Market Data API Monitor
              </h1>
              <p className="text-muted-foreground">
                Real-time monitoring and testing of market data providers
              </p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              Back to Admin
            </button>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full ${allConnected ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
              {connectedCount}/{totalCount} APIs Connected
            </div>
            <div className="text-sm text-muted-foreground">
              Tested at: {new Date(results.timestamp).toLocaleString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
            >
              🔄 Refresh Status
            </button>
          </div>
        </div>

        {/* Auto-Update Control Panel */}
        <div className="bg-card rounded-lg shadow-xl p-6 mb-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                🔄 Auto-Update Service
              </h2>
              <p className="text-muted-foreground mt-1">
                Automatically updates market data every few minutes in the background
              </p>
            </div>
            <div className="flex items-center gap-3">
              {autoUpdateStatus && (
                <div className={`px-4 py-2 rounded-full font-medium ${
                  autoUpdateStatus.isRunning 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {autoUpdateStatus.isRunning ? '✅ Running' : '⏸️ Stopped'}
                </div>
              )}
              <button
                onClick={() => toggleAutoUpdate(autoUpdateStatus?.isRunning ? 'stop' : 'start')}
                disabled={loadingAutoUpdate}
                className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  autoUpdateStatus?.isRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loadingAutoUpdate ? '⏳' : autoUpdateStatus?.isRunning ? 'Stop Service' : 'Start Service'}
              </button>
              <button
                onClick={runTradingViewScraper}
                disabled={runningScraper}
                className="px-6 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {runningScraper ? '⏳ Scraping…' : 'Run TradingView Scraper'}
              </button>
            </div>
          </div>

          {autoUpdateStatus && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Cryptocurrencies</div>
                  <div className="text-2xl font-bold text-foreground">Every {autoUpdateStatus.intervals.crypto}</div>
                  <div className="text-xs text-muted-foreground mt-1">🪙 Bitcoin, Ethereum, etc.</div>
                </div>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Stock Indices</div>
                  <div className="text-2xl font-bold text-foreground">Every {autoUpdateStatus.intervals.indices}</div>
                  <div className="text-xs text-muted-foreground mt-1">📈 S&P 500, NASDAQ, etc.</div>
                </div>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Currency Rates</div>
                  <div className="text-2xl font-bold text-foreground">Every {autoUpdateStatus.intervals.currencies}</div>
                  <div className="text-xs text-muted-foreground mt-1">💱 USD, EUR, GBP, etc.</div>
                </div>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Commodities</div>
                  <div className="text-2xl font-bold text-foreground">Every {autoUpdateStatus.intervals.commodities}</div>
                  <div className="text-xs text-muted-foreground mt-1">🛢️ Gold, Oil, Silver, etc.</div>
                </div>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">TradingView Fallback</div>
                  <div className="text-2xl font-bold text-foreground">Every {autoUpdateStatus.intervals.scraper}</div>
                  <div className="text-xs text-muted-foreground mt-1">🧹 Scrapes indices when APIs fail</div>
                </div>
              </div>

              {/* Interval Editor */}
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-300">⚙️ Customize Update Intervals</h3>
                  <button
                    onClick={() => {
                      if (autoUpdateStatus.intervalsMinutes) {
                        setIntervalInputs({
                          crypto: autoUpdateStatus.intervalsMinutes.crypto,
                          indices: autoUpdateStatus.intervalsMinutes.indices,
                          currencies: autoUpdateStatus.intervalsMinutes.currencies,
                          commodities: autoUpdateStatus.intervalsMinutes.commodities,
                          scraper: autoUpdateStatus.intervalsMinutes.scraper ?? intervalInputs.scraper,
                        });
                      }
                      setShowIntervalEditor(!showIntervalEditor);
                    }}
                    className="text-sm px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {showIntervalEditor ? 'Cancel' : '✏️ Edit Times'}
                  </button>
                </div>

                {showIntervalEditor ? (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-purple-900 dark:text-purple-300 mb-1 block">
                          Crypto (minutes)
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={intervalInputs.crypto}
                          onChange={(e) => setIntervalInputs(prev => ({ ...prev, crypto: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-purple-900 dark:text-purple-300 mb-1 block">
                          Indices (minutes)
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={intervalInputs.indices}
                          onChange={(e) => setIntervalInputs(prev => ({ ...prev, indices: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-purple-900 dark:text-purple-300 mb-1 block">
                          Currencies (minutes)
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={intervalInputs.currencies}
                          onChange={(e) => setIntervalInputs(prev => ({ ...prev, currencies: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-purple-900 dark:text-purple-300 mb-1 block">
                          Commodities (minutes)
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={intervalInputs.commodities}
                          onChange={(e) => setIntervalInputs(prev => ({ ...prev, commodities: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-purple-900 dark:text-purple-300 mb-1 block">
                          TradingView Fallback (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={intervalInputs.scraper}
                          onChange={(e) => setIntervalInputs(prev => ({ ...prev, scraper: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-foreground"
                        />
                      </div>
                    </div>
                    <button
                      onClick={updateIntervals}
                      disabled={loadingAutoUpdate}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
                    >
                      {loadingAutoUpdate ? '⏳ Updating...' : '💾 Save & Restart Service'}
                    </button>
                    <p className="text-xs text-purple-700 dark:text-purple-400">
                      ⚠️ The service will automatically restart to apply the new intervals. Minimum: 0.5 minutes (30 seconds)
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    Click "Edit Times" to customize how frequently each data type updates. Lower intervals = fresher data but more API calls.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>ℹ️ How it works:</strong> The service runs in the background and updates your database cache automatically.
              Users get instant responses from the cache instead of waiting for external APIs. This prevents rate limit issues!
            </p>
          </div>
        </div>

        {/* Provider Preferences */}
        <div className="bg-card rounded-lg shadow-xl p-6 mb-6 border border-border">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Provider Fallback Strategy</h2>
              <p className="text-sm text-muted-foreground">
                Reorder APIs and scrapers for each market segment. The system tries them from top to bottom until data is retrieved.
              </p>
            </div>
            <button
              onClick={loadProviderPreferences}
              disabled={providerLoading}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 disabled:opacity-60"
            >
              {providerLoading ? 'Loading…' : 'Refresh Preferences'}
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {['indices', 'cryptocurrencies', 'currencies', 'commodities'].map((category) => {
              const order = providerPreferences[category];
              const catalog = providerCatalog[category] || [];
              if (!order || order.length === 0) {
                return (
                  <div key={category} className="border border-border rounded-lg p-4 bg-card/60">
                    <h3 className="text-lg font-semibold text-foreground capitalize">{category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {providerLoading ? 'Loading preferred providers…' : 'No providers configured.'}
                    </p>
                  </div>
                );
              }

              return (
                <div key={category} className="border border-border rounded-lg p-4 bg-card/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground capitalize">{category}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => resetProviderOrder(category)}
                        className="px-3 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/70"
                      >
                        Reset to default
                      </button>
                      <button
                        onClick={() => saveProviderOrder(category)}
                        disabled={providerSaving[category]}
                        className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-60"
                      >
                        {providerSaving[category] ? 'Saving…' : 'Save order'}
                      </button>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {order.map((providerId, index) => {
                      const info = catalog.find((item) => item.id === providerId);
                      return (
                        <li key={providerId} className="border border-border rounded-md p-3 bg-muted/40">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">#{index + 1}</span>
                                {info?.label ?? providerId}
                                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  {info?.type === 'scraper' ? 'scraper' : 'api'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {info?.description ?? 'No description available.'}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveProvider(category, index, -1)}
                                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-40"
                                disabled={index === 0}
                              >
                                ↑ Up
                              </button>
                              <button
                                onClick={() => moveProvider(category, index, 1)}
                                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-40"
                                disabled={index === order.length - 1}
                              >
                                ↓ Down
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Configuration Snapshot */}
        <div className="bg-card rounded-lg shadow-xl p-6 border border-border mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Market Configuration Snapshot</h2>
              <p className="text-sm text-muted-foreground">
                Aggregated view of every configured index, currency pair, commodity, and cryptocurrency (includes inactive rows).
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadConfigSnapshot}
                disabled={configLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {configLoading ? 'Refreshing…' : 'Refresh Snapshot'}
              </button>
              <button
                onClick={() => handleDirectCall('/api/admin/market-config?includeInactive=true', 'All Market Configurations')}
                disabled={endpointLoading['/api/admin/market-config?includeInactive=true']}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 disabled:opacity-60"
              >
                {endpointLoading['/api/admin/market-config?includeInactive=true'] ? 'Calling…' : 'Call API'}
              </button>
            </div>
          </div>

          {configError && (
            <div className="mt-4 px-4 py-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-300">
              {configError}
            </div>
          )}

          {configCounts && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="text-xs text-green-700 dark:text-green-400 uppercase tracking-wide">Indices</div>
                <div className="text-2xl font-semibold text-green-900 dark:text-green-200">{configCounts.indices}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide">Currencies</div>
                <div className="text-2xl font-semibold text-blue-900 dark:text-blue-200">{configCounts.currencies}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                <div className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wide">Commodities</div>
                <div className="text-2xl font-semibold text-amber-900 dark:text-amber-200">{configCounts.commodities}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <div className="text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide">Cryptocurrencies</div>
                <div className="text-2xl font-semibold text-purple-900 dark:text-purple-200">{configCounts.cryptocurrencies}</div>
              </div>
            </div>
          )}

          {configLoading && !configSnapshot && (
            <div className="mt-6 text-sm text-muted-foreground">Loading configuration snapshot…</div>
          )}

          {configSnapshot && (
            <div className="mt-6 space-y-4">
              <details className="border border-border rounded-lg bg-muted/40">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-foreground">
                  Stock Indices ({configSnapshot.indices.length})
                </summary>
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-muted-foreground bg-muted/60">
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Country</th>
                        <th className="px-3 py-2">Exchange</th>
                        <th className="px-3 py-2">Currency</th>
                        <th className="px-3 py-2">Regions</th>
                        <th className="px-3 py-2">Global</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Sort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {configSnapshot.indices.slice(0, CONFIG_PREVIEW_LIMIT).map((index) => (
                        <tr key={index.id} className="text-foreground">
                          <td className="px-3 py-2 font-mono text-xs">{index.symbol}</td>
                          <td className="px-3 py-2">{index.name}</td>
                          <td className="px-3 py-2">{index.country}</td>
                          <td className="px-3 py-2">{index.exchange}</td>
                          <td className="px-3 py-2">{index.currency}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{index.region.length ? index.region.join(', ') : '—'}</td>
                          <td className="px-3 py-2 text-xs">
                            {index.isGlobal ? (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold">Yes</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                              index.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {index.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-muted-foreground">{index.sortOrder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {configSnapshot.indices.length > CONFIG_PREVIEW_LIMIT && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Showing first {CONFIG_PREVIEW_LIMIT} indices. Use the Market Configuration admin pages to manage the full list.
                    </p>
                  )}
                </div>
              </details>

              <details className="border border-border rounded-lg bg-muted/40">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-foreground">
                  Currency Pairs ({configSnapshot.currencies.length})
                </summary>
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-muted-foreground bg-muted/60">
                        <th className="px-3 py-2">Pair</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Base</th>
                        <th className="px-3 py-2">Quote</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Sort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {configSnapshot.currencies.slice(0, CONFIG_PREVIEW_LIMIT).map((pair) => (
                        <tr key={pair.id} className="text-foreground">
                          <td className="px-3 py-2 font-mono text-xs">{pair.pair}</td>
                          <td className="px-3 py-2">{pair.name || '—'}</td>
                          <td className="px-3 py-2">{pair.base}</td>
                          <td className="px-3 py-2">{pair.quote}</td>
                          <td className="px-3 py-2 text-xs uppercase text-muted-foreground">{pair.type}</td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                              pair.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {pair.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-muted-foreground">{pair.sortOrder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {configSnapshot.currencies.length > CONFIG_PREVIEW_LIMIT && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Showing first {CONFIG_PREVIEW_LIMIT} currency pairs.
                    </p>
                  )}
                </div>
              </details>

              <details className="border border-border rounded-lg bg-muted/40">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-foreground">
                  Commodities ({configSnapshot.commodities.length})
                </summary>
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-muted-foreground bg-muted/60">
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2">Currency</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Sort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {configSnapshot.commodities.slice(0, CONFIG_PREVIEW_LIMIT).map((commodity) => (
                        <tr key={commodity.id} className="text-foreground">
                          <td className="px-3 py-2 font-mono text-xs">{commodity.symbol}</td>
                          <td className="px-3 py-2">{commodity.name}</td>
                          <td className="px-3 py-2">{commodity.category}</td>
                          <td className="px-3 py-2">{commodity.unit}</td>
                          <td className="px-3 py-2">{commodity.currency}</td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                              commodity.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {commodity.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-muted-foreground">{commodity.sortOrder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {configSnapshot.commodities.length > CONFIG_PREVIEW_LIMIT && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Showing first {CONFIG_PREVIEW_LIMIT} commodities.
                    </p>
                  )}
                </div>
              </details>

              <details className="border border-border rounded-lg bg-muted/40">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-foreground">
                  Cryptocurrencies ({configSnapshot.cryptocurrencies.length})
                </summary>
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-muted-foreground bg-muted/60">
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">CoinGecko ID</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Sort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {configSnapshot.cryptocurrencies.slice(0, CONFIG_PREVIEW_LIMIT).map((crypto) => (
                        <tr key={crypto.id} className="text-foreground">
                          <td className="px-3 py-2 font-mono text-xs">{crypto.symbol}</td>
                          <td className="px-3 py-2">{crypto.name}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{crypto.coinGeckoId}</td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${
                              crypto.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {crypto.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-muted-foreground">{crypto.sortOrder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {configSnapshot.cryptocurrencies.length > CONFIG_PREVIEW_LIMIT && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Showing first {CONFIG_PREVIEW_LIMIT} cryptocurrencies.
                    </p>
                  )}
                </div>
              </details>
            </div>
          )}

          {!configLoading && !configSnapshot && !configError && (
            <div className="mt-6 text-sm text-muted-foreground">No configuration data available. Try refreshing the snapshot.</div>
          )}
        </div>

        {/* Direct API Calls */}
        <div className="bg-card rounded-lg shadow-xl p-6 border border-border mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">Direct API Calls & Last Responses</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These endpoints respond with whatever is currently stored in the database cache. Real-time values appear only when
            <code className="mx-1 px-1 py-0.5 bg-muted rounded">ENABLE_REAL_MARKET_DATA</code>
            is set to <code className="mx-1 px-1 py-0.5 bg-muted rounded">"true"</code> and the external API keys are configured.
          </p>

          <div className="space-y-4">
            {MARKET_API_ENDPOINTS.map(({ label, endpoint, description }) => {
              const last = lastResponses[endpoint];
              return (
                <div key={endpoint} className="border border-border rounded-lg p-4 bg-card/60">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">{endpoint}</div>
                      <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={endpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                      >
                        Open in new tab ↗
                      </a>
                      <button
                        onClick={() => handleDirectCall(endpoint, label)}
                        disabled={endpointLoading[endpoint]}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                      >
                        {endpointLoading[endpoint] ? 'Calling...' : 'Call API' }
                      </button>
                    </div>
                  </div>

                  {last && (
                    <div className="mt-3 text-xs text-foreground border border-border rounded-md bg-muted/50 p-3">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={last.ok ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                          {last.ok ? `✅ Success (${last.status ?? '200'})` : `⚠️ Failed${last.status ? ` (${last.status})` : ''}`}
                        </span>
                        <span className="text-muted-foreground">Last call: {new Date(last.timestamp).toLocaleString()}</span>
                        {last.error && (
                          <span className="text-red-600 dark:text-red-400">{last.error}</span>
                        )}
                      </div>
                      {last.payload !== null && last.payload !== undefined ? (
                        <details>
                          <summary className="cursor-pointer text-foreground font-semibold">View last response payload</summary>
                          <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded overflow-auto max-h-80">
{JSON.stringify(last.payload, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <p className="text-muted-foreground">No payload captured for the last attempt.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* External Provider Probes */}
        <div className="bg-card rounded-lg shadow-xl p-6 border border-border mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">External Provider Probes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Trigger direct calls to the third-party services (bypassing the cache) to verify credentials, rate limits, and the
            <code className="mx-1 px-1 py-0.5 bg-muted rounded">ENABLE_REAL_MARKET_DATA</code>
            setting. Responses stream straight from the providers through our server.
          </p>

          <div className="space-y-4">
            {LIVE_PROVIDER_ENDPOINTS.map(({ label, endpoint, description, provider }) => {
              const last = lastResponses[endpoint];
              return (
                <div key={endpoint} className="border border-border rounded-lg p-4 bg-card/60">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">Provider: {provider}</div>
                      <div className="text-xs text-muted-foreground break-all">{endpoint}</div>
                      <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={endpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                      >
                        Open in new tab ↗
                      </a>
                      <button
                        onClick={() => handleDirectCall(endpoint, label)}
                        disabled={endpointLoading[endpoint]}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                      >
                        {endpointLoading[endpoint] ? 'Calling...' : 'Call Provider'}
                      </button>
                    </div>
                  </div>

                  {last && (
                    <div className="mt-3 text-xs text-foreground border border-border rounded-md bg-muted/50 p-3">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={last.ok ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                          {last.ok ? `✅ Success (${last.status ?? '200'})` : `⚠️ Failed${last.status ? ` (${last.status})` : ''}`}
                        </span>
                        <span className="text-muted-foreground">Last call: {new Date(last.timestamp).toLocaleString()}</span>
                        {last.error && (
                          <span className="text-red-600 dark:text-red-400">{last.error}</span>
                        )}
                      </div>
                      {last.payload !== null && last.payload !== undefined ? (
                        <details>
                          <summary className="cursor-pointer text-foreground font-semibold">View provider response</summary>
                          <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded overflow-auto max-h-80">
{JSON.stringify(last.payload, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <p className="text-muted-foreground">No payload captured for the last attempt.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* API Status Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {/* Alpha Vantage */}
          <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Alpha Vantage</h2>
                <p className="text-sm text-muted-foreground">Stock Indices & Commodities</p>
              </div>
              {getStatusIcon(results.apis.alphaVantage)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {results.recommendations.alphaVantage}
            </p>
            <div className="text-xs text-muted-foreground">
              Free Tier: 25 requests/day
            </div>
            {!results.apis.alphaVantage && results.errors?.alphaVantage && (
              <p className="mt-2 text-xs text-destructive">
                {results.errors.alphaVantage}
              </p>
            )}
            {!results.apis.alphaVantage && (
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90"
              >
                Get API Key
              </a>
            )}
          </div>

          {/* Finnhub */}
          <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Finnhub</h2>
                <p className="text-sm text-muted-foreground">Real-time Stock Data</p>
              </div>
              {getStatusIcon(results.apis.finnhub)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {results.recommendations.finnhub}
            </p>
            <div className="text-xs text-muted-foreground">
              Free Tier: 60 calls/minute (Optional)
            </div>
            {!results.apis.finnhub && results.errors?.finnhub && (
              <p className="mt-2 text-xs text-destructive">
                {results.errors.finnhub}
              </p>
            )}
            {!results.apis.finnhub && (
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90"
              >
                Get API Key
              </a>
            )}
          </div>

          {/* CoinGecko */}
          <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">CoinGecko</h2>
                <p className="text-sm text-muted-foreground">Cryptocurrency Data</p>
              </div>
              {getStatusIcon(results.apis.coingecko)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {results.recommendations.coingecko}
            </p>
            <div className="text-xs text-muted-foreground">
              Free Tier: No API key needed! 🎉
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Exchange Rate API</h2>
                <p className="text-sm text-muted-foreground">Currency Conversion</p>
              </div>
              {getStatusIcon(results.apis.exchangeRate)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {results.recommendations.exchangeRate}
            </p>
            <div className="text-xs text-muted-foreground">
              Free Tier: No API key needed! 🎉
            </div>
            {!results.apis.exchangeRate && results.errors?.exchangeRate && (
              <p className="mt-2 text-xs text-destructive">
                {results.errors.exchangeRate}
              </p>
            )}
          </div>

          {/* MarketStack */}
          <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">MarketStack</h2>
                <p className="text-sm text-muted-foreground">End-of-day Equity & Index Data</p>
              </div>
              {getStatusIcon(results.apis.marketstack)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {results.recommendations.marketstack}
            </p>
            <div className="text-xs text-muted-foreground">
              Free Tier: 1K calls/month (requires API key)
            </div>
            {!results.apis.marketstack && results.errors?.marketstack && (
              <p className="mt-2 text-xs text-destructive">
                {results.errors.marketstack}
              </p>
            )}
            {!results.apis.marketstack && (
              <a
                href="https://marketstack.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90"
              >
                Get API Key
              </a>
            )}
          </div>

          {/* TwelveData */}
          <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">TwelveData</h2>
                <p className="text-sm text-muted-foreground">Intraday Series & Commodities</p>
              </div>
              {getStatusIcon(results.apis.twelveData)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {results.recommendations.twelveData}
            </p>
            <div className="text-xs text-muted-foreground">
              Free Tier: 800 calls/day (requires API key)
            </div>
            {!results.apis.twelveData && results.errors?.twelveData && (
              <p className="mt-2 text-xs text-destructive">
                {results.errors.twelveData}
              </p>
            )}
            {!results.apis.twelveData && (
              <a
                href="https://twelvedata.com/sign-up"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90"
              >
                Get API Key
              </a>
            )}
          </div>

          {/* Financial Modeling Prep */}
          <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Financial Modeling Prep</h2>
                <p className="text-sm text-muted-foreground">Quotes & Fundamentals</p>
              </div>
              {getStatusIcon(results.apis.fmp)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {results.recommendations.fmp}
            </p>
            <div className="text-xs text-muted-foreground">
              Free Tier: 250 calls/day (requires API key)
            </div>
            {!results.apis.fmp && results.errors?.fmp && (
              <p className="mt-2 text-xs text-destructive">
                {results.errors.fmp}
              </p>
            )}
            {!results.apis.fmp && (
              <a
                href="https://financialmodelingprep.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90"
              >
                Get API Key
              </a>
            )}
          </div>

          {/* TradingView Fallback */}
          <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">TradingView Fallback</h2>
                <p className="text-sm text-muted-foreground">Scraped Index Snapshot</p>
              </div>
              {getStatusIcon(results.apis.tradingview)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {results.recommendations.tradingview}
            </p>
            <div className="text-xs text-muted-foreground">
              Runs via internal scraper every {autoUpdateStatus?.intervals.scraper ?? '60m'}
            </div>
            {!results.apis.tradingview && results.errors?.tradingview && (
              <p className="mt-2 text-xs text-destructive">
                {results.errors.tradingview}
              </p>
            )}
            <button
              onClick={runTradingViewScraper}
              disabled={runningScraper}
              className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {runningScraper ? 'Refreshing…' : 'Refresh Snapshot'}
            </button>
          </div>
        </div>

        {/* Live Data Testing */}
        <div className="bg-card rounded-lg shadow-xl p-8 border border-border mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Live Market Data Test</h2>
          <p className="text-muted-foreground mb-4">
            Fetch actual data from the APIs to verify they're working correctly. This shows REAL data only - no mock data fallbacks. Ensure
            <code className="mx-1 px-1 py-0.5 bg-muted rounded">ENABLE_REAL_MARKET_DATA</code>
            is enabled when you want fresh values from external providers, otherwise the cached snapshot is returned.
          </p>
          
          <button
            onClick={fetchSampleData}
            disabled={loadingData}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
          >
            {loadingData ? '⏳ Fetching Data...' : '🚀 Fetch Live Data'}
          </button>

          {sampleData && (
            <div className="mt-6 space-y-4">
              {/* Cryptocurrencies */}
              <div className="border border-border rounded-lg p-4 bg-card/50">
                <h3 className="font-bold text-lg mb-2 text-foreground">
                  🪙 Cryptocurrencies ({sampleData.cryptocurrencies?.length || 0})
                </h3>
                {sampleData.cryptocurrencies && sampleData.cryptocurrencies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    {sampleData.cryptocurrencies.slice(0, 6).map((crypto: any) => {
                      const changeValue = typeof crypto.changePercent === 'number' ? crypto.changePercent : Number(crypto.changePercent);
                      const hasChange = Number.isFinite(changeValue);
                      const changeClass = hasChange
                        ? changeValue >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground';

                      return (
                        <div key={crypto.id} className="bg-muted p-3 rounded border border-border">
                          <div className="font-semibold text-foreground">{crypto.name} ({crypto.symbol})</div>
                          <div className="text-lg font-bold text-foreground">${formatNumber(crypto.value)}</div>
                          <div className={changeClass}>{formatSignedPercent(crypto.changePercent)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded">
                    <p className="text-red-600 dark:text-red-400">❌ No crypto data - CoinGecko API may have failed or rate limited</p>
                  </div>
                )}
              </div>

              {/* Currencies */}
              <div className="border border-border rounded-lg p-4 bg-card/50">
                <h3 className="font-bold text-lg mb-2 text-foreground">
                  💱 Currency Rates ({sampleData.currencies?.length || 0})
                </h3>
                {sampleData.currencies && sampleData.currencies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                    {sampleData.currencies.slice(0, 8).map((curr: any) => (
                      <div key={curr.id} className="bg-muted p-2 rounded border border-border">
                        <span className="font-semibold text-foreground">{curr.pair}:</span>
                        <div className="text-lg font-bold text-foreground">{formatNumber(curr.rate, 4)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded">
                    <p className="text-red-600 dark:text-red-400">❌ No currency data - Exchange Rate API may have failed</p>
                  </div>
                )}
              </div>

              {/* Indices */}
              <div className="border border-border rounded-lg p-4 bg-card/50">
                <h3 className="font-bold text-lg mb-2 text-foreground">
                  📈 Stock Indices ({sampleData.indices?.length || 0})
                </h3>
                {sampleData.indices && sampleData.indices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    {sampleData.indices.slice(0, 6).map((index: any) => {
                      const changeValue = typeof index.changePercent === 'number' ? index.changePercent : Number(index.changePercent);
                      const hasChange = Number.isFinite(changeValue);
                      const changeClass = hasChange
                        ? changeValue >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground';

                      return (
                        <div key={index.id} className="bg-muted p-3 rounded border border-border">
                          <div className="font-semibold text-foreground">{index.name}</div>
                          <div className="text-xs text-muted-foreground">{index.symbol}</div>
                          <div className="text-lg font-bold text-foreground">${formatNumber(index.value)}</div>
                          <div className={changeClass}>{formatSignedPercent(index.changePercent)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded">
                    <p className="text-yellow-700 dark:text-yellow-400">⚠️ No index data - APIs may be rate limited (Alpha Vantage: 25/day, Finnhub: 60/min)</p>
                  </div>
                )}
              </div>

              {/* Commodities */}
              <div className="border border-border rounded-lg p-4 bg-card/50">
                <h3 className="font-bold text-lg mb-2 text-foreground">
                  🛢️ Commodities ({sampleData.commodities?.length || 0})
                </h3>
                {sampleData.commodities && sampleData.commodities.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                    {sampleData.commodities.map((comm: any) => (
                      <div key={comm.id} className="bg-muted p-2 rounded border border-border">
                        <span className="font-semibold text-foreground">{comm.name}:</span>
                        <div className="text-lg font-bold text-foreground">${formatNumber(comm.value)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded">
                    <p className="text-blue-700 dark:text-blue-400">ℹ️ Commodity data API integration pending - will be added soon</p>
                  </div>
                )}
              </div>

              {/* Raw JSON Toggle */}
              <details className="border border-border rounded-lg p-4 bg-card/50">
                <summary className="font-bold cursor-pointer text-foreground hover:text-primary">
                  🔍 View Raw JSON Response (Debug)
                </summary>
                <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(sampleData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        {!allConnected && (
          <div className="bg-card rounded-lg shadow-xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">⚙️ Setup Instructions</h2>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">⚠️ Some APIs Not Connected</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Follow the instructions below to set up the remaining APIs for full functionality.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Get API Keys</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Alpha Vantage: <a href="https://www.alphavantage.co/support/#api-key" target="_blank" className="text-primary hover:underline">Get Free Key</a></li>
                  <li>Finnhub (Optional): <a href="https://finnhub.io/register" target="_blank" className="text-primary hover:underline">Sign Up</a></li>
                  <li>CoinGecko: No key needed ✅</li>
                  <li>Exchange Rate: No key needed ✅</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Add to .env.local</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`ALPHA_VANTAGE_API_KEY="your-key-here"
FINNHUB_API_KEY="your-key-here"
ENABLE_REAL_MARKET_DATA="true"`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Restart Server</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
                  npm run dev
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <a
            href="/category/business"
            className="px-6 py-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 font-medium shadow-lg"
          >
            📊 View Live Market Widget
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-4 bg-primary text-primary-foreground text-center rounded-lg hover:bg-primary/90 font-medium shadow-lg"
          >
            🔄 Retest APIs
          </button>
          <a
            href="/admin"
            className="px-6 py-4 bg-secondary text-secondary-foreground text-center rounded-lg hover:bg-secondary/80 font-medium shadow-lg"
          >
            ⬅️ Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
