"use client";

import { useState, useEffect } from 'react';
import adminAuth, { AdminUser } from '@/lib/admin-auth';
import { API_CONFIG } from '@/config/api';

export default function ProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await adminAuth.validate();
      if (currentUser) {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          fullName: currentUser.fullName || '',
          email: currentUser.email || '',
          username: currentUser.username || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const token = adminAuth.getToken();
      const updateData: Record<string, string> = {};
      if (formData.fullName !== user?.fullName) updateData.fullName = formData.fullName;
      if (formData.username !== user?.username) updateData.username = formData.username;
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const res = await fetch(`${API_CONFIG.baseURL}/auth/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      await loadProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Could not load profile. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-lg ${
              user.isSuperAdmin ? 'bg-gradient-to-br from-purple-500 to-pink-600 ring-4 ring-yellow-400/50' :
              user.isAdmin ? 'bg-gradient-to-br from-red-500 to-orange-600 ring-4 ring-orange-400/30' :
              'bg-gradient-to-br from-blue-500 to-cyan-600 ring-4 ring-blue-400/30'
            }`}>
              {user.fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{user.fullName || 'Admin User'}</h2>
              <p className="text-blue-100">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  user.isSuperAdmin ? 'bg-yellow-400/20 text-yellow-200 border border-yellow-400/30' :
                  user.isAdmin ? 'bg-orange-400/20 text-orange-200 border border-orange-400/30' :
                  'bg-blue-400/20 text-blue-200 border border-blue-400/30'
                }`}>
                  {user.isSuperAdmin ? '👑 Super Admin' : user.isAdmin ? '🛡️ Admin' : '👤 ' + user.role}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-200 border border-green-400/30">
                  ✓ Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Account Details</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              ) : (
                <p className="text-foreground font-medium py-2.5">{user.fullName || '—'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
              <p className="text-foreground font-medium py-2.5">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Username</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              ) : (
                <p className="text-foreground font-medium py-2.5">{user.username || '—'}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Role</label>
              <p className="text-foreground font-medium py-2.5 capitalize">{user.role}</p>
            </div>

            {/* Role Level */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Role Level</label>
              <p className="text-foreground font-medium py-2.5">{user.roleLevel}</p>
            </div>

            {/* Permissions Count */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Permissions</label>
              <p className="text-foreground font-medium py-2.5">
                {user.permissions?.includes('*') ? 'Full Access' : `${user.permissions?.length || 0} permissions`}
              </p>
            </div>
          </div>

          {/* Password Change Section */}
          {editing && (
            <div className="pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4">Change Password</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={e => setFormData(p => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={e => setFormData(p => ({ ...p, newPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {editing && (
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(prev => ({
                    ...prev,
                    fullName: user.fullName || '',
                    username: user.username || '',
                    currentPassword: '', newPassword: '', confirmPassword: '',
                  }));
                  setMessage(null);
                }}
                className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Permissions Card */}
      <div className="mt-6 bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Permissions & Access</h3>
        <div className="flex flex-wrap gap-2">
          {user.permissions?.includes('*') ? (
            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm font-medium border border-yellow-200 dark:border-yellow-800">
              ⭐ Full Access (All Permissions)
            </span>
          ) : (
            user.permissions?.map((perm, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-200 dark:border-blue-800"
              >
                {perm}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Security Card */}
      <div className="mt-6 bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <span className="mt-2 sm:mt-0 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm font-medium">
              Coming Soon
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium text-foreground">Active Sessions</p>
              <p className="text-sm text-muted-foreground">Manage your logged-in sessions</p>
            </div>
            <span className="mt-2 sm:mt-0 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
              1 Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
