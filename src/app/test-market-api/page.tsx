'use client';

import { useEffect, useState } from 'react';

interface APITestResult {
  status: string;
  timestamp: string;
  apis: {
    alphaVantage: boolean;
    finnhub: boolean;
    coingecko: boolean;
    exchangeRate: boolean;
  };
  recommendations: {
    alphaVantage: string;
    finnhub: string;
    coingecko: string;
    exchangeRate: string;
  };
}

export default function TestMarketAPI() {
  const [results, setResults] = useState<APITestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    testAPIs();
  }, []);

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <span className="text-green-600 text-2xl">✅</span>
    ) : (
      <span className="text-red-600 text-2xl">❌</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Testing API Connections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Market Data API Test
          </h1>
          <p className="text-gray-600">
            Testing connectivity to market data providers
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full ${allConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {connectedCount}/{totalCount} APIs Connected
            </div>
            <div className="text-sm text-gray-500">
              Tested at: {new Date(results.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* API Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Alpha Vantage */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Alpha Vantage</h2>
                <p className="text-sm text-gray-500">Stock Indices & Commodities</p>
              </div>
              {getStatusIcon(results.apis.alphaVantage)}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {results.recommendations.alphaVantage}
            </p>
            <div className="text-xs text-gray-500">
              Free Tier: 25 requests/day
            </div>
            {!results.apis.alphaVantage && (
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
              >
                Get API Key
              </a>
            )}
          </div>

          {/* Finnhub */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Finnhub</h2>
                <p className="text-sm text-gray-500">Real-time Stock Data</p>
              </div>
              {getStatusIcon(results.apis.finnhub)}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {results.recommendations.finnhub}
            </p>
            <div className="text-xs text-gray-500">
              Free Tier: 60 calls/minute (Optional)
            </div>
            {!results.apis.finnhub && (
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
              >
                Get API Key
              </a>
            )}
          </div>

          {/* CoinGecko */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">CoinGecko</h2>
                <p className="text-sm text-gray-500">Cryptocurrency Data</p>
              </div>
              {getStatusIcon(results.apis.coingecko)}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {results.recommendations.coingecko}
            </p>
            <div className="text-xs text-gray-500">
              Free Tier: No API key needed! 🎉
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Exchange Rate API</h2>
                <p className="text-sm text-gray-500">Currency Conversion</p>
              </div>
              {getStatusIcon(results.apis.exchangeRate)}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {results.recommendations.exchangeRate}
            </p>
            <div className="text-xs text-gray-500">
              Free Tier: No API key needed! 🎉
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Instructions</h2>
          
          {!allConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Some APIs Not Connected</h3>
              <p className="text-sm text-yellow-700">
                Follow the instructions below to set up the remaining APIs.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">1. Get API Keys</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Alpha Vantage: <a href="https://www.alphavantage.co/support/#api-key" target="_blank" className="text-indigo-600 hover:underline">Get Free Key</a></li>
                <li>Finnhub (Optional): <a href="https://finnhub.io/register" target="_blank" className="text-indigo-600 hover:underline">Sign Up</a></li>
                <li>CoinGecko: No key needed ✅</li>
                <li>Exchange Rate: No key needed ✅</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">2. Add to .env.local</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`ALPHA_VANTAGE_API_KEY="your-key-here"
FINNHUB_API_KEY="your-key-here"
ENABLE_REAL_MARKET_DATA="true"`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">3. Restart Server</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
                npm run dev
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">4. Test Again</h3>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Retest APIs
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <a
            href="/category/business"
            className="flex-1 px-6 py-3 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 font-medium"
          >
            View Market Widget
          </a>
          <a
            href="/"
            className="flex-1 px-6 py-3 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 font-medium"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
