// src/components/admin/RoleBasedDashboard.tsx - Role-specific dashboard content
'use client';

import React from'react';
import Link from'next/link';
import { useRBAC, RoleBadge, PermissionGate, EditorOnly, AdminOnly, SuperAdminOnly } from'@/components/rbac';
import { UserRole, ROLES } from'@/config/rbac';

interface QuickAction {
 label: string;
 href: string;
 icon: string;
 description: string;
 color: string;
}

interface StatCard {
 label: string;
 value: string | number;
 change?: string;
 changeType?:'up' |'down' |'neutral';
 icon: string;
}

// Role-specific quick actions
const ROLE_QUICK_ACTIONS: Record<UserRole, QuickAction[]> = {
 SUPER_ADMIN: [
 { label:'System Settings', href:'/system', icon:'⚙️', description:'Configure system', color:'from-purple-500 to-pink-500' },
 { label:'Team Management', href:'/users/team', icon:'👥', description:'Manage team', color:'from-blue-500 to-cyan-500' },
 { label:'Security', href:'/system/security', icon:'🔐', description:'Security settings', color:'from-red-500 to-orange-500' },
 { label:'Backup', href:'/system/backup', icon:'💾', description:'Backup data', color:'from-green-500 to-emerald-500' },
 ],
 ADMIN: [
 { label:'New Article', href:'/content/new', icon:'✍️', description:'Create article', color:'from-blue-500 to-purple-500' },
 { label:'Users', href:'/users', icon:'👥', description:'Manage users', color:'from-green-500 to-emerald-500' },
 { label:'Analytics', href:'/analytics', icon:'📊', description:'View stats', color:'from-orange-500 to-red-500' },
 { label:'Newsletter', href:'/newsletter', icon:'📧', description:'Send emails', color:'from-cyan-500 to-blue-500' },
 ],
 EDITOR: [
 { label:'New Article', href:'/content/new', icon:'✍️', description:'Create article', color:'from-blue-500 to-purple-500' },
 { label:'Articles', href:'/content/articles', icon:'📄', description:'Manage articles', color:'from-green-500 to-emerald-500' },
 { label:'Web Stories', href:'/content/web-stories', icon:'📱', description:'Create stories', color:'from-pink-500 to-rose-500' },
 { label:'Moderation', href:'/moderation', icon:'💬', description:'Moderate content', color:'from-orange-500 to-amber-500' },
 { label:'Scraped Items', href:'/scraped-items', icon:'🗞️', description:'Review engine‑scraped items', color:'from-green-500 to-emerald-500' },
 ],
 AUTHOR: [
 { label:'New Draft', href:'/content/new', icon:'✍️', description:'Start writing', color:'from-blue-500 to-purple-500' },
 { label:'My Drafts', href:'/content/drafts', icon:'📝', description:'View drafts', color:'from-green-500 to-emerald-500' },
 { label:'Media', href:'/media', icon:'🖼️', description:'Upload media', color:'from-pink-500 to-rose-500' },
 { label:'My Stats', href:'/analytics', icon:'📊', description:'View performance', color:'from-orange-500 to-amber-500' },
 ],
 MODERATOR: [
 { label:'Comments', href:'/moderation', icon:'💬', description:'Review comments', color:'from-blue-500 to-cyan-500' },
 { label:'Reports', href:'/moderation/reports', icon:'⚠️', description:'Handle reports', color:'from-red-500 to-orange-500' },
 { label:'Spam', href:'/moderation/spam', icon:'🚫', description:'Filter spam', color:'from-gray-500 to-slate-500' },
 { label:'Users', href:'/users', icon:'👤', description:'User actions', color:'from-green-500 to-emerald-500' },
 ],
 VIEWER: [
 { label:'Analytics', href:'/analytics', icon:'📊', description:'View analytics', color:'from-blue-500 to-purple-500' },
 { label:'Traffic', href:'/analytics/traffic', icon:'🌐', description:'Traffic data', color:'from-green-500 to-emerald-500' },
 { label:'Content', href:'/content', icon:'📄', description:'Browse content', color:'from-orange-500 to-amber-500' },
 { label:'Export', href:'/analytics/export', icon:'📥', description:'Export data', color:'from-cyan-500 to-blue-500' },
 ],
};

// Welcome messages by role
const ROLE_WELCOME_MESSAGES: Record<UserRole, { title: string; subtitle: string }> = {
 SUPER_ADMIN: {
 title:'System Overview',
 subtitle:'Full control over the NewsTRNT platform'
 },
 ADMIN: {
 title:'Admin Dashboard',
 subtitle:'Manage content, users, and platform operations'
 },
 EDITOR: {
 title:'Editorial Dashboard',
 subtitle:'Create, edit, and publish content'
 },
 AUTHOR: {
 title:'Author Workspace',
 subtitle:'Write and manage your articles'
 },
 MODERATOR: {
 title:'Moderation Center',
 subtitle:'Keep the community safe and engaged'
 },
 VIEWER: {
 title:'Analytics Dashboard',
 subtitle:'Track performance and insights'
 },
};

