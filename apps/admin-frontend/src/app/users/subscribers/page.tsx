"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getEmailString } from '@/lib/utils';
import { API_CONFIG } from '@/config/api';
import adminAuth from '@/lib/admin-auth';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'paused' | 'unsubscribed';
  emailsReceived: number;
  lastEmailOpened?: string;
  preferences: {
    newsletter?: boolean;
    breaking?: boolean;
    weekly?: boolean;
    categories?: string[];
  };
  source: string;
}

interface SubscriberStats {
  total: number;
  active: number;
  paused: number;
  unsubscribed: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const API_BASE_URL = API_CONFIG.baseURL;

const Subscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<SubscriberStats>({ total: 0, active: 0, paused: 0, unsubscribed: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'unsubscribed'>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch subscribers from API
  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = adminAuth.getToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await fetch(`${API_BASE_URL}/admin/subscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch subscribers');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSubscribers(data.subscribers || []);
      setStats(data.stats || { total: 0, active: 0, paused: 0, unsubscribed: 0 });
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [statusFilter, debouncedSearch]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getEngagementRate = (subscriber: Subscriber) => {
    if (subscriber.emailsReceived === 0) return 0;
    return subscriber.lastEmailOpened ? 75 : 25;
  };

  const toggleSubscriberSelection = (subscriberId: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId) 
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const selectAllVisible = () => {
    setSelectedSubscribers(subscribers.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedSubscribers([]);
  };

  const updateSubscriberStatus = async (subscriberId: string, newStatus: Subscriber['status']) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/subscribers/${subscriberId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to update subscriber');
        return;
      }

      // Update local state
      setSubscribers(prev => prev.map(sub => 
        sub.id === subscriberId ? { ...sub, status: newStatus } : sub
      ));
    } catch (err) {
      console.error('Error updating subscriber:', err);
      alert('Failed to update subscriber');
    }
  };

  const exportSubscribers = (format: 'csv' | 'json') => {
    const dataToExport = selectedSubscribers.length > 0 
      ? subscribers.filter(s => selectedSubscribers.includes(s.id))
      : subscribers;

    if (format === 'csv') {
      const headers = ['Email', 'Name', 'Status', 'Subscribed Date', 'Emails Received', 'Source'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(sub => [
          sub.email,
          sub.name || '',
          sub.status,
          formatDate(sub.subscribedAt),
          sub.emailsReceived,
          sub.source
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscribers.csv';
      a.click();
    } else {
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscribers.json';
      a.click();
    }
    
    setIsExportModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/' },
          { label: 'Users', href: '/users' },
          { label: 'Subscribers', href: '/users/subscribers' }
        ]}
      />

      <div className="bg-card rounded-2xl shadow-lg border border-border text-foreground transition-colors">
        {/* Header */}
        <div className="p-8 border-b border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Email Subscribers
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your newsletter and email subscriptions
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => fetchSubscribers()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/90 transition-colors"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                📥 Export Data
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600/70">Total Subscribers</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-green-600/70">Active</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
              <div className="text-sm text-yellow-600/70">Paused</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">{stats.unsubscribed}</div>
              <div className="text-sm text-red-600/70">Unsubscribed</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={() => fetchSubscribers()}
              className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-b border-border/50 bg-muted">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedSubscribers.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-4 bg-primary/10 dark:bg-primary/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-primary">
                  {selectedSubscribers.length} subscriber(s) selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm"
                >
                  📥 Export Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscribers...</p>
          </div>
        )}

        {/* Subscribers Table */}
        {!loading && !error && subscribers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => e.target.checked ? selectAllVisible() : clearSelection()}
                      className="w-4 h-4 text-blue-600 border-2 border-border/50 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Subscriber
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Engagement
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-muted/60 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={() => toggleSubscriberSelection(subscriber.id)}
                        className="w-4 h-4 text-blue-600 border-2 border-border/50 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{getEmailString(subscriber.email)}</div>
                        {subscriber.name && (
                          <div className="text-sm text-muted-foreground">{subscriber.name}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Joined {formatDate(subscriber.subscribedAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        subscriber.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : subscriber.status === 'paused'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{subscriber.emailsReceived} emails</div>
                        <div className="text-muted-foreground">
                          {getEngagementRate(subscriber)}% engagement
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {subscriber.source || 'website'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {subscriber.status === 'active' && (
                          <button
                            onClick={() => updateSubscriberStatus(subscriber.id, 'paused')}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors duration-300"
                            title="Pause subscription"
                          >
                            ⏸️
                          </button>
                        )}
                        {subscriber.status === 'paused' && (
                          <button
                            onClick={() => updateSubscriberStatus(subscriber.id, 'active')}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-300"
                            title="Resume subscription"
                          >
                            ▶️
                          </button>
                        )}
                        {subscriber.status !== 'unsubscribed' && (
                          <button
                            onClick={() => updateSubscriberStatus(subscriber.id, 'unsubscribed')}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-300"
                            title="Unsubscribe"
                          >
                            🚫
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && subscribers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No subscribers found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search terms or filters' 
                : 'No newsletter subscribers yet'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              Showing {subscribers.length} of {pagination.total} subscribers (Page {pagination.page} of {pagination.totalPages})
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground">Export Subscribers</h2>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground mb-4">
                {selectedSubscribers.length > 0 
                  ? `Export ${selectedSubscribers.length} selected subscribers`
                  : `Export ${subscribers.length} subscribers`
                }
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => exportSubscribers('csv')}
                  className="w-full p-4 text-left border border-border/50 rounded-xl hover:bg-muted transition-colors duration-300"
                >
                  <div className="font-medium text-foreground">📊 CSV Format</div>
                  <div className="text-sm text-muted-foreground">Suitable for Excel and spreadsheet applications</div>
                </button>
                <button
                  onClick={() => exportSubscribers('json')}
                  className="w-full p-4 text-left border border-border/50 rounded-xl hover:bg-muted transition-colors duration-300"
                >
                  <div className="font-medium text-foreground">📄 JSON Format</div>
                  <div className="text-sm text-muted-foreground">Suitable for technical integrations</div>
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end space-x-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-6 py-2 bg-muted text-foreground rounded-xl hover:bg-card transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribers;

