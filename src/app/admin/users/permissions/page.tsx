"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';

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
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@newstrnt.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T09:30:00Z',
      createdAt: '2024-01-01T10:00:00Z',
      permissions: [
        { id: 'content.create', name: 'Create Content', description: 'Create new articles and posts', category: 'content', granted: true },
        { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content', granted: true },
        { id: 'content.delete', name: 'Delete Content', description: 'Delete articles and posts', category: 'content', granted: true },
        { id: 'users.view', name: 'View Users', description: 'View user list and profiles', category: 'users', granted: true },
        { id: 'users.manage', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'users', granted: true },
        { id: 'system.settings', name: 'System Settings', description: 'Access system configuration', category: 'system', granted: true },
        { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reports', category: 'analytics', granted: true }
      ]
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@newstrnt.com',
      role: 'editor',
      status: 'active',
      lastLogin: '2024-01-14T14:20:00Z',
      createdAt: '2024-01-02T11:30:00Z',
      permissions: [
        { id: 'content.create', name: 'Create Content', description: 'Create new articles and posts', category: 'content', granted: true },
        { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content', granted: true },
        { id: 'content.delete', name: 'Delete Content', description: 'Delete articles and posts', category: 'content', granted: false },
        { id: 'users.view', name: 'View Users', description: 'View user list and profiles', category: 'users', granted: true },
        { id: 'users.manage', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'users', granted: false },
        { id: 'system.settings', name: 'System Settings', description: 'Access system configuration', category: 'system', granted: false },
        { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reports', category: 'analytics', granted: true }
      ]
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@newstrnt.com',
      role: 'author',
      status: 'active',
      lastLogin: '2024-01-13T16:45:00Z',
      createdAt: '2024-01-05T09:15:00Z',
      permissions: [
        { id: 'content.create', name: 'Create Content', description: 'Create new articles and posts', category: 'content', granted: true },
        { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content', granted: false },
        { id: 'content.delete', name: 'Delete Content', description: 'Delete articles and posts', category: 'content', granted: false },
        { id: 'users.view', name: 'View Users', description: 'View user list and profiles', category: 'users', granted: false },
        { id: 'users.manage', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'users', granted: false },
        { id: 'system.settings', name: 'System Settings', description: 'Access system configuration', category: 'system', granted: false },
        { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reports', category: 'analytics', granted: false }
      ]
    }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to all system features',
      permissions: ['content.create', 'content.edit', 'content.delete', 'users.view', 'users.manage', 'system.settings', 'analytics.view'],
      userCount: 1,
      color: '#EF4444'
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Content management and user viewing permissions',
      permissions: ['content.create', 'content.edit', 'users.view', 'analytics.view'],
      userCount: 1,
      color: '#3B82F6'
    },
    {
      id: 'author',
      name: 'Author',
      description: 'Content creation permissions only',
      permissions: ['content.create'],
      userCount: 1,
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
          <div className="p-8 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">User Roles</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
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
                      className="text-slate-400 hover:text-blue-600 transition-colors duration-300"
                    >
                      ✏️
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    {role.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{role.userCount} users</span>
                    <span className="text-slate-500">{role.permissions.length} permissions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users and Permissions Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
          <div className="p-8 border-b border-border/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  User Permissions
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Manage individual user permissions and access controls
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-border/50 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as User['role'])}
                        className="px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground text-sm"
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
                      <div className="text-sm text-slate-500">
                        {formatDate(user.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openPermissionModal(user)}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300 text-sm font-medium"
                      >
                        🔐 Manage Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      {isPermissionModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground">
                Manage Permissions: {selectedUser.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
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
                              <div className="text-sm text-slate-500">{permission.description}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permission.granted}
                                onChange={() => toggleUserPermission(selectedUser.id, permission.id)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
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
