// src/app/admin/advertising/requests/page.tsx - Ad Requests Management
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminRoute } from '@/components/auth/RouteGuard';
import { getEmailString } from '@/lib/utils';
import adminAuth from '@/lib/admin-auth';
import { API_CONFIG } from '@/config/api';

interface AdRequest {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  adType: 'banner' | 'sidebar' | 'sponsored' | 'native' | 'video';
  budget: number;
  duration: string;
  message: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'negotiating';
  createdAt: string;
  notes?: string;
}

function AdRequestsContent() {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AdRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const token = adminAuth.getToken();
      const response = await fetch(`${API_CONFIG.baseURL}/admin/advertising/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching ad requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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

  const handleStatusChange = async (id: string, newStatus: AdRequest['status']) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.baseURL}/admin/advertising/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
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
            ${requests.reduce((acc, r) => acc + (r.budget || 0), 0).toLocaleString()}
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
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-4">📭</span>
            <h3 className="text-lg font-medium text-foreground mb-2">No Ad Requests</h3>
            <p className="text-muted-foreground">No advertising requests to display</p>
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
                          ${(request.budget || 0).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">📅 {request.duration}</span>
                        <span className="text-muted-foreground">{request.adType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
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
                    ${(selectedRequest.budget || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Duration</label>
                  <p className="font-medium text-foreground">{selectedRequest.duration || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <p className={`inline-block text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</p>
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

