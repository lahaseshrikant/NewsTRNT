"use client";

import { useEffect, useState } from'react';
import Link from'next/link';
import { adminClient } from'@/lib/api/admin-client';
import {
 DocumentTextIcon, UsersIcon, ChartBarIcon, EyeIcon,
 ArrowTrendingUpIcon, ArrowTrendingDownIcon, PlusIcon,
 ServerIcon, CircleStackIcon, BoltIcon, ClockIcon,
 CogIcon, ShieldCheckIcon,
} from'@/components/icons/AdminIcons';

/* ─── Types ─── */
interface AdminStats {
 totalArticles: { count: number; growth: number; growthType:'increase' |'decrease' };
 activeUsers: { count: number; growth: number; growthType:'increase' |'decrease' };
 pageViews: { count: number; growth: number; growthType:'increase' |'decrease' };
 revenue?: { count: number; growth: number; growthType:'increase' |'decrease' };
 overview: {
 totalArticles: number;
 totalUsers: number;
 totalViews: number;
 totalSubscribers: number;
 };
 recentArticles: Array<{
 id: string;
 title: string;
 status: string;
 publishedAt: string | null;
 views: number;
 author: string;
 }>;
 systemStatus: {
 server: { status: string; uptime: string };
 database: { status: string; responseTime: string };
 cdn: { status: string; cacheHitRate: string };
 backup: { status: string; lastBackup: string };
 };
 recentActivity: Array<{
 id: number;
 type: string;
 message: string;
 timestamp: string;
 icon: string;
 color: string;
 }>;
 performanceMetrics: {
 siteSpeed: number;
 userEngagement: number;
 contentQuality: number;
 seoScore: number;
 };
}

/* ─── Helpers ─── */
const fmt = (n: number | undefined | null) => {
 const v = typeof n ==='number' ? n : 0;
 if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) +'M';
 if (v >= 1_000) return (v / 1_000).toFixed(1) +'k';
 return v.toLocaleString();
};

const timeAgo = (ts: string) => {
 const ms = Date.now() - new Date(ts).getTime();
 const mins = Math.floor(ms / 60_000);
 if (mins < 1) return'just now';
 if (mins < 60) return `${mins}m ago`;
 const hrs = Math.floor(mins / 60);
 if (hrs < 24) return `${hrs}h ago`;
 const days = Math.floor(hrs / 24);
 return `${days}d ago`;
};

const statusColor = (s: string) => {
 if (['online','connected','completed','active'].includes(s.toLowerCase()))
 return { dot:'bg-emerald-500', text:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-500/8 dark:bg-emerald-500/15' };
 if (['warning','pending','slow'].includes(s.toLowerCase()))
 return { dot:'bg-amber-500', text:'text-amber-600 dark:text-amber-400', bg:'bg-amber-500/8 dark:bg-amber-500/15' };
 return { dot:'bg-red-500', text:'text-red-600 dark:text-red-400', bg:'bg-red-500/8 dark:bg-red-500/15' };
};

/* ─── Stat Card ─── */
function StatCard({ label, value, growth, growthType, icon: Icon, accent }: {
 label: string;
 value: string;
 growth: number;
 growthType:'increase' |'decrease';
 icon: React.FC<{ className?: string }>;
 accent: string;
}) {
 const up = growthType ==='increase';
 return (
 <div className="group relative bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] p-5 transition-all duration-200 hover:shadow-sm hover:shadow-black/[0.04] dark:hover:shadow-black/[0.2] hover:-translate-y-0.5">
 <div className="flex items-start justify-between">
 <div className="space-y-2">
 <p className="text-[13px] font-medium text-[rgb(var(--muted-foreground))] tracking-wide uppercase">{label}</p>
 <p className="text-[28px] font-bold text-[rgb(var(--foreground))] tracking-tight leading-none">{value}</p>
 <div className="flex items-center gap-1.5 mt-1">
 {up
 ? <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-500" />
 : <ArrowTrendingDownIcon className="w-3.5 h-3.5 text-red-500" />
 }
 <span className={`text-xs font-semibold ${up ?'text-emerald-600 dark:text-emerald-400' :'text-red-600 dark:text-red-400'}`}>
 {up ?'+' :'-'}{growth}%
 </span>
 <span className="text-xs text-[rgb(var(--muted-foreground))]">vs last month</span>
 </div>
 </div>
 <div className={`p-2.5 rounded-lg ${accent} transition-transform duration-200 group-hover:scale-110`}>
 <Icon className="w-5 h-5" />
 </div>
 </div>
 </div>
 );
}

/* ─── Quick Action ─── */
function QuickAction({ href, icon: Icon, title, desc }: {
 href: string; icon: React.FC<{ className?: string }>; title: string; desc: string;
}) {
 return (
 <Link href={href} className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary))/0.3] hover:bg-[rgb(var(--primary))/0.04] transition-all duration-150 group">
 <div className="p-2 rounded-lg bg-[rgb(var(--primary))/0.08] text-[rgb(var(--primary))] group-hover:bg-[rgb(var(--primary))/0.15] transition-colors">
 <Icon className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <p className="text-sm font-semibold text-[rgb(var(--foreground))] truncate">{title}</p>
 <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">{desc}</p>
 </div>
 </Link>
 );
}

