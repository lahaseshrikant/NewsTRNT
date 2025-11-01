"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'subscriber';
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastLogin: string;
  articlesCount: number;
  avatar?: string;
}

const UserManagement: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      joinDate: '2023-12-01',
      lastLogin: '2024-01-15 10:30',
      articlesCount: 15
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'editor',
      status: 'active',
      joinDate: '2023-11-15',
      lastLogin: '2024-01-14 16:45',
      articlesCount: 23
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'subscriber',
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-15 09:15',
      articlesCount: 0
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      role: 'editor',
      status: 'inactive',
      joinDate: '2023-10-20',
      lastLogin: '2024-01-05 14:20',
      articlesCount: 8
    }
  ]);

  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const roles = ['admin', 'editor', 'subscriber'];
  const statuses = ['active', 'inactive', 'banned'];

  const filteredUsers = users.filter(user => {
    const roleMatch = selectedRole === 'all' || user.role === selectedRole;
    const statusMatch = selectedStatus === 'all' || user.status === selectedStatus;
    const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && statusMatch && searchMatch;
  });

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      subscriber: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    return styles[role as keyof typeof styles] || styles.subscriber;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      banned: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'User Management' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts, permissions, and subscriber information</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              👤 Add User
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              📧 Send Newsletter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">
              {users.filter(u => u.role === 'subscriber').length}
            </div>
            <div className="text-sm text-muted-foreground">Subscribers</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">
              {users.filter(u => u.role === 'admin' || u.role === 'editor').length}
            </div>
            <div className="text-sm text-muted-foreground">Staff Members</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground w-64"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Role</label>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1"></div>
            <div className="flex space-x-2">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                🔄 Refresh
              </button>
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
                📊 Export
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">User</th>
                  <th className="text-left p-4 font-medium text-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Join Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Last Login</th>
                  <th className="text-left p-4 font-medium text-foreground">Articles</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">{user.joinDate}</td>
                    <td className="p-4 text-foreground">{user.lastLogin}</td>
                    <td className="p-4 text-foreground">{user.articlesCount}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Edit">
                          ✏️
                        </button>
                        <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300" title="View Profile">
                          👁️
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300" title="Send Message">
                          📧
                        </button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Delete">
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

        {/* Bulk Actions */}
        <div className="bg-card border border-border rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Bulk Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              📧 Send Newsletter
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              ✅ Activate Selected
            </button>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              ⏸️ Deactivate Selected
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              🚫 Ban Selected
            </button>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex space-x-2">
            <button className="bg-secondary text-secondary-foreground px-3 py-2 rounded hover:bg-secondary/90 transition-colors">
              Previous
            </button>
            <button className="bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminUsersPage() {
  return (
    <UnifiedAdminGuard>
      <UserManagement />
    </UnifiedAdminGuard>
  );
}

