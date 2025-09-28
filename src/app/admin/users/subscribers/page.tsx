"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'paused' | 'unsubscribed';
  emailsReceived: number;
  lastEmailOpened?: string;
  preferences: {
    newsletter: boolean;
    breaking: boolean;
    weekly: boolean;
    categories: string[];
  };
  source: string;
}

const Subscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      subscribedAt: '2024-01-01T10:00:00Z',
      status: 'active',
      emailsReceived: 45,
      lastEmailOpened: '2024-01-14T09:30:00Z',
      preferences: {
        newsletter: true,
        breaking: true,
        weekly: false,
        categories: ['Technology', 'Business']
      },
      source: 'Homepage'
    },
    {
      id: '2',
      email: 'jane.smith@email.com',
      subscribedAt: '2024-01-03T14:20:00Z',
      status: 'active',
      emailsReceived: 38,
      lastEmailOpened: '2024-01-13T16:45:00Z',
      preferences: {
        newsletter: true,
        breaking: false,
        weekly: true,
        categories: ['Environment', 'Health']
      },
      source: 'Article popup'
    },
    {
      id: '3',
      email: 'mike.johnson@company.com',
      name: 'Mike Johnson',
      subscribedAt: '2024-01-05T11:15:00Z',
      status: 'paused',
      emailsReceived: 22,
      lastEmailOpened: '2024-01-10T12:20:00Z',
      preferences: {
        newsletter: false,
        breaking: true,
        weekly: true,
        categories: ['Politics', 'World News']
      },
      source: 'Newsletter signup'
    },
    {
      id: '4',
      email: 'sarah.wilson@example.org',
      name: 'Sarah Wilson',
      subscribedAt: '2023-12-15T08:30:00Z',
      status: 'unsubscribed',
      emailsReceived: 156,
      lastEmailOpened: '2023-12-28T14:00:00Z',
      preferences: {
        newsletter: false,
        breaking: false,
        weekly: false,
        categories: []
      },
      source: 'Social media'
    }
  ]);

  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'unsubscribed'>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getEngagementRate = (subscriber: Subscriber) => {
    if (subscriber.emailsReceived === 0) return 0;
    return subscriber.lastEmailOpened ? 75 : 25; // Simplified calculation
  };

  const toggleSubscriberSelection = (subscriberId: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId) 
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const selectAllVisible = () => {
    setSelectedSubscribers(filteredSubscribers.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedSubscribers([]);
  };

  const updateSubscriberStatus = (subscriberId: string, newStatus: Subscriber['status']) => {
    setSubscribers(prev => prev.map(sub => 
      sub.id === subscriberId ? { ...sub, status: newStatus } : sub
    ));
  };

  const exportSubscribers = (format: 'csv' | 'json') => {
    const dataToExport = selectedSubscribers.length > 0 
      ? subscribers.filter(s => selectedSubscribers.includes(s.id))
      : filteredSubscribers;

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

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    paused: subscribers.filter(s => s.status === 'paused').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    avgEngagement: Math.round(subscribers.reduce((sum, s) => sum + getEngagementRate(s), 0) / subscribers.length)
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Subscribers', href: '/admin/users/subscribers' }
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
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              📥 Export Data
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
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
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.avgEngagement}%</div>
              <div className="text-sm text-purple-600/70">Avg Engagement</div>
            </div>
          </div>
        </div>

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

        {/* Subscribers Table */}
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
                  Preferences
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredSubscribers.map((subscriber) => (
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
                      <div className="font-medium text-foreground">{subscriber.email}</div>
                      {subscriber.name && (
                        <div className="text-sm text-muted-foreground">{subscriber.name}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Joined {formatDate(subscriber.subscribedAt)} • via {subscriber.source}
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
                      {subscriber.lastEmailOpened && (
                        <div className="text-xs text-muted-foreground">
                          Last opened: {formatDate(subscriber.lastEmailOpened)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {subscriber.preferences.newsletter && (
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                          Newsletter
                        </span>
                      )}
                      {subscriber.preferences.breaking && (
                        <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded ml-1">
                          Breaking
                        </span>
                      )}
                      {subscriber.preferences.weekly && (
                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded ml-1">
                          Weekly
                        </span>
                      )}
                      {subscriber.preferences.categories.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {subscriber.preferences.categories.join(', ')}
                        </div>
                      )}
                    </div>
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

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No subscribers found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No subscribers match the current filter'}
            </p>
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
                  : `Export ${filteredSubscribers.length} filtered subscribers`
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

