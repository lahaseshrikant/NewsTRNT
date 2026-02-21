'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAuth from '@/lib/admin-auth';

// ── Types ────────────────────────────────────────────────────────────────────

interface EngineHealth {
  status: string;
  version?: string;
  uptime?: number;
  environment?: string;
}

interface PipelineRun {
  run_id: string;
  type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  stages?: Record<string, {
    status: string;
    duration_ms?: number;
    items_in?: number;
    items_out?: number;
    error?: string;
  }>;
  total_articles?: number;
  delivered?: number;
  errors?: string[];
}

interface SchedulerStatus {
  running: boolean;
  jobs: SchedulerJob[];
}

interface SchedulerJob {
  id: string;
  name: string;
  trigger: string;
  next_run?: string;
  last_run?: string;
  is_paused: boolean;
}

interface IngestRun {
  id: string;
  scraperName: string;
  dataType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  itemsFound?: number;
  itemsInserted?: number;
  itemsFailed?: number;
  errorMessage?: string;
}

// ── Dashboard Page ───────────────────────────────────────────────────────────

export default function ContentEngineDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<EngineHealth | null>(null);
  const [recentRuns, setRecentRuns] = useState<PipelineRun[]>([]);
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);
  const [ingestStats, setIngestStats] = useState<IngestRun[]>([]);
  const [triggerLoading, setTriggerLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch all dashboard data ──────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    const headers = adminAuth.getAuthHeaders();
    try {
      const [healthRes, historyRes, schedulerRes, ingestRes] = await Promise.allSettled([
        fetch(`${API}/content-engine/health`, { headers }).then(r => r.json()),
        fetch(`${API}/content-engine/pipeline/history?limit=10`, { headers }).then(r => r.json()),
        fetch(`${API}/content-engine/scheduler/status`, { headers }).then(r => r.json()),
        fetch(`${API}/articles/ingest/stats`, { headers }).then(r => r.json()),
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value?.success) {
        setHealth(healthRes.value.data);
      } else {
        setHealth({ status: 'offline' });
      }

      if (historyRes.status === 'fulfilled' && historyRes.value?.success) {
        const runs = historyRes.value.data?.runs || historyRes.value.data || [];
        setRecentRuns(Array.isArray(runs) ? runs : []);
      }

      if (schedulerRes.status === 'fulfilled' && schedulerRes.value?.success) {
        setScheduler(schedulerRes.value.data);
      }

      if (ingestRes.status === 'fulfilled' && ingestRes.value?.success) {
        setIngestStats(ingestRes.value.runs || []);
      }
    } catch (err) {
      console.error('[ContentEngine] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll, router]);

  // ── Trigger Pipeline ──────────────────────────────────────────────────

  const triggerPipeline = async (type: 'full' | 'news' | 'market') => {
    setTriggerLoading(type);
    try {
      const res = await fetch(`${API}/content-engine/pipeline/trigger`, {
        method: 'POST',
        headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${type} pipeline triggered successfully`);
        setTimeout(fetchAll, 2000);
      } else {
        showToast(data.error || 'Failed to trigger pipeline', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to Content Engine', 'error');
    } finally {
      setTriggerLoading(null);
    }
  };

  // ── Helper: uptime format ─────────────────────────────────────────────

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success': case 'completed': case 'healthy': case 'online': return 'text-green-400';
      case 'running': case 'in_progress': return 'text-blue-400';
      case 'partial': case 'warning': return 'text-yellow-400';
      case 'failed': case 'error': case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const statusBg = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success': case 'completed': case 'healthy': case 'online': return 'bg-green-500/10 border-green-500/20';
      case 'running': case 'in_progress': return 'bg-blue-500/10 border-blue-500/20';
      case 'partial': case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'failed': case 'error': case 'offline': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading Content Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl border ${
          toast.type === 'success'
            ? 'bg-green-900/90 border-green-500/30 text-green-200'
            : 'bg-red-900/90 border-red-500/30 text-red-200'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            🤖 Content Engine
            <span className={`text-sm px-3 py-1 rounded-full border ${statusBg(health?.status || 'offline')}`}>
              <span className={statusColor(health?.status || 'offline')}>
                {health?.status === 'healthy' || health?.status === 'ok' ? '● Online' : '○ Offline'}
              </span>
            </span>
          </h1>
          <p className="text-gray-400 mt-1">
            AI-powered content pipeline — scraping, processing, and delivery
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {health?.version && <span>v{health.version}</span>}
          {health?.uptime != null && <span>• up {formatUptime(health.uptime)}</span>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['full', 'news', 'market'] as const).map((type) => (
          <button
            key={type}
            onClick={() => triggerPipeline(type)}
            disabled={triggerLoading !== null}
            className={`p-4 rounded-xl border transition-all text-left ${
              triggerLoading === type
                ? 'bg-blue-500/10 border-blue-500/30 animate-pulse'
                : 'bg-[#1a1a2e] border-gray-700/50 hover:border-blue-500/40 hover:bg-blue-500/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                  {type === 'full' ? '🚀 Full Pipeline' : type === 'news' ? '📰 News Only' : '📈 Market Only'}
                </div>
                <div className="text-white font-semibold">
                  {triggerLoading === type ? 'Running...' : `Run ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                </div>
              </div>
              {triggerLoading === type && (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-400" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Engine Status"
          value={health?.status === 'healthy' || health?.status === 'ok' ? 'Online' : 'Offline'}
          icon="🖥️"
          color={health?.status === 'healthy' || health?.status === 'ok' ? 'green' : 'red'}
        />
        <StatCard
          label="Scheduler"
          value={scheduler?.running ? 'Active' : 'Stopped'}
          icon="⏰"
          color={scheduler?.running ? 'green' : 'yellow'}
          sub={`${scheduler?.jobs?.length || 0} jobs`}
        />
        <StatCard
          label="Recent Runs"
          value={String(recentRuns.length)}
          icon="🔄"
          color="blue"
          sub={recentRuns[0] ? `Last: ${formatTime(recentRuns[0].started_at)}` : undefined}
        />
        <StatCard
          label="Articles Ingested"
          value={String(ingestStats.reduce((sum, r) => sum + (r.itemsInserted || 0), 0))}
          icon="📰"
          color="purple"
          sub={`${ingestStats.length} pipeline runs`}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Pipeline Runs */}
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              🔄 Recent Pipeline Runs
            </h2>
            <button
              onClick={() => router.push('/content-engine/pipeline')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentRuns.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-2xl mb-2">📭</p>
                <p>No pipeline runs yet</p>
                <p className="text-xs mt-1">Trigger a run above to get started</p>
              </div>
            ) : (
              recentRuns.map((run) => (
                <div
                  key={run.run_id}
                  className={`p-3 rounded-lg border ${statusBg(run.status)} cursor-pointer hover:brightness-110 transition-all`}
                  onClick={() => router.push(`/content-engine/pipeline?run=${run.run_id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${statusColor(run.status)}`}>
                        {run.status?.toUpperCase()}
                      </span>
                      <span className="text-gray-300 text-sm font-medium">{run.type}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{formatTime(run.started_at)}</span>
                  </div>
                  {run.total_articles != null && (
                    <div className="text-xs text-gray-400 mt-1">
                      {run.total_articles} articles • {run.delivered || 0} delivered
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduler Jobs */}
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              ⏰ Scheduler Jobs
            </h2>
            <button
              onClick={() => router.push('/content-engine/scheduler')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Manage →
            </button>
          </div>
          <div className="space-y-3">
            {!scheduler?.jobs?.length ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-2xl mb-2">📅</p>
                <p>No scheduled jobs</p>
              </div>
            ) : (
              scheduler.jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white text-sm font-medium">{job.name || job.id}</span>
                      <span className="text-gray-500 text-xs ml-2">({job.trigger})</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      job.is_paused
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {job.is_paused ? 'Paused' : 'Active'}
                    </span>
                  </div>
                  {job.next_run && (
                    <div className="text-xs text-gray-400 mt-1">
                      Next: {formatTime(job.next_run)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ingest History */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          📥 Article Ingest History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700/50">
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Found</th>
                <th className="pb-2 pr-4">Inserted</th>
                <th className="pb-2 pr-4">Failed</th>
                <th className="pb-2 pr-4">Started</th>
                <th className="pb-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {ingestStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6">
                    No ingest runs recorded yet
                  </td>
                </tr>
              ) : (
                ingestStats.slice(0, 15).map((run) => {
                  const duration = run.completedAt && run.startedAt
                    ? Math.round(
                        (new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000
                      )
                    : null;
                  return (
                    <tr key={run.id} className="border-b border-gray-800/50">
                      <td className="py-2 pr-4">
                        <span className={`text-xs font-mono ${statusColor(run.status)}`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-300">{run.dataType}</td>
                      <td className="py-2 pr-4 text-gray-300">{run.itemsFound ?? '—'}</td>
                      <td className="py-2 pr-4 text-green-400">{run.itemsInserted ?? '—'}</td>
                      <td className="py-2 pr-4 text-red-400">{run.itemsFailed || '—'}</td>
                      <td className="py-2 pr-4 text-gray-400">{formatTime(run.startedAt)}</td>
                      <td className="py-2 text-gray-400">{duration != null ? `${duration}s` : '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture Info */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-lg font-semibold text-white mb-3">🏗️ Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/30">
            <div className="text-blue-400 font-medium mb-1">📡 Scraping Layer</div>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• RSS feeds (10+ sources)</li>
              <li>• NewsAPI integration</li>
              <li>• TradingView market data</li>
              <li>• Deduplication engine</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/30">
            <div className="text-purple-400 font-medium mb-1">🧠 AI Processing</div>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• GPT-powered summarization</li>
              <li>• Topic classification (12 cats)</li>
              <li>• Sentiment analysis</li>
              <li>• SEO optimization</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/30">
            <div className="text-green-400 font-medium mb-1">🚀 Delivery</div>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• HTTP delivery to admin-backend</li>
              <li>• Bulk article ingestion</li>
              <li>• Market data push</li>
              <li>• Pipeline run tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  sub?: string;
}) {
  const colorMap = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
  };
  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1 truncate">{sub}</div>}
    </div>
  );
}
