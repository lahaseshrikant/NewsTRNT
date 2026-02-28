"use client";

import React, { useState, useEffect, useCallback } from'react';
import { getEmailString } from'@/lib/utils/utils';
import adminAuth from'@/lib/auth/admin-auth';
import { UsersIcon, EyeIcon, ShieldCheckIcon } from'@/components/icons/AdminIcons';
import { API_CONFIG } from'@/config/api';

/* ─── Types ─── */
interface User {
 id: string;
 name: string;
 email: string;
 avatar?: string;
 role:'admin' |'editor' |'subscriber';
 status:'active' |'inactive' |'banned';
 joinDate: string;
 lastLogin: string | null;
 articlesCount: number;
}

interface UserStats { total: number; active: number; admins: number; subscribers: number }
interface Pagination { page: number; limit: number; total: number; totalPages: number }

const API_BASE_URL = API_CONFIG.baseURL;

const roleBadge: Record<string, string> = {
 admin:'bg-rose-500/10 text-rose-700 dark:text-rose-400',
 editor:'bg-[rgb(var(--primary))]/50/10 text-[rgb(var(--primary))]',
 subscriber:'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

const statusBadge: Record<string, string> = {
 active:'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
 inactive:'bg-amber-500/10 text-amber-700 dark:text-amber-400',
 banned:'bg-red-500/10 text-red-700 dark:text-red-400',
};

const fmtDate = (d: string | null) => {
 if (!d) return'—';
 return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
};

/* ─── Page ─── */
export default function UsersPage() {
 const [users, setUsers] = useState<User[]>([]);
 const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, admins: 0, subscribers: 0 });
 const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedRole, setSelectedRole] = useState('all');
 const [selectedStatus, setSelectedStatus] = useState('all');
 const [searchTerm, setSearchTerm] = useState('');
 const [debouncedSearch, setDebouncedSearch] = useState('');

 useEffect(() => {
 const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
 return () => clearTimeout(t);
 }, [searchTerm]);

 const fetchUsers = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const token = adminAuth.getToken();
 if (!token) { setError('Authentication required.'); setLoading(false); return; }

 const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
 if (selectedRole !=='all') params.append('role', selectedRole);
 if (selectedStatus !=='all') params.append('status', selectedStatus);
 if (debouncedSearch) params.append('search', debouncedSearch);

 const res = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
 headers: { ...adminAuth.getAuthHeaders(),'Content-Type':'application/json' },
 });

 if (!res.ok) {
 if (res.status === 401) setError('Session expired.');
 else if (res.status === 403) setError('Access denied.');
 else { const d = await res.json(); setError(d.error ||'Failed to fetch users'); }
 setLoading(false);
 return;
 }

 const d = await res.json();
 setUsers(d.users || []);
 setStats(d.stats || { total: 0, active: 0, admins: 0, subscribers: 0 });
 setPagination(prev => ({ ...prev, total: d.pagination?.total || 0, totalPages: d.pagination?.totalPages || 0 }));
 } catch {
 setError('Failed to connect to server.');
 } finally {
 setLoading(false);
 }
 }, [pagination.page, pagination.limit, selectedRole, selectedStatus, debouncedSearch]);

 useEffect(() => { fetchUsers(); }, [fetchUsers]);
 useEffect(() => { setPagination(prev => ({ ...prev, page: 1 })); }, [selectedRole, selectedStatus, debouncedSearch]);

 const handleDeleteUser = async (userId: string) => {
 if (!confirm('Are you sure you want to delete this user?')) return;
 try {
 const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
 method:'DELETE',
 headers: {'Authorization': `Bearer ${adminAuth.getToken()}`,'Content-Type':'application/json' },
 });
 if (!res.ok) { const d = await res.json(); alert(d.error ||'Failed'); return; }
 fetchUsers();
 } catch { alert('Failed to delete user'); }
 };

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] tracking-tight">Users</h1>
 <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Manage accounts, roles, and subscriber information.</p>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { label:'Total', value: stats.total, icon: UsersIcon },
 { label:'Active', value: stats.active, icon: EyeIcon },
 { label:'Subscribers', value: stats.subscribers, icon: UsersIcon },
 { label:'Staff', value: stats.admins, icon: ShieldCheckIcon },
 ].map(s => (
 <div key={s.label} className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl px-4 py-3">
 <div className="flex items-center gap-2 mb-1">
 <s.icon className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
 <span className="text-[11px] font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wider">{s.label}</span>
 </div>
 <p className="text-xl font-bold text-[rgb(var(--foreground))] tabular-nums">{s.value}</p>
 </div>
 ))}
 </div>

 {/* Filters */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <div className="flex flex-col sm:flex-row gap-3">
 <input type="text" placeholder="Search users..." value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="flex-1 min-w-0 px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))/0.3]" />
 <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
 className="px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
 <option value="all">All Roles</option>
 <option value="admin">Admin</option>
 <option value="editor">Editor</option>
 <option value="subscriber">Subscriber</option>
 </select>
 <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
 className="px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
 <option value="all">All Statuses</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 <option value="banned">Banned</option>
 </select>
 <button onClick={fetchUsers} className="px-3 py-2 text-sm font-medium border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors">
 Refresh
 </button>
 </div>
 </div>

 {/* Error */}
 {error && (
 <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
 <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
 <button onClick={fetchUsers} className="mt-1 text-xs text-red-600 dark:text-red-300 underline">Try again</button>
 </div>
 )}

 {/* Table */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl overflow-hidden">
 {loading ? (
 <div className="p-10 text-center">
 <div className="skeleton-warm h-6 w-40 mx-auto mb-3" />
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Loading users...</p>
 </div>
 ) : !error && users.length === 0 ? (
 <div className="p-10 text-center">
 <UsersIcon className="w-10 h-10 text-[rgb(var(--muted-foreground))]/40 mx-auto mb-3" />
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">No users found</h3>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">
 {debouncedSearch || selectedRole !=='all' || selectedStatus !=='all' ?'Adjust your filters.' :'No users registered yet.'}
 </p>
 </div>
 ) : !error && users.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/50">
 <th className="px-4 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">User</th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Role</th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Status</th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider hidden md:table-cell">Joined</th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider hidden lg:table-cell">Last Login</th>
 <th className="px-3 py-3 text-right text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider hidden sm:table-cell">Articles</th>
 <th className="px-4 py-3 text-right text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[rgb(var(--border))]">
 {users.map((user) => (
 <tr key={user.id} className="hover:bg-[rgb(var(--muted))]/30 transition-colors">
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 {user.avatar ? (
 <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
 ) : (
 <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center flex-shrink-0">
 <span className="text-[rgb(var(--primary-foreground))] text-xs font-bold">
 {user.name?.split('').map(n => n[0]).join('').toUpperCase().slice(0, 2) ||'?'}
 </span>
 </div>
 )}
 <div className="min-w-0">
 <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{user.name ||'Unknown'}</p>
 <p className="text-[11px] text-[rgb(var(--muted-foreground))] truncate">{getEmailString(user.email)}</p>
 </div>
 </div>
 </td>
 <td className="px-3 py-3">
 <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${roleBadge[user.role] || roleBadge.subscriber}`}>
 {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
 </span>
 </td>
 <td className="px-3 py-3">
 <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusBadge[user.status] || statusBadge.inactive}`}>
 {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
 </span>
 </td>
 <td className="px-3 py-3 hidden md:table-cell">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">{fmtDate(user.joinDate)}</span>
 </td>
 <td className="px-3 py-3 hidden lg:table-cell">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">{fmtDate(user.lastLogin)}</span>
 </td>
 <td className="px-3 py-3 text-right hidden sm:table-cell">
 <span className="text-xs font-medium text-[rgb(var(--foreground))] tabular-nums">{user.articlesCount || 0}</span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-1">
 <button className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/8 transition-colors" title="Edit">
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
 </button>
 <button className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-emerald-600 hover:bg-emerald-500/8 transition-colors" title="View">
 <EyeIcon className="w-3.5 h-3.5" />
 </button>
 <button onClick={() => handleDeleteUser(user.id)}
 className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-red-600 hover:bg-red-500/8 transition-colors" title="Delete">
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : null}
 </div>

 {/* Pagination */}
 {!loading && !error && pagination.totalPages > 1 && (
 <div className="flex items-center justify-between">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">
 Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
 </span>
 <div className="flex items-center gap-1">
 <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page <= 1}
 className="px-3 py-1.5 text-xs font-medium border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors disabled:opacity-40">Previous</button>
 <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page >= pagination.totalPages}
 className="px-3 py-1.5 text-xs font-medium border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors disabled:opacity-40">Next</button>
 </div>
 </div>
 )}
 </div>
 );
}
