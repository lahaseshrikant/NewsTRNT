// src/app/admin/access/team/page.tsx - Team Management
// Manage admin team members, invitations, and role assignments
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import { ROLES, ROLE_HIERARCHY, ROLE_DEFINITIONS, UserRole } from '@/config/rbac';
import AuditLogger from '@/lib/audit-logger';
import ErrorHandler from '@/lib/error-handler';
import RBACAuth from '@/lib/rbac-auth';
import { getEmailString } from '@/lib/utils';

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  avatar?: string;
  lastActive?: string;
  createdAt: string;
  mfaEnabled: boolean;
  invitedBy?: string;
}

interface InvitationData {
  email: string;
  role: UserRole;
  message?: string;
}

function TeamManagementContent() {
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [inviteData, setInviteData] = useState<InvitationData>({ email: '', role: 'VIEWER' });
  const [processing, setProcessing] = useState(false);

  // Check for action query param on load
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'invite') {
      setShowInviteModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/admin/team`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const mappedMembers: TeamMember[] = (data.team || []).map((user: any) => ({
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role || 'VIEWER',
          status: user.isActive ? 'active' : 'inactive',
          lastActive: user.lastLoginAt || user.updatedAt,
          createdAt: user.createdAt,
          mfaEnabled: user.mfaEnabled || false,
          invitedBy: user.invitedBy
        }));
        setMembers(mappedMembers);
      } else {
        console.error('Failed to fetch team members');
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    if (filter !== 'all' && member.status !== filter) return false;
    if (roleFilter !== 'all' && member.role !== roleFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        member.name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleSelectMember = (id: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const handleInvite = async () => {
    if (!inviteData.email || !inviteData.role) return;
    
    setProcessing(true);
    try {
      // In production, send invitation via API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add pending member
      const newMember: TeamMember = {
        id: Date.now().toString(),
        email: inviteData.email,
        name: inviteData.email.split('@')[0],
        role: inviteData.role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        mfaEnabled: false,
        invitedBy: 'current-user@newstrnt.com'
      };
      
      setMembers([...members, newMember]);
      
      AuditLogger.logFromSession('USER_CREATE', {
        resource: 'team-member',
        resourceId: newMember.id,
        details: { message: `Invited ${inviteData.email} as ${inviteData.role}` }
      });
      
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'VIEWER' });
    } catch (error) {
      console.error('Failed to send invitation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMembers(members.map(m => 
        m.id === editingMember.id ? editingMember : m
      ));
      
      AuditLogger.logFromSession('USER_UPDATE', {
        resource: 'team-member',
        resourceId: editingMember.id,
        details: { message: `Updated ${editingMember.email}` }
      });
      
      setShowEditModal(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to update member:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: UserRole) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    try {
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      
      AuditLogger.logFromSession('ROLE_ASSIGN', {
        resource: 'team-member',
        resourceId: memberId,
        details: { message: `Changed ${member.email} role from ${member.role} to ${newRole}` },
        oldValues: { role: member.role },
        newValues: { role: newRole }
      });
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  const handleDeactivate = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    if (!confirm(`Are you sure you want to deactivate ${member.name}?`)) return;
    
    try {
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, status: 'inactive' as const } : m
      ));
      
      AuditLogger.logFromSession('USER_UPDATE', {
        resource: 'team-member',
        resourceId: memberId,
        details: { message: `Deactivated ${member.email}`, action: 'deactivate' }
      });
    } catch (error) {
      console.error('Failed to deactivate member:', error);
    }
  };

  const handleActivate = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    try {
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, status: 'active' as const } : m
      ));
      
      AuditLogger.logFromSession('USER_UPDATE', {
        resource: 'team-member',
        resourceId: memberId,
        details: { message: `Activated ${member.email}`, action: 'activate' }
      });
    } catch (error) {
      console.error('Failed to activate member:', error);
    }
  };

  const handleResendInvite = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      AuditLogger.logFromSession('USER_UPDATE', {
        resource: 'team-member',
        resourceId: memberId,
        details: { message: `Resent invitation to ${member.email}`, action: 'resend_invite' }
      });
      
      alert(`Invitation resent to ${member.email}`);
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'remove') => {
    if (selectedMembers.size === 0) return;
    
    const count = selectedMembers.size;
    if (!confirm(`Are you sure you want to ${action} ${count} member${count > 1 ? 's' : ''}?`)) return;
    
    try {
      if (action === 'remove') {
        setMembers(members.filter(m => !selectedMembers.has(m.id)));
      } else {
        setMembers(members.map(m => 
          selectedMembers.has(m.id) 
            ? { ...m, status: action === 'activate' ? 'active' as const : 'inactive' as const }
            : m
        ));
      }
      
      AuditLogger.logFromSession('USER_UPDATE', {
        resource: 'team-members',
        details: { message: `Bulk ${action}: ${count} members`, bulkAction: action, count }
      });
      
      setSelectedMembers(new Set());
    } catch (error) {
      console.error(`Failed to ${action} members:`, error);
    }
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return badges[status] || badges.inactive;
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/access" className="hover:text-foreground">Access Control</Link>
            <span>/</span>
            <span className="text-foreground">Team Management</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            👥 Team Management
          </h1>
          <p className="text-muted-foreground">
            Manage admin team members, invitations, and role assignments
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span> Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <p className="text-2xl font-bold text-foreground">{members.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {members.filter(m => m.status === 'active').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {members.filter(m => m.status === 'pending').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">MFA Enabled</p>
          <p className="text-2xl font-bold text-blue-600">
            {members.filter(m => m.mfaEnabled).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          {ROLE_HIERARCHY.map(role => (
            <option key={role} value={role}>
              {ROLE_DEFINITIONS[role].icon} {ROLE_DEFINITIONS[role].displayName}
            </option>
          ))}
        </select>

        {selectedMembers.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              {selectedMembers.size} selected
            </span>
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction('remove')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Member</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Last Active</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Security</th>
                <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((member) => {
                const roleConfig = ROLE_DEFINITIONS[member.role as UserRole] ?? ROLE_DEFINITIONS.VIEWER;
                // Log unexpected/unknown role values in dev to help debug API issues
                if (process.env.NODE_ENV !== 'production' && !ROLE_DEFINITIONS[member.role as UserRole]) {
                  // eslint-disable-next-line no-console
                  console.warn('TeamManagement: unknown role from API', member.role, 'falling back to', roleConfig.name);
                }

                return (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(member.id)}
                        onChange={() => handleSelectMember(member.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${roleConfig?.bgColor ?? 'bg-gray-100'} flex items-center justify-center text-lg`}>
                          {member.avatar || member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{getEmailString(member.email)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value as UserRole)}
                          className={`px-3 py-1 rounded-lg border-0 text-sm font-medium ${roleConfig?.bgColor ?? 'bg-gray-100'} ${roleConfig?.color ?? 'text-gray-700'}`}
                        disabled={member.role === 'SUPER_ADMIN'}
                      >
                        {ROLE_HIERARCHY.map(role => (
                          <option key={role} value={role}>
                            {ROLE_DEFINITIONS[role].icon} {ROLE_DEFINITIONS[role].displayName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.status)}`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {member.status === 'pending' ? (
                        <span className="text-yellow-600">Awaiting response</span>
                      ) : (
                        getTimeAgo(member.lastActive)
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {member.mfaEnabled ? (
                          <span className="text-green-600 text-sm">🔒 MFA</span>
                        ) : (
                          <span className="text-yellow-600 text-sm">⚠️ No MFA</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {member.status === 'pending' && (
                          <button
                            onClick={() => handleResendInvite(member.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            title="Resend invitation"
                          >
                            📧
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg"
                          title="Edit member"
                        >
                          ✏️
                        </button>
                        {member.status === 'active' ? (
                          <button
                            onClick={() => handleDeactivate(member.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg"
                            title="Deactivate"
                            disabled={member.role === 'SUPER_ADMIN'}
                          >
                            ⏸️
                          </button>
                        ) : member.status === 'inactive' ? (
                          <button
                            onClick={() => handleActivate(member.id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                            title="Activate"
                          >
                            ▶️
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No members found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Invite Team Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role *
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {ROLE_HIERARCHY.filter(r => r !== 'SUPER_ADMIN').map(role => (
                    <option key={role} value={role}>
                      {ROLE_DEFINITIONS[role].icon} {ROLE_DEFINITIONS[role].displayName} - {ROLE_DEFINITIONS[role].description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteData.message || ''}
                  onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                  placeholder="Add a welcome message..."
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">
                  {ROLE_DEFINITIONS[inviteData.role].icon} {ROLE_DEFINITIONS[inviteData.role].displayName} Permissions:
                </h3>
                <p className="text-sm text-muted-foreground">
                  {ROLE_DEFINITIONS[inviteData.role].description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteData({ email: '', role: 'VIEWER' });
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteData.email || processing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Edit Team Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingMember.email}
                  disabled
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role
                </label>
                <select
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as UserRole })}
                  disabled={editingMember.role === 'SUPER_ADMIN'}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {ROLE_HIERARCHY.map(role => (
                    <option key={role} value={role}>
                      {ROLE_DEFINITIONS[role].icon} {ROLE_DEFINITIONS[role].displayName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={editingMember.status}
                  onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as TeamMember['status'] })}
                  disabled={editingMember.role === 'SUPER_ADMIN'}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMember(null);
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMember}
                disabled={processing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamManagementPage() {
  return (
    <SuperAdminRoute>
      <TeamManagementContent />
    </SuperAdminRoute>
  );
}

