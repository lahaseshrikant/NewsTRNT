"use client";

import React, { useState, useEffect, useCallback } from"react";
import { getEmailString } from"@/lib/utils/utils";
import adminAuth from"@/lib/auth/admin-auth";
import { API_CONFIG } from"@/config/api";
import { FollowIcon } from '@/components/icons/EditorialIcons';

const API_BASE_URL = API_CONFIG.baseURL;

/* ── tiny SVG icons ────────────────────────────────────── */
const Icon = ({ d, cls }: { d: string; cls?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls ??"h-5 w-5"}>
 <path strokeLinecap="round" strokeLinejoin="round" d={d} />
 </svg>
);
const TargetIcon = ({ cls }: { cls?: string }) => <Icon cls={cls} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />;
const ClipboardIcon = ({ cls }: { cls?: string }) => <Icon cls={cls} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />;
const ChartIcon = ({ cls }: { cls?: string }) => <Icon cls={cls} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />;
const PlugIcon = ({ cls }: { cls?: string }) => <FollowIcon className={cls} />;
const CurrencyIcon = ({ cls }: { cls?: string }) => <Icon cls={cls} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
const EyeIcon = ({ cls }: { cls?: string }) => <Icon cls={cls} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />;
const CursorIcon = ({ cls }: { cls?: string }) => <Icon cls={cls} d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />;
const PlusIcon = ({ cls }: { cls?: string }) => <Icon cls={cls} d="M12 4.5v15m7.5-7.5h-15" />;
const ArrowPathIcon = ({ cls }: { cls?: string }) => <Icon cls={cls} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />;

/* ── types ─────────────────────────────────────────────── */
interface Campaign {
 id: string;
 title: string;
 advertiser: string;
 type:"banner" |"sponsored" |"video" |"native";
 status:"active" |"paused" |"completed" |"pending";
 budget: number;
 spent: number;
 impressions: number;
 clicks: number;
 ctr: number;
 startDate: string;
 endDate: string;
}

interface AdProposal {
 id: string;
 company: string;
 email: string;
 campaign: string;
 budget: string;
 duration: string;
 status:"pending" |"approved" |"rejected";
 submittedDate: string;
}

