'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAuth from '@/lib/admin-auth';

interface SchedulerJob {
  id: string;
  name: string;
  trigger: string;
  next_run?: string;
  last_run?: string;
  is_paused: boolean;
  interval_minutes?: number;
  run_count?: number;
  last_status?: string;
}

interface SchedulerStatus {
  running: boolean;
  jobs: SchedulerJob[];
  timezone?: string;
}

export default function SchedulerPage() {
  const router = useRouter();
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchScheduler = useCallback(async () => {
    try {
      const res = await fetch(`${API}/content-engine/scheduler/status`, {
        headers: adminAuth.getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setScheduler(data.data);
    } catch (err) {
      console.error('[Scheduler] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) { router.push('/login'); return; }
    fetchScheduler();
    const iv = setInterval(fetchScheduler, 10000);
    return () => clearInterval(iv);
  }, [fetchScheduler, router]);

  const toggleJob = async (jobId: string, isPaused: boolean) => {
    setActionLoading(jobId);
    try {
      const action = isPaused ? 'resume' : 'pause';
      const res = await fetch(`${API}/content-engine/scheduler/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Job ${action}d successfully`);
        fetchScheduler();
      } else {
        showToast(data.error || `Failed to ${action} job`, 'error');
      }
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Remove this scheduled job?')) return;
    setActionLoading(jobId);
    try {
      const res = await fetch(`${API}/content-engine/scheduler/jobs/${jobId}`, {
        method: 'DELETE',
        headers: adminAuth.getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Job removed');
        fetchScheduler();
      } else {
        showToast(data.error || 'Failed to remove job', 'error');
      }
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⏰ Scheduler</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage automated pipeline jobs
            {scheduler?.timezone && <span className="ml-2 text-gray-500">({scheduler.timezone})</span>}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm border ${
          scheduler?.running
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {scheduler?.running ? '● Running' : '○ Stopped'}
        </div>
      </div>

      {/* Jobs */}
      <div className="space-y-4">
        {!scheduler?.jobs?.length ? (
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-12 text-center text-gray-500">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-lg">No scheduled jobs</p>
            <p className="text-sm mt-1">The scheduler is empty. Pipeline runs must be triggered manually.</p>
          </div>
        ) : (
          scheduler.jobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {job.name?.includes('news') ? '📰' : job.name?.includes('market') ? '📈' : '⚙️'}
                  </span>
                  <div>
                    <h3 className="text-white font-semibold">{job.name || job.id}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="bg-gray-800 px-2 py-0.5 rounded">{job.trigger}</span>
                      {job.interval_minutes && <span>Every {job.interval_minutes} min</span>}
                      {job.run_count != null && <span>{job.run_count} runs</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    job.is_paused
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    {job.is_paused ? '⏸ Paused' : '▶ Active'}
                  </span>
                  <button
                    onClick={() => toggleJob(job.id, job.is_paused)}
                    disabled={actionLoading === job.id}
                    className="px-3 py-1 text-xs rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {actionLoading === job.id ? '...' : job.is_paused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    disabled={actionLoading === job.id}
                    className="px-3 py-1 text-xs rounded border border-red-700/50 text-red-400 hover:bg-red-900/30 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Next/Last run */}
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div className="bg-gray-800/30 rounded-lg p-2">
                  <span className="text-gray-500 text-xs">Next Run</span>
                  <div className="text-gray-300">
                    {job.next_run ? formatTime(job.next_run) : 'Not scheduled'}
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2">
                  <span className="text-gray-500 text-xs">Last Run</span>
                  <div className="text-gray-300">
                    {job.last_run ? formatTime(job.last_run) : 'Never'}
                    {job.last_status && (
                      <span className={`ml-2 text-xs ${
                        job.last_status === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ({job.last_status})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
