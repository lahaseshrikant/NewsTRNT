// src/app/admin/access/page.tsx - Access Control Hub
// Unified dashboard for all role, permission, and admin management
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SuperAdminRoute } from '@/components/auth/RouteGuard';
import { ROLES, ROLE_HIERARCHY, ROLE_DEFINITIONS, UserRole } from '@/config/rbac';
import AuditLogger from '@/lib/audit-logger';
import RBACAuth from '@/lib/rbac-auth';
import { getEmailString } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface TeamStats {
  total: number;
  byRole: Record<UserRole, number>;
  activeToday: number;
  pendingInvites: number;
}

interface SecurityStats {
  mfaEnabled: number;
  mfaEnforced: boolean;
  recentSecurityEvents: number;
  activeSessions: number;
}

function AccessControlHubContent() {
  const [teamStats, setTeamStats] = useState<TeamStats>({
    total: 0,
    byRole: {} as Record<UserRole, number>,
    activeToday: 0,
    pendingInvites: 0
  });
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    mfaEnabled: 0,
    mfaEnforced: false,
    recentSecurityEvents: 0,
    activeSessions: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load audit stats
    const auditStats = AuditLogger.getStats(7);
    setRecentActivity(auditStats.recentCritical.slice(0, 5));
    
    // Mock team stats (in production, fetch from API)
    setTeamStats({
      total: 12,
      byRole: {
        SUPER_ADMIN: 2,
        ADMIN: 3,
        EDITOR: 4,
        AUTHOR: 2,
        MODERATOR: 1,
        VIEWER: 0
      },
      activeToday: 8,
      pendingInvites: 2
    });

    setSecurityStats({
      mfaEnabled: 5,
      mfaEnforced: false,
      recentSecurityEvents: auditStats.severityBreakdown.CRITICAL,
      activeSessions: 8
    });

    setLoading(false);
  };

  const quickActions = [
    {
      title: 'Invite Team Member',
      description: 'Send an invitation to join the team',
      icon: '➕',
      href: '/access/team?action=invite',
      color: 'bg-blue-500'
    },
    {
      title: 'Create Custom Role',
      description: 'Define a new role with specific permissions',
      icon: '🎭',
      href: '/access/roles?action=create',
      color: 'bg-purple-500'
    },
    {
      title: 'Review Permissions',
      description: 'Audit and update permission assignments',
      icon: '🔍',
      href: '/access/permissions',
      color: 'bg-green-500'
    },
    {
      title: 'View Audit Logs',
      description: 'Review recent admin activities',
      icon: '📋',
      href: '/access/audit',
      color: 'bg-orange-500'
    }
  ];

  const accessSections = [
    {
      id: 'team',
      title: 'Team Management',
      description: 'Manage admin users, invite new members, assign roles',
      icon: '👥',
      href: '/access/team',
      stats: `${teamStats.total} members`,
      badge: teamStats.pendingInvites > 0 ? `${teamStats.pendingInvites} pending` : undefined
    },
    {
      id: 'roles',
      title: 'Role Definitions',
      description: 'Configure roles, hierarchy, and inheritance',
      icon: '🎭',
      href: '/access/roles',
      stats: `${ROLE_HIERARCHY.length} roles`
    },
    {
      id: 'permissions',
      title: 'Permission Matrix',
      description: 'View and manage granular permissions',
      icon: '🔐',
      href: '/access/permissions',
      stats: '60+ permissions'
    },
    {
      id: 'policies',
      title: 'Access Policies',
      description: 'Configure conditional access rules',
      icon: '📜',
      href: '/access/policies',
      stats: 'Coming soon',
      disabled: true
    },
    {
      id: 'audit',
      title: 'Audit Logs',
      description: 'Review all admin actions and changes',
      icon: '📋',
      href: '/access/audit',
      stats: `${AuditLogger.getLogs({ limit: 1000 }).length} events`
    },
    {
      id: 'activity',
      title: 'Activity Monitor',
      description: 'Real-time monitoring of admin activities',
      icon: '📊',
      href: '/access/activity',
      stats: `${teamStats.activeToday} active today`
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'MFA, sessions, password policies',
      icon: '🛡️',
      href: '/access/security',
      stats: `${securityStats.mfaEnabled} MFA enabled`
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🔐 Access Control Center
          </h1>
          <p className="text-muted-foreground">
            Unified management for roles, permissions, and admin access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/access/team?action=invite"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span> Invite Member
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-3xl font-bold text-foreground">{teamStats.total}</p>
                </div>
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-xs text-green-600 mt-2">
                {teamStats.activeToday} active today
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Roles Defined</p>
                  <p className="text-3xl font-bold text-foreground">{ROLE_HIERARCHY.length}</p>
                </div>
                <span className="text-3xl">🎭</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Hierarchical system
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-3xl font-bold text-foreground">{securityStats.activeSessions}</p>
                </div>
                <span className="text-3xl">🔌</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all roles
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Events</p>
                  <p className={`text-3xl font-bold ${securityStats.recentSecurityEvents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {securityStats.recentSecurityEvents}
                  </p>
                </div>
                <span className="text-3xl">🚨</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last 7 days
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="p-4 rounded-xl border border-border hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <span className={`text-2xl inline-block p-2 ${action.color} text-white rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </span>
                  <h3 className="font-medium text-foreground">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessSections.map((section) => (
              <Link
                key={section.id}
                href={section.disabled ? '#' : section.href}
                className={`p-6 bg-card border border-border rounded-xl transition-all ${
                  section.disabled 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:border-blue-500 hover:shadow-lg group'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {section.icon}
                  </span>
                  {section.badge && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs rounded-full font-medium">
                      {section.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1">{section.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 font-medium">{section.stats}</span>
                  {!section.disabled && (
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Role Distribution & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Distribution */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Team Role Distribution</h2>
              <div className="space-y-3">
                {ROLE_HIERARCHY.map((role) => {
                  const count = teamStats.byRole[role] || 0;
                  const percentage = teamStats.total > 0 ? (count / teamStats.total) * 100 : 0;
                  const roleConfig = ROLE_DEFINITIONS[role];
                  
                  return (
                    <div key={role} className="flex items-center gap-3">
                      <span className="text-xl w-8">{roleConfig.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {roleConfig.displayName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} {count === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 rounded-full h-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link 
                href="/access/team"
                className="inline-block mt-4 text-sm text-blue-600 hover:underline"
              >
                View all team members →
              </Link>
            </div>

            {/* Recent Security Activity */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Security Events</h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((event, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                    >
                      <span className="text-xl">⚠️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {event.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getEmailString(event.userEmail)} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-2 block">✅</span>
                  <p className="text-muted-foreground">No security events to report</p>
                  <p className="text-xs text-muted-foreground mt-1">All systems operating normally</p>
                </div>
              )}
              <Link 
                href="/access/audit"
                className="inline-block mt-4 text-sm text-blue-600 hover:underline"
              >
                View full audit log →
              </Link>
            </div>
          </div>

          {/* Role Hierarchy Visualization */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Role Hierarchy</h2>
              <Link 
                href="/access/roles"
                className="text-sm text-blue-600 hover:underline"
              >
                Manage roles →
              </Link>
            </div>
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {ROLE_HIERARCHY.map((role, idx) => {
                const roleConfig = ROLE_DEFINITIONS[role];
                return (
                  <React.Fragment key={role}>
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${roleConfig.bgColor} border-4 border-white dark:border-gray-800 shadow-lg`}>
                        {roleConfig.icon}
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground text-center">
                        {roleConfig.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Level {roleConfig.level}
                      </p>
                    </div>
                    {idx < ROLE_HIERARCHY.length - 1 && (
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 mx-2 min-w-[20px]" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Higher level roles inherit permissions from lower level roles
            </p>
          </div>

          {/* Information Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-300">
                  Access Control Best Practices
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Follow the principle of least privilege - assign the minimum permissions needed for each role. 
                  Regularly audit access logs and review role assignments quarterly.
                </p>
                <Link 
                  href="/docs/security-best-practices"
                  className="inline-block mt-2 text-sm text-blue-600 hover:underline font-medium"
                >
                  Read security documentation →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AccessControlHubPage() {
  return (
    <SuperAdminRoute>
      <AccessControlHubContent />
    </SuperAdminRoute>
  );
}