export default function RoleBasedDashboard() {
 const { session, role, isSuperAdmin, isAdmin, isEditor, getRoleInfo } = useRBAC();
 
 if (!session || !role) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
 </div>
 );
 }
 
 const roleConfig = ROLES[role as UserRole];
 const quickActions = ROLE_QUICK_ACTIONS[role as UserRole] || [];
 const welcomeMessage = ROLE_WELCOME_MESSAGES[role as UserRole] || { title:'Dashboard', subtitle:'Welcome' };
 const roleInfo = getRoleInfo();
 
 return (
 <div className="p-6 space-y-6">
 {/* Welcome Header */}
 <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
 {/* Decorative elements */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
 <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
 
 <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <span className="text-3xl">{ROLES[role as UserRole]?.icon || '👤'}</span>
 <RoleBadge role={role as UserRole} size="lg" />
 </div>
 <h1 className="text-3xl font-bold mb-2">{welcomeMessage.title}</h1>
 <p className="text-[rgb(var(--muted-foreground))]/50">{welcomeMessage.subtitle}</p>
 <p className="text-sm text-[rgb(var(--muted-foreground))]/70 mt-2">
 Welcome back, <span className="text-white font-medium">{session.fullName || session.username}</span>
 </p>
 </div>
 
 <div className="flex flex-col items-end gap-2">
 <div className="text-right">
 <p className="text-sm text-[rgb(var(--muted-foreground))]/70">Role Level</p>
 <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
 {roleConfig?.level || 0}
 </p>
 </div>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">
 Role level: {(session as any).roleLevel ?? 0}
 </p>
 </div>
 </div>
 </div>
 
 {/* Quick Actions */}
 <div>
 <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">Quick Actions</h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {quickActions.map((action, index) => (
 <Link
 key={index}
 href={action.href}
 className="group relative bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4 hover:shadow-lg transition-all duration-300 overflow-hidden"
 >
 <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
 <div className="relative z-10">
 <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
 <h3 className="font-semibold text-[rgb(var(--foreground))] mb-1">{action.label}</h3>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">{action.description}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 
 {/* Role-specific content sections */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Recent Activity - All roles */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
 <span>📋</span> Recent Activity
 </h3>
 <div className="space-y-3">
 {[1, 2, 3, 4].map((_, i) => (
 <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--muted))]/5 hover:bg-[rgb(var(--muted))]/10 transition-colors">
 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
 <div className="flex-1">
 <p className="text-sm font-medium text-[rgb(var(--foreground))]">Activity item {i + 1}</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">2 hours ago</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 
 {/* Pending Tasks - Authors and above */}
 <PermissionGate permission="content.create">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
 <span>✅</span> Pending Tasks
 </h3>
 <div className="space-y-3">
 <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
 <div className="flex items-center gap-3">
 <span>📝</span>
 <span className="text-sm font-medium">3 drafts need review</span>
 </div>
 <Link href="/content/drafts" className="text-xs text-blue-600 hover:underline">View</Link>
 </div>
 
 <PermissionGate permission="comments.moderate">
 <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
 <div className="flex items-center gap-3">
 <span>💬</span>
 <span className="text-sm font-medium">12 comments pending</span>
 </div>
 <Link href="/moderation" className="text-xs text-blue-600 hover:underline">Moderate</Link>
 </div>
 </PermissionGate>
 
 <PermissionGate permission="reports.view">
 <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
 <div className="flex items-center gap-3">
 <span>⚠️</span>
 <span className="text-sm font-medium">2 reports need attention</span>
 </div>
 <Link href="/moderation/reports" className="text-xs text-blue-600 hover:underline">Review</Link>
 </div>
 </PermissionGate>
 </div>
 </div>
 </PermissionGate>
 </div>
 
 {/* Super Admin Only - System Status */}
 <SuperAdminOnly>
 <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
 <span>👑</span> System Status (Super Admin Only)
 </h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-[rgb(var(--card))] rounded-lg p-4 text-center">
 <p className="text-2xl font-bold text-green-600">✓</p>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Database</p>
 </div>
 <div className="bg-[rgb(var(--card))] rounded-lg p-4 text-center">
 <p className="text-2xl font-bold text-green-600">✓</p>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">API Server</p>
 </div>
 <div className="bg-[rgb(var(--card))] rounded-lg p-4 text-center">
 <p className="text-2xl font-bold text-green-600">✓</p>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Cache</p>
 </div>
 <div className="bg-[rgb(var(--card))] rounded-lg p-4 text-center">
 <p className="text-2xl font-bold text-yellow-600">!</p>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">CDN</p>
 </div>
 </div>
 <div className="mt-4 flex gap-3">
 <Link href="/system" className="text-sm text-purple-600 hover:underline">System Settings →</Link>
 <Link href="/system/logs" className="text-sm text-purple-600 hover:underline">View Logs →</Link>
 </div>
 </div>
 </SuperAdminOnly>
 
 {/* Admin Only - Team Overview */}
 <AdminOnly>
 <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 rounded-xl p-6">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
 <span>👥</span> Team Overview (Admin Only)
 </h3>
 <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
 {Object.entries(ROLES).map(([roleKey, config]) => (
 <div key={roleKey} className="bg-[rgb(var(--card))] rounded-lg p-3">
 <span className="text-2xl">{config.icon}</span>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{config.displayName.split('')[0]}</p>
 <p className="text-lg font-bold text-[rgb(var(--foreground))]">-</p>
 </div>
 ))}
 </div>
 <div className="mt-4">
 <Link href="/users/team" className="text-sm text-blue-600 hover:underline">Manage Team →</Link>
 </div>
 </div>
 </AdminOnly>
 </div>
 );
}

