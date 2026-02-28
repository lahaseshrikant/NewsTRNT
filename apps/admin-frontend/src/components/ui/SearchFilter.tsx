"use client";

import React, { useState, useCallback, useRef, useEffect } from"react";

/* ─── Types ─────────────────────────────────────────────── */
interface FilterOption {
 value: string;
 label: string;
 count?: number;
}

interface FilterGroup {
 key: string;
 label: string;
 options: FilterOption[];
}

interface Props {
 value: string;
 onChange: (value: string) => void;
 placeholder?: string;
 filters?: FilterGroup[];
 activeFilters?: Record<string, string>;
 onFilterChange?: (key: string, value: string) => void;
 debounceMs?: number;
 className?: string;
}

/* ─── Component ─────────────────────────────────────────── */
export default function SearchFilter({
 value,
 onChange,
 placeholder ="Search...",
 filters = [],
 activeFilters = {},
 onFilterChange,
 debounceMs = 250,
 className ="",
}: Props) {
 const [localValue, setLocalValue] = useState(value);
 const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

 // Sync external value changes
 useEffect(() => {
 setLocalValue(value);
 }, [value]);

 const handleChange = useCallback(
 (val: string) => {
 setLocalValue(val);
 clearTimeout(timerRef.current);
 timerRef.current = setTimeout(() => onChange(val), debounceMs);
 },
 [onChange, debounceMs]
 );

 const activeFilterCount = Object.values(activeFilters).filter((v) => v && v !=="all").length;

 return (
 <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}>
 {/* Search Input */}
 <div className="relative flex-1">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={1.5}
 stroke="currentColor"
 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]"
 >
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 value={localValue}
 onChange={(e) => handleChange(e.target.value)}
 placeholder={placeholder}
 className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] pl-9 pr-8 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] outline-none focus:border-[rgb(var(--primary))]/50 focus:ring-1 focus:ring-[rgb(var(--primary))]/20 transition-colors"
 />
 {localValue && (
 <button
 onClick={() => handleChange("")}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>

 {/* Filter Dropdowns */}
 {filters.map((group) => (
 <select
 key={group.key}
 value={activeFilters[group.key] ??"all"}
 onChange={(e) => onFilterChange?.(group.key, e.target.value)}
 className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 text-sm text-[rgb(var(--foreground))] outline-none focus:border-[rgb(var(--primary))]/50 focus:ring-1 focus:ring-[rgb(var(--primary))]/20 transition-colors appearance-none cursor-pointer"
 >
 <option value="all">{group.label}: All</option>
 {group.options.map((opt) => (
 <option key={opt.value} value={opt.value}>
 {opt.label}
 {opt.count !== undefined ? ` (${opt.count})` :""}
 </option>
 ))}
 </select>
 ))}

 {/* Active filter count badge */}
 {activeFilterCount > 0 && (
 <button
 onClick={() => {
 for (const group of filters) {
 onFilterChange?.(group.key,"all");
 }
 }}
 className="inline-flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-[11px] font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 {activeFilterCount} filter{activeFilterCount > 1 ?"s" :""}
 </button>
 )}
 </div>
 );
}

export type { FilterGroup, FilterOption };
