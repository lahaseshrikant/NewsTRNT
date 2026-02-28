"use client";

import React from"react";

/* ─── Types ─────────────────────────────────────────────── */
interface Props {
 icon: React.ReactNode;
 label: string;
 value: string | number;
 subValue?: string;
 trend?: { value: number; label?: string };
 className?: string;
}

/* ─── Component ─────────────────────────────────────────── */
export default function StatCard({ icon, label, value, subValue, trend, className ="" }: Props) {
 const trendPositive = trend && trend.value > 0;
 const trendNegative = trend && trend.value < 0;

 return (
 <div className={`rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 ${className}`}>
 <div className="flex items-start justify-between">
 <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
 {icon}
 </span>
 {trend && (
 <span
 className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
 trendPositive
 ?"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
 : trendNegative
 ?"bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
 :"bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted-foreground))]"
 }`}
 >
 {trendPositive ? (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
 <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
 </svg>
 ) : trendNegative ? (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
 <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
 </svg>
 ) : null}
 {Math.abs(trend.value)}%
 </span>
 )}
 </div>
 <div className="mt-3">
 <p className="text-2xl font-semibold tabular-nums text-[rgb(var(--foreground))]">{value}</p>
 <p className="mt-0.5 text-[11px] text-[rgb(var(--muted-foreground))]">
 {label}
 {trend?.label && <span className="ml-1 text-[rgb(var(--muted-foreground))]/60">{trend.label}</span>}
 </p>
 </div>
 {subValue && (
 <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]/70">{subValue}</p>
 )}
 </div>
 );
}
