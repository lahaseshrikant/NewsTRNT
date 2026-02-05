// src/app/admin/system/settings/page.tsx - System Settings Dashboard
'use client';

import React, { useState, useEffect } from 'react';
import { SuperAdminRoute } from '@/components/admin/RouteGuard';
import AuditLogger from '@/lib/audit-logger';
import { ROLE_DEFINITIONS, ROLE_HIERARCHY, RoleName } from '@/config/rbac';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface SystemSettings {
  security: {
    mfaEnforcement: 'disabled' | 'optional' | 'required_admins' | 'required_all';
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      preventReuse: number;
    };
    ipWhitelist: string[];
  };
  notifications: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    slackWebhook: string;
    alertOnFailedLogins: boolean;
    alertOnRoleChanges: boolean;
    alertOnBulkActions: boolean;
    alertOnCriticalErrors: boolean;
    alertThresholds: {
      failedLogins: number;
      apiErrors: number;
    };
  };
  content: {
    autoSaveInterval: number;
    maxUploadSize: number;
    allowedFileTypes: string[];
    defaultArticleStatus: 'draft' | 'published';
    requireApproval: boolean;
    approvalRoles: RoleName[];
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  security: {
    mfaEnforcement: 'optional',
    sessionTimeout: 480, // 8 hours in minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5
    },
    ipWhitelist: []
  },
  notifications: {
    emailEnabled: true,
    slackEnabled: false,
    slackWebhook: '',
    alertOnFailedLogins: true,
    alertOnRoleChanges: true,
    alertOnBulkActions: true,
    alertOnCriticalErrors: true,
    alertThresholds: {
      failedLogins: 3,
      apiErrors: 10
    }
  },
  content: {
    autoSaveInterval: 30,
    maxUploadSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'pdf'],
    defaultArticleStatus: 'draft',
    requireApproval: false,
    approvalRoles: ['ADMIN', 'SUPER_ADMIN', 'EDITOR']
  }
};

