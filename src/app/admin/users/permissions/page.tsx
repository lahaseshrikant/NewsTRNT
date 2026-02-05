"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';
import { getEmailString } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'subscriber';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'users' | 'system' | 'analytics';
  granted: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
}

const UserPermissions: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to all system features',
      permissions: ['content.create', 'content.edit', 'content.delete', 'users.view', 'users.manage', 'system.settings', 'analytics.view'],
      userCount: 0,
      color: '#EF4444'
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Content management and user viewing permissions',
      permissions: ['content.create', 'content.edit', 'users.view', 'analytics.view'],
      userCount: 0,
      color: '#3B82F6'
    },
    {
      id: 'author',
      name: 'Author',
      description: 'Content creation permissions only',
      permissions: ['content.create'],
      userCount: 0,
      color: '#10B981'
    },
    {
      id: 'subscriber',
      name: 'Subscriber',
      description: 'Basic user access with no administrative permissions',
      permissions: [],
      userCount: 0,
      color: '#6B7280'
    }
  ]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        const sessionData = localStorage.getItem('newstrnt_admin_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const tokenPayload = {
            userId: session.userId,
            email: session.email,
            role: session.role,
            isAdmin: true,
            sessionId: session.sessionId,
            timestamp: session.timestamp || Date.now(),
            permissions: session.permissions || []
          };
          token = btoa(JSON.stringify(tokenPayload));
          localStorage.setItem('adminToken', token);
        }
      }
      
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/users?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      // Transform API data to include permissions based on role
      const transformedUsers: User[] = (data.users || []).map((user: any) => ({
        id: user.id,
        name: user.name || user.fullName || 'Unknown',
        email: user.email,
        role: user.isAdmin ? 'admin' : 'subscriber',
        status: user.status || 'active',
        lastLogin: user.lastLogin || new Date().toISOString(),
        createdAt: user.joinDate || new Date().toISOString(),
        permissions: getPermissionsForRole(user.isAdmin ? 'admin' : 'subscriber')
      }));
      
      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissionsForRole = (role: string): Permission[] => {
    const allPermissions = [
      { id: 'content.create', name: 'Create Content', description: 'Create new articles and posts', category: 'content' as const },
      { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content' as const },
      { id: 'content.delete', name: 'Delete Content', description: 'Delete articles and posts', category: 'content' as const },
      { id: 'users.view', name: 'View Users', description: 'View user list and profiles', category: 'users' as const },
      { id: 'users.manage', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'users' as const },
      { id: 'system.settings', name: 'System Settings', description: 'Access system configuration', category: 'system' as const },
      { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reports', category: 'analytics' as const }
    ];
    
    const rolePermissions: Record<string, string[]> = {
      admin: ['content.create', 'content.edit', 'content.delete', 'users.view', 'users.manage', 'system.settings', 'analytics.view'],
      editor: ['content.create', 'content.edit', 'users.view', 'analytics.view'],
      author: ['content.create'],
      subscriber: []
    };
    
    const granted = rolePermissions[role] || [];
    return allPermissions.map(p => ({ ...p, granted: granted.includes(p.id) }));
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const openPermissionModal = (user: User) => {
    setSelectedUser(user);
    setIsPermissionModalOpen(true);
  };

  const toggleUserPermission = (userId: string, permissionId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          permissions: user.permissions.map(perm =>
            perm.id === permissionId ? { ...perm, granted: !perm.granted } : perm
          )
        };
      }
      return user;
    }));
  };

  const updateUserRole = (userId: string, newRole: User['role']) => {
    const role = roles.find(r => r.id === newRole);
    if (!role) return;

    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          role: newRole,
          permissions: user.permissions.map(perm => ({
            ...perm,
            granted: role.permissions.includes(perm.id)
          }))
        };
      }
      return user;
    }));
  };

  const openRoleModal = (role: Role | null = null) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  const allPermissions = [
    { id: 'content.create', name: 'Create Content', description: 'Create new articles and posts', category: 'content' as const },
    { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content' as const },
    { id: 'content.delete', name: 'Delete Content', description: 'Delete articles and posts', category: 'content' as const },
    { id: 'content.publish', name: 'Publish Content', description: 'Publish and unpublish content', category: 'content' as const },
    { id: 'users.view', name: 'View Users', description: 'View user list and profiles', category: 'users' as const },
    { id: 'users.manage', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'users' as const },
    { id: 'users.permissions', name: 'Manage Permissions', description: 'Assign roles and permissions', category: 'users' as const },
    { id: 'system.settings', name: 'System Settings', description: 'Access system configuration', category: 'system' as const },
    { id: 'system.backup', name: 'System Backup', description: 'Create and restore backups', category: 'system' as const },
    { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reports', category: 'analytics' as const },
    { id: 'analytics.export', name: 'Export Analytics', description: 'Export analytics data', category: 'analytics' as const }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content': return 'blue';
      case 'users': return 'green';
      case 'system': return 'red';
      case 'analytics': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Permissions', href: '/admin/users/permissions' }
        ]}
      />

      <div className="space-y-8">
        {/* Roles Section */}
        <div className="bg-card rounded-2xl shadow-lg border border-border text-foreground transition-colors">
          <div className="p-8 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">User Roles</h2>
                <p className="text-muted-foreground mt-2">
                  Manage user roles and their default permissions
                </p>
              </div>
              <button
                onClick={() => openRoleModal()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                ➕ Add Role
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="p-6 rounded-xl border border-border/30 hover:shadow-lg transition-all duration-300"
                  style={{ borderLeftColor: role.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">{role.name}</h3>
                    <button
                      onClick={() => openRoleModal(role)}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      ✏️
                    </button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {role.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{role.userCount} users</span>
                    <span className="text-muted-foreground">{role.permissions.length} permissions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users and Permissions Section */}
        <div className="bg-card rounded-2xl shadow-lg border border-border text-foreground transition-colors">
          <div className="p-8 border-b border-border/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  User Permissions
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage individual user permissions and access controls
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-border/50 bg-muted">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-muted-foreground">Loading users...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">⚠️ {error}</div>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Users Table */}
          {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/60 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{getEmailString(user.email)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as User['role'])}
                        className="px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground text-sm"
                      >
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : user.status === 'inactive'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(user.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openPermissionModal(user)}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/15 transition-colors duration-300 text-sm font-medium"
                      >
                        🔐 Manage Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Permission Modal */}
      {isPermissionModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-border">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground">
                Manage Permissions: {selectedUser.name}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Role: {roles.find(r => r.id === selectedUser.role)?.name}
              </p>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {['content', 'users', 'system', 'analytics'].map(category => (
                  <div key={category}>
                    <h3 className={`text-lg font-semibold mb-3 text-${getCategoryColor(category)}-600`}>
                      {category.charAt(0).toUpperCase() + category.slice(1)} Permissions
                    </h3>
                    <div className="space-y-3">
                      {selectedUser.permissions
                        .filter(perm => perm.category === category)
                        .map(permission => (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-4 border border-border/30 rounded-xl"
                          >
                            <div>
                              <div className="font-medium text-foreground">{permission.name}</div>
                              <div className="text-sm text-muted-foreground">{permission.description}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permission.granted}
                                onChange={() => toggleUserPermission(selectedUser.id, permission.id)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end">
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminUserPermissionsPage() {
  return (
    <UnifiedAdminGuard requireSuperAdmin={true}>
      <UserPermissions />
    </UnifiedAdminGuard>
  );
}

