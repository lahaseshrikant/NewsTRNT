"use client";

import React from"react";

/* ─── Types ─────────────────────────────────────────────── */
interface Props {
 icon?: React.ReactNode;
 title: string;
 description?: string;
 action?: { label: string; onClick: () => void };
 className?: string;
}

/* ─── Default Icon ──────────────────────────────────────── */
const FolderIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-10 w-10">
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
 </svg>
);

/* ─── Component ─────────────────────────────────────────── */
export default function EmptyState({ icon, title, description, action, className ="" }: Props) {
 return (
 <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
 <span className="text-[rgb(var(--muted-foreground))]/30">
 {icon ?? <FolderIcon />}
 </span>
 <h3 className="mt-3 text-sm font-semibold text-[rgb(var(--foreground))]">{title}</h3>
 {description && (
 <p className="mt-1 max-w-sm text-xs text-[rgb(var(--muted-foreground))]">{description}</p>
 )}
 {action && (
 <button
 onClick={action.onClick}
 className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--primary))] px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-sm"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
 </svg>
 {action.label}
 </button>
 )}
 </div>
 );
}