/* ── reusable bits ─────────────────────────────────────── */
const STATUS: Record<string, string> = {
 active:"bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
 paused:"bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
 completed:"bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400",
 pending:"bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
 approved:"bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
 rejected:"bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};
const TYPE: Record<string, string> = {
 banner:"bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
 sponsored:"bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-400",
 video:"bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
 native:"bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
};
const Badge = ({ label, map }: { label: string; map: Record<string, string> }) => (
 <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${map[label] ?? map.pending}`}>
 {label.charAt(0).toUpperCase() + label.slice(1)}
 </span>
);

const TABS = [
 { id:"campaigns" as const, label:"Campaigns", icon: TargetIcon },
 { id:"proposals" as const, label:"Proposals", icon: ClipboardIcon },
 { id:"performance" as const, label:"Performance", icon: ChartIcon },
 { id:"networks" as const, label:"Ad Networks", icon: PlugIcon },
];

/* ── page ──────────────────────────────────────────────── */
export default function AdvertisingManager() {
 const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("campaigns");
 const [campaigns, setCampaigns] = useState<Campaign[]>([]);
 const [proposals, setProposals] = useState<AdProposal[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const fetchData = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const token = adminAuth.getToken();
 if (!token) { setError("Authentication required"); setLoading(false); return; }
 const res = await fetch(`${API_BASE_URL}/admin/analytics/overview`, {
 headers: { Authorization: `Bearer ${token}`,"Content-Type":"application/json" },
 });
 if (res.ok) { /* analytics data – will map once advertising API exists */ }
 setCampaigns([]);
 setProposals([]);
 } catch (err) {
 console.error("Error fetching advertising data:", err);
 setError("Failed to load advertising data");
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => { fetchData(); }, [fetchData]);

 const totalRevenue = campaigns.reduce((s, c) => s + c.spent, 0);
 const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
 const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
 const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

 /* ── stat cards ── */
 const stats = [
 { label:"Total Revenue", value: `$${totalRevenue.toLocaleString()}`, sub:"+18 % vs last month", color:"text-emerald-600", icon: CurrencyIcon },
 { label:"Active Campaigns", value: campaigns.filter((c) => c.status ==="active").length, sub: `${campaigns.length} total`, color:"text-[rgb(var(--primary))]", icon: TargetIcon },
 { label:"Total Impressions", value: totalImpressions.toLocaleString(), sub:"+12 % vs last month", color:"text-emerald-600", icon: EyeIcon },
 { label:"Avg. CTR", value: `${avgCTR.toFixed(2)} %`, sub:"+0.3 % vs last month", color:"text-emerald-600", icon: CursorIcon },
 ];

 /* ── render ──────────────────────────────────────── */
 return (
 <div className="space-y-6">
 {/* header */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">Advertisement Manager</h1>
 <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Manage campaigns, review proposals, and track ad performance</p>
 </div>
 <div className="flex gap-2">
 <button className="inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--primary))] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
 <PlusIcon cls="h-4 w-4" /> New Campaign
 </button>
 <button className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-2 text-sm font-medium text-[rgb(var(--foreground))] transition hover:bg-[rgb(var(--muted))]/10">
 <ChartIcon cls="h-4 w-4" /> Analytics Report
 </button>
 </div>
 </div>

 {/* stat cards */}
 <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
 {stats.map((s) => (
 <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5">
 <div className="mb-3 flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
 <s.icon cls="h-4 w-4" />
 <span className="text-[11px] font-medium uppercase tracking-wider">{s.label}</span>
 </div>
 <p className="text-2xl font-semibold tabular-nums text-[rgb(var(--foreground))]">{s.value}</p>
 <p className={`mt-1 text-xs font-medium ${s.color}`}>{s.sub}</p>
 </div>
 ))}
 </div>

 {/* tabs */}
 <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
 <nav className="flex gap-1 border-b border-[rgb(var(--border))] px-4 pt-1">
 {TABS.map((t) => (
 <button
 key={t.id}
 onClick={() => setActiveTab(t.id)}
 className={`relative inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition
 ${activeTab === t.id
 ?"text-[rgb(var(--primary))] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[rgb(var(--primary))]"
 :"text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"}`}
 >
 <t.icon cls="h-4 w-4" />
 {t.label}
 </button>
 ))}
 </nav>

 <div className="p-5">
 {/* ── CAMPAIGNS ── */}
 {activeTab ==="campaigns" && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">Active Campaigns</h3>
 <div className="flex gap-2">
 <button onClick={fetchData} className="inline-flex items-center gap-1 rounded-lg bg-[rgb(var(--primary))] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
 <ArrowPathIcon cls="h-3.5 w-3.5" /> Refresh
 </button>
 </div>
 </div>

 {loading ? (
 <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-[rgb(var(--muted))]/10" />)}</div>
 ) : error ? (
 <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-900/10">
 <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
 <button onClick={fetchData} className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700">Retry</button>
 </div>
 ) : campaigns.length === 0 ? (
 <div className="rounded-lg border border-dashed border-[rgb(var(--border))] p-12 text-center">
 <TargetIcon cls="mx-auto h-10 w-10 text-[rgb(var(--muted-foreground))]" />
 <p className="mt-3 text-sm font-medium text-[rgb(var(--foreground))]">No campaigns yet</p>
 <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">Create your first advertising campaign to get started</p>
 <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
 <PlusIcon cls="h-4 w-4" /> New Campaign
 </button>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[rgb(var(--border))]">
 {["Campaign","Type","Status","Budget","Spent","Performance",""].map((h) => (
 <th key={h} className="pb-3 pr-4 text-left text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-[rgb(var(--border))]">
 {campaigns.map((c) => (
 <tr key={c.id} className="group hover:bg-[rgb(var(--muted))]/5">
 <td className="py-3 pr-4">
 <p className="font-medium text-[rgb(var(--foreground))]">{c.title}</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">{c.advertiser}</p>
 </td>
 <td className="py-3 pr-4"><Badge label={c.type} map={TYPE} /></td>
 <td className="py-3 pr-4"><Badge label={c.status} map={STATUS} /></td>
 <td className="py-3 pr-4 tabular-nums text-[rgb(var(--foreground))]">${c.budget.toLocaleString()}</td>
 <td className="py-3 pr-4 tabular-nums text-[rgb(var(--foreground))]">${c.spent.toLocaleString()}</td>
 <td className="py-3 pr-4">
 <p className="tabular-nums text-[rgb(var(--foreground))]">{c.impressions.toLocaleString()} imp</p>
 <p className="text-xs tabular-nums text-[rgb(var(--muted-foreground))]">{c.clicks.toLocaleString()} clicks &middot; {c.ctr} % CTR</p>
 </td>
 <td className="py-3 text-right">
 <button className="text-[rgb(var(--muted-foreground))] opacity-0 transition hover:text-[rgb(var(--foreground))] group-hover:opacity-100" title="Details">
 <Icon d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )}

 {/* ── PROPOSALS ── */}
 {activeTab ==="proposals" && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">Advertisement Proposals</h3>
 <span className="text-xs text-[rgb(var(--muted-foreground))]">{proposals.filter((p) => p.status ==="pending").length} pending review</span>
 </div>

 {proposals.length === 0 ? (
 <div className="rounded-lg border border-dashed border-[rgb(var(--border))] p-12 text-center">
 <ClipboardIcon cls="mx-auto h-10 w-10 text-[rgb(var(--muted-foreground))]" />
 <p className="mt-3 text-sm font-medium text-[rgb(var(--foreground))]">No proposals</p>
 <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">Incoming ad proposals from advertisers will appear here</p>
 </div>
 ) : (
 <div className="space-y-4">
 {proposals.map((p) => (
 <div key={p.id} className="rounded-xl border border-[rgb(var(--border))] p-5 transition hover:shadow-sm">
 <div className="flex items-start justify-between gap-4">
 <div className="min-w-0 flex-1">
 <div className="mb-2 flex items-center gap-2">
 <h4 className="text-sm font-semibold text-[rgb(var(--foreground))]">{p.company}</h4>
 <Badge label={p.status} map={STATUS} />
 </div>
 <div className="grid grid-cols-3 gap-4 text-sm">
 {[
 { k:"Campaign", v: p.campaign },
 { k:"Budget", v: p.budget },
 { k:"Duration", v: p.duration },
 ].map((f) => (
 <div key={f.k}>
 <p className="text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">{f.k}</p>
 <p className="mt-0.5 font-medium text-[rgb(var(--foreground))]">{f.v}</p>
 </div>
 ))}
 </div>
 <p className="mt-3 text-xs text-[rgb(var(--muted-foreground))]">
 Contact: {getEmailString(p.email)} &middot; Submitted {p.submittedDate}
 </p>
 </div>
 {p.status ==="pending" && (
 <div className="flex shrink-0 gap-2">
 <button className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700">Approve</button>
 <button className="h-8 rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700">Reject</button>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ── PERFORMANCE ── */}
 {activeTab ==="performance" && (
 <div className="space-y-5">
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">Performance Overview</h3>

 <div className="grid gap-4 lg:grid-cols-2">
 {["Revenue Trend","Click-through Rates"].map((title) => (
 <div key={title} className="rounded-xl border border-[rgb(var(--border))] p-5">
 <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">{title}</h4>
 <div className="flex h-48 items-center justify-center text-sm text-[rgb(var(--muted-foreground))]">
 Chart placeholder — connect analytics API
 </div>
 </div>
 ))}
 </div>

 <div className="rounded-xl border border-[rgb(var(--border))] p-5">
 <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Top Performing Campaigns</h4>
 {campaigns.length === 0 ? (
 <p className="py-6 text-center text-sm text-[rgb(var(--muted-foreground))]">No campaign data available</p>
 ) : (
 <div className="divide-y divide-[rgb(var(--border))]">
 {[...campaigns].sort((a, b) => b.ctr - a.ctr).slice(0, 5).map((c) => (
 <div key={c.id} className="flex items-center justify-between py-3">
 <div>
 <p className="text-sm font-medium text-[rgb(var(--foreground))]">{c.title}</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">{c.advertiser}</p>
 </div>
 <div className="text-right">
 <p className="text-sm font-semibold tabular-nums text-[rgb(var(--foreground))]">{c.ctr} % CTR</p>
 <p className="text-xs tabular-nums text-[rgb(var(--muted-foreground))]">${c.spent.toLocaleString()} spent</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* ── AD NETWORKS ── */}
 {activeTab ==="networks" && (
 <div className="space-y-5">
 <div>
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">Ad Network Integrations</h3>
 <p className="mt-0.5 text-xs text-[rgb(var(--muted-foreground))]">Connect advertising platforms to monetize your content</p>
 </div>

 <div className="grid gap-4 md:grid-cols-2">
 {/* Google AdSense */}
 <NetworkCard
 name="Google AdSense"
 desc="Display ads from Google&rsquo;s advertiser network"
 color="bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
 btnColor="bg-[rgb(var(--primary))] hover:opacity-90"
 btnLabel="Connect AdSense"
 fields={[{ label:"Publisher ID", placeholder:"ca-pub-XXXXXXXXXX" }]}
 slots={["Header Banner","Sidebar","In-Article","Footer"]}
 />
 {/* Google AdMob */}
 <NetworkCard
 name="Google AdMob"
 desc="Mobile app monetization with banner, interstitial & rewarded ads"
 color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
 btnColor="bg-emerald-600 hover:bg-emerald-700"
 btnLabel="Connect AdMob"
 fields={[{ label:"App ID", placeholder:"ca-app-pub-XXXXXXXXXX" }]}
 slots={["Banner","Interstitial","Rewarded","Native"]}
 />
 {/* Meta Audience Network */}
 <NetworkCard
 name="Meta Audience Network"
 desc="Display ads from Meta&rsquo;s advertising platform"
 color="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
 btnColor="bg-indigo-600 hover:bg-indigo-700"
 btnLabel="Connect Meta Ads"
 fields={[{ label:"Placement ID", placeholder:"YOUR_PLACEMENT_ID" }]}
 />
 {/* Custom provider */}
 <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-5 transition hover:shadow-sm">
 <div className="mb-4 flex items-start gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
 <PlugIcon cls="h-5 w-5" />
 </span>
 <div>
 <h4 className="text-sm font-semibold text-[rgb(var(--foreground))]">Custom Ad Provider</h4>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">Add any ad network using custom HTML/JS embed code</p>
 </div>
 </div>
 <div className="space-y-3">
 <InputField label="Provider Name" placeholder="e.g., Taboola, Outbrain" />
 <div>
 <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Embed Code</label>
 <textarea placeholder="Paste your ad provider's embed code..." rows={3} className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 font-mono text-xs text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30" />
 </div>
 <button className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700">Add Provider</button>
 </div>
 </div>
 </div>

 {/* Global Ad Settings */}
 <div className="rounded-xl border border-[rgb(var(--border))] p-5">
 <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Global Ad Settings</h4>
 <div className="grid gap-3 sm:grid-cols-2">
 {[
 { label:"Enable ads for logged-in users", on: true },
 { label:"Show ads on mobile", on: true },
 { label:"Lazy-load advertisements", on: true },
 { label:"Ad-free for premium users", on: false },
 ].map((s) => (
 <ToggleRow key={s.label} label={s.label} defaultOn={s.on} />
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}

/* ── sub-components ────────────────────────────────────── */
function InputField({ label, placeholder }: { label: string; placeholder: string }) {
 return (
 <div>
 <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">{label}</label>
 <input
 type="text"
 placeholder={placeholder}
 className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 </div>
 );
}

function ToggleRow({ label, defaultOn }: { label: string; defaultOn: boolean }) {
 const [on, setOn] = useState(defaultOn);
 return (
 <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] px-4 py-3">
 <span className="text-sm text-[rgb(var(--foreground))]">{label}</span>
 <button
 role="switch"
 aria-checked={on}
 onClick={() => setOn(!on)}
 className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${on ?"bg-[rgb(var(--primary))]" :"bg-[rgb(var(--muted))]/40"}`}
 >
 <span className={`inline-block h-3.5 w-3.5 rounded-full bg-[rgb(var(--card))] shadow transition-transform ${on ?"translate-x-[18px]" :"translate-x-[3px]"}`} />
 </button>
 </div>
 );
}

