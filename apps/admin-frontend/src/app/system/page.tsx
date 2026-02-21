"use client";

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { showToast } from '@/lib/toast';
import UnifiedAdminGuard from '@/components/auth/UnifiedAdminGuard';
import adminAuth from '@/lib/admin-auth';

interface SystemSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  value: any;
  options?: string[];
  placeholder?: string;
}

const SystemSettings: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState<SystemSetting[]>([
    // General Settings
    {
      id: 'site_maintenance',
      category: 'general',
      name: 'Maintenance Mode',
      description: 'Enable maintenance mode to temporarily disable public access',
      type: 'boolean',
      value: false
    },
    {
      id: 'site_registration',
      category: 'general',
      name: 'User Registration',
      description: 'Allow new users to register accounts',
      type: 'boolean',
      value: true
    },
    {
      id: 'articles_per_page',
      category: 'general',
      name: 'Articles Per Page',
      description: 'Number of articles to display per page',
      type: 'number',
      value: 10
    },
    {
      id: 'default_language',
      category: 'general',
      name: 'Default Language',
      description: 'Default language for the website',
      type: 'select',
      value: 'en',
      options: ['en', 'es', 'fr', 'de', 'it']
    },

    // Security Settings
    {
      id: 'password_min_length',
      category: 'security',
      name: 'Minimum Password Length',
      description: 'Minimum number of characters required for passwords',
      type: 'number',
      value: 8
    },
    {
      id: 'session_timeout',
      category: 'security',
      name: 'Session Timeout (minutes)',
      description: 'Automatic logout after inactivity',
      type: 'number',
      value: 60
    },
    {
      id: 'two_factor_auth',
      category: 'security',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for admin accounts',
      type: 'boolean',
      value: false
    },
    {
      id: 'rate_limiting',
      category: 'security',
      name: 'API Rate Limiting',
      description: 'Enable rate limiting for API endpoints',
      type: 'boolean',
      value: true
    },

    // Email Settings
    {
      id: 'smtp_host',
      category: 'email',
      name: 'SMTP Host',
      description: 'SMTP server hostname',
      type: 'string',
      value: 'smtp.newstrnt.com',
      placeholder: 'smtp.example.com'
    },
    {
      id: 'smtp_port',
      category: 'email',
      name: 'SMTP Port',
      description: 'SMTP server port number',
      type: 'number',
      value: 587
    },
    {
      id: 'email_notifications',
      category: 'email',
      name: 'Email Notifications',
      description: 'Send email notifications for system events',
      type: 'boolean',
      value: true
    },
    {
      id: 'newsletter_from_email',
      category: 'email',
      name: 'Newsletter From Email',
      description: 'Email address used for newsletter campaigns',
      type: 'string',
      value: 'newsletter@newstrnt.com',
      placeholder: 'newsletter@example.com'
    },

    // Performance Settings
    {
      id: 'cache_enabled',
      category: 'performance',
      name: 'Page Caching',
      description: 'Enable page caching for better performance',
      type: 'boolean',
      value: true
    },
    {
      id: 'cache_duration',
      category: 'performance',
      name: 'Cache Duration (minutes)',
      description: 'How long to cache pages',
      type: 'number',
      value: 30
    },
    {
      id: 'image_optimization',
      category: 'performance',
      name: 'Image Optimization',
      description: 'Automatically optimize uploaded images',
      type: 'boolean',
      value: true
    },
    {
      id: 'cdn_enabled',
      category: 'performance',
      name: 'CDN Integration',
      description: 'Use CDN for static assets',
      type: 'boolean',
      value: false
    },

    // API Settings
    {
      id: 'api_enabled',
      category: 'api',
      name: 'Public API',
      description: 'Enable public API endpoints',
      type: 'boolean',
      value: true
    },
    {
      id: 'api_rate_limit',
      category: 'api',
      name: 'API Rate Limit (requests/hour)',
      description: 'Maximum API requests per hour per user',
      type: 'number',
      value: 1000
    },
    {
      id: 'webhook_enabled',
      category: 'api',
      name: 'Webhooks',
      description: 'Enable webhook notifications',
      type: 'boolean',
      value: false
    }
  ]);

  const [loadingMaintenance, setLoadingMaintenance] = useState(true);

  // fetch current maintenance state on mount
  useEffect(() => {
    fetch('/api/market/auto-update', { headers: { ...adminAuth.getAuthHeaders() } })
      .then(res => res.json())
      .then(data => {
        const enabled = !!data?.data?.enabled;
        setSettings(prev => prev.map(s =>
          s.id === 'site_maintenance' ? { ...s, value: enabled } : s
        ));
      })
      .catch(err => console.error('fetch status', err))
      .finally(() => setLoadingMaintenance(false));
  }, []);

  const categories = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'api', name: 'API & Integrations', icon: '🔌' }
  ];

  const updateSetting = async (settingId: string, value: any) => {
    if (settingId === 'site_maintenance') {
      try {
        const res = await fetch('/api/market/auto-update', {
          method: 'POST',
          headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: value ? 'stop' : 'start' }),
        });
        if (!res.ok) {
          const text = await res.text();
          console.error('toggle maintenance bad status', res.status, text);
          throw new Error(`status ${res.status}`);
        }
        setSettings(prev => prev.map(setting => 
          setting.id === settingId ? { ...setting, value } : setting
        ));
        showToast('Maintenance mode updated', 'success');
      } catch (err) {
        console.error('toggle maintenance', err);
        showToast('Failed to update maintenance mode', 'error');
      }
      return;
    }
    setSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ));
  };

  const filteredSettings = settings.filter(setting => setting.category === activeCategory);

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value}
              disabled={setting.id === 'site_maintenance' && loadingMaintenance}
              onChange={(e) => updateSetting(setting.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-blue-600"></div>
          </label>
        );
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground w-48"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value) || 0)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground w-32"
          />
        );
      case 'string':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            placeholder={setting.placeholder}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground w-64"
          />
        );
      default:
        return null;
    }
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    showToast('Settings saved successfully! Changes will take effect after server restart.', 'success');
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      // Reset logic would go here
      showToast('Settings reset to defaults.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'System Settings' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">System Settings</h1>
            <p className="text-muted-foreground">Configure system preferences, security settings, and integrations</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleResetToDefaults}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              🔄 Reset to Defaults
            </button>
            <button 
              onClick={handleSaveSettings}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              💾 Save Settings
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-800 dark:text-yellow-400">⚠️</span>
            <span className="text-yellow-800 dark:text-yellow-400 font-medium">
              Warning: Changes to system settings may require a server restart to take effect.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Setting Categories</h3>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* System Info */}
            <div className="bg-card border border-border rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-foreground mb-4">System Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="text-foreground">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="text-foreground">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database:</span>
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cache:</span>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Backup:</span>
                  <span className="text-foreground">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">
                  {categories.find(cat => cat.id === activeCategory)?.icon}
                </span>
                <h2 className="text-xl font-semibold text-foreground">
                  {categories.find(cat => cat.id === activeCategory)?.name} Settings
                </h2>
              </div>

              <div className="space-y-6">
                {filteredSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{setting.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Category-specific additional content */}
              {activeCategory === 'security' && (
                <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">Security Recommendations</h3>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Enable two-factor authentication for all admin accounts</li>
                    <li>• Use strong passwords with minimum 12 characters</li>
                    <li>• Regularly update system dependencies</li>
                    <li>• Monitor login attempts and failed authentications</li>
                  </ul>
                </div>
              )}

              {activeCategory === 'performance' && (
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Performance Tips</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Enable caching for better response times</li>
                    <li>• Optimize images to reduce bandwidth usage</li>
                    <li>• Use CDN for static assets in production</li>
                    <li>• Monitor server resources and scale as needed</li>
                  </ul>
                </div>
              )}

              {activeCategory === 'email' && (
                <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">Email Configuration</h3>
                  <div className="space-y-2">
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm">
                      📧 Test Email Configuration
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm ml-2">
                      📋 View Email Templates
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Actions */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              🔄 Clear Cache
            </button>
            <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
              💾 Create Backup
            </button>
            <button className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors">
              📊 Generate System Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminSystemPage() {
  return (
    <UnifiedAdminGuard requireSuperAdmin={true}>
      <SystemSettings />
    </UnifiedAdminGuard>
  );
}