function SystemSettingsContent() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'content'>('security');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newFileType, setNewFileType] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Try to load from localStorage first (for demo purposes)
      const saved = localStorage.getItem('newstrnt_system_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (for demo purposes)
      localStorage.setItem('newstrnt_system_settings', JSON.stringify(settings));
      AuditLogger.logFromSession('CONFIG_CHANGE', { resource: 'settings', details: { section: activeTab, settings: settings[activeTab] } });
      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = <K extends keyof SystemSettings>(
    section: K,
    key: keyof SystemSettings[K],
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedSettings = <K extends keyof SystemSettings>(
    section: K,
    parentKey: string,
    key: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...(prev[section] as any)[parentKey],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const addToList = (section: keyof SystemSettings, key: string, value: string) => {
    if (!value.trim()) return;
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: [...(prev[section] as any)[key], value.trim()]
      }
    }));
    setHasChanges(true);
  };

  const removeFromList = (section: keyof SystemSettings, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: (prev[section] as any)[key].filter((v: string) => v !== value)
      }
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: 'security', label: '🔐 Security', icon: '🔐' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'content', label: '📝 Content', icon: '📝' }
  ] as const;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure security, notifications, and content policies</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-yellow-600 dark:text-yellow-400">
              Unsaved changes
            </span>
          )}
          <button
            onClick={saveSettings}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* MFA Enforcement */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">🔑 Multi-Factor Authentication</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">MFA Enforcement Level</label>
                    <select
                      value={settings.security.mfaEnforcement}
                      onChange={(e) => updateSettings('security', 'mfaEnforcement', e.target.value)}
                      className="w-full md:w-64 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="disabled">Disabled</option>
                      <option value="optional">Optional (User Choice)</option>
                      <option value="required_admins">Required for Admins Only</option>
                      <option value="required_all">Required for All Users</option>
                    </select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {settings.security.mfaEnforcement === 'disabled' && 'MFA is completely disabled for all users.'}
                      {settings.security.mfaEnforcement === 'optional' && 'Users can optionally enable MFA on their accounts.'}
                      {settings.security.mfaEnforcement === 'required_admins' && 'Super Admins and Admins must enable MFA.'}
                      {settings.security.mfaEnforcement === 'required_all' && 'All users must enable MFA to access the platform.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Settings */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">⏱️ Session Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      min={15}
                      max={1440}
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Max Login Attempts</label>
                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={settings.security.lockoutDuration}
                      onChange={(e) => updateSettings('security', 'lockoutDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Password Policy */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">🔒 Password Policy</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Minimum Length</label>
                      <input
                        type="number"
                        min={6}
                        max={32}
                        value={settings.security.passwordPolicy.minLength}
                        onChange={(e) => updateNestedSettings('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Prevent Reuse (last N passwords)</label>
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={settings.security.passwordPolicy.preventReuse}
                        onChange={(e) => updateNestedSettings('security', 'passwordPolicy', 'preventReuse', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'requireUppercase', label: 'Require Uppercase' },
                      { key: 'requireLowercase', label: 'Require Lowercase' },
                      { key: 'requireNumbers', label: 'Require Numbers' },
                      { key: 'requireSpecialChars', label: 'Require Special Chars' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(settings.security.passwordPolicy as any)[key]}
                          onChange={(e) => updateNestedSettings('security', 'passwordPolicy', key, e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* IP Whitelist */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">🌐 IP Whitelist</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Restrict admin access to specific IP addresses. Leave empty to allow all.
                </p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Enter IP address (e.g., 192.168.1.1)"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                  <button
                    onClick={() => {
                      addToList('security', 'ipWhitelist', newIp);
                      setNewIp('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.security.ipWhitelist.map(ip => (
                    <span key={ip} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                      {ip}
                      <button
                        onClick={() => removeFromList('security', 'ipWhitelist', ip)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {settings.security.ipWhitelist.length === 0 && (
                    <span className="text-sm text-muted-foreground">No IP restrictions (all IPs allowed)</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Alert Channels */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">📬 Notification Channels</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailEnabled}
                      onChange={(e) => updateSettings('notifications', 'emailEnabled', e.target.checked)}
                      className="rounded border-border w-5 h-5"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-foreground">Slack Notifications</p>
                      <p className="text-sm text-muted-foreground">Send alerts to Slack channel</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.slackEnabled}
                      onChange={(e) => updateSettings('notifications', 'slackEnabled', e.target.checked)}
                      className="rounded border-border w-5 h-5"
                    />
                  </label>
                  {settings.notifications.slackEnabled && (
                    <div className="ml-4">
                      <label className="block text-sm font-medium text-foreground mb-1">Slack Webhook URL</label>
                      <input
                        type="url"
                        placeholder="https://hooks.slack.com/services/..."
                        value={settings.notifications.slackWebhook}
                        onChange={(e) => updateSettings('notifications', 'slackWebhook', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Alert Types */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">🚨 Alert Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'alertOnFailedLogins', label: 'Failed Login Attempts', description: 'Alert when multiple login failures occur' },
                    { key: 'alertOnRoleChanges', label: 'Role Changes', description: 'Alert when user roles are modified' },
                    { key: 'alertOnBulkActions', label: 'Bulk Actions', description: 'Alert when bulk user actions are performed' },
                    { key: 'alertOnCriticalErrors', label: 'Critical Errors', description: 'Alert on critical system errors' }
                  ].map(({ key, label, description }) => (
                    <label key={key} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(settings.notifications as any)[key]}
                        onChange={(e) => updateSettings('notifications', key as keyof SystemSettings['notifications'], e.target.checked)}
                        className="rounded border-border mt-1"
                      />
                      <div>
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Alert Thresholds */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">📊 Alert Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Failed Logins Before Alert
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={settings.notifications.alertThresholds.failedLogins}
                      onChange={(e) => updateNestedSettings('notifications', 'alertThresholds', 'failedLogins', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert after this many consecutive failed login attempts
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      API Errors Before Alert (per hour)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.notifications.alertThresholds.apiErrors}
                      onChange={(e) => updateNestedSettings('notifications', 'alertThresholds', 'apiErrors', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert if this many API errors occur within an hour
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Settings */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Auto-Save & Uploads */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">💾 Auto-Save & Uploads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Auto-Save Interval (seconds)</label>
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={settings.content.autoSaveInterval}
                      onChange={(e) => updateSettings('content', 'autoSaveInterval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Max Upload Size (MB)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.content.maxUploadSize}
                      onChange={(e) => updateSettings('content', 'maxUploadSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Allowed File Types */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">📁 Allowed File Types</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Enter file extension (e.g., pdf)"
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                  <button
                    onClick={() => {
                      addToList('content', 'allowedFileTypes', newFileType);
                      setNewFileType('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.content.allowedFileTypes.map(type => (
                    <span key={type} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                      .{type}
                      <button
                        onClick={() => removeFromList('content', 'allowedFileTypes', type)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Workflow */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">📋 Content Workflow</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Default Article Status</label>
                    <select
                      value={settings.content.defaultArticleStatus}
                      onChange={(e) => updateSettings('content', 'defaultArticleStatus', e.target.value)}
                      className="w-full md:w-64 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-foreground">Require Approval for Publishing</p>
                      <p className="text-sm text-muted-foreground">Articles must be approved before publishing</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.content.requireApproval}
                      onChange={(e) => updateSettings('content', 'requireApproval', e.target.checked)}
                      className="rounded border-border w-5 h-5"
                    />
                  </label>
                  {settings.content.requireApproval && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Roles That Can Approve</label>
                      <div className="flex flex-wrap gap-2">
                        {ROLE_HIERARCHY.map(role => (
                          <label key={role} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.content.approvalRoles.includes(role)}
                              onChange={(e) => {
                                const newRoles = e.target.checked
                                  ? [...settings.content.approvalRoles, role]
                                  : settings.content.approvalRoles.filter(r => r !== role);
                                updateSettings('content', 'approvalRoles', newRoles);
                              }}
                              className="rounded border-border"
                            />
                            <span className="text-sm">{ROLE_DEFINITIONS[role]?.icon} {role}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SystemSettingsPage() {
  return (
    <SuperAdminRoute>
      <SystemSettingsContent />
    </SuperAdminRoute>
  );
}
