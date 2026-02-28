"use client";

import React from"react";

/* ─── Types ─────────────────────────────────────────────── */
interface Props {
 title: string;
 description?: string;
 badge?: { label: string; color?: string };
 actions?: React.ReactNode;
 tabs?: { id: string; label: string; count?: number }[];
 activeTab?: string;
 onTabChange?: (id: string) => void;
 children?: React.ReactNode;
}

/* ─── Component ─────────────────────────────────────────── */
export default function PageHeader({
 title,
 description,
 badge,
 actions,
 tabs,
 activeTab,
 onTabChange,
 children,
}: Props) {
 return (
 <div className="space-y-4">
 {/* Title row */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="min-w-0">
 <div className="flex items-center gap-2.5">
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">{title}</h1>
 {badge && (
 <span
 className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
 badge.color ??"bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
 }`}
 >
 {badge.label}
 </span>
 )}
 </div>
 {description && (
 <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{description}</p>
 )}
 </div>
 {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
 </div>

 {/* Optional children (stat cards, filters, etc.) */}
 {children}

 {/* Tabs */}
 {tabs && tabs.length > 0 && (
 <div className="flex items-center gap-1 border-b border-[rgb(var(--border))]">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => onTabChange?.(tab.id)}
 className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
 activeTab === tab.id
 ?"text-[rgb(var(--foreground))] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[rgb(var(--primary))] after:rounded-full"
 :"text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
 }`}
 >
 {tab.label}
 {tab.count !== undefined && (
 <span
 className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1 text-[10px] font-semibold tabular-nums ${
 activeTab === tab.id
 ?"bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
 :"bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted-foreground))]"
 }`}
 >
 {tab.count}
 </span>
 )}
 </button>
 ))}
 </div>
 )}
 </div>
 );
}
