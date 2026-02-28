'use client';

import React from'react';

/* ─── Admin Table ───────────────────────────────────────── */

interface Column<T> {
 key: string;
 header: string;
 className?: string;
 render?: (item: T, index: number) => React.ReactNode;
}

interface AdminTableProps<T> {
 columns: Column<T>[];
 data: T[];
 keyExtractor?: (item: T, index: number) => string;
 emptyMessage?: string;
 className?: string;
 onRowClick?: (item: T) => void;
 compact?: boolean;
}

export function AdminTable<T extends Record<string, unknown>>({
 columns,
 data,
 keyExtractor,
 emptyMessage ='No data available',
 className ='',
 onRowClick,
 compact = false,
}: AdminTableProps<T>) {
 const cellPadding = compact ?'px-4 py-2.5' :'px-6 py-3.5';
 const headerPadding = compact ?'px-4 py-2' :'px-6 py-3';

 return (
 <div className={`overflow-x-auto rounded-xl border border-[rgb(var(--border))] ${className}`}>
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/5">
 {columns.map(col => (
 <th
 key={col.key}
 className={`${headerPadding} text-left text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider ${col.className ||''}`}
 >
 {col.header}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {data.length === 0 ? (
 <tr>
 <td colSpan={columns.length} className="px-6 py-12 text-center text-[rgb(var(--muted-foreground))]">
 {emptyMessage}
 </td>
 </tr>
 ) : (
 data.map((item, index) => (
 <tr
 key={keyExtractor ? keyExtractor(item, index) : index}
 className={`
 bg-[rgb(var(--card))] transition-colors duration-100
 ${onRowClick ?'cursor-pointer hover:bg-accent/30' :'hover:bg-accent/20'}
 `}
 onClick={() => onRowClick?.(item)}
 >
 {columns.map(col => (
 <td key={col.key} className={`${cellPadding} text-[rgb(var(--foreground))] ${col.className ||''}`}>
 {col.render ? col.render(item, index) : String(item[col.key] ??'')}
 </td>
 ))}
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 );
}

/* ─── AdminInput ────────────────────────────────────────── */

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 hint?: string;
 icon?: React.ReactNode;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
 ({ label, error, hint, icon, className ='', ...props }, ref) => {
 return (
 <div className="space-y-1.5">
 {label && (
 <label className="text-sm font-medium text-[rgb(var(--foreground))]">{label}</label>
 )}
 <div className="relative">
 {icon && (
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[rgb(var(--muted-foreground))]">
 {icon}
 </div>
 )}
 <input
 ref={ref}
 className={`
 w-full rounded-lg border bg-[rgb(var(--card))] text-[rgb(var(--foreground))] text-sm
 placeholder:text-[rgb(var(--muted-foreground))]
 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
 transition-all duration-150
 disabled:opacity-50 disabled:cursor-not-allowed
 ${icon ?'pl-10' :'px-3'} py-2
 ${error ?'border-red-500 focus:ring-red-500' :'border-[rgb(var(--border))]'}
 ${className}
 `}
 {...props}
 />
 </div>
 {error && <p className="text-xs text-red-500">{error}</p>}
 {hint && !error && <p className="text-xs text-[rgb(var(--muted-foreground))]">{hint}</p>}
 </div>
 );
 }
);
AdminInput.displayName ='AdminInput';

/* ─── AdminSelect ───────────────────────────────────────── */

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
 label?: string;
 error?: string;
 options: { value: string; label: string }[];
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
 ({ label, error, options, className ='', ...props }, ref) => {
 return (
 <div className="space-y-1.5">
 {label && (
 <label className="text-sm font-medium text-[rgb(var(--foreground))]">{label}</label>
 )}
 <select
 ref={ref}
 className={`
 w-full rounded-lg border bg-[rgb(var(--card))] text-[rgb(var(--foreground))] text-sm px-3 py-2
 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
 transition-all duration-150
 ${error ?'border-red-500 focus:ring-red-500' :'border-[rgb(var(--border))]'}
 ${className}
 `}
 {...props}
 >
 {options.map(opt => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 {error && <p className="text-xs text-red-500">{error}</p>}
 </div>
 );
 }
);
AdminSelect.displayName ='AdminSelect';
