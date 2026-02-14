// src/app/admin/moderation/reports/page.tsx - Content Reports Management
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminRoute } from '@/components/auth/RouteGuard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Report {
  id: string;
  type: 'article' | 'comment' | 'user';
  reason: string;
  description: string;
  reportedBy: { id: string; name: string; email: string };
  reportedItem: { id: string; title?: string; content?: string; author?: string };
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  moderatorNotes?: string;
}

function ReportsContent() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/moderation/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getStatusColor = (status: Report['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Report['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const getTypeIcon = (type: Report['type']) => {
    const icons = { article: '📄', comment: '💬', user: '👤' };
    return icons[type];
  };

  const handleAction = async (reportId: string, action: 'resolve' | 'dismiss' | 'escalate') => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/moderation/reports/${reportId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Refresh reports after action
        fetchReports();
      }
    } catch (err) {
      console.error('Error handling report action:', err);
    }
    setSelectedReport(null);
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority;
    return matchesStatus && matchesType && matchesPriority;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const criticalCount = reports.filter(r => r.priority === 'critical' && r.status !== 'resolved').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Reports</h1>
          <p className="text-muted-foreground">Review and moderate reported content</p>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              ⚠️ {criticalCount} Critical
            </span>
          )}
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            🕐 {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Reports</p>
          <p className="text-2xl font-bold text-foreground">{reports.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Resolved Today</p>
          <p className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'resolved').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
          <p className="text-2xl font-bold text-blue-600">2.4h</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="comment">Comments</option>
            <option value="user">Users</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReports.map(report => (
              <div
                key={report.id}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{report.reason}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Reported by {report.reportedBy.name} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAction(report.id, 'resolve'); }}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAction(report.id, 'dismiss'); }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Report Details</h2>
              <button onClick={() => setSelectedReport(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <p className="font-medium text-foreground">{getTypeIcon(selectedReport.type)} {selectedReport.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Reason</label>
                  <p className="font-medium text-foreground">{selectedReport.reason}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <p className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(selectedReport.status)}`}>{selectedReport.status}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Priority</label>
                  <p className={`inline-block px-2 py-1 rounded-full text-sm ${getPriorityColor(selectedReport.priority)}`}>{selectedReport.priority}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <p className="text-foreground">{selectedReport.description}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Reported Content</label>
                <div className="p-3 bg-muted rounded-lg mt-1">
                  <p className="text-foreground">{selectedReport.reportedItem.title || selectedReport.reportedItem.content || `User: ${selectedReport.reportedItem.author}`}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleAction(selectedReport.id, 'resolve')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✓ Resolve
                </button>
                <button
                  onClick={() => handleAction(selectedReport.id, 'dismiss')}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  ✗ Dismiss
                </button>
                <button
                  onClick={() => handleAction(selectedReport.id, 'escalate')}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  ⬆ Escalate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AdminRoute>
      <ReportsContent />
    </AdminRoute>
  );
}

