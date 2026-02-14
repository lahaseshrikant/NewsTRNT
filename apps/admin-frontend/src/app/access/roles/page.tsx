// src/app/admin/access/roles/page.tsx - Roles & Permissions Management
// Configure role definitions, hierarchy, and inheritance
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import { 
  ROLES, 
  ROLE_HIERARCHY, 
  ROLE_DEFINITIONS, 
  UserRole,
  Permission
} from '@/config/rbac';
import AuditLogger from '@/lib/audit-logger';

interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  inherited: Permission[];
}

function RolesManagementContent() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Permission[]>>({
    SUPER_ADMIN: ['*'] as Permission[],
    ADMIN: [
      'dashboard.view', 'dashboard.advanced',
      'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish',
      'categories.view', 'categories.manage',
      'users.view', 'users.create', 'users.edit',
      'media.view', 'media.upload', 'media.delete',
      'comments.view', 'comments.moderate', 'comments.delete',
      'analytics.view'
    ] as Permission[],
    EDITOR: [
      'dashboard.view',
      'content.view', 'content.create', 'content.edit', 'content.publish',
      'categories.view', 'categories.manage',
      'media.view', 'media.upload',
      'comments.view', 'comments.moderate',
      'analytics.view'
    ] as Permission[],
    AUTHOR: [
      'dashboard.view',
      'content.view', 'content.create', 'content.edit_own',
      'categories.view',
      'media.view', 'media.upload',
      'comments.view'
    ] as Permission[],
    MODERATOR: [
      'dashboard.view',
      'content.view',
      'comments.view', 'comments.moderate', 'comments.delete',
      'users.view'
    ] as Permission[],
    VIEWER: [
      'dashboard.view',
      'content.view',
      'categories.view'
    ] as Permission[]
  });

  const getInheritedPermissions = (role: UserRole): Permission[] => {
    const roleIndex = ROLE_HIERARCHY.indexOf(role);
    const inherited: Set<Permission> = new Set();
    
    // Higher roles inherit from lower roles
    for (let i = roleIndex + 1; i < ROLE_HIERARCHY.length; i++) {
      const lowerRole = ROLE_HIERARCHY[i];
      rolePermissions[lowerRole]?.forEach(p => inherited.add(p));
    }
    
    return Array.from(inherited);
  };

  const getAllPermissions = (role: UserRole): Permission[] => {
    const direct = rolePermissions[role] || [];
    const inherited = getInheritedPermissions(role);
    return [...new Set([...direct, ...inherited])];
  };

  const permissionCategories = [
    {
      name: 'Content',
      icon: '📰',
      permissions: ['content.view', 'content.create', 'content.edit', 'content.edit_own', 'content.delete', 'content.publish'] as Permission[]
    },
    {
      name: 'Categories',
      icon: '📁',
      permissions: ['categories.view', 'categories.manage'] as Permission[]
    },
    {
      name: 'Users',
      icon: '👥',
      permissions: ['users.view', 'users.create', 'users.edit', 'users.delete'] as Permission[]
    },
    {
      name: 'Media',
      icon: '🖼️',
      permissions: ['media.view', 'media.upload', 'media.delete'] as Permission[]
    },
    {
      name: 'Comments',
      icon: '💬',
      permissions: ['comments.view', 'comments.moderate', 'comments.delete'] as Permission[]
    },
    {
      name: 'System',
      icon: '⚙️',
      permissions: ['analytics.view', 'system.view', 'system.settings', 'system.security'] as Permission[]
    }
  ];

  const handleTogglePermission = (permission: Permission) => {
    if (selectedRole === 'SUPER_ADMIN') return; // Super admin has all permissions
    
    setRolePermissions(prev => {
      const current = prev[selectedRole] || [];
      const updated = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission];
      
      return { ...prev, [selectedRole]: updated };
    });
  };

  const handleSaveChanges = async () => {
    try {
      // In production, save to API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      AuditLogger.logFromSession('CONFIG_UPDATE', {
        resource: 'role-permissions',
        resourceId: selectedRole,
        details: { message: `Updated permissions for ${selectedRole}` }
      });
      
      setEditMode(false);
      alert('Permissions saved successfully!');
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  const roleConfig = ROLE_DEFINITIONS[selectedRole];
  const allPermissions = getAllPermissions(selectedRole);
  const inheritedPermissions = getInheritedPermissions(selectedRole);
  const directPermissions = rolePermissions[selectedRole] || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/access" className="hover:text-foreground">Access Control</Link>
            <span>/</span>
            <span className="text-foreground">Roles & Permissions</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🎭 Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Configure role definitions, permissions, and inheritance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>✏️</span> Edit Permissions
            </button>
          )}
        </div>
      </div>

      {/* Role Hierarchy Visualization */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <h2 className="text-lg font-semibold text-foreground mb-4">Role Hierarchy</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Higher level roles inherit all permissions from lower level roles
        </p>
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {ROLE_HIERARCHY.map((role, idx) => {
            const config = ROLE_DEFINITIONS[role];
            const isSelected = role === selectedRole;
            return (
              <React.Fragment key={role}>
                <button
                  onClick={() => setSelectedRole(role)}
                  className={`flex flex-col items-center min-w-[120px] p-4 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${config.bgColor} border-4 ${
                    isSelected ? 'border-blue-500' : 'border-white dark:border-gray-800'
                  } shadow-lg`}>
                    {config.icon}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-foreground'} text-center`}>
                    {config.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {config.level}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {getAllPermissions(role).length} permissions
                  </p>
                </button>
                {idx < ROLE_HIERARCHY.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 mx-2 min-w-[20px]" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Role Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Info */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${roleConfig.bgColor}`}>
              {roleConfig.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{roleConfig.displayName}</h2>
              <p className="text-sm text-muted-foreground">Level {roleConfig.level}</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {roleConfig.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Direct Permissions</span>
              <span className="font-medium text-foreground">{directPermissions.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Inherited Permissions</span>
              <span className="font-medium text-foreground">{inheritedPermissions.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Total Permissions</span>
              <span className="font-bold text-blue-600">{allPermissions.length}</span>
            </div>
          </div>

          {inheritedPermissions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <span>ℹ️</span>
                This role inherits permissions from: {
                  ROLE_HIERARCHY.slice(ROLE_HIERARCHY.indexOf(selectedRole) + 1)
                    .map(r => ROLE_DEFINITIONS[r].displayName)
                    .join(', ')
                }
              </p>
            </div>
          )}
        </div>

        {/* Permissions by Category */}
        <div className="lg:col-span-2 space-y-4">
          {permissionCategories.map((category) => {
            const categoryPermissions = category.permissions;
            const grantedCount = categoryPermissions.filter(p => 
              allPermissions.includes(p)
            ).length;
            
            return (
              <div key={category.name} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.name}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {grantedCount}/{categoryPermissions.length} granted
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categoryPermissions.map((permission) => {
                    const hasPermission = allPermissions.includes(permission);
                    const isInherited = inheritedPermissions.includes(permission);
                    const isDirect = directPermissions.includes(permission);
                    const permissionLabel = permission.split('.')[1];
                    
                    return (
                      <button
                        key={permission}
                        onClick={() => editMode && handleTogglePermission(permission)}
                        disabled={!editMode || selectedRole === 'SUPER_ADMIN' || isInherited}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          hasPermission
                            ? isInherited
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-not-allowed'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        } ${editMode && !isInherited && selectedRole !== 'SUPER_ADMIN' ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''}`}
                        title={
                          isInherited 
                            ? `Inherited from lower roles` 
                            : isDirect 
                              ? 'Direct permission' 
                              : 'Not granted'
                        }
                      >
                        {hasPermission ? '✓' : '×'} {permissionLabel}
                        {isInherited && ' (inherited)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission Comparison Table */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-x-auto">
        <h2 className="text-lg font-semibold text-foreground mb-4">Permission Matrix</h2>
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">Permission</th>
              {ROLE_HIERARCHY.map(role => (
                <th key={role} className="p-3 text-center text-sm font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    {ROLE_DEFINITIONS[role].icon}
                    <span className="hidden md:inline">{ROLE_DEFINITIONS[role].displayName}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionCategories.map(category => (
              <React.Fragment key={category.name}>
                <tr className="bg-muted/30">
                  <td colSpan={ROLE_HIERARCHY.length + 1} className="p-2 text-sm font-medium text-foreground">
                    {category.icon} {category.name}
                  </td>
                </tr>
                {category.permissions.map(permission => (
                  <tr key={permission} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 text-sm text-foreground">
                      {permission.split('.')[1]}
                    </td>
                    {ROLE_HIERARCHY.map(role => {
                      const hasPermission = getAllPermissions(role).includes(permission);
                      const isInherited = getInheritedPermissions(role).includes(permission);
                      return (
                        <td key={role} className="p-3 text-center">
                          {hasPermission ? (
                            <span className={`inline-block w-6 h-6 rounded-full flex items-center justify-center text-white ${
                              isInherited ? 'bg-blue-400' : 'bg-green-500'
                            }`} title={isInherited ? 'Inherited' : 'Direct'}>
                              ✓
                            </span>
                          ) : (
                            <span className="inline-block w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-full bg-green-500"></span> Direct permission
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-full bg-blue-400"></span> Inherited permission
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700"></span> Not granted
          </span>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300">
              Understanding Role Inheritance
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Roles in NewsTRNT use a hierarchical inheritance model. Higher-level roles 
              automatically receive all permissions from lower-level roles. For example, 
              an Editor inherits all Author and Viewer permissions, plus their own Editor-specific 
              permissions. This simplifies permission management and ensures consistency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RolesManagementPage() {
  return (
    <SuperAdminRoute>
      <RolesManagementContent />
    </SuperAdminRoute>
  );
}

