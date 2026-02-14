'use client';

import { useEffect, useState } from 'react';
import { API_CONFIG } from '@/config/api';
import adminAuth from '@/lib/admin-auth';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  response?: any;
  error?: string;
  duration?: number;
}

interface MarketIndexConfig {
  id: string;
  symbol: string;
  name: string;
  country: string;
  exchange: string;
  currency: string;
  isActive: boolean;
  isGlobal: boolean;
  sortOrder: number;
  region: string[];
}

interface CryptoConfig {
  id: string;
  symbol: string;
  name: string;
  coinGeckoId: string;
  isActive: boolean;
  sortOrder: number;
}

interface CommodityConfig {
  id: string;
  symbol: string;
  name: string;
  category: string;
  unit: string;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

interface CurrencyPairConfig {
  id: string;
  pair: string;
  name: string | null;
  base: string;
  quote: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
}

interface MarketConfigResponse {
  indices: MarketIndexConfig[];
  cryptocurrencies: CryptoConfig[];
  commodities: CommodityConfig[];
  currencies: CurrencyPairConfig[];
}

interface MarketConfigCounts {
  indices: number;
  cryptocurrencies: number;
  commodities: number;
  currencies: number;
  total: number;
}

export default function APITestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [configOverview, setConfigOverview] = useState<MarketConfigResponse | null>(null);
  const [configCounts, setConfigCounts] = useState<MarketConfigCounts | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  useEffect(() => {
    refreshConfigOverview();
  }, []);

  const NIFTY_LABEL = 'NIFTY 50';
  const NIFTY_SYMBOL = '^NSEI';
  const NIFTY_MARKETSTACK_SYMBOL = 'NIFTY50';

  const ADMIN_API = API_CONFIG.baseURL; // http://localhost:5001/api
  const MARKET_API = 'http://localhost:5000/api'; // user-backend for market data

  const apiEndpoints = [
    { name: 'Admin Stats', endpoint: `${ADMIN_API}/admin/stats`, method: 'GET' },
    {
      name: 'All Market Configurations',
      endpoint: `${ADMIN_API}/admin/market-config?includeInactive=true`,
      method: 'GET',
    },
    { name: 'Market Indices Config', endpoint: `${ADMIN_API}/admin/market-config/indices`, method: 'GET' },
    { name: 'Cryptocurrencies Config', endpoint: `${ADMIN_API}/admin/market-config/cryptos`, method: 'GET' },
    { name: 'Commodities Config', endpoint: `${ADMIN_API}/admin/market-config/commodities`, method: 'GET' },
    { name: 'Currency Pairs Config', endpoint: `${ADMIN_API}/admin/market-config/currencies`, method: 'GET' },
    { name: 'Market Auto-Update Status', endpoint: `${MARKET_API}/market/auto-update`, method: 'GET' },
    { name: 'Market Indices Data', endpoint: `${MARKET_API}/market/country/US`, method: 'GET' },
    { name: 'Cryptocurrencies Data', endpoint: `${MARKET_API}/market/crypto`, method: 'GET' },
    { name: 'Currency Rates Data', endpoint: `${MARKET_API}/market/currencies`, method: 'GET' },
    { name: 'Commodities Data', endpoint: `${MARKET_API}/market/commodities`, method: 'GET' },
    {
      name: `MarketStack Live (${NIFTY_LABEL})`,
      endpoint: `${MARKET_API}/market/live?provider=marketstack&symbol=${encodeURIComponent(NIFTY_MARKETSTACK_SYMBOL)}`,
      method: 'GET',
    },
    {
      name: `TwelveData Live (${NIFTY_LABEL})`,
      endpoint: `${MARKET_API}/market/live?provider=twelvedata&symbol=${encodeURIComponent(NIFTY_MARKETSTACK_SYMBOL)}&interval=1min`,
      method: 'GET',
    },
    {
      name: `Financial Modeling Prep Live (${NIFTY_LABEL})`,
      endpoint: `${MARKET_API}/market/live?provider=fmp&symbol=${encodeURIComponent(NIFTY_SYMBOL)}`,
      method: 'GET',
    },
  ];

