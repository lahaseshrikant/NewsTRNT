"use client";

import React, { useState, useEffect, useCallback } from"react";
import { getEmailString } from"@/lib/utils/utils";
import { API_CONFIG } from"@/config/api";
import adminAuth from"@/lib/auth/admin-auth";
import {
 EnvelopeIcon,
 UsersIcon,
 ChartBarIcon,
 PlusIcon,
 EyeIcon,
 XMarkIcon,
} from"@/components/icons/AdminIcons";

const API_BASE_URL = API_CONFIG.baseURL;

/* ── Types ── */
interface Newsletter {
 id: string;
 subject: string;
 status:"draft" |"scheduled" |"sent";
 recipients: number;
 openRate: number;
 clickRate: number;
 createdDate: string;
 sentDate?: string;
}

interface Subscriber {
 id: string;
 email: string;
 name: string;
 subscriptionDate: string;
 status:"active" |"unsubscribed" |"bounced";
 source: string;
}

/* ── Helpers ── */
const STATUS_STYLES: Record<string, string> = {
 sent:"bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-400",
 scheduled:"bg-[rgb(var(--primary))]/5 text-[rgb(var(--primary))] /15",
 draft:"bg-amber-50 text-amber-700 dark:bg-amber-900/15 dark:text-amber-400",
 active:"bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-400",
 unsubscribed:"bg-red-50 text-red-700 dark:bg-red-900/15 dark:text-red-400",
 bounced:"bg-orange-50 text-orange-700 dark:bg-orange-900/15 dark:text-orange-400",
};

const Badge = ({ status }: { status: string }) => (
 <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}>
 {status}
 </span>
);

