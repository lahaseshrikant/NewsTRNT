// src/app/admin/system/security/page.tsx - System Security Settings
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import { API_CONFIG } from '@/config/api';
import adminAuth from '@/lib/admin-auth';

const API_BASE_URL = API_CONFIG.baseURL;

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'password_change' | 'mfa_enabled' | 'suspicious_activity' | 'ip_blocked';
  description: string;
  user?: string;
  ip: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecuritySettings {
  mfaRequired: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  passwordRequireNumbers: boolean;
  passwordExpiry: number;
  ipWhitelistEnabled: boolean;
  rateLimiting: boolean;
  bruteForceProtection: boolean;
}

interface SecurityStats {
  securityScore: number;
  failedLogins24h: number;
  blockedIps: number;
  activeSessions: number;
}

function SecurityContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'policies' | 'firewall'>('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState<SecurityStats>({ securityScore: 0, failedLogins24h: 0, blockedIps: 0, activeSessions: 0 });
  const [settings, setSettings] = useState<SecuritySettings>({
    mfaRequired: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 12,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordExpiry: 90,
    ipWhitelistEnabled: false,
    rateLimiting: true,
    bruteForceProtection: true
  });

  const fetchSecurityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = adminAuth.getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [eventsRes, statsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/system/security/events`, { headers }),
        fetch(`${API_BASE_URL}/admin/system/security/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/system/security/settings`, { headers })
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setSecurityEvents(data.events || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || { securityScore: 0, failedLogins24h: 0, blockedIps: 0, activeSessions: 0 });
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    } catch (err) {
      console.error('Error fetching security data:', err);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSecuritySettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/system/security/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving security settings:', err);
      setError('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity];
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    const icons = {
      login_attempt: '🔑',
      password_change: '🔒',
      mfa_enabled: '📱',
      suspicious_activity: '⚠️',
      ip_blocked: '🚫'
    };
    return icons[type];
  };

  const highSeverityCount = securityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length;

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
          <button onClick={fetchSecurityData} className="ml-4 underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Settings</h1>
          <p className="text-muted-foreground">Configure system security and view security events</p>
        </div>
        {highSeverityCount > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            🚨 {highSeverityCount} high priority event(s)
          </span>
        )}
      </div>

      {/* Security Score */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100">Security Score</p>
            <p className="text-4xl font-bold">{stats.securityScore || 0}/100</p>
            <p className="text-green-100 text-sm mt-2">
              {stats.securityScore >= 80 ? 'Good - System is well protected' : 
               stats.securityScore >= 60 ? 'Fair - Some improvements recommended' : 
               'Needs attention - Review security settings'}
            </p>
          </div>
          <div className="text-6xl">🛡️</div>
        </div>
        <div className="mt-4 h-2 bg-green-400/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: `${stats.securityScore || 0}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['overview', 'events', 'policies', 'firewall'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' ? '📊 Overview' : 
             tab === 'events' ? '📋 Events' : 
             tab === 'policies' ? '📜 Policies' : '🔥 Firewall'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Two-Factor Auth</p>
                <p className="text-xl font-bold text-foreground">78%</p>
                <p className="text-xs text-muted-foreground">of admins enabled</p>
              </div>
              <span className="text-3xl">📱</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins (24h)</p>
                <p className="text-xl font-bold text-red-600">23</p>
                <p className="text-xs text-muted-foreground">5 IPs blocked</p>
              </div>
              <span className="text-3xl">🔑</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-xl font-bold text-blue-600">12</p>
                <p className="text-xs text-muted-foreground">across 8 users</p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SSL Certificate</p>
                <p className="text-xl font-bold text-green-600">Valid</p>
                <p className="text-xs text-muted-foreground">Expires in 245 days</p>
              </div>
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Security Scan</p>
                <p className="text-xl font-bold text-green-600">Passed</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rate Limiting</p>
                <p className="text-xl font-bold text-green-600">Active</p>
                <p className="text-xs text-muted-foreground">100 req/min per IP</p>
              </div>
              <span className="text-3xl">⚡</span>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Security Events</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">Export Log</button>
          </div>
          <div className="divide-y divide-border">
            {securityEvents.map(event => (
              <div key={event.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{getEventIcon(event.type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{event.description}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {event.user && <span>👤 {event.user}</span>}
                        <span>🌐 {event.ip}</span>
                        <span>🕐 {new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Authentication Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Require MFA for all admins</p>
                  <p className="text-sm text-muted-foreground">Force two-factor authentication</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, mfaRequired: !settings.mfaRequired })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.mfaRequired ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.mfaRequired ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div>
                <label className="block font-medium text-foreground mb-2">Session Timeout (minutes)</label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-foreground mb-2">Max Login Attempts</label>
                <select
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                >
                  <option value={3}>3 attempts</option>
                  <option value={5}>5 attempts</option>
                  <option value={10}>10 attempts</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Password Policy</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-foreground mb-2">Minimum Password Length</label>
                <input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({ ...settings, passwordMinLength: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.passwordRequireSpecial}
                  onChange={(e) => setSettings({ ...settings, passwordRequireSpecial: e.target.checked })}
                  className="rounded"
                />
                <label className="text-foreground">Require special characters (!@#$%)</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.passwordRequireNumbers}
                  onChange={(e) => setSettings({ ...settings, passwordRequireNumbers: e.target.checked })}
                  className="rounded"
                />
                <label className="text-foreground">Require numbers</label>
              </div>
              <div>
                <label className="block font-medium text-foreground mb-2">Password Expiry (days)</label>
                <select
                  value={settings.passwordExpiry}
                  onChange={(e) => setSettings({ ...settings, passwordExpiry: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>
          </div>
          
          <button 
            onClick={saveSecuritySettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Security Policies'}
          </button>
        </div>
      )}

      {/* Firewall Tab */}
      {activeTab === 'firewall' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Firewall Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Rate Limiting</p>
                  <p className="text-sm text-muted-foreground">Limit requests per IP address</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, rateLimiting: !settings.rateLimiting })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.rateLimiting ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.rateLimiting ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Brute Force Protection</p>
                  <p className="text-sm text-muted-foreground">Auto-block after failed attempts</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, bruteForceProtection: !settings.bruteForceProtection })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.bruteForceProtection ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.bruteForceProtection ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">IP Whitelist</p>
                  <p className="text-sm text-muted-foreground">Only allow specific IPs</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, ipWhitelistEnabled: !settings.ipWhitelistEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.ipWhitelistEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.ipWhitelistEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Blocked IPs</h3>
            <div className="space-y-2">
              {['198.51.100.23', '203.0.113.50', '192.0.2.100'].map(ip => (
                <div key={ip} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-red-600">🚫</span>
                    <span className="font-mono text-foreground">{ip}</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">Unblock</button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Enter IP address to block"
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
              />
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Block IP
              </button>
            </div>
          </div>
          
          <button 
            onClick={saveSecuritySettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Firewall Settings'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SecurityPage() {
  return (
    <SuperAdminRoute>
      <SecurityContent />
    </SuperAdminRoute>
  );
}

