// src/app/admin/access/security/page.tsx - Security Settings
// Configure security policies for admin access
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SuperAdminRoute } from '@/components/admin/RouteGuard';
import AuditLogger from '@/lib/audit-logger';

interface SecuritySettings {
  mfa: {
    enforcement: 'disabled' | 'optional' | 'required_admins' | 'required_all';
    methods: string[];
    gracePeriodDays: number;
  };
  sessions: {
    maxConcurrent: number;
    timeoutMinutes: number;
    requireReauthForSensitive: boolean;
  };
  passwords: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expirationDays: number;
    historyCount: number;
  };
  access: {
    ipWhitelist: string[];
    ipWhitelistEnabled: boolean;
    allowedCountries: string[];
    blockVpn: boolean;
    requireEmailVerification: boolean;
  };
  alerts: {
    failedLoginThreshold: number;
    suspiciousActivityNotify: boolean;
    newDeviceNotify: boolean;
    adminActionNotify: boolean;
  };
}

function SecuritySettingsContent() {
  const [settings, setSettings] = useState<SecuritySettings>({
    mfa: {
      enforcement: 'optional',
      methods: ['authenticator', 'email'],
      gracePeriodDays: 7
    },
    sessions: {
      maxConcurrent: 3,
      timeoutMinutes: 60,
      requireReauthForSensitive: true
    },
    passwords: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      expirationDays: 90,
      historyCount: 5
    },
    access: {
      ipWhitelist: [],
      ipWhitelistEnabled: false,
      allowedCountries: [],
      blockVpn: false,
      requireEmailVerification: true
    },
    alerts: {
      failedLoginThreshold: 5,
      suspiciousActivityNotify: true,
      newDeviceNotify: true,
      adminActionNotify: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'mfa' | 'sessions' | 'passwords' | 'access' | 'alerts'>('mfa');
  const [newIp, setNewIp] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    // In production, load from API
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      AuditLogger.log({
        action: 'CONFIG_CHANGE',
        resource: 'security-settings',
        details: `Updated security settings: ${activeTab}`,
        severity: 'HIGH'
      });
      
      alert('Security settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addIpToWhitelist = () => {
    if (!newIp || settings.access.ipWhitelist.includes(newIp)) return;
    
    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(newIp)) {
      alert('Please enter a valid IP address or CIDR range');
      return;
    }
    
    setSettings({
      ...settings,
      access: {
        ...settings.access,
        ipWhitelist: [...settings.access.ipWhitelist, newIp]
      }
    });
    setNewIp('');
  };

  const removeIpFromWhitelist = (ip: string) => {
    setSettings({
      ...settings,
      access: {
        ...settings.access,
        ipWhitelist: settings.access.ipWhitelist.filter(i => i !== ip)
      }
    });
  };

  const tabs = [
    { id: 'mfa', label: 'Multi-Factor Auth', icon: '🔐' },
    { id: 'sessions', label: 'Sessions', icon: '🔌' },
    { id: 'passwords', label: 'Password Policy', icon: '🔑' },
    { id: 'access', label: 'Access Control', icon: '🌐' },
    { id: 'alerts', label: 'Security Alerts', icon: '🚨' }
  ] as const;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin/access" className="hover:text-foreground">Access Control</Link>
            <span>/</span>
            <span className="text-foreground">Security Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🛡️ Security Settings
          </h1>
          <p className="text-muted-foreground">
            Configure security policies for admin access
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>💾 Save Changes</>
          )}
        </button>
      </div>

      {/* Security Score */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Security Score</h2>
            <p className="text-sm text-muted-foreground">Based on your current configuration</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">85</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="12"
                  fill="none"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="12"
                  fill="none"
                  className="stroke-green-500"
                  strokeDasharray={`${85 * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🛡️</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-foreground ml-2">MFA Available</span>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-foreground ml-2">Strong Password Policy</span>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <span className="text-yellow-600">⚠</span>
            <span className="text-sm text-foreground ml-2">MFA Not Enforced</span>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <span className="text-yellow-600">⚠</span>
            <span className="text-sm text-foreground ml-2">IP Whitelist Disabled</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs */}
          <div className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-card border border-border hover:bg-muted'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bg-card border border-border rounded-xl p-6">
            {/* MFA Settings */}
            {activeTab === 'mfa' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  🔐 Multi-Factor Authentication
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    MFA Enforcement
                  </label>
                  <select
                    value={settings.mfa.enforcement}
                    onChange={(e) => setSettings({
                      ...settings,
                      mfa: { ...settings.mfa, enforcement: e.target.value as any }
                    })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="disabled">Disabled - MFA not available</option>
                    <option value="optional">Optional - Users can enable MFA</option>
                    <option value="required_admins">Required for Admins - Super Admins and Admins must use MFA</option>
                    <option value="required_all">Required for All - All users must use MFA</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls whether multi-factor authentication is available or required
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Allowed MFA Methods
                  </label>
                  <div className="space-y-2">
                    {['authenticator', 'sms', 'email', 'hardware_key'].map((method) => (
                      <label key={method} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={settings.mfa.methods.includes(method)}
                          onChange={(e) => {
                            const methods = e.target.checked
                              ? [...settings.mfa.methods, method]
                              : settings.mfa.methods.filter(m => m !== method);
                            setSettings({
                              ...settings,
                              mfa: { ...settings.mfa, methods }
                            });
                          }}
                          className="rounded border-border"
                        />
                        <span className="text-lg">
                          {method === 'authenticator' && '📱'}
                          {method === 'sms' && '📨'}
                          {method === 'email' && '📧'}
                          {method === 'hardware_key' && '🔑'}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">
                            {method === 'authenticator' && 'Authenticator App'}
                            {method === 'sms' && 'SMS Verification'}
                            {method === 'email' && 'Email Verification'}
                            {method === 'hardware_key' && 'Hardware Security Key'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {method === 'authenticator' && 'Google Authenticator, Authy, etc.'}
                            {method === 'sms' && 'One-time code via text message'}
                            {method === 'email' && 'One-time code via email'}
                            {method === 'hardware_key' && 'YubiKey, Titan, etc.'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Grace Period (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={settings.mfa.gracePeriodDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      mfa: { ...settings.mfa, gracePeriodDays: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Days users have to set up MFA after it becomes required (0 = immediate)
                  </p>
                </div>
              </div>
            )}

            {/* Session Settings */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  🔌 Session Management
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Maximum Concurrent Sessions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.sessions.maxConcurrent}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, maxConcurrent: parseInt(e.target.value) || 1 }
                    })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum number of devices a user can be logged in from simultaneously
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessions.timeoutMinutes}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, timeoutMinutes: parseInt(e.target.value) || 60 }
                    })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Time of inactivity before a user is automatically logged out
                  </p>
                </div>

                <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={settings.sessions.requireReauthForSensitive}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, requireReauthForSensitive: e.target.checked }
                    })}
                    className="rounded border-border"
                  />
                  <div>
                    <p className="font-medium text-foreground">Require Re-authentication for Sensitive Actions</p>
                    <p className="text-xs text-muted-foreground">
                      Users must enter password/MFA again for critical operations
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Password Policy */}
            {activeTab === 'passwords' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  🔑 Password Policy
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="128"
                    value={settings.passwords.minLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwords: { ...settings.passwords, minLength: parseInt(e.target.value) || 12 }
                    })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password Requirements
                  </label>
                  {[
                    { key: 'requireUppercase', label: 'Require Uppercase Letters (A-Z)' },
                    { key: 'requireLowercase', label: 'Require Lowercase Letters (a-z)' },
                    { key: 'requireNumbers', label: 'Require Numbers (0-9)' },
                    { key: 'requireSymbols', label: 'Require Symbols (!@#$%...)' }
                  ].map((req) => (
                    <label key={req.key} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={(settings.passwords as any)[req.key]}
                        onChange={(e) => setSettings({
                          ...settings,
                          passwords: { ...settings.passwords, [req.key]: e.target.checked }
                        })}
                        className="rounded border-border"
                      />
                      <span className="text-foreground">{req.label}</span>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password Expiration (days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={settings.passwords.expirationDays}
                      onChange={(e) => setSettings({
                        ...settings,
                        passwords: { ...settings.passwords, expirationDays: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      0 = never expires
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password History Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={settings.passwords.historyCount}
                      onChange={(e) => setSettings({
                        ...settings,
                        passwords: { ...settings.passwords, historyCount: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Prevent reuse of last N passwords
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Access Control */}
            {activeTab === 'access' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  🌐 Access Control
                </h2>
                
                <div>
                  <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={settings.access.ipWhitelistEnabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        access: { ...settings.access, ipWhitelistEnabled: e.target.checked }
                      })}
                      className="rounded border-border"
                    />
                    <div>
                      <p className="font-medium text-foreground">Enable IP Whitelist</p>
                      <p className="text-xs text-muted-foreground">
                        Only allow access from specified IP addresses
                      </p>
                    </div>
                  </label>
                  
                  {settings.access.ipWhitelistEnabled && (
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newIp}
                          onChange={(e) => setNewIp(e.target.value)}
                          placeholder="Enter IP address or CIDR (e.g., 192.168.1.0/24)"
                          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={addIpToWhitelist}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {settings.access.ipWhitelist.map((ip) => (
                          <div key={ip} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <code className="text-foreground">{ip}</code>
                            <button
                              onClick={() => removeIpFromWhitelist(ip)}
                              className="text-red-600 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {settings.access.ipWhitelist.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No IP addresses whitelisted
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={settings.access.blockVpn}
                    onChange={(e) => setSettings({
                      ...settings,
                      access: { ...settings.access, blockVpn: e.target.checked }
                    })}
                    className="rounded border-border"
                  />
                  <div>
                    <p className="font-medium text-foreground">Block VPN/Proxy Connections</p>
                    <p className="text-xs text-muted-foreground">
                      Deny access from known VPN and proxy services
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={settings.access.requireEmailVerification}
                    onChange={(e) => setSettings({
                      ...settings,
                      access: { ...settings.access, requireEmailVerification: e.target.checked }
                    })}
                    className="rounded border-border"
                  />
                  <div>
                    <p className="font-medium text-foreground">Require Email Verification</p>
                    <p className="text-xs text-muted-foreground">
                      Users must verify their email before accessing admin features
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Security Alerts */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  🚨 Security Alerts
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Failed Login Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.alerts.failedLoginThreshold}
                    onChange={(e) => setSettings({
                      ...settings,
                      alerts: { ...settings.alerts, failedLoginThreshold: parseInt(e.target.value) || 5 }
                    })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of failed login attempts before triggering an alert
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'suspiciousActivityNotify', label: 'Suspicious Activity', desc: 'Alert on unusual patterns or potential attacks' },
                    { key: 'newDeviceNotify', label: 'New Device Login', desc: 'Notify when logging in from a new device' },
                    { key: 'adminActionNotify', label: 'Admin Actions', desc: 'Notify on critical admin operations' }
                  ].map((alert) => (
                    <label key={alert.key} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={(settings.alerts as any)[alert.key]}
                        onChange={(e) => setSettings({
                          ...settings,
                          alerts: { ...settings.alerts, [alert.key]: e.target.checked }
                        })}
                        className="rounded border-border"
                      />
                      <div>
                        <p className="font-medium text-foreground">{alert.label}</p>
                        <p className="text-xs text-muted-foreground">{alert.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SecuritySettingsPage() {
  return (
    <SuperAdminRoute>
      <SecuritySettingsContent />
    </SuperAdminRoute>
  );
}
