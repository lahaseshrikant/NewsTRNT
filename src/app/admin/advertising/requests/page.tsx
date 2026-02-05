// src/app/admin/advertising/requests/page.tsx - Ad Requests Management
'use client';

import React, { useState, useEffect } from 'react';
import { AdminRoute } from '@/components/admin/RouteGuard';
import { getEmailString } from '@/lib/utils';

interface AdRequest {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  adType: 'banner' | 'sidebar' | 'sponsored' | 'native' | 'video';
  budget: { min: number; max: number; currency: string };
  duration: string;
  targetAudience: string;
  message: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'negotiating';
  submittedAt: string;
  notes?: string;
}

function AdRequestsContent() {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AdRequest | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setRequests([
        {
          id: '1',
          companyName: 'TechCorp Solutions',
          contactName: 'Sarah Johnson',
          contactEmail: 'sarah@techcorp.com',
          phone: '+1 555-0123',
          adType: 'banner',
          budget: { min: 5000, max: 10000, currency: 'USD' },
          duration: '3 months',
          targetAudience: 'Tech professionals, developers',
          message: 'Looking to advertise our new SaaS product to your tech-savvy audience.',
          status: 'pending',
          submittedAt: new Date().toISOString()
        },
        {
          id: '2',
          companyName: 'Green Energy Inc',
          contactName: 'Michael Chen',
          contactEmail: 'mchen@greenenergy.com',
          adType: 'sponsored',
          budget: { min: 15000, max: 25000, currency: 'USD' },
          duration: '6 months',
          targetAudience: 'Environmentally conscious readers',
          message: 'Interested in sponsored content about renewable energy.',
          status: 'reviewing',
          submittedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          companyName: 'Fashion Forward',
          contactName: 'Emma Davis',
          contactEmail: 'emma@fashionforward.com',
          phone: '+1 555-0456',
          adType: 'native',
          budget: { min: 3000, max: 5000, currency: 'USD' },
          duration: '1 month',
          targetAudience: 'Fashion enthusiasts, millennials',
          message: 'Want to run native ads for our spring collection launch.',
          status: 'approved',
          submittedAt: new Date(Date.now() - 172800000).toISOString(),
          notes: 'Approved for homepage sidebar placement'
        },
        {
          id: '4',
          companyName: 'CryptoExchange',
          contactName: 'Alex Thompson',
          contactEmail: 'alex@cryptoex.com',
          adType: 'banner',
          budget: { min: 20000, max: 50000, currency: 'USD' },
          duration: '12 months',
          targetAudience: 'Investors, crypto enthusiasts',
          message: 'Large-scale advertising campaign for our new platform.',
          status: 'negotiating',
          submittedAt: new Date(Date.now() - 259200000).toISOString(),
          notes: 'Discussing premium placement options'
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: AdRequest['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      negotiating: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colors[status];
  };

  const getAdTypeIcon = (type: AdRequest['adType']) => {
    const icons = { banner: '🖼️', sidebar: '📐', sponsored: '📰', native: '📝', video: '🎬' };
    return icons[type];
  };

  const handleStatusChange = (id: string, newStatus: AdRequest['status']) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter(r => filterStatus === 'all' || r.status === filterStatus);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Requests</h1>
          <p className="text-muted-foreground">Review and manage advertising requests</p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              📋 {pendingCount} Pending Review
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Requests</p>
          <p className="text-2xl font-bold text-foreground">{requests.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'approved').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Negotiating</p>
          <p className="text-2xl font-bold text-purple-600">{requests.filter(r => r.status === 'negotiating').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Potential Revenue</p>
          <p className="text-2xl font-bold text-blue-600">
            ${requests.reduce((acc, r) => acc + r.budget.max, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="negotiating">Negotiating</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredRequests.map(request => (
              <div
                key={request.id}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                      {getAdTypeIcon(request.adType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{request.companyName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.contactName} • {getEmailString(request.contactEmail)}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-green-600 font-medium">
                          ${request.budget.min.toLocaleString()} - ${request.budget.max.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">📅 {request.duration}</span>
                        <span className="text-muted-foreground">{request.adType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Request Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Company</label>
                  <p className="font-medium text-foreground">{selectedRequest.companyName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Contact</label>
                  <p className="font-medium text-foreground">{selectedRequest.contactName}</p>
                  <p className="text-sm text-muted-foreground">{getEmailString(selectedRequest.contactEmail)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Ad Type</label>
                  <p className="font-medium text-foreground">{getAdTypeIcon(selectedRequest.adType)} {selectedRequest.adType}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Budget</label>
                  <p className="font-medium text-green-600">
                    ${selectedRequest.budget.min.toLocaleString()} - ${selectedRequest.budget.max.toLocaleString()} {selectedRequest.budget.currency}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Duration</label>
                  <p className="font-medium text-foreground">{selectedRequest.duration}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Target Audience</label>
                  <p className="font-medium text-foreground">{selectedRequest.targetAudience}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Message</label>
                <p className="text-foreground p-3 bg-muted rounded-lg mt-1">{selectedRequest.message}</p>
              </div>
              {selectedRequest.notes && (
                <div>
                  <label className="text-sm text-muted-foreground">Notes</label>
                  <p className="text-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-1">{selectedRequest.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'negotiating')}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  💬 Negotiate
                </button>
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdRequestsPage() {
  return (
    <AdminRoute>
      <AdRequestsContent />
    </AdminRoute>
  );
}
