// src/app/admin/users/team/page.tsx - Team Management Page
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminRoute } from '@/components/admin/RouteGuard';
import { useRBAC, RoleBadge, PermissionGate, SuperAdminOnly } from '@/components/rbac';
import { UserRole, ROLES } from '@/config/rbac';
import { getEmailString } from '@/lib/utils';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string | null;
  joinDate: string;
  articlesCount?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function TeamManagementContent() {
  const { session, isSuperAdmin, isAdmin } = useRBAC();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Fetch team members from API
  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}/api/admin/team?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch team');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      // Map API response to TeamMember format
      const members = (data.team || []).map((m: any) => ({
        id: m.id,
        email: m.email,
        name: m.name || 'Unknown',
        avatar: m.avatar,
        role: 'ADMIN', // All team members are admins
        status: m.status || 'active',
        lastLogin: m.lastLogin,
        joinDate: m.joinDate,
        articlesCount: m.articlesCount
      }));
      setTeamMembers(members);
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const filteredMembers = teamMembers.filter(member => {
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const roleStats = Object.entries(ROLES).map(([role, config]) => ({
    role,
    config,
    count: teamMembers.filter(m => m.role === role).length
  }));

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchTeam()}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl hover:bg-secondary/90 transition-colors"
          >
            🔄 Refresh
          </button>
          <SuperAdminOnly>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              + Invite Team Member
            </button>
          </SuperAdminOnly>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => fetchTeam()}
            className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {roleStats.map(({ role, config, count }) => (
          <div 
            key={role}
            className={`bg-card border border-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${filterRole === role ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilterRole(filterRole === role ? 'all' : role)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{config.icon}</span>
              <span className={`text-xs font-medium ${config.color}`}>{config.displayName.split(' ')[0]}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">Level {config.level}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          {Object.entries(ROLES).map(([role, config]) => (
            <option key={role} value={role}>{config.displayName}</option>
          ))}
        </select>
      </div>

      {/* Team Table */}
      {loading && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team members...</p>
        </div>
      )}

      {!loading && !error && (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Member</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Last Login</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Articles</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((member) => {
                const roleConfig = ROLES[member.role as UserRole] || ROLES.ADMIN;
                return (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${roleConfig.bgColor}`}>
                            <span className="text-lg">{roleConfig.icon}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{getEmailString(member.email)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={member.role as UserRole} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(member.lastLogin)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {member.articlesCount ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="View Profile"
                        >
                          👁️
                        </button>
                        <SuperAdminOnly>
                          <button 
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                            title="Edit Role"
                          >
                            ✏️
                          </button>
                          {member.role !== 'SUPER_ADMIN' && (
                            <button 
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                              title="Remove"
                            >
                              🗑️
                            </button>
                          )}
                        </SuperAdminOnly>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterRole !== 'all' 
                ? 'Try adjusting your filters or search term'
                : 'No admin team members yet'}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Role Permissions Reference */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Role Permissions Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ROLES).map(([role, config]) => (
            <div key={role} className={`p-4 rounded-lg border ${config.bgColor} border-opacity-50`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{config.icon}</span>
                <span className={`font-semibold ${config.color}`}>{config.displayName}</span>
                <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">Lvl {config.level}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
              <div className="text-xs text-muted-foreground">
                <strong>Can manage:</strong> {config.canManageRoles.length > 0 ? config.canManageRoles.join(', ') : 'None'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-foreground mb-4">Invite Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground">
                  {Object.entries(ROLES)
                    .filter(([role]) => role !== 'SUPER_ADMIN')
                    .map(([role, config]) => (
                      <option key={role} value={role}>{config.displayName}</option>
                    ))
                  }
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <AdminRoute>
      <TeamManagementContent />
    </AdminRoute>
  );
}
