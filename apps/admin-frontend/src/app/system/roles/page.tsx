// src/app/admin/system/roles/page.tsx - Role & Permission Management
'use client';

import React, { useState } from 'react';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import { ROLES, UserRole, Permission, RoleConfig } from '@/config/rbac';
import AuditLogger from '@/lib/audit-logger';

// Permission categories for display
const PERMISSION_CATEGORIES: Record<string, { label: string; permissions: Permission[] }> = {
  dashboard: {
    label: '📊 Dashboard',
    permissions: ['dashboard.view', 'dashboard.advanced']
  },
  content: {
    label: '📝 Content',
    permissions: ['content.view', 'content.create', 'content.edit', 'content.edit_own', 'content.delete', 'content.delete_own', 'content.publish', 'content.unpublish', 'content.schedule', 'content.feature', 'content.restore']
  },
  categories: {
    label: '📁 Categories & Tags',
    permissions: ['categories.view', 'categories.manage', 'tags.view', 'tags.manage']
  },
  media: {
    label: '🎬 Media',
    permissions: ['media.view', 'media.upload', 'media.delete']
  },
  users: {
    label: '👤 Users',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.ban']
  },
  analytics: {
    label: '📈 Analytics',
    permissions: ['analytics.view', 'analytics.export', 'analytics.advanced']
  },
  comments: {
    label: '💬 Comments',
    permissions: ['comments.view', 'comments.moderate', 'comments.delete']
  },
  reports: {
    label: '⚠️ Reports',
    permissions: ['reports.view', 'reports.resolve']
  },
  system: {
    label: '⚙️ System',
    permissions: ['system.view', 'system.settings', 'system.backup', 'system.logs', 'system.security']
  }
};

function RoleManagementContent() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('VIEWER');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy'>('grid');

  const roleConfig = ROLES[selectedRole];

  const hasPermission = (permission: Permission): boolean => {
    if (roleConfig.permissions.includes('*')) return true;
    return roleConfig.permissions.includes(permission);
  };

  const getRoleHierarchy = () => {
    return Object.entries(ROLES)
      .sort(([, a], [, b]) => b.level - a.level)
      .map(([role, config]) => ({ role: role as UserRole, config }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage role hierarchy and granular permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-card shadow' : ''}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1 rounded ${viewMode === 'hierarchy' ? 'bg-card shadow' : ''}`}
            >
              Hierarchy
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'hierarchy' ? (
        /* Role Hierarchy View */
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Role Hierarchy</h2>
          <div className="space-y-2">
            {getRoleHierarchy().map(({ role, config }, index) => (
              <div
                key={role}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedRole === role ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-border'
                }`}
                style={{ marginLeft: `${(5 - index) * 24}px` }}
                onClick={() => setSelectedRole(role)}
              >
                <span className="text-2xl">{config.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${config.color}`}>{config.displayName}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">Level {config.level}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {config.permissions.includes('*') ? 'All' : config.permissions.length} permissions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Can manage: {config.canManageRoles.length > 0 ? config.canManageRoles.join(', ') : 'None'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(ROLES).map(([role, config]) => (
            <div
              key={role}
              onClick={() => setSelectedRole(role as UserRole)}
              className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === role ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border'
              }`}
            >
              <div className={`text-3xl mb-2 ${config.bgColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
                {config.icon}
              </div>
              <h3 className={`font-semibold ${config.color}`}>{config.displayName}</h3>
              <p className="text-xs text-muted-foreground mt-1">Level {config.level}</p>
              <p className="text-xs text-muted-foreground">
                {config.permissions.includes('*') ? 'All' : config.permissions.length} perms
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Selected Role Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`text-4xl ${roleConfig.bgColor} w-16 h-16 rounded-xl flex items-center justify-center`}>
              {roleConfig.icon}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${roleConfig.color}`}>{roleConfig.displayName}</h2>
              <p className="text-sm text-muted-foreground">Level {roleConfig.level}</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">{roleConfig.description}</p>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">Dashboard Path</p>
              <p className="text-sm text-muted-foreground">{roleConfig.dashboardPath}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Can Manage Roles</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {roleConfig.canManageRoles.length > 0 ? (
                  roleConfig.canManageRoles.map(r => (
                    <span key={r} className="text-xs bg-muted px-2 py-1 rounded">{r}</span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Permissions</h3>
          
          {roleConfig.permissions.includes('*') ? (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-purple-800 dark:text-purple-300 font-semibold">👑 Full Access</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                This role has all permissions (wildcard access)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(PERMISSION_CATEGORIES).map(([category, { label, permissions }]) => {
                const grantedInCategory = permissions.filter(p => hasPermission(p));
                if (grantedInCategory.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-foreground mb-2">{label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map(permission => {
                        const granted = hasPermission(permission);
                        return (
                          <span
                            key={permission}
                            className={`text-xs px-2 py-1 rounded ${
                              granted
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 line-through'
                            }`}
                          >
                            {permission.split('.')[1]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Role Comparison */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Permission Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-4 font-medium">Category</th>
                {Object.entries(ROLES).map(([role, config]) => (
                  <th key={role} className="text-center py-2 px-2">
                    <span title={config.displayName}>{config.icon}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERMISSION_CATEGORIES).map(([category, { label, permissions }]) => (
                <tr key={category} className="border-b border-border">
                  <td className="py-2 px-4 font-medium">{label}</td>
                  {Object.entries(ROLES).map(([role, config]) => {
                    const count = config.permissions.includes('*')
                      ? permissions.length
                      : permissions.filter(p => config.permissions.includes(p)).length;
                    const percentage = Math.round((count / permissions.length) * 100);
                    return (
                      <td key={role} className="text-center py-2 px-2">
                        <div 
                          className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium ${
                            percentage === 100 ? 'bg-green-100 text-green-800' :
                            percentage > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {percentage}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">📖 Role System Documentation</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-400">
          <div>
            <h4 className="font-medium mb-2">Role Hierarchy</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Higher-level roles inherit access from lower levels</li>
              <li>Super Admin has wildcard (*) access to all permissions</li>
              <li>Each role has a specific dashboard path for focused workflows</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Permission Categories</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><code>view</code> - Read-only access</li>
              <li><code>create</code> - Create new resources</li>
              <li><code>edit</code> - Modify any resource</li>
              <li><code>edit_own</code> - Modify only own resources</li>
              <li><code>delete</code> - Remove resources</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoleManagementPage() {
  return (
    <SuperAdminRoute>
      <RoleManagementContent />
    </SuperAdminRoute>
  );
}

