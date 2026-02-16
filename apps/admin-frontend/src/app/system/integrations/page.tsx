// src/app/admin/system/integrations/page.tsx - System Integrations Management
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import { API_CONFIG } from '@/config/api';
import adminAuth from '@/lib/admin-auth';

const API_BASE_URL = API_CONFIG.baseURL;

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'analytics' | 'social' | 'payment' | 'email' | 'storage' | 'ai' | 'seo';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
  config?: Record<string, string>;
}

function IntegrationsContent() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = adminAuth.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/system/integrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      } else {
        // If API not yet implemented, show empty state
        setIntegrations([]);
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError('Failed to load integrations');
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const getStatusColor = (status: Integration['status']) => {
    const colors = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: Integration['status']) => {
    const icons = { connected: '✓', disconnected: '○', error: '⚠', pending: '⏳' };
    return icons[status];
  };

  const getCategoryColor = (category: Integration['category']) => {
    const colors = {
      analytics: 'border-blue-500',
      social: 'border-purple-500',
      payment: 'border-green-500',
      email: 'border-orange-500',
      storage: 'border-cyan-500',
      ai: 'border-pink-500',
      seo: 'border-yellow-500'
    };
    return colors[category];
  };

  const filteredIntegrations = integrations.filter(i => 
    filterCategory === 'all' || i.category === filterCategory
  );

  const handleConnect = async (id: string) => {
    try {
      const token = adminAuth.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/system/integrations/${id}/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchIntegrations();
      }
    } catch (err) {
      console.error('Error connecting integration:', err);
    }
    setSelectedIntegration(null);
  };

  const handleDisconnect = async (id: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      try {
        const token = adminAuth.getToken();
        const response = await fetch(`${API_BASE_URL}/admin/system/integrations/${id}/disconnect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          fetchIntegrations();
        }
      } catch (err) {
        console.error('Error disconnecting integration:', err);
      }
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

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
          <button onClick={fetchIntegrations} className="ml-4 underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground">Connect and manage third-party services</p>
        </div>
        {errorCount > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            ⚠️ {errorCount} integration(s) need attention
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Integrations</p>
          <p className="text-2xl font-bold text-foreground">{integrations.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Connected</p>
          <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Disconnected</p>
          <p className="text-2xl font-bold text-gray-600">{integrations.filter(i => i.status === 'disconnected').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Errors</p>
          <p className="text-2xl font-bold text-red-600">{errorCount}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'analytics', 'social', 'payment', 'email', 'storage', 'ai', 'seo'].map(category => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map(integration => (
          <div
            key={integration.id}
            className={`bg-card border-l-4 ${getCategoryColor(integration.category)} border border-border rounded-xl p-4 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{integration.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(integration.status)}`}>
                {getStatusIcon(integration.status)} {integration.status}
              </span>
              {integration.lastSync && (
                <span className="text-xs text-muted-foreground">
                  Synced {new Date(integration.lastSync).toLocaleTimeString()}
                </span>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              {integration.status === 'connected' ? (
                <>
                  <button
                    onClick={() => setSelectedIntegration(integration)}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                </>
              ) : integration.status === 'error' ? (
                <>
                  <button
                    onClick={() => setSelectedIntegration(integration)}
                    className="flex-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Fix Issue
                  </button>
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedIntegration(integration)}
                  className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedIntegration.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedIntegration.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedIntegration.description}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {selectedIntegration.status === 'error' && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
                  ⚠️ Connection error: Unable to authenticate. Please check your API key.
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">API Key</label>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              
              {selectedIntegration.category === 'analytics' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Property ID</label>
                  <input
                    type="text"
                    placeholder="e.g., GA-XXXXXXXXX"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              )}
              
              {selectedIntegration.category === 'social' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Auto-post new articles</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                    <option value="yes">Yes - Post all published articles</option>
                    <option value="featured">Only featured articles</option>
                    <option value="no">No - Manual posting only</option>
                  </select>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sync-enabled" className="rounded" defaultChecked />
                <label htmlFor="sync-enabled" className="text-sm text-foreground">Enable automatic sync</label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConnect(selectedIntegration.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedIntegration.status === 'connected' ? 'Save Changes' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <SuperAdminRoute>
      <IntegrationsContent />
    </SuperAdminRoute>
  );
}