  const testEndpoint = async (endpoint: string, method: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...adminAuth.getAuthHeaders(),
        },
      });
      const duration = Date.now() - startTime;
      const data = await response.json();

      return {
        endpoint,
        method,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        response: data,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        endpoint,
        method,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);

    for (const api of apiEndpoints) {
      // Add pending status
      setTestResults(prev => [
        ...prev,
        { endpoint: api.endpoint, method: api.method, status: 'pending' }
      ]);

      // Test endpoint
      const result = await testEndpoint(api.endpoint, api.method);
      
      // Update result
      setTestResults(prev => 
        prev.map(r => 
          r.endpoint === api.endpoint && r.method === api.method
            ? result
            : r
        )
      );

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  const testSingleEndpoint = async (endpoint: string, method: string) => {
    setTestResults(prev => [
      ...prev.filter(r => !(r.endpoint === endpoint && r.method === method)),
      { endpoint, method, status: 'pending' }
    ]);

    const result = await testEndpoint(endpoint, method);
    
    setTestResults(prev => 
      prev.map(r => 
        r.endpoint === endpoint && r.method === method
          ? result
          : r
      )
    );
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const refreshConfigOverview = async () => {
    try {
      setOverviewLoading(true);
      setOverviewError(null);
      const response = await fetch(`${API_CONFIG.baseURL}/admin/market-config?includeInactive=true`, {
        headers: {
          'Content-Type': 'application/json',
          ...adminAuth.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || 'Failed to load market configuration overview');
      }

      const payload = await response.json();
      const data = payload?.data as MarketConfigResponse | undefined;
      const counts = payload?.counts as MarketConfigCounts | undefined;

      if (!data) {
        throw new Error('Invalid response payload for market configuration overview');
      }

      setConfigOverview(data);
      setConfigCounts(counts ?? null);
    } catch (error) {
      console.error('[API Test] Failed to fetch market configuration overview:', error);
      setOverviewError(error instanceof Error ? error.message : 'Failed to fetch configuration overview');
      setConfigOverview(null);
      setConfigCounts(null);
    } finally {
      setOverviewLoading(false);
    }
  };

  const MAX_PREVIEW_ROWS = 12;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Testing Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Test all admin and market data API endpoints</p>
        </div>

        {/* Market Configuration Snapshot */}
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Market Configuration Snapshot</h2>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Live view of all market configurations in the database (includes inactive entries)
              </p>
            </div>
            <button
              onClick={refreshConfigOverview}
              disabled={overviewLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {overviewLoading ? 'Refreshing…' : 'Refresh Snapshot'}
            </button>
          </div>

          {overviewError && (
            <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm border-b border-red-200 dark:border-red-700">
              {overviewError}
            </div>
          )}

          {configCounts && (
            <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-4">
                <div className="text-sm text-green-600 dark:text-green-300">Indices</div>
                <div className="text-2xl font-semibold text-green-800 dark:text-green-200">{configCounts.indices}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
                <div className="text-sm text-blue-600 dark:text-blue-300">Currencies</div>
                <div className="text-2xl font-semibold text-blue-800 dark:text-blue-200">{configCounts.currencies}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700 p-4">
                <div className="text-sm text-amber-600 dark:text-amber-300">Commodities</div>
                <div className="text-2xl font-semibold text-amber-800 dark:text-amber-200">{configCounts.commodities}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 p-4">
                <div className="text-sm text-purple-600 dark:text-purple-300">Cryptocurrencies</div>
                <div className="text-2xl font-semibold text-purple-800 dark:text-purple-200">{configCounts.cryptocurrencies}</div>
              </div>
            </div>
          )}

          {configOverview && (
            <div className="px-6 pb-6 space-y-4">
              <details className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-800 dark:text-slate-100">
                  Stock Indices ({configOverview.indices.length})
                </summary>
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800">
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Country</th>
                        <th className="px-3 py-2">Exchange</th>
                        <th className="px-3 py-2">Currency</th>
                        <th className="px-3 py-2">Regions</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Global</th>
                        <th className="px-3 py-2 text-right">Sort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {configOverview.indices.slice(0, MAX_PREVIEW_ROWS).map((index) => (
                        <tr key={index.id} className="text-gray-800 dark:text-slate-200">
                          <td className="px-3 py-2 font-mono text-xs">{index.symbol}</td>
                          <td className="px-3 py-2">{index.name}</td>
                          <td className="px-3 py-2">{index.country}</td>
                          <td className="px-3 py-2">{index.exchange}</td>
                          <td className="px-3 py-2">{index.currency}</td>
                          <td className="px-3 py-2 text-xs text-gray-500 dark:text-slate-400">
                            {index.region.length ? index.region.join(', ') : '—'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              index.isActive
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {index.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {index.isGlobal ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500">
                                Yes
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-gray-500 dark:text-slate-400">
                            {index.sortOrder}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {configOverview.indices.length > MAX_PREVIEW_ROWS && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      Showing first {MAX_PREVIEW_ROWS} indices. Use the Market Configuration pages to manage the full list.
                    </p>
                  )}
                </div>
              </details>

              <details className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-800 dark:text-slate-100">
                  Currency Pairs ({configOverview.currencies.length})
                </summary>
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800">
                        <th className="px-3 py-2">Pair</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Base</th>
                        <th className="px-3 py-2">Quote</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Sort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {configOverview.currencies.slice(0, MAX_PREVIEW_ROWS).map((pair) => (
                        <tr key={pair.id} className="text-gray-800 dark:text-slate-200">
                          <td className="px-3 py-2 font-mono text-xs">{pair.pair}</td>
                          <td className="px-3 py-2">{pair.name || '—'}</td>
                          <td className="px-3 py-2">{pair.base}</td>
                          <td className="px-3 py-2">{pair.quote}</td>
                          <td className="px-3 py-2 text-xs uppercase text-gray-500 dark:text-slate-400">{pair.type}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              pair.isActive
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {pair.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-gray-500 dark:text-slate-400">
                            {pair.sortOrder}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {configOverview.currencies.length > MAX_PREVIEW_ROWS && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      Showing first {MAX_PREVIEW_ROWS} currency pairs.
                    </p>
                  )}
                </div>
              </details>

              <details className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-800 dark:text-slate-100">
                  Commodities ({configOverview.commodities.length})
                </summary>
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800">
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2">Currency</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Sort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {configOverview.commodities.slice(0, MAX_PREVIEW_ROWS).map((commodity) => (
                        <tr key={commodity.id} className="text-gray-800 dark:text-slate-200">
                          <td className="px-3 py-2 font-mono text-xs">{commodity.symbol}</td>
                          <td className="px-3 py-2">{commodity.name}</td>
                          <td className="px-3 py-2">{commodity.category}</td>
                          <td className="px-3 py-2">{commodity.unit}</td>
                          <td className="px-3 py-2">{commodity.currency}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              commodity.isActive
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {commodity.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-gray-500 dark:text-slate-400">
                            {commodity.sortOrder}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {configOverview.commodities.length > MAX_PREVIEW_ROWS && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      Showing first {MAX_PREVIEW_ROWS} commodities.
                    </p>
                  )}
                </div>
              </details>

              <details className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-800 dark:text-slate-100">
                  Cryptocurrencies ({configOverview.cryptocurrencies.length})
                </summary>
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800">
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">CoinGecko ID</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Sort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {configOverview.cryptocurrencies.slice(0, MAX_PREVIEW_ROWS).map((crypto) => (
                        <tr key={crypto.id} className="text-gray-800 dark:text-slate-200">
                          <td className="px-3 py-2 font-mono text-xs">{crypto.symbol}</td>
                          <td className="px-3 py-2">{crypto.name}</td>
                          <td className="px-3 py-2 text-xs text-gray-500 dark:text-slate-400">{crypto.coinGeckoId}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              crypto.isActive
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {crypto.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-gray-500 dark:text-slate-400">
                            {crypto.sortOrder}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {configOverview.cryptocurrencies.length > MAX_PREVIEW_ROWS && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      Showing first {MAX_PREVIEW_ROWS} cryptocurrencies.
                    </p>
                  )}
                </div>
              </details>
            </div>
          )}

          {!overviewLoading && !configOverview && !overviewError && (
            <div className="px-6 py-6 text-sm text-gray-600 dark:text-slate-300">
              No configuration data available. Use the refresh button to fetch the latest snapshot.
            </div>
          )}

          {overviewLoading && (
            <div className="px-6 py-6 text-sm text-gray-600 dark:text-slate-300">
              Loading configuration snapshot…
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={runAllTests}
            disabled={testing}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              testing
                ? 'bg-gray-400 dark:bg-slate-700 cursor-not-allowed text-gray-600 dark:text-slate-400'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
            }`}
          >
            {testing ? '🔄 Testing...' : '▶️ Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            disabled={testing}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Clear Results
          </button>
        </div>

        {/* API Endpoints List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Endpoints</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {apiEndpoints.map((api, index) => {
              const result = testResults.find(
                r => r.endpoint === api.endpoint && r.method === api.method
              );

              return (
                <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{api.name}</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                          {api.method}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400 font-mono mt-1">{api.endpoint}</p>
                    </div>
                    
                    <button
                      onClick={() => testSingleEndpoint(api.endpoint, api.method)}
                      disabled={testing}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Test
                    </button>
                  </div>

                  {/* Result Display */}
                  {result && (
                    <div className={`mt-4 p-4 rounded-lg border-2 ${
                      result.status === 'pending'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                        : result.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {result.status === 'pending' && '⏳'}
                            {result.status === 'success' && '✅'}
                            {result.status === 'error' && '❌'}
                          </span>
                          <span className={`font-semibold ${
                            result.status === 'pending'
                              ? 'text-yellow-800 dark:text-yellow-300'
                              : result.status === 'success'
                              ? 'text-green-800 dark:text-green-300'
                              : 'text-red-800 dark:text-red-300'
                          }`}>
                            {result.status === 'pending' && 'Testing...'}
                            {result.status === 'success' && `Success (${result.statusCode})`}
                            {result.status === 'error' && `Failed ${result.statusCode ? `(${result.statusCode})` : ''}`}
                          </span>
                        </div>
                        {result.duration && (
                          <span className="text-sm text-gray-600 dark:text-slate-400">
                            ⏱️ {result.duration}ms
                          </span>
                        )}
                      </div>

                      {result.status !== 'pending' && (
                        <div className="mt-3">
                          <details className="cursor-pointer">
                            <summary className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                              📄 View Response
                            </summary>
                            <pre className="text-xs bg-white dark:bg-slate-900 p-3 rounded border border-gray-300 dark:border-slate-600 overflow-auto max-h-64 text-gray-800 dark:text-slate-200">
                              {result.error 
                                ? result.error
                                : JSON.stringify(result.response, null, 2)
                              }
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {testResults.length > 0 && (
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                  {testResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Passed</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                <div className="text-2xl font-bold text-red-800 dark:text-red-300">
                  {testResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                  {testResults.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

