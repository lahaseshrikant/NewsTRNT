'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAuth from '@/lib/admin-auth';

interface Source {
  name: string;
  type: string;
  url?: string;
  category?: string;
  enabled: boolean;
}

interface SourceGroup {
  type: string;
  label: string;
  icon: string;
  sources: Source[];
}

export default function SourcesPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<SourceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrapeLoading, setScrapeLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch(`${API}/content-engine/scraping/sources`, {
        headers: adminAuth.getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        const raw = data.data?.sources || data.data || {};
        // Normalize into groups
        const g: SourceGroup[] = [];

        if (raw.rss) {
          g.push({ type: 'rss', label: 'RSS Feeds', icon: '📡', sources: Array.isArray(raw.rss) ? raw.rss : [] });
        }
        if (raw.newsapi) {
          g.push({ type: 'newsapi', label: 'NewsAPI', icon: '📰', sources: Array.isArray(raw.newsapi) ? raw.newsapi : [raw.newsapi] });
        }
        if (raw.tradingview || raw.market) {
          g.push({ type: 'market', label: 'Market Data', icon: '📈', sources: [{ name: 'TradingView', type: 'market', enabled: true }] });
        }

        // If data came as flat array
        if (Array.isArray(data.data)) {
          g.push({ type: 'all', label: 'All Sources', icon: '📡', sources: data.data });
        }

        setGroups(g.length > 0 ? g : [{ type: 'default', label: 'Sources', icon: '📡', sources: [] }]);
      }
    } catch (err) {
      console.error('[Sources] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) { router.push('/login'); return; }
    fetchSources();
  }, [fetchSources, router]);

  const triggerScrape = async (type: 'rss' | 'newsapi' | 'market') => {
    setScrapeLoading(type);
    const endpoint = type === 'market' ? 'scraping/market' : `scraping/${type}`;
    try {
      const res = await fetch(`${API}/content-engine/${endpoint}`, {
        method: 'POST',
        headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        const count = data.data?.count || data.data?.articles?.length || 0;
        showToast(`${type} scrape complete — ${count} items`);
      } else {
        showToast(data.error || 'Scrape failed', 'error');
      }
    } catch {
      showToast(`Failed to trigger ${type} scrape`, 'error');
    } finally {
      setScrapeLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl border ${
          toast.type === 'success' ? 'bg-green-900/90 border-green-500/30 text-green-200'
            : 'bg-red-900/90 border-red-500/30 text-red-200'
        }`}>{toast.msg}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📡 Scraping Sources</h1>
          <p className="text-gray-400 text-sm mt-1">News feeds, APIs, and market data sources</p>
        </div>
        <div className="flex gap-2">
          {(['rss', 'newsapi', 'market'] as const).map((t) => (
            <button
              key={t}
              onClick={() => triggerScrape(t)}
              disabled={scrapeLoading !== null}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                scrapeLoading === t
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse'
                  : 'bg-[#1a1a2e] border-gray-700/50 text-white hover:border-blue-500/40'
              }`}
            >
              {scrapeLoading === t ? '...' : `Scrape ${t.toUpperCase()}`}
            </button>
          ))}
        </div>
      </div>

      {/* Source Groups */}
      {groups.map((group) => (
        <div key={group.type} className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            {group.icon} {group.label}
            <span className="text-xs text-gray-500 font-normal">({group.sources.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.sources.length === 0 ? (
              <p className="text-gray-500 text-sm col-span-2">No sources configured</p>
            ) : (
              group.sources.map((src, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/20"
                >
                  <span className={`w-2 h-2 rounded-full ${src.enabled !== false ? 'bg-green-400' : 'bg-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{src.name}</div>
                    {src.url && (
                      <div className="text-xs text-gray-500 truncate">{src.url}</div>
                    )}
                    {src.category && (
                      <span className="text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        {src.category}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs ${src.enabled !== false ? 'text-green-400' : 'text-gray-500'}`}>
                    {src.enabled !== false ? 'Active' : 'Disabled'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