function NetworkCard({
 name, desc, color, btnColor, btnLabel, fields, slots,
}: {
 name: string; desc: string; color: string; btnColor: string; btnLabel: string;
 fields: { label: string; placeholder: string }[];
 slots?: string[];
}) {
 return (
 <div className="rounded-xl border border-[rgb(var(--border))] p-5 transition hover:shadow-sm">
 <div className="mb-4 flex items-start justify-between gap-3">
 <div className="flex items-start gap-3">
 <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
 <CurrencyIcon cls="h-5 w-5" />
 </span>
 <div>
 <h4 className="text-sm font-semibold text-[rgb(var(--foreground))]">{name}</h4>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">{desc}</p>
 </div>
 </div>
 <span className="rounded-md bg-[rgb(var(--muted))]/10 px-2 py-0.5 text-[10px] font-medium text-[rgb(var(--muted-foreground))]">Not Connected</span>
 </div>
 <div className="space-y-3">
 {fields.map((f) => <InputField key={f.label} {...f} />)}
 {slots && (
 <div>
 <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
 {name.includes("AdMob") ?"Ad Formats" :"Ad Slots"}
 </label>
 <div className="grid grid-cols-2 gap-2">
 {slots.map((s) => (
 <label key={s} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[rgb(var(--border))] p-2 text-xs text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10">
 <input type="checkbox" className="rounded border-[rgb(var(--border))]" />
 {s}
 </label>
 ))}
 </div>
 </div>
 )}
 <button className={`w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition ${btnColor}`}>{btnLabel}</button>
 </div>
 </div>
 );
}