/* ── Component ── */
const NewsletterManagement: React.FC = () => {
 const [activeTab, setActiveTab] = useState<"newsletters" |"subscribers" |"create">("newsletters");
 const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
 const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [newNewsletter, setNewNewsletter] = useState({ subject:"", content:"", scheduleDate:"", scheduleTime:"" });

 /* ── Data ── */
 const fetchData = useCallback(async () => {
 setError(null);
 try {
 const token = adminAuth.getToken();
 if (!token) { setError("Authentication required. Please log in."); setLoading(false); return; }

 const res = await fetch(`${API_BASE_URL}/admin/subscribers`, {
 headers: { Authorization: `Bearer ${token}`,"Content-Type":"application/json" },
 });
 if (res.ok) {
 const data = await res.json();
 setSubscribers(
 (data.subscribers || []).map((s: any) => ({
 id: s.id,
 email: s.email,
 name: s.name || s.email.split("@")[0],
 subscriptionDate: new Date(s.createdAt).toISOString().split("T")[0],
 status: s.status?.toLowerCase() ==="active" ?"active" : s.status?.toLowerCase() ==="bounced" ?"bounced" :"unsubscribed",
 source: s.source ||"Website",
 }))
 );
 }
 setNewsletters([]);
 } catch {
 setError("Failed to connect to server. Please try again.");
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => { fetchData(); }, [fetchData]);

 /* ── Stats ── */
 const totalSubs = subscribers.length;
 const activeSubs = subscribers.filter((s) => s.status ==="active").length;
 const sentNL = newsletters.filter((n) => n.status ==="sent");
 const avgOpen = sentNL.length ? sentNL.reduce((s, n) => s + n.openRate, 0) / sentNL.length : 0;
 const avgClick = sentNL.length ? sentNL.reduce((s, n) => s + n.clickRate, 0) / sentNL.length : 0;

 const stats = [
 { label:"Subscribers", value: totalSubs, sub: `${activeSubs} active`, icon: <UsersIcon className="w-4 h-4" />, subColor:"text-emerald-600" },
 { label:"Campaigns", value: newsletters.length, sub: `${sentNL.length} sent`, icon: <EnvelopeIcon className="w-4 h-4" />, subColor:"text-[rgb(var(--primary))]" },
 { label:"Avg Open Rate", value: `${avgOpen.toFixed(1)}%`, sub:"Industry avg: 21%", icon: <EyeIcon className="w-4 h-4" />, subColor:"text-emerald-600" },
 { label:"Avg Click Rate", value: `${avgClick.toFixed(1)}%`, sub:"Industry avg: 2.6%", icon: <ChartBarIcon className="w-4 h-4" />, subColor:"text-emerald-600" },
 ];

 const tabs = [
 { id:"newsletters" as const, label:"Newsletters", icon: <EnvelopeIcon className="w-4 h-4" /> },
 { id:"subscribers" as const, label:"Subscribers", icon: <UsersIcon className="w-4 h-4" /> },
 { id:"create" as const, label:"Create Campaign", icon: <PlusIcon className="w-4 h-4" /> },
 ];

 /* ── Loading / Error ── */
 if (loading) {
 return (
 <div className="space-y-6">
 <div className="h-8 w-64 skeleton-warm rounded-lg" />
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
 {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton-warm rounded-xl" />)}
 </div>
 <div className="h-96 skeleton-warm rounded-xl" />
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex items-center justify-center py-16">
 <div className="max-w-sm rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/40 dark:bg-red-900/10">
 <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Error Loading Data</h3>
 <p className="mt-1 text-xs text-red-600 dark:text-red-300">{error}</p>
 <button onClick={fetchData} className="mt-3 h-8 rounded-lg bg-red-600 px-4 text-xs font-medium text-white transition-colors hover:bg-red-700">
 Try Again
 </button>
 </div>
 </div>
 );
 }

 /* ── Shared input class ── */
 const inputCls ="h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30";

 /* ── Render ── */
 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">Newsletter</h1>
 <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Create campaigns, manage subscribers, and track performance</p>
 </div>
 <div className="flex gap-2">
 <button onClick={fetchData} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3.5 text-sm font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>
 Refresh
 </button>
 <button onClick={() => setActiveTab("create")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[rgb(var(--primary))] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90">
 <PlusIcon className="w-4 h-4" />
 New Campaign
 </button>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
 {stats.map((s) => (
 <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
 <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
 {s.icon}
 <span className="text-[11px] uppercase tracking-wider">{s.label}</span>
 </div>
 <div className="mt-2 text-xl font-semibold tabular-nums text-[rgb(var(--foreground))]">{s.value}</div>
 <div className={`mt-0.5 text-[11px] ${s.subColor}`}>{s.sub}</div>
 </div>
 ))}
 </div>

 {/* Tabs */}
 <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
 <nav className="flex gap-1 border-b border-[rgb(var(--border))] px-4 pt-1">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
 activeTab === tab.id
 ?"border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
 :"border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
 }`}
 >
 {tab.icon}
 {tab.label}
 </button>
 ))}
 </nav>

 <div className="p-5">
 {/* ── Newsletters Tab ── */}
 {activeTab ==="newsletters" && (
 <div>
 <div className="overflow-hidden rounded-lg border border-[rgb(var(--border))]">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/5">
 {["Subject","Status","Recipients","Open Rate","Click Rate","Date",""].map((h) => (
 <th key={h} className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-[rgb(var(--border))]">
 {newsletters.length === 0 ? (
 <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[rgb(var(--muted-foreground))]">No campaigns yet. Create your first newsletter above.</td></tr>
 ) : newsletters.map((nl) => (
 <tr key={nl.id} className="transition-colors hover:bg-[rgb(var(--muted))]/5">
 <td className="px-4 py-3">
 <div className="font-medium text-[rgb(var(--foreground))]">{nl.subject}</div>
 <div className="text-[11px] text-[rgb(var(--muted-foreground))]">ID: {nl.id}</div>
 </td>
 <td className="px-4 py-3"><Badge status={nl.status} /></td>
 <td className="px-4 py-3 tabular-nums text-[rgb(var(--foreground))]">{nl.recipients.toLocaleString()}</td>
 <td className="px-4 py-3 tabular-nums text-[rgb(var(--foreground))]">{nl.status ==="sent" ? `${nl.openRate}%` :"—"}</td>
 <td className="px-4 py-3 tabular-nums text-[rgb(var(--foreground))]">{nl.status ==="sent" ? `${nl.clickRate}%` :"—"}</td>
 <td className="px-4 py-3 text-[rgb(var(--muted-foreground))]">{nl.sentDate || nl.createdDate}</td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-1">
 <button className="rounded-md p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--foreground))]" title="View">
 <EyeIcon className="w-4 h-4" />
 </button>
 <button className="rounded-md p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10" title="Delete">
 <XMarkIcon className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* ── Subscribers Tab ── */}
 {activeTab ==="subscribers" && (
 <div>
 <div className="mb-4 flex items-center justify-between">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">{subscribers.length} subscriber{subscribers.length !== 1 &&"s"}</span>
 <div className="flex gap-2">
 <button className="h-8 rounded-lg border border-[rgb(var(--border))] px-3 text-xs font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10">
 Export
 </button>
 <button className="h-8 rounded-lg bg-[rgb(var(--primary))] px-3 text-xs font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90">
 Add Subscriber
 </button>
 </div>
 </div>

 <div className="overflow-hidden rounded-lg border border-[rgb(var(--border))]">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/5">
 {["Subscriber","Status","Source","Subscribed",""].map((h) => (
 <th key={h} className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-[rgb(var(--border))]">
 {subscribers.length === 0 ? (
 <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-[rgb(var(--muted-foreground))]">No subscribers yet.</td></tr>
 ) : subscribers.map((sub) => (
 <tr key={sub.id} className="transition-colors hover:bg-[rgb(var(--muted))]/5">
 <td className="px-4 py-3">
 <div className="font-medium text-[rgb(var(--foreground))]">{sub.name}</div>
 <div className="text-[11px] text-[rgb(var(--muted-foreground))]">{getEmailString(sub.email)}</div>
 </td>
 <td className="px-4 py-3"><Badge status={sub.status} /></td>
 <td className="px-4 py-3 text-[rgb(var(--muted-foreground))]">{sub.source}</td>
 <td className="px-4 py-3 text-[rgb(var(--muted-foreground))]">{sub.subscriptionDate}</td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-1">
 <button className="rounded-md p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--foreground))]" title="Send Email">
 <EnvelopeIcon className="w-4 h-4" />
 </button>
 <button className="rounded-md p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10" title="Remove">
 <XMarkIcon className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* ── Create Campaign Tab ── */}
 {activeTab ==="create" && (
 <div className="max-w-2xl space-y-5">
 <div>
 <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Subject Line</label>
 <input
 type="text"
 value={newNewsletter.subject}
 onChange={(e) => setNewNewsletter((p) => ({ ...p, subject: e.target.value }))}
 className={inputCls}
 placeholder="Enter newsletter subject..."
 />
 </div>

 <div>
 <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Content</label>
 <textarea
 value={newNewsletter.content}
 onChange={(e) => setNewNewsletter((p) => ({ ...p, content: e.target.value }))}
 rows={10}
 className={`${inputCls} h-auto py-2.5`}
 placeholder="Write your newsletter content here..."
 />
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Schedule Date</label>
 <input type="date" value={newNewsletter.scheduleDate} onChange={(e) => setNewNewsletter((p) => ({ ...p, scheduleDate: e.target.value }))} className={inputCls} />
 </div>
 <div>
 <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Schedule Time</label>
 <input type="time" value={newNewsletter.scheduleTime} onChange={(e) => setNewNewsletter((p) => ({ ...p, scheduleTime: e.target.value }))} className={inputCls} />
 </div>
 </div>

 <div className="flex gap-2 pt-2">
 <button className="h-9 rounded-lg bg-[rgb(var(--primary))] px-4 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90">
 Save Draft
 </button>
 <button className="h-9 rounded-lg border border-blue-300 bg-[rgb(var(--primary))]/5 px-4 text-sm font-medium text-[rgb(var(--primary))] transition-colors hover:bg-[rgb(var(--primary))]/10 /10">
 Schedule
 </button>
 <button className="h-9 rounded-lg border border-emerald-300 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-900/10 dark:text-emerald-400">
 Send Now
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default NewsletterManagement;


