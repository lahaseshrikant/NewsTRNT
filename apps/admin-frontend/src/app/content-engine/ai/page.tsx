'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAuth from '@/lib/admin-auth';

interface AIStatus {
  provider: string;
  model: string;
  available: boolean;
  features: string[];
}

export default function AIProcessingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [activeTest, setActiveTest] = useState<string>('summarize');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/content-engine/ai/status`, {
        headers: adminAuth.getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch (err) {
      console.error('[AI] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) { router.push('/login'); return; }
    fetchStatus();
  }, [fetchStatus, router]);

  const runTest = async () => {
    if (!testInput.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const body: Record<string, any> = {};
      if (activeTest === 'summarize') {
        body.title = 'Test Article';
        body.content = testInput;
        body.max_length = 100;
      } else if (activeTest === 'classify') {
        body.title = testInput;
        body.content = testInput;
      } else if (activeTest === 'sentiment') {
        body.text = testInput;
      } else if (activeTest === 'seo') {
        body.title = testInput;
        body.content = testInput;
      }

      // These go through the proxy, which routes to content-engine
      // For now, show the request that would be made
      setTestResult({
        note: 'Direct AI testing requires Content Engine to be running.',
        endpoint: `/ai/${activeTest}`,
        request: body,
      });
    } catch {
      showToast('Test failed', 'error');
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
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

      <div>
        <h1 className="text-2xl font-bold text-white">🧠 AI Processing</h1>
        <p className="text-gray-400 text-sm mt-1">AI provider status and processing tools</p>
      </div>

      {/* AI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-xs mb-1">Provider</div>
          <div className="text-white font-semibold text-lg">{status?.provider || 'OpenAI'}</div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-xs mb-1">Model</div>
          <div className="text-purple-400 font-semibold text-lg">{status?.model || 'gpt-3.5-turbo'}</div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-xs mb-1">Status</div>
          <div className={`font-semibold text-lg ${status?.available ? 'text-green-400' : 'text-red-400'}`}>
            {status?.available ? '● Connected' : '○ Unavailable'}
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-xs mb-1">Features</div>
          <div className="text-blue-400 font-semibold text-lg">{status?.features?.length || 5}</div>
        </div>
      </div>

      {/* Feature List */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">AI Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '📝', name: 'Summarization', desc: 'Generate concise 60-100 word summaries from full articles', color: 'blue' },
            { icon: '🏷️', name: 'Classification', desc: 'Auto-categorize into 12 news categories using keyword + AI', color: 'green' },
            { icon: '😊', name: 'Sentiment Analysis', desc: 'Detect article sentiment: positive, negative, or neutral', color: 'yellow' },
            { icon: '🔍', name: 'SEO Optimization', desc: 'Generate slugs, meta descriptions, keywords, and schema markup', color: 'purple' },
            { icon: '📰', name: 'Headline Generation', desc: 'Create alternative engaging headlines for articles', color: 'pink' },
            { icon: '💬', name: 'Key Quote Extraction', desc: 'Pull important quotes from article content', color: 'cyan' },
          ].map((f) => (
            <div key={f.name} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{f.icon}</span>
                <span className="text-white font-medium">{f.name}</span>
              </div>
              <p className="text-xs text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Test Area */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">🧪 Test AI Processing</h2>

        {/* Test Type Tabs */}
        <div className="flex gap-2 mb-4">
          {['summarize', 'classify', 'sentiment', 'seo'].map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTest(t); setTestResult(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                activeTest === t
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-gray-800/30 border-gray-700/20 text-gray-400 hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder={
            activeTest === 'summarize'
              ? 'Paste article content to summarize...'
              : activeTest === 'classify'
              ? 'Enter article title and content to classify...'
              : activeTest === 'sentiment'
              ? 'Enter text to analyze sentiment...'
              : 'Enter article title and content for SEO analysis...'
          }
          rows={4}
          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-gray-200 text-sm resize-none focus:outline-none focus:border-purple-500/50 mb-3"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={runTest}
            disabled={testLoading || !testInput.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              testLoading
                ? 'bg-purple-500/20 text-purple-300 animate-pulse'
                : 'bg-purple-600 text-white hover:bg-purple-500'
            }`}
          >
            {testLoading ? 'Processing...' : `Run ${activeTest}`}
          </button>
          <span className="text-xs text-gray-500">
            Requires Content Engine to be running on port 8000
          </span>
        </div>

        {/* Result */}
        {testResult && (
          <div className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700/30">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Result</h3>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