/* ─── Main ─── */
export default function AdminPage() {
 const [stats, setStats] = useState<AdminStats | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [greeting, setGreeting] = useState('Good morning');

 useEffect(() => {
 const h = new Date().getHours();
 setGreeting(h < 12 ?'Good morning' : h < 18 ?'Good afternoon' :'Good evening');
 fetchStats();
 }, []);

 const fetchStats = async () => {
 try {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const api: any = await adminClient.getStats();
 setStats({
 totalArticles: api.totalArticles,
 activeUsers: api.activeUsers,
 pageViews: api.pageViews,
 revenue: { count: 0, growth: 0, growthType:'increase' },
 recentArticles: (api.recentArticles || []).map((r: Record<string, unknown>) => ({
 id: String(r.id),
 title: r.title as string,
 status: r.status as string,
 publishedAt: r.publishedAt as string | null,
 views: r.views as number,
 author: r.author as string,
 })),
 systemStatus: api.systemStatus,
 recentActivity: api.recentActivity,
 performanceMetrics: api.performanceMetrics,
 overview: {
 totalArticles: api.totalArticles?.count ?? 0,
 totalUsers: api.totalUsers ?? (api.activeUsers?.count ?? 0),
 totalViews: api.pageViews?.count ?? 0,
 totalSubscribers: 0,
 },
 });
 } catch (err) {
 setError(err instanceof Error ? err.message :'Failed to load dashboard');
 } finally {
 setLoading(false);
 }
 };

 /* Loading skeleton */
 if (loading) {
 return (
 <div className="space-y-6 animate-fade-in">
 <div className="space-y-2">
 <div className="skeleton-warm h-8 w-64" />
 <div className="skeleton-warm h-4 w-96" />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
 {[...Array(4)].map((_, i) => <div key={i} className="skeleton-warm h-[120px] rounded-xl" />)}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 skeleton-warm h-80 rounded-xl" />
 <div className="skeleton-warm h-80 rounded-xl" />
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div>
 <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl text-sm">
 <p className="font-semibold">Dashboard Error</p>
 <p className="mt-1 opacity-80">{error}</p>
 </div>
 </div>
 );
 }

 if (!stats) {
 return (
 <div>
 <p className="text-[rgb(var(--muted-foreground))]">No data available</p>
 </div>
 );
 }

 const sys = stats.systemStatus ?? {
 server: { status:'unknown', uptime:'—' },
 database: { status:'unknown', responseTime:'—' },
 cdn: { status:'unknown', cacheHitRate:'—' },
 backup: { status:'unknown', lastBackup: new Date().toISOString() },
 };

 const perf = stats.performanceMetrics;
 const perfItems = [
 { label:'Site Speed', value: perf?.siteSpeed ?? 0, color:'bg-emerald-500' },
 { label:'User Engagement', value: perf?.userEngagement ?? 0, color:'bg-[rgb(var(--primary))]/50' },
 { label:'Content Quality', value: perf?.contentQuality ?? 0, color:'bg-violet-500' },
 { label:'SEO Score', value: perf?.seoScore ?? 0, color:'bg-amber-500' },
 ];

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] tracking-tight">{greeting}</h1>
 <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
 Here&apos;s what&apos;s happening with your platform today.
 </p>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
 <StatCard
 label="Articles" value={fmt(stats.overview.totalArticles)}
 growth={stats.totalArticles?.growth ?? 0}
 growthType={stats.totalArticles?.growthType ??'increase'}
 icon={DocumentTextIcon}
 accent="bg-[rgb(var(--primary))]/50/10/20 text-[rgb(var(--primary))]"
 />
 <StatCard
 label="Users" value={fmt(stats.overview.totalUsers)}
 growth={stats.activeUsers?.growth ?? 0}
 growthType={stats.activeUsers?.growthType ??'increase'}
 icon={UsersIcon}
 accent="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
 />
 <StatCard
 label="Page Views" value={fmt(stats.overview.totalViews)}
 growth={stats.pageViews?.growth ?? 0}
 growthType={stats.pageViews?.growthType ??'increase'}
 icon={EyeIcon}
 accent="bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400"
 />
 <StatCard
 label="Subscribers" value={fmt(stats.overview.totalSubscribers)}
 growth={0}
 growthType="increase"
 icon={ChartBarIcon}
 accent="bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
 />
 </div>

 {/* Main grid: Articles + Sidebar */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Recent Articles */}
 <div className="lg:col-span-2 bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))]">
 <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--border))]">
 <h2 className="text-sm font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">Recent Articles</h2>
 <Link href="/content" className="text-xs font-medium text-[rgb(var(--primary))] hover:underline">View all</Link>
 </div>
 <div className="divide-y divide-[rgb(var(--border))]">
 {(stats.recentArticles || []).slice(0, 6).map((article) => (
 <div key={article.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[rgb(var(--muted))/0.5] transition-colors">
 <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[rgb(var(--muted))] flex items-center justify-center">
 <DocumentTextIcon className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{article.title}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
 article.status ==='Published'
 ?'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
 : article.status ==='Draft'
 ?'bg-amber-500/10 text-amber-700 dark:text-amber-400'
 :'bg-[rgb(var(--primary))]/50/10 text-[rgb(var(--primary))]'
 }`}>
 {article.status}
 </span>
 <span className="text-[11px] text-[rgb(var(--muted-foreground))]">by {article.author}</span>
 </div>
 </div>
 <div className="flex-shrink-0 text-right">
 <p className="text-xs font-medium text-[rgb(var(--foreground))]">
 <EyeIcon className="w-3 h-3 inline mr-1 opacity-50" />
 {fmt(article.views)}
 </p>
 <p className="text-[11px] text-[rgb(var(--muted-foreground))] mt-0.5">
 {article.publishedAt ? timeAgo(article.publishedAt) :'Unpublished'}
 </p>
 </div>
 </div>
 ))}
 {(!stats.recentArticles || stats.recentArticles.length === 0) && (
 <div className="px-5 py-8 text-center text-sm text-[rgb(var(--muted-foreground))]">No articles yet</div>
 )}
 </div>
 </div>

 {/* Sidebar */}
 <div className="space-y-6">
 {/* Quick Actions */}
 <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] p-5">
 <h2 className="text-sm font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider mb-4">Quick Actions</h2>
 <div className="space-y-2.5">
 <QuickAction href="/content/new" icon={PlusIcon} title="New Article" desc="Create new content" />
 <QuickAction href="/analytics" icon={ChartBarIcon} title="Analytics" desc="View performance" />
 <QuickAction href="/content" icon={DocumentTextIcon} title="Content Hub" desc="Manage articles" />
 <QuickAction href="/system" icon={CogIcon} title="Settings" desc="System config" />
 </div>
 </div>

 {/* System Status */}
 <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] p-5">
 <h2 className="text-sm font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider mb-4">System Status</h2>
 <div className="space-y-3">
 {[
 { icon: ServerIcon, label:'Server', status: sys.server.status, detail: `Uptime: ${sys.server.uptime}` },
 { icon: CircleStackIcon, label:'Database', status: sys.database.status, detail: sys.database.responseTime },
 { icon: BoltIcon, label:'CDN', status: sys.cdn.status, detail: `Hit rate: ${sys.cdn.cacheHitRate}` },
 { icon: ShieldCheckIcon, label:'Backup', status: sys.backup.status, detail: sys.backup.lastBackup ? timeAgo(sys.backup.lastBackup) :'—' },
 ].map((item) => {
 const sc = statusColor(item.status);
 return (
 <div key={item.label} className={`flex items-center gap-3 p-3 rounded-lg ${sc.bg}`}>
 <item.icon className={`w-4 h-4 flex-shrink-0 ${sc.text}`} />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-[rgb(var(--foreground))]">{item.label}</p>
 <p className="text-[11px] text-[rgb(var(--muted-foreground))]">{item.detail}</p>
 </div>
 <div className="flex items-center gap-1.5">
 <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
 <span className={`text-xs font-medium capitalize ${sc.text}`}>{item.status}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>

 {/* Bottom grid: Activity + Performance */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Recent Activity */}
 <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))]">
 <div className="px-5 py-4 border-b border-[rgb(var(--border))]">
 <h2 className="text-sm font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">Recent Activity</h2>
 </div>
 <div className="divide-y divide-[rgb(var(--border))]">
 {(stats.recentActivity || []).slice(0, 5).map((activity) => (
 <div key={activity.id} className="flex items-center gap-3 px-5 py-3">
 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center">
 <ClockIcon className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm text-[rgb(var(--foreground))] truncate">{activity.message}</p>
 <p className="text-[11px] text-[rgb(var(--muted-foreground))]">{timeAgo(activity.timestamp)}</p>
 </div>
 </div>
 ))}
 {(!stats.recentActivity || stats.recentActivity.length === 0) && (
 <div className="px-5 py-8 text-center text-sm text-[rgb(var(--muted-foreground))]">No recent activity</div>
 )}
 </div>
 </div>

 {/* Performance */}
 <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] p-5">
 <h2 className="text-sm font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider mb-5">Performance</h2>
 <div className="space-y-5">
 {perfItems.map((item) => (
 <div key={item.label}>
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm text-[rgb(var(--muted-foreground))]">{item.label}</span>
 <span className="text-sm font-semibold text-[rgb(var(--foreground))] tabular-nums">{item.value}%</span>
 </div>
 <div className="h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
 style={{ width: `${item.value}%` }}
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}



