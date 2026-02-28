"use client";

import React from"react";

/* ─── Types ─────────────────────────────────────────────── */
interface Props {
 label: string;
 value: number;
 max: number;
 unit?: string;
 thresholds?: { warning: number; critical: number };
 showPercentage?: boolean;
 className?: string;
}

/* ─── Component ─────────────────────────────────────────── */
export default function QuotaBar({
 label,
 value,
 max,
 unit ="",
 thresholds = { warning: 70, critical: 90 },
 showPercentage = true,
 className ="",
}: Props) {
 const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
 const isCritical = pct >= thresholds.critical;
 const isWarning = pct >= thresholds.warning;

 const barColor = isCritical
 ?"bg-red-500"
 : isWarning
 ?"bg-amber-500"
 :"bg-emerald-500";

 const textColor = isCritical
 ?"text-red-600 dark:text-red-400"
 : isWarning
 ?"text-amber-600 dark:text-amber-400"
 :"text-[rgb(var(--muted-foreground))]";

 return (
 <div className={`space-y-1.5 ${className}`}>
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-[rgb(var(--foreground))]">{label}</span>
 <span className={`text-[11px] font-medium tabular-nums ${textColor}`}>
 {value.toLocaleString()}{unit} / {max.toLocaleString()}{unit}
 {showPercentage && <span className="ml-1 text-[rgb(var(--muted-foreground))]/60">({pct}%)</span>}
 </span>
 </div>
 <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--muted))]/15">
 <div
 className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 );
}
