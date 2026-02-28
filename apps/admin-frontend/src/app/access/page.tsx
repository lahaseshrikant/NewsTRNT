// src/app/admin/access/page.tsx - Access Control Hub
// Unified dashboard for all role, permission, and admin management
'use client';

import React, { useState, useEffect } from'react';
import Link from'next/link';
import { SuperAdminRoute } from'@/components/auth/RouteGuard';
import { ROLES, ROLE_HIERARCHY, ROLE_DEFINITIONS, UserRole } from'@/config/rbac';
import AuditLogger from'@/lib/utils/audit-logger';
import RBACAuth from'@/lib/auth/rbac-auth';
import adminAuth from'@/lib/auth/admin-auth';
import { getEmailString } from'@/lib/utils/utils';

import { API_CONFIG } from'@/config/api';
const API_URL = API_CONFIG.baseURL;

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
 
 try {
 // Fetch real team stats from API
 const [teamRes, securityRes] = await Promise.all([
 fetch(`${API_URL}/admin/team`, {
 headers: { ...adminAuth.getAuthHeaders() }
 }),
 fetch(`${API_URL}/admin/system/security/stats`, {
 headers: { ...adminAuth.getAuthHeaders() }
 })
 ]);

 if (teamRes.ok) {
 const teamData = await teamRes.json();
 const members = teamData.team || [];
 const byRole: Record<string, number> = {};
 ROLE_HIERARCHY.forEach(r => { byRole[r] = 0; });
 members.forEach((m: any) => {
 const role = m.role ||'VIEWER';
 byRole[role] = (byRole[role] || 0) + 1;
 });
 
 setTeamStats({
 total: members.length,
 byRole: byRole as Record<UserRole, number>,
 activeToday: members.filter((m: any) => m.isActive).length,
 pendingInvites: teamData.pendingInvites || 0
 });
 }

 if (securityRes.ok) {
 const secData = await securityRes.json();
 setSecurityStats({
 mfaEnabled: secData.mfaEnabled || 0,
 mfaEnforced: secData.mfaEnforced || false,
 recentSecurityEvents: secData.recentEvents || auditStats.severityBreakdown.CRITICAL,
 activeSessions: secData.activeSessions || 0
 });
 } else {
 setSecurityStats({
 mfaEnabled: 0,
 mfaEnforced: false,
 recentSecurityEvents: auditStats.severityBreakdown.CRITICAL,
 activeSessions: 0
 });
 }
 } catch (error) {
 console.error('Failed to load access control data:', error);
 }

 setLoading(false);
 };

 const quickActions = [
 {
 title:'Invite Team Member',
 description:'Send an invitation to join the team',
 icon:'➕',
 href:'/access/team?action=invite',
 color:'bg-[rgb(var(--primary))]/50'
 },
 {
 title:'Create Custom Role',
 description:'Define a new role with specific permissions',
 icon:'🎭',
 href:'/access/roles?action=create',
 color:'bg-purple-500'
 },
 {
 title:'Review Permissions',
 description:'Audit and update permission assignments',
 icon:'🔍',
 href:'/access/permissions',
 color:'bg-green-500'
 },
 {
 title:'View Audit Logs',
 description:'Review recent admin activities',
 icon:'📋',
 href:'/access/audit',
 color:'bg-orange-500'
 }
 ];

 const accessSections = [
 {
 id:'team',
 title:'Team Management',
 description:'Manage admin users, invite new members, assign roles',
 icon:'👥',
 href:'/access/team',
 stats: `${teamStats.total} members`,
 badge: teamStats.pendingInvites > 0 ? `${teamStats.pendingInvites} pending` : undefined
 },
 {
 id:'roles',
 title:'Role Definitions',
 description:'Configure roles, hierarchy, and inheritance',
 icon:'🎭',
 href:'/access/roles',
 stats: `${ROLE_HIERARCHY.length} roles`
 },
 {
 id:'permissions',
 title:'Permission Matrix',
 description:'View and manage granular permissions',
 icon:'🔐',
 href:'/access/permissions',
 stats:'60+ permissions'
 },
 {
 id:'policies',
 title:'Access Policies',
 description:'Configure conditional access rules',
 icon:'📜',
 href:'/access/policies',
 stats:'Coming soon',
 disabled: true
 },
 {
 id:'audit',
 title:'Audit Logs',
 description:'Review all admin actions and changes',
 icon:'📋',
 href:'/access/audit',
 stats: `${AuditLogger.getLogs({ limit: 1000 }).length} events`
 },
 {
 id:'activity',
 title:'Activity Monitor',
 description:'Real-time monitoring of admin activities',
 icon:'📊',
 href:'/access/activity',
 stats: `${teamStats.activeToday} active today`
 },
 {
 id:'security',
 title:'Security Settings',
 description:'MFA, sessions, password policies',
 icon:'🛡️',
 href:'/access/security',
 stats: `${securityStats.mfaEnabled} MFA enabled`
 }
 ];

 return (
 <div className="p-6 space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
 Access Control Center
 </h1>
 <p className="text-[rgb(var(--muted-foreground))]">
 Unified management for roles, permissions, and admin access
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Link
 href="/access/team?action=invite"
 className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
 >
 <span>➕</span> Invite Member
 </Link>
 </div>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-12">
 <div className="animate-spin w-8 h-8 border-4 border-[rgb(var(--primary))] border-t-transparent rounded-full"></div>
 </div>
 ) : (
 <>
 {/* Key Metrics */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Team Members</p>
 <p className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">{teamStats.total}</p>
 </div>
 <span className="text-3xl">👥</span>
 </div>
 <p className="text-xs text-green-600 mt-2">
 {teamStats.activeToday} active today
 </p>
 </div>
 
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Roles Defined</p>
 <p className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">{ROLE_HIERARCHY.length}</p>
 </div>
 <span className="text-3xl">🎭</span>
 </div>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
 Hierarchical system
 </p>
 </div>
 
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Active Sessions</p>
 <p className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">{securityStats.activeSessions}</p>
 </div>
 <span className="text-3xl">🔌</span>
 </div>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
 Across all roles
 </p>
 </div>
 
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Security Events</p>
 <p className={`text-2xl font-semibold tracking-tight ${securityStats.recentSecurityEvents > 0 ?'text-red-600' :'text-green-600'}`}>
 {securityStats.recentSecurityEvents}
 </p>
 </div>
 <span className="text-3xl">🚨</span>
 </div>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
 Last 7 days
 </p>
 </div>
 </div>

 {/* Quick Actions */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Quick Actions</h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {quickActions.map((action) => (
 <Link
 key={action.title}
 href={action.href}
 className="p-4 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] hover:shadow-sm transition-all group"
 >
 <span className={`text-2xl inline-block p-2 ${action.color} text-white rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
 {action.icon}
 </span>
 <h3 className="font-medium text-[rgb(var(--foreground))]">{action.title}</h3>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">{action.description}</p>
 </Link>
 ))}
 </div>
 </div>

 {/* Main Sections Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {accessSections.map((section) => (
 <Link
 key={section.id}
 href={section.disabled ?'#' : section.href}
 className={`p-6 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl transition-all ${
 section.disabled 
 ?'opacity-60 cursor-not-allowed' 
 :'hover:border-[rgb(var(--primary))] hover:shadow-sm group'
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
 <h3 className="font-semibold text-[rgb(var(--foreground))] text-lg mb-1">{section.title}</h3>
 <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">{section.description}</p>
 <div className="flex items-center justify-between">
 <span className="text-xs text-[rgb(var(--primary))] font-medium">{section.stats}</span>
 {!section.disabled && (
 <span className="text-[rgb(var(--primary))] group-hover:translate-x-1 transition-transform">→</span>
 )}
 </div>
 </Link>
 ))}
 </div>

 {/* Role Distribution & Recent Activity */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Role Distribution */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Team Role Distribution</h2>
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
 <span className="text-sm font-medium text-[rgb(var(--foreground))]">
 {roleConfig.displayName}
 </span>
 <span className="text-sm text-[rgb(var(--muted-foreground))]">
 {count} {count === 1 ?'member' :'members'}
 </span>
 </div>
 <div className="w-full bg-[rgb(var(--muted))]/10 rounded-full h-2">
 <div 
 className="bg-[rgb(var(--primary))]/50 rounded-full h-2 transition-all"
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
 className="inline-block mt-4 text-sm text-[rgb(var(--primary))] hover:underline"
 >
 View all team members →
 </Link>
 </div>

 {/* Recent Security Activity */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Recent Security Events</h2>
 {recentActivity.length > 0 ? (
 <div className="space-y-3">
 {recentActivity.map((event, idx) => (
 <div 
 key={idx}
 className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
 >
 <span className="text-xl">⚠️</span>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
 {event.action}
 </p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">
 {getEmailString(event.userEmail)} • {new Date(event.timestamp).toLocaleString()}
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-8">
 <span className="text-4xl mb-2 block">✅</span>
 <p className="text-[rgb(var(--muted-foreground))]">No security events to report</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">All systems operating normally</p>
 </div>
 )}
 <Link 
 href="/access/audit"
 className="inline-block mt-4 text-sm text-[rgb(var(--primary))] hover:underline"
 >
 View full audit log →
 </Link>
 </div>
 </div>

 {/* Role Hierarchy Visualization */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Role Hierarchy</h2>
 <Link 
 href="/access/roles"
 className="text-sm text-[rgb(var(--primary))] hover:underline"
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
 <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${roleConfig.bgColor} border-4 border-white shadow-sm`}>
 {roleConfig.icon}
 </div>
 <p className="mt-2 text-sm font-medium text-[rgb(var(--foreground))] text-center">
 {roleConfig.displayName}
 </p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">
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
 <p className="text-xs text-[rgb(var(--muted-foreground))] text-center mt-2">
 Higher level roles inherit permissions from lower level roles
 </p>
 </div>

 {/* Information Banner */}
 <div className="bg-[rgb(var(--primary))]/5 border border-[rgb(var(--primary))]/20 rounded-xl p-4">
 <div className="flex items-start gap-3">
 <span className="text-2xl">💡</span>
 <div>
 <h3 className="font-medium text-[rgb(var(--primary))]">
 Access Control Best Practices
 </h3>
 <p className="text-sm text-[rgb(var(--primary))] mt-1">
 Follow the principle of least privilege - assign the minimum permissions needed for each role. 
 Regularly audit access logs and review role assignments quarterly.
 </p>
 <Link 
 href="/docs/security-best-practices"
 className="inline-block mt-2 text-sm text-[rgb(var(--primary))] hover:underline font-medium"
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

