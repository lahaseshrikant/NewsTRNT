// src/app/admin/system/users/page.tsx - User Management Dashboard
'use client';

import React, { useState, useEffect } from 'react';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import { ROLE_DEFINITIONS, ROLE_HIERARCHY, Permission, RoleName } from '@/config/rbac';
import RBACAuth from '@/lib/rbac-auth';
import ErrorHandler from '@/lib/error-handler';
import AuditLogger from '@/lib/audit-logger';

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

// Helper function to safely get email string from user object
const getEmailString = (email: any): string => {
  if (typeof email === 'string') return email;
  if (typeof email?.email === 'string') return email.email;
  return '';
};

// Normalize user data to ensure email is a string, not an object
const normalizeUser = (user: any): User => {
  return {
    ...user,
    email: getEmailString(user.email)
  };
};

interface User {
  id: string;
  email: string;
  name: string;
  role: RoleName;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin?: string;
  createdAt: string;
  mfaEnabled: boolean;
  avatar?: string;
}

function UserManagementContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<RoleName | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const authToken = RBACAuth.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/users`, { headers });
      const data = await response.json().catch(() => null);

      if (response.ok) {
        const rawUsers = Array.isArray(data) ? data : data?.users || [];
        setUsers(rawUsers.map(normalizeUser));
      } else {
        const parsed = ErrorHandler.parseApiError({ status: response.status, data });
        setError(ErrorHandler.getUserMessage(parsed.type).message);
      }
    } catch (err) {
      const parsed = ErrorHandler.parseApiError(err);
      setError(ErrorHandler.getUserMessage(parsed.type).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: RoleName) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const authToken = RBACAuth.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        AuditLogger.logFromSession('ROLE_CHANGE', { details: { userId, newRole }, success: true });
      } else {
        const data = await response.json().catch(() => null);
        const parsed = ErrorHandler.parseApiError({ status: response.status, data });
        AuditLogger.logFromSession('ROLE_CHANGE', { details: { userId, newRole }, errorMessage: parsed.message, success: false });
        alert(ErrorHandler.getUserMessage(parsed.type).message);
      }
    } catch (err) {
      const parsed = ErrorHandler.parseApiError(err);
      AuditLogger.logFromSession('ROLE_CHANGE', { details: { userId, newRole }, errorMessage: parsed.message, success: false });
      alert(ErrorHandler.getUserMessage(parsed.type).message);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const authToken = RBACAuth.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/users/${userId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        AuditLogger.logFromSession('USER_STATUS_CHANGE', { details: { userId, newStatus }, success: true });
      } else {
        const data = await response.json().catch(() => null);
        const parsed = ErrorHandler.parseApiError({ status: response.status, data });
        AuditLogger.logFromSession('USER_STATUS_CHANGE', { details: { userId, newStatus }, errorMessage: parsed.message, success: false });
        alert(ErrorHandler.getUserMessage(parsed.type).message);
      }
    } catch (err) {
      const parsed = ErrorHandler.parseApiError(err);
      AuditLogger.logFromSession('USER_STATUS_CHANGE', { details: { userId, newStatus }, errorMessage: parsed.message, success: false });
      alert(ErrorHandler.getUserMessage(parsed.type).message);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`
    );
    if (!confirmed) return;

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const authToken = RBACAuth.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/users/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userIds: selectedUsers, action })
      });

      if (response.ok) {
        AuditLogger.logFromSession('USER_BULK_ACTION', { details: { action, count: selectedUsers.length }, success: true });
        setSelectedUsers([]);
        fetchUsers();
      } else {
        const data = await response.json().catch(() => null);
        const parsed = ErrorHandler.parseApiError({ status: response.status, data });
        alert(ErrorHandler.getUserMessage(parsed.type).message);
      }
    } catch (err) {
      const parsed = ErrorHandler.parseApiError(err);
      alert(ErrorHandler.getUserMessage(parsed.type).message);
    }
  };

  const filteredUsers = users.filter(user => {
    const emailStr = getEmailString(user.email);
    const matchesSearch = 
      emailStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: RoleName) => {
    const colors: Record<RoleName, string> = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      EDITOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      AUTHOR: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      MODERATOR: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[role] || colors.VIEWER;
  };

  const getStatusColor = (status: User['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[status] || colors.inactive;
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span> Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{users.filter(u => ['SUPER_ADMIN', 'ADMIN'].includes(u.role)).length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">MFA Enabled</p>
          <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.mfaEnabled).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as RoleName | 'all')}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Roles</option>
            {ROLE_HIERARCHY.map(role => (
              <option key={role} value={role}>{ROLE_DEFINITIONS[role].displayName}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
          <span className="text-blue-800 dark:text-blue-300">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Deactivate
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

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p className="text-lg font-medium">Error loading users</p>
            <p className="text-sm">{error}</p>
            <button onClick={fetchUsers} className="mt-4 text-blue-600 hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">MFA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Login</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{getEmailString(user.email)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as RoleName)}
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user.role)} border-0 cursor-pointer`}
                        >
                          {ROLE_HIERARCHY.map(role => (
                            <option key={role} value={role}>{ROLE_DEFINITIONS[role].displayName}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.mfaEnabled ? (
                          <span className="text-green-600">✓ Enabled</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.id, user.status === 'suspended' ? 'active' : 'suspended')}
                            className={`text-sm ${user.status === 'suspended' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                          >
                            {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Distribution Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Role Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ROLE_HIERARCHY.map(role => {
            const count = users.filter(u => u.role === role).length;
            const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
            return (
              <div key={role} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${percentage * 1.76} 176`}
                      className="text-blue-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                    {count}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground">{ROLE_DEFINITIONS[role].icon}</p>
                <p className="text-xs text-muted-foreground">{ROLE_DEFINITIONS[role].displayName}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// Create User Modal Component
function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER' as RoleName,
    sendInvite: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const authToken = RBACAuth.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        AuditLogger.logFromSession('USER_CREATE', { details: { email: formData.email, role: formData.role }, success: true });
        onSuccess();
      } else {
        const data = await response.json().catch(() => null);
        const parsed = ErrorHandler.parseApiError({ status: response.status, data });
        setError(ErrorHandler.getUserMessage(parsed.type).message);
        AuditLogger.logFromSession('USER_CREATE', { details: { email: formData.email }, errorMessage: parsed.message, success: false });
      }
    } catch (err) {
      const parsed = ErrorHandler.parseApiError(err);
      setError(ErrorHandler.getUserMessage(parsed.type).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-foreground mb-4">Create New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleName })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              {ROLE_HIERARCHY.map(role => (
                <option key={role} value={role}>{ROLE_DEFINITIONS[role].displayName}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendInvite"
              checked={formData.sendInvite}
              onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="sendInvite" className="text-sm text-foreground">Send invitation email</label>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: getEmailString(user.email),
    role: user.role,
    status: user.status,
    resetPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const authToken = RBACAuth.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        AuditLogger.logFromSession('USER_UPDATE', { details: { userId: user.id, changes: formData }, success: true });
        onSuccess();
      } else {
        const data = await response.json().catch(() => null);
        const parsed = ErrorHandler.parseApiError({ status: response.status, data });
        setError(ErrorHandler.getUserMessage(parsed.type).message);
        AuditLogger.logFromSession('USER_UPDATE', { details: { userId: user.id }, errorMessage: parsed.message, success: false });
      }
    } catch (err) {
      const parsed = ErrorHandler.parseApiError(err);
      setError(ErrorHandler.getUserMessage(parsed.type).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-foreground mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleName })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              {ROLE_HIERARCHY.map(role => (
                <option key={role} value={role}>{ROLE_DEFINITIONS[role].displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="resetPassword"
              checked={formData.resetPassword}
              onChange={(e) => setFormData({ ...formData, resetPassword: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="resetPassword" className="text-sm text-foreground">Send password reset email</label>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <SuperAdminRoute>
      <UserManagementContent />
    </SuperAdminRoute>
  );
}


