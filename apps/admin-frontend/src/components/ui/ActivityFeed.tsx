"use client";

import React, { useState, useMemo } from"react";

/* ─── Types ─────────────────────────────────────────────── */
type ActivityType ="article" |"user" |"system" |"comment" |"media" |"setting";

interface ActivityItem {
 id: string;
 type: ActivityType;
 title: string;
 description: string;
 actor: string;
 timestamp: string;
 meta?: string;
}

/* ─── Icons per type ────────────────────────────────────── */
const ICONS: Record<ActivityType, React.ReactNode> = {
 article: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
 </svg>
 ),
 user: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
 </svg>
 ),
 system: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 ),
 comment: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
 </svg>
 ),
 media: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18V6a2.25 2.25 0 012.25-2.25h15A2.25 2.25 0 0121.75 6v12A2.25 2.25 0 0119.5 20.25H4.5A2.25 2.25 0 012.25 18z" />
 </svg>
 ),
 setting: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
 </svg>
 ),
};

const TYPE_COLORS: Record<ActivityType, string> = {
 article:"bg-sky-100 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
 user:"bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
 system:"bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
 comment:"bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
 media:"bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/20 dark:text-fuchsia-400",
 setting:"bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
};

/* ─── Filter Tabs ────────────────────────────────────────── */
const FILTERS: { label: string; value: ActivityType |"all" }[] = [
 { label:"All", value:"all" },
 { label:"Articles", value:"article" },
 { label:"Users", value:"user" },
 { label:"Comments", value:"comment" },
 { label:"System", value:"system" },
];

/* ─── Time formatting ────────────────────────────────────── */
function relativeTime(timestamp: string): string {
 const diff = Date.now() - new Date(timestamp).getTime();
 const minutes = Math.floor(diff / 60000);
 if (minutes < 1) return"Just now";
 if (minutes < 60) return `${minutes}m ago`;
 const hours = Math.floor(minutes / 60);
 if (hours < 24) return `${hours}h ago`;
 const days = Math.floor(hours / 24);
 if (days < 7) return `${days}d ago`;
 return new Date(timestamp).toLocaleDateString(undefined, { month:"short", day:"numeric" });
}

/* ─── Component ─────────────────────────────────────────── */
interface Props {
 activities: ActivityItem[];
 maxItems?: number;
 title?: string;
 showFilters?: boolean;
 className?: string;
}

export default function ActivityFeed({
 activities,
 maxItems = 15,
 title ="Recent Activity",
 showFilters = true,
 className ="",
}: Props) {
 const [filter, setFilter] = useState<ActivityType |"all">("all");

 const filtered = useMemo(() => {
 const base = filter ==="all" ? activities : activities.filter((a) => a.type === filter);
 return base.slice(0, maxItems);
 }, [activities, filter, maxItems]);

 return (
 <div className={`rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] ${className}`}>
 {/* Header */}
 <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3">
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">{title}</h3>
 <span className="text-[11px] tabular-nums text-[rgb(var(--muted-foreground))]">
 {filtered.length} {filtered.length === 1 ?"event" :"events"}
 </span>
 </div>

 {/* Filters */}
 {showFilters && (
 <div className="flex items-center gap-1 border-b border-[rgb(var(--border))] px-4 py-2">
 {FILTERS.map((f) => (
 <button
 key={f.value}
 onClick={() => setFilter(f.value)}
 className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
 filter === f.value
 ?"bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
 :"text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10"
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>
 )}

 {/* Timeline */}
 <div className="max-h-[400px] overflow-y-auto">
 {filtered.length === 0 ? (
 <div className="py-10 text-center">
 <p className="text-sm text-[rgb(var(--muted-foreground))]">No activity found</p>
 </div>
 ) : (
 <div className="divide-y divide-[rgb(var(--border))]">
 {filtered.map((item) => (
 <div key={item.id} className="group flex items-start gap-3 px-4 py-3 hover:bg-[rgb(var(--muted))]/5 transition-colors">
 <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${TYPE_COLORS[item.type]}`}>
 {ICONS[item.type]}
 </span>
 <div className="min-w-0 flex-1">
 <p className="text-sm text-[rgb(var(--foreground))]">
 <span className="font-medium">{item.actor}</span>{""}
 <span className="text-[rgb(var(--muted-foreground))]">{item.description}</span>
 </p>
 {item.meta && (
 <p className="mt-0.5 truncate text-xs text-[rgb(var(--muted-foreground))]/70">{item.meta}</p>
 )}
 </div>
 <span className="shrink-0 text-[11px] tabular-nums text-[rgb(var(--muted-foreground))]/50 group-hover:text-[rgb(var(--muted-foreground))]">
 {relativeTime(item.timestamp)}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}

export type { ActivityItem, ActivityType };
