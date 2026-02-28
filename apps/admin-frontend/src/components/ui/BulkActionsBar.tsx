"use client";

import React from"react";

/* ─── Types ─────────────────────────────────────────────── */
interface BulkAction {
 id: string;
 label: string;
 icon?: React.ReactNode;
 variant?:"default" |"danger";
 onClick: (selectedIds: string[]) => void;
}

interface Props {
 selectedCount: number;
 totalCount: number;
 actions: BulkAction[];
 onClearSelection: () => void;
 onSelectAll?: () => void;
}

/* ─── Component ─────────────────────────────────────────── */
export default function BulkActionsBar({
 selectedCount,
 totalCount,
 actions,
 onClearSelection,
 onSelectAll,
}: Props) {
 if (selectedCount === 0) return null;

 return (
 <div className="sticky top-0 z-30 flex items-center justify-between gap-4 rounded-xl border border-[rgb(var(--primary))]/20 bg-[rgb(var(--primary))]/[0.04] px-4 py-2.5 animate-in slide-in-from-top-2 duration-200">
 <div className="flex items-center gap-3">
 <div className="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10 px-2">
 <span className="text-sm font-bold tabular-nums text-[rgb(var(--primary))]">{selectedCount}</span>
 </div>
 <span className="text-sm text-[rgb(var(--foreground))]">
 {selectedCount === 1 ?"item" :"items"} selected
 {selectedCount < totalCount && onSelectAll && (
 <button onClick={onSelectAll} className="ml-1.5 text-[rgb(var(--primary))] hover:underline font-medium">
 Select all {totalCount}
 </button>
 )}
 </span>
 </div>

 <div className="flex items-center gap-2">
 {actions.map((action) => (
 <button
 key={action.id}
 onClick={() => action.onClick([])}
 className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
 action.variant ==="danger"
 ?"bg-red-600 text-white hover:bg-red-700"
 :"bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10"
 }`}
 >
 {action.icon}
 {action.label}
 </button>
 ))}

 <div className="ml-1 h-5 w-px bg-[rgb(var(--border))]" />

 <button
 onClick={onClearSelection}
 className="rounded-lg p-1.5 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10 transition-colors"
 title="Clear selection"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 </div>
 );
}

export type { BulkAction };
