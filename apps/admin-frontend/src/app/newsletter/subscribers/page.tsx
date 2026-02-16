// src/app/admin/newsletter/subscribers/page.tsx - Newsletter Subscribers Management
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminRoute } from '@/components/auth/RouteGuard';
import { getEmailString } from '@/lib/utils';
import { API_CONFIG } from '@/config/api';
import adminAuth from '@/lib/admin-auth';

const API_BASE_URL = API_CONFIG.baseURL;

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'pending';
  source: 'website' | 'import' | 'manual' | 'api';
  lists: string[];
  subscribedAt: string;
  lastEmailOpened?: string;
  openRate: number;
  clickRate: number;
}

function SubscribersContent() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterList, setFilterList] = useState<string>('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const lists = ['Daily Digest', 'Weekly Newsletter', 'Breaking News', 'Tech Updates', 'Business Insights'];

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = adminAuth.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/subscribers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform data to expected format
        const subs: Subscriber[] = (data.subscribers || []).map((sub: any) => ({
          id: sub.id,
          email: sub.email,
          name: sub.name,
          status: sub.status === 'active' ? 'active' : sub.status === 'unsubscribed' ? 'unsubscribed' : 'pending',
          source: 'website',
          lists: sub.preferences?.categories || [],
          subscribedAt: sub.subscribedAt || sub.createdAt,
          openRate: 0,
          clickRate: 0
        }));
        setSubscribers(subs);
      } else {
        setSubscribers([]);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Failed to load subscribers');
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const getStatusColor = (status: Subscriber['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      unsubscribed: 'bg-gray-100 text-gray-800',
      bounced: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getSourceIcon = (source: Subscriber['source']) => {
    const icons = { website: '🌐', import: '📥', manual: '✏️', api: '🔗' };
    return icons[source];
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = 
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesList = filterList === 'all' || sub.lists.includes(filterList);
    return matchesSearch && matchesStatus && matchesList;
  });

  const toggleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(s => s.id));
    }
  };

  const handleBulkAction = (action: 'delete' | 'unsubscribe' | 'resubscribe') => {
    if (selectedSubscribers.length === 0) return;
    if (!confirm(`Are you sure you want to ${action} ${selectedSubscribers.length} subscriber(s)?`)) return;
    
    if (action === 'delete') {
      setSubscribers(subscribers.filter(s => !selectedSubscribers.includes(s.id)));
    } else {
      setSubscribers(subscribers.map(s => 
        selectedSubscribers.includes(s.id) 
          ? { ...s, status: action === 'unsubscribe' ? 'unsubscribed' : 'active' as const }
          : s
      ));
    }
    setSelectedSubscribers([]);
  };

  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const avgOpenRate = subscribers.length > 0 
    ? subscribers.reduce((acc, s) => acc + s.openRate, 0) / subscribers.length 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">Manage your email subscriber list</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
          >
            📥 Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Add Subscriber
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Subscribers</p>
          <p className="text-2xl font-bold text-foreground">{subscribers.length.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Avg Open Rate</p>
          <p className="text-2xl font-bold text-blue-600">{avgOpenRate.toFixed(1)}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold text-purple-600">+128</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filterList}
            onChange={(e) => setFilterList(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Lists</option>
            {lists.map(list => (
              <option key={list} value={list}>{list}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubscribers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
          <span className="text-blue-800 dark:text-blue-300">
            {selectedSubscribers.length} subscriber(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('resubscribe')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Resubscribe
            </button>
            <button
              onClick={() => handleBulkAction('unsubscribe')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Unsubscribe
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Subscriber</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Lists</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Open Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Source</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubscribers.map(subscriber => (
                  <tr key={subscriber.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={() => {
                          setSelectedSubscribers(prev =>
                            prev.includes(subscriber.id)
                              ? prev.filter(id => id !== subscriber.id)
                              : [...prev, subscriber.id]
                          );
                        }}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{subscriber.name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{getEmailString(subscriber.email)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(subscriber.status)}`}>
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {subscriber.lists.length > 0 ? (
                          subscriber.lists.slice(0, 2).map(list => (
                            <span key={list} className="text-xs px-2 py-0.5 bg-muted rounded">
                              {list}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {subscriber.lists.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{subscriber.lists.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${subscriber.openRate >= 50 ? 'bg-green-500' : subscriber.openRate >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${subscriber.openRate}%` }}
                          />
                        </div>
                        <span className="text-sm">{subscriber.openRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span>{getSourceIcon(subscriber.source)} {subscriber.source}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Add Subscriber</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                <input type="email" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Subscribe to</label>
                <div className="space-y-2">
                  {lists.map(list => (
                    <label key={list} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{list}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg">Cancel</button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Import Subscribers</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Drag & drop CSV file here</p>
                <p className="text-sm text-muted-foreground mt-2">or</p>
                <button className="mt-2 px-4 py-2 bg-muted rounded-lg text-sm">Browse Files</button>
              </div>
              <p className="text-xs text-muted-foreground">CSV should have columns: email, name (optional)</p>
              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowImportModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg">Cancel</button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Import</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewsletterSubscribersPage() {
  return (
    <AdminRoute>
      <SubscribersContent />
    </AdminRoute>
  );
}

