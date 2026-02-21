'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import adminAuth from '@/lib/admin-auth';

interface StageResult {
  status: string;
  duration_ms?: number;
  items_in?: number;
  items_out?: number;
  error?: string;
}

interface PipelineRun {
  run_id: string;
  type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  stages?: Record<string, StageResult>;
  total_articles?: number;
  delivered?: number;
  errors?: string[];
}

export default function PipelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRunId = searchParams.get('run');

  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch(`${API}/content-engine/pipeline/history?limit=50`, {
        headers: adminAuth.getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        const runList = data.data?.runs || data.data || [];
        setRuns(Array.isArray(runList) ? runList : []);
      }
    } catch (err) {
      console.error('[Pipeline] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) { router.push('/login'); return; }
    fetchRuns();
    const iv = setInterval(fetchRuns, 15000);
    return () => clearInterval(iv);
  }, [fetchRuns, router]);

  // Auto-select run from query param
  useEffect(() => {
    if (selectedRunId && runs.length > 0) {
      const found = runs.find(r => r.run_id === selectedRunId);
      if (found) setSelectedRun(found);
    }
  }, [selectedRunId, runs]);

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
        showToast(`${type} pipeline triggered!`);
        setTimeout(fetchRuns, 3000);
      } else {
        showToast(data.error || 'Trigger failed', 'error');
      }
    } catch {
      showToast('Failed to reach Content Engine', 'error');
    } finally {
      setTriggerLoading(null);
    }
  };

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'success': case 'completed': return 'text-green-400';
      case 'running': case 'in_progress': return 'text-blue-400';
      case 'partial': return 'text-yellow-400';
      case 'failed': case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const stageIcon = (name: string) => {
    if (name.includes('scrape') || name.includes('fetch')) return '📡';
    if (name.includes('dedup')) return '🔄';
    if (name.includes('ai') || name.includes('enrich')) return '🧠';
    if (name.includes('deliver')) return '🚀';
    if (name.includes('market')) return '📈';
    return '⚙️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl border ${
          toast.type === 'success' ? 'bg-green-900/90 border-green-500/30 text-green-200'
            : 'bg-red-900/90 border-red-500/30 text-red-200'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🔄 Pipeline Monitor</h1>
          <p className="text-gray-400 text-sm mt-1">Track and trigger content pipeline runs</p>
        </div>
        <div className="flex gap-2">
          {(['full', 'news', 'market'] as const).map((t) => (
            <button
              key={t}
              onClick={() => triggerPipeline(t)}
              disabled={triggerLoading !== null}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                triggerLoading === t
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse'
                  : 'bg-[#1a1a2e] border-gray-700/50 text-white hover:border-blue-500/40'
              }`}
            >
              {triggerLoading === t ? '...' : `▶ ${t.charAt(0).toUpperCase() + t.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run List */}
        <div className="lg:col-span-1 bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-4 max-h-[80vh] overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Run History ({runs.length})
          </h2>
          <div className="space-y-2">
            {runs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No pipeline runs yet</p>
            ) : (
              runs.map((run) => (
                <button
                  key={run.run_id}
                  onClick={() => setSelectedRun(run)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedRun?.run_id === run.run_id
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-gray-800/30 border-gray-700/20 hover:border-gray-600/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${statusColor(run.status)}`}>
                      {run.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {run.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTime(run.started_at)}
                  </div>
                  {run.total_articles != null && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {run.total_articles} articles → {run.delivered || 0} delivered
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Run Detail */}
        <div className="lg:col-span-2 bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5">
          {!selectedRun ? (
            <div className="text-center text-gray-500 py-20">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-lg">Select a run to view details</p>
              <p className="text-sm mt-1">Or trigger a new pipeline run</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedRun.type.toUpperCase()} Pipeline
                  </h2>
                  <p className="text-xs text-gray-500 font-mono">{selectedRun.run_id}</p>
                </div>
                <span className={`text-sm font-mono px-3 py-1 rounded-full border ${
                  selectedRun.status === 'completed' || selectedRun.status === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : selectedRun.status === 'running'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {selectedRun.status}
                </span>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Started</div>
                  <div className="text-white">{formatTime(selectedRun.started_at)}</div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Completed</div>
                  <div className="text-white">
                    {selectedRun.completed_at ? formatTime(selectedRun.completed_at) : '—'}
                  </div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Duration</div>
                  <div className="text-white">
                    {selectedRun.duration_ms != null
                      ? `${(selectedRun.duration_ms / 1000).toFixed(1)}s`
                      : '—'}
                  </div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Articles</div>
                  <div className="text-white">
                    {selectedRun.total_articles ?? '—'} / {selectedRun.delivered ?? '—'} delivered
                  </div>
                </div>
              </div>

              {/* Stages */}
              {selectedRun.stages && Object.keys(selectedRun.stages).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Pipeline Stages</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedRun.stages).map(([name, stage]) => (
                      <div
                        key={name}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/20"
                      >
                        <span className="text-lg">{stageIcon(name)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-medium capitalize">
                              {name.replace(/_/g, ' ')}
                            </span>
                            <span className={`text-xs font-mono ${statusColor(stage.status)}`}>
                              {stage.status}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-400 mt-1">
                            {stage.items_in != null && <span>In: {stage.items_in}</span>}
                            {stage.items_out != null && <span>Out: {stage.items_out}</span>}
                            {stage.duration_ms != null && (
                              <span>{(stage.duration_ms / 1000).toFixed(1)}s</span>
                            )}
                          </div>
                          {stage.error && (
                            <div className="text-xs text-red-400 mt-1 font-mono">
                              {stage.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {selectedRun.errors && selectedRun.errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-2">
                    Errors ({selectedRun.errors.length})
                  </h3>
                  <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {selectedRun.errors.map((err, i) => (
                      <div key={i} className="text-xs text-red-300 font-mono mb-1">{err}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
