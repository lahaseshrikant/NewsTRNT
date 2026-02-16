// src/app/admin/moderation/spam/page.tsx - Spam Filter Management
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminRoute } from '@/components/auth/RouteGuard';
import adminAuth from '@/lib/admin-auth';
import { getEmailString } from '@/lib/utils';
import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.baseURL;

interface SpamRule {
  id: string;
  name: string;
  type: 'keyword' | 'pattern' | 'ip' | 'email_domain';
  value: string;
  action: 'block' | 'flag' | 'quarantine';
  hits: number;
  enabled: boolean;
  createdAt: string;
}

interface SpamEntry {
  id: string;
  type: 'comment' | 'user' | 'submission';
  content: string;
  author: string;
  authorEmail: string;
  authorIp: string;
  reason: string;
  confidence: number;
  detectedAt: string;
  status: 'quarantined' | 'blocked' | 'approved' | 'deleted';
}

interface SpamStats {
  blockedToday: number;
  quarantined: number;
  falsePositives: number;
  detectionRate: number;
}

function SpamFilterContent() {
  const [activeTab, setActiveTab] = useState<'queue' | 'rules' | 'settings'>('queue');
  const [spamQueue, setSpamQueue] = useState<SpamEntry[]>([]);
  const [rules, setRules] = useState<SpamRule[]>([]);
  const [stats, setStats] = useState<SpamStats>({ blockedToday: 0, quarantined: 0, falsePositives: 0, detectionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', type: 'keyword' as SpamRule['type'], value: '', action: 'flag' as SpamRule['action'] });

  const fetchSpamData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' };

      const [queueRes, rulesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/moderation/spam/queue`, { headers }),
        fetch(`${API_BASE_URL}/admin/moderation/spam/rules`, { headers }),
        fetch(`${API_BASE_URL}/admin/moderation/spam/stats`, { headers })
      ]);

      if (queueRes.ok) {
        const data = await queueRes.json();
        setSpamQueue(data.queue || []);
      }

      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setRules(data.rules || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || { blockedToday: 0, quarantined: 0, falsePositives: 0, detectionRate: 0 });
      }
    } catch (err) {
      console.error('Error fetching spam data:', err);
      setError('Failed to load spam data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpamData();
  }, [fetchSpamData]);

  const handleSpamAction = async (id: string, action: 'approve' | 'delete') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/moderation/spam/${id}/${action}`, {
        method: 'POST',
        headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        fetchSpamData();
      }
    } catch (err) {
      console.error('Error handling spam action:', err);
    }
  };

  const handleToggleRule = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/moderation/spam/rules/${id}/toggle`, {
        method: 'POST',
        headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        fetchSpamData();
      }
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.name || !newRule.value) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/moderation/spam/rules`, {
        method: 'POST',
        headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      
      if (response.ok) {
        setNewRule({ name: '', type: 'keyword', value: '', action: 'flag' });
        setShowAddRule(false);
        fetchSpamData();
      }
    } catch (err) {
      console.error('Error adding rule:', err);
    }
  };

  const quarantinedCount = spamQueue.filter(s => s.status === 'quarantined').length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
          <button onClick={fetchSpamData} className="ml-4 underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Spam Filter</h1>
          <p className="text-muted-foreground">Manage spam detection and filtering rules</p>
        </div>
        <div className="flex gap-2">
          {quarantinedCount > 0 && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              🚫 {quarantinedCount} Quarantined
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Blocked Today</p>
          <p className="text-2xl font-bold text-red-600">{stats.blockedToday}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Quarantined</p>
          <p className="text-2xl font-bold text-orange-600">{stats.quarantined || quarantinedCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">False Positives</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.falsePositives}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Detection Rate</p>
          <p className="text-2xl font-bold text-green-600">{stats.detectionRate}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['queue', 'rules', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'queue' ? '📥 Spam Queue' : tab === 'rules' ? '⚙️ Filter Rules' : '🔧 Settings'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'queue' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {spamQueue.filter(s => s.status === 'quarantined').map(entry => (
                <div key={entry.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          entry.confidence >= 90 ? 'bg-red-100 text-red-800' :
                          entry.confidence >= 70 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entry.confidence}% spam
                        </span>
                        <span className="text-xs text-muted-foreground">{entry.type}</span>
                      </div>
                      <p className="text-foreground bg-muted/50 p-2 rounded text-sm">{entry.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>👤 {entry.author}</span>
                        <span>📧 {getEmailString(entry.authorEmail)}</span>
                        <span>🌐 {entry.authorIp}</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">⚠️ {entry.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSpamAction(entry.id, 'approve')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleSpamAction(entry.id, 'delete')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        ✗ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {spamQueue.filter(s => s.status === 'quarantined').length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  ✓ No items in spam queue
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddRule(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ➕ Add Rule
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {rules.map(rule => (
                <div key={rule.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        rule.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <div>
                      <p className="font-medium text-foreground">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.type}: {rule.value.length > 50 ? rule.value.substring(0, 50) + '...' : rule.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      rule.action === 'block' ? 'bg-red-100 text-red-800' :
                      rule.action === 'quarantine' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rule.action}
                    </span>
                    <span className="text-sm text-muted-foreground">{rule.hits} hits</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="font-semibold text-foreground">Spam Filter Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Enable Spam Filter</p>
                <p className="text-sm text-muted-foreground">Automatically detect and filter spam content</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-green-500">
                <div className="w-5 h-5 rounded-full bg-white shadow translate-x-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">AI-Powered Detection</p>
                <p className="text-sm text-muted-foreground">Use machine learning for better detection</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-green-500">
                <div className="w-5 h-5 rounded-full bg-white shadow translate-x-6" />
              </button>
            </div>
            
            <div>
              <label className="block font-medium text-foreground mb-2">Sensitivity Level</label>
              <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground">
                <option value="low">Low - Only obvious spam</option>
                <option value="medium">Medium - Balanced detection</option>
                <option value="high">High - Aggressive filtering</option>
              </select>
            </div>
            
            <div>
              <label className="block font-medium text-foreground mb-2">Default Action</label>
              <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground">
                <option value="quarantine">Quarantine for review</option>
                <option value="flag">Flag for moderation</option>
                <option value="block">Block immediately</option>
              </select>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Settings
          </button>
        </div>
      )}

      {/* Add Rule Modal */}
      {showAddRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Add Filter Rule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="keyword">Keywords</option>
                  <option value="pattern">Regex Pattern</option>
                  <option value="ip">IP Address</option>
                  <option value="email_domain">Email Domain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Value</label>
                <textarea
                  value={newRule.value}
                  onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                  placeholder="Comma-separated values or regex pattern"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Action</label>
                <select
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="flag">Flag for review</option>
                  <option value="quarantine">Quarantine</option>
                  <option value="block">Block</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowAddRule(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRule}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpamFilterPage() {
  return (
    <AdminRoute>
      <SpamFilterContent />
    </AdminRoute>
  );
}

