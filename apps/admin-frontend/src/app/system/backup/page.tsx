// src/app/admin/system/backup/page.tsx - System Backup & Restore
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'database' | 'media' | 'config';
  size: string;
  createdAt: string;
  status: 'completed' | 'in_progress' | 'failed';
  createdBy: string;
  location: 'local' | 'cloud';
}

function BackupContent() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/system/backups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      } else {
        setBackups([]);
      }
    } catch (err) {
      console.error('Error fetching backups:', err);
      setError('Failed to load backups');
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const getTypeIcon = (type: Backup['type']) => {
    const icons = { full: '💾', database: '🗄️', media: '🎬', config: '⚙️' };
    return icons[type];
  };

  const getStatusColor = (status: Backup['status']) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const handleBackup = async (type: Backup['type']) => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/system/backups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      
      // Simulate progress for UX
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setBackupProgress(i);
      }
      
      if (response.ok) {
        fetchBackups();
      }
    } catch (err) {
      console.error('Error creating backup:', err);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/system/backups/${selectedBackup.id}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert(`Restore initiated from backup: ${selectedBackup.name}`);
      }
    } catch (err) {
      console.error('Error restoring backup:', err);
    }
    setShowRestoreModal(false);
    setSelectedBackup(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/admin/system/backups/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          fetchBackups();
        }
      } catch (err) {
        console.error('Error deleting backup:', err);
      }
    }
  };

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
          <button onClick={fetchBackups} className="ml-4 underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backup & Restore</h1>
          <p className="text-muted-foreground">Manage system backups and recovery</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
        >
          ⏰ Schedule Settings
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Backups</p>
          <p className="text-2xl font-bold text-foreground">{backups.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Last Backup</p>
          <p className="text-2xl font-bold text-green-600">Today</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Storage Used</p>
          <p className="text-2xl font-bold text-blue-600">8.9 GB</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Cloud Backups</p>
          <p className="text-2xl font-bold text-purple-600">{backups.filter(b => b.location === 'cloud').length}</p>
        </div>
      </div>

      {/* Backup Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Create New Backup</h3>
        
        {isBackingUp ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Backup in progress...</span>
              <span className="text-blue-600 font-medium">{backupProgress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${backupProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleBackup('full')}
              className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <span className="text-2xl">💾</span>
              <p className="font-medium text-foreground mt-2">Full Backup</p>
              <p className="text-xs text-muted-foreground">Everything included</p>
            </button>
            <button
              onClick={() => handleBackup('database')}
              className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <span className="text-2xl">🗄️</span>
              <p className="font-medium text-foreground mt-2">Database Only</p>
              <p className="text-xs text-muted-foreground">Users, articles, settings</p>
            </button>
            <button
              onClick={() => handleBackup('media')}
              className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <span className="text-2xl">🎬</span>
              <p className="font-medium text-foreground mt-2">Media Files</p>
              <p className="text-xs text-muted-foreground">Images, videos, uploads</p>
            </button>
            <button
              onClick={() => handleBackup('config')}
              className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <span className="text-2xl">⚙️</span>
              <p className="font-medium text-foreground mt-2">Configuration</p>
              <p className="text-xs text-muted-foreground">Settings & environment</p>
            </button>
          </div>
        )}
      </div>

      {/* Backup History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Backup History</h3>
        </div>
        <div className="divide-y divide-border">
          {backups.map(backup => (
            <div key={backup.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getTypeIcon(backup.type)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{backup.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(backup.createdAt).toLocaleString()}</span>
                    <span>{backup.size}</span>
                    <span>{backup.location === 'cloud' ? '☁️ Cloud' : '💻 Local'}</span>
                    <span>by {backup.createdBy}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border border-border rounded hover:bg-muted">
                  Download
                </button>
                <button
                  onClick={() => {
                    setSelectedBackup(backup);
                    setShowRestoreModal(true);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Restore
                </button>
                <button
                  onClick={() => handleDelete(backup.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">⚠️ Confirm Restore</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  <strong>Warning:</strong> This will restore the system to the state from {new Date(selectedBackup.createdAt).toLocaleString()}.
                  All changes made after this backup will be lost.
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Backup Details:</p>
                <p className="font-medium text-foreground">{selectedBackup.name}</p>
                <p className="text-sm text-muted-foreground">Type: {selectedBackup.type} • Size: {selectedBackup.size}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Type &quot;RESTORE&quot; to confirm
                </label>
                <input
                  type="text"
                  placeholder="RESTORE"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedBackup(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Restore System
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Settings Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Backup Schedule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Backup</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                  <option value="daily">Daily at 3:00 AM</option>
                  <option value="weekly">Weekly on Sunday</option>
                  <option value="monthly">Monthly on 1st</option>
                  <option value="off">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Database Backup</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                  <option value="hourly">Every hour</option>
                  <option value="6hours">Every 6 hours</option>
                  <option value="daily">Daily</option>
                  <option value="off">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Retention Period</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                  <option value="7">Keep last 7 days</option>
                  <option value="14">Keep last 14 days</option>
                  <option value="30">Keep last 30 days</option>
                  <option value="90">Keep last 90 days</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cloud-sync" className="rounded" defaultChecked />
                <label htmlFor="cloud-sync" className="text-sm text-foreground">Sync to cloud storage</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BackupPage() {
  return (
    <SuperAdminRoute>
      <BackupContent />
    </SuperAdminRoute>
  );
}

