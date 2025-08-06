"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface Newsletter {
  id: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  openRate: number;
  clickRate: number;
  createdDate: string;
  sentDate?: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscriptionDate: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string;
}

const NewsletterManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'newsletters' | 'subscribers' | 'create'>('newsletters');
  
  const [newsletters] = useState<Newsletter[]>([
    {
      id: '1',
      subject: 'Weekly News Digest - January 2024',
      status: 'sent',
      recipients: 45623,
      openRate: 24.5,
      clickRate: 3.2,
      createdDate: '2024-01-08',
      sentDate: '2024-01-08'
    },
    {
      id: '2',
      subject: 'Breaking: Major Tech Announcement',
      status: 'sent',
      recipients: 45623,
      openRate: 32.1,
      clickRate: 5.8,
      createdDate: '2024-01-12',
      sentDate: '2024-01-12'
    },
    {
      id: '3',
      subject: 'Monthly Roundup - Best Stories',
      status: 'scheduled',
      recipients: 46150,
      openRate: 0,
      clickRate: 0,
      createdDate: '2024-01-15'
    },
    {
      id: '4',
      subject: 'Special Report: Climate Change',
      status: 'draft',
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      createdDate: '2024-01-16'
    }
  ]);

  const [subscribers] = useState<Subscriber[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      subscriptionDate: '2023-12-01',
      status: 'active',
      source: 'Homepage'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      subscriptionDate: '2023-11-15',
      status: 'active',
      source: 'Article Page'
    },
    {
      id: '3',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      subscriptionDate: '2024-01-10',
      status: 'unsubscribed',
      source: 'Social Media'
    }
  ]);

  const [newNewsletter, setNewNewsletter] = useState({
    subject: '',
    content: '',
    scheduleDate: '',
    scheduleTime: ''
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      unsubscribed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      bounced: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.status === 'active').length;
  const avgOpenRate = newsletters.filter(n => n.status === 'sent').reduce((sum, n) => sum + n.openRate, 0) / newsletters.filter(n => n.status === 'sent').length || 0;
  const avgClickRate = newsletters.filter(n => n.status === 'sent').reduce((sum, n) => sum + n.clickRate, 0) / newsletters.filter(n => n.status === 'sent').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Newsletter Management' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Newsletter Management</h1>
            <p className="text-muted-foreground">Create newsletters, manage subscribers, and schedule campaigns</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setActiveTab('create')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              ✏️ Create Newsletter
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              📊 Export Data
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{totalSubscribers}</div>
            <div className="text-sm text-muted-foreground">Total Subscribers</div>
            <div className="text-xs text-green-600 mt-1">+{activeSubscribers} active</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{newsletters.length}</div>
            <div className="text-sm text-muted-foreground">Total Campaigns</div>
            <div className="text-xs text-blue-600 mt-1">{newsletters.filter(n => n.status === 'sent').length} sent</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{avgOpenRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Avg Open Rate</div>
            <div className="text-xs text-green-600 mt-1">Industry avg: 21%</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{avgClickRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Avg Click Rate</div>
            <div className="text-xs text-green-600 mt-1">Industry avg: 2.6%</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'newsletters', label: 'Newsletters', icon: '📧' },
                { id: 'subscribers', label: 'Subscribers', icon: '👥' },
                { id: 'create', label: 'Create Campaign', icon: '✏️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'newsletters' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Newsletter Campaigns</h3>
                  <div className="flex space-x-2">
                    <button className="bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90 transition-colors">
                      🔄 Refresh
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground">Subject</th>
                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-foreground">Recipients</th>
                        <th className="text-left p-4 font-medium text-foreground">Open Rate</th>
                        <th className="text-left p-4 font-medium text-foreground">Click Rate</th>
                        <th className="text-left p-4 font-medium text-foreground">Date</th>
                        <th className="text-left p-4 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsletters.map((newsletter, index) => (
                        <tr key={newsletter.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <td className="p-4">
                            <div className="font-medium text-foreground">{newsletter.subject}</div>
                            <div className="text-sm text-muted-foreground">ID: {newsletter.id}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(newsletter.status)}`}>
                              {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-foreground">{newsletter.recipients.toLocaleString()}</td>
                          <td className="p-4 text-foreground">
                            {newsletter.status === 'sent' ? `${newsletter.openRate}%` : '-'}
                          </td>
                          <td className="p-4 text-foreground">
                            {newsletter.status === 'sent' ? `${newsletter.clickRate}%` : '-'}
                          </td>
                          <td className="p-4 text-foreground">
                            {newsletter.sentDate || newsletter.createdDate}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400" title="Edit">
                                ✏️
                              </button>
                              <button className="text-green-600 hover:text-green-800 dark:text-green-400" title="View">
                                👁️
                              </button>
                              {newsletter.status === 'draft' && (
                                <button className="text-purple-600 hover:text-purple-800 dark:text-purple-400" title="Send">
                                  📤
                                </button>
                              )}
                              <button className="text-red-600 hover:text-red-800 dark:text-red-400" title="Delete">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'subscribers' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Subscriber Management</h3>
                  <div className="flex space-x-2">
                    <button className="bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90 transition-colors">
                      👤 Add Subscriber
                    </button>
                    <button className="bg-secondary text-secondary-foreground px-3 py-2 rounded hover:bg-secondary/90 transition-colors">
                      📊 Export List
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground">Subscriber</th>
                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-foreground">Source</th>
                        <th className="text-left p-4 font-medium text-foreground">Subscription Date</th>
                        <th className="text-left p-4 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((subscriber, index) => (
                        <tr key={subscriber.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-foreground">{subscriber.name}</div>
                              <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(subscriber.status)}`}>
                              {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-foreground">{subscriber.source}</td>
                          <td className="p-4 text-foreground">{subscriber.subscriptionDate}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400" title="Edit">
                                ✏️
                              </button>
                              <button className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400" title="Send Email">
                                📧
                              </button>
                              <button className="text-red-600 hover:text-red-800 dark:text-red-400" title="Unsubscribe">
                                🚫
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'create' && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-6">Create New Newsletter</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subject Line</label>
                    <input
                      type="text"
                      value={newNewsletter.subject}
                      onChange={(e) => setNewNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      placeholder="Enter newsletter subject..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                    <textarea
                      value={newNewsletter.content}
                      onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                      rows={12}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      placeholder="Write your newsletter content here..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Schedule Date</label>
                      <input
                        type="date"
                        value={newNewsletter.scheduleDate}
                        onChange={(e) => setNewNewsletter(prev => ({ ...prev, scheduleDate: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Schedule Time</label>
                      <input
                        type="time"
                        value={newNewsletter.scheduleTime}
                        onChange={(e) => setNewNewsletter(prev => ({ ...prev, scheduleTime: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                      💾 Save as Draft
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      ⏰ Schedule
                    </button>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      📤 Send Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterManagement;
