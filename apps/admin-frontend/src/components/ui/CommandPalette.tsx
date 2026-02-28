"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from"react";
import { useRouter, usePathname } from"next/navigation";
import { createPortal } from"react-dom";
import { ADMIN_NAVIGATION, NavItem, UserRole, RBACUtils } from"@/config/rbac";
import NavIcon from"@/components/icons/NavIcon";
import { useRBAC } from"@/components/rbac";

/* ─── SVG Icons ─────────────────────────────────────────── */
const SearchIcon = ({ cls }: { cls?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls ??"h-5 w-5"}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
);
const ReturnIcon = ({ cls }: { cls?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls ??"h-4 w-4"}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
 </svg>
);
const HashtagIcon = ({ cls }: { cls?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cls ??"h-4 w-4"}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.6 19.5m-2.1-19.5l-3.6 19.5" />
 </svg>
);

/* ─── Types ─────────────────────────────────────────────── */
interface CommandItem {
 id: string;
 label: string;
 description?: string;
 icon: string;
 href: string;
 section: string;
 keywords: string[];
}

/* ─── Flatten navigation tree into a searchable list ────── */
function flattenNav(items: NavItem[], section =""): CommandItem[] {
 const result: CommandItem[] = [];
 for (const item of items) {
 const sec = section || item.label;
 result.push({
 id: item.id,
 label: item.label,
 description: item.description,
 icon: item.icon,
 href: item.href,
 section: sec,
 keywords: [
 item.label.toLowerCase(),
 item.id.toLowerCase(),
 item.href.toLowerCase().replace(/\//g,""),
 item.description?.toLowerCase() ??"",
 ],
 });
 if (item.children) {
 result.push(...flattenNav(item.children, sec));
 }
 }
 return result;
}

/* ─── Quick actions (always visible when no query) ──────── */
const QUICK_ACTIONS: CommandItem[] = [
 { id:"qa-new-article", label:"New Article", description:"Create a new article", icon:"plus", href:"/content/new", section:"Quick Actions", keywords: ["new","article","create","write","post"] },
 { id:"qa-dashboard", label:"Go to Dashboard", description:"Return to the main dashboard", icon:"home", href:"/", section:"Quick Actions", keywords: ["dashboard","home","overview"] },
 { id:"qa-analytics", label:"View Analytics", description:"Check performance metrics", icon:"chart", href:"/analytics", section:"Quick Actions", keywords: ["analytics","stats","performance","metrics"] },
 { id:"qa-users", label:"Manage Users", description:"View and manage user accounts", icon:"users", href:"/users", section:"Quick Actions", keywords: ["users","members","accounts","team"] },
 { id:"qa-settings", label:"System Settings", description:"Configure system preferences", icon:"cog", href:"/system/settings", section:"Quick Actions", keywords: ["settings","config","preferences","system"] },
 { id:"qa-media", label:"Media Library", description:"Upload and manage files", icon:"photo", href:"/media", section:"Quick Actions", keywords: ["media","images","upload","files","photos"] },
];

/* ─── Component ─────────────────────────────────────────── */
export default function CommandPalette() {
 const [open, setOpen] = useState(false);
 const [query, setQuery] = useState("");
 const [selectedIndex, setSelectedIndex] = useState(0);
 const inputRef = useRef<HTMLInputElement>(null);
 const listRef = useRef<HTMLDivElement>(null);
 const router = useRouter();
 const pathname = usePathname();
 const { session } = useRBAC();

 // Build full command list from navigation
 const allCommands = useMemo(() => {
 const role = session?.role as UserRole | undefined;
 const filtered = role ? RBACUtils.filterNavigation(role, ADMIN_NAVIGATION) : ADMIN_NAVIGATION;
 return flattenNav(filtered);
 }, [session]);

 // Filter results
 const results = useMemo(() => {
 if (!query.trim()) return QUICK_ACTIONS;

 const q = query.toLowerCase().trim();
 const terms = q.split(/\s+/);

 return allCommands
 .filter((item) =>
 terms.every((term) => item.keywords.some((kw) => kw.includes(term)))
 )
 .slice(0, 12);
 }, [query, allCommands]);

 // Group results by section
 const grouped = useMemo(() => {
 const map = new Map<string, CommandItem[]>();
 for (const item of results) {
 const section = item.section;
 if (!map.has(section)) map.set(section, []);
 map.get(section)!.push(item);
 }
 return map;
 }, [results]);

 // Keyboard shortcut to open
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if ((e.metaKey || e.ctrlKey) && e.key ==="k") {
 e.preventDefault();
 setOpen((prev) => !prev);
 }
 if (e.key ==="Escape") {
 setOpen(false);
 }
 };
 window.addEventListener("keydown", handleKeyDown);
 return () => window.removeEventListener("keydown", handleKeyDown);
 }, []);

 // Focus input when opened
 useEffect(() => {
 if (open) {
 setQuery("");
 setSelectedIndex(0);
 requestAnimationFrame(() => inputRef.current?.focus());
 }
 }, [open]);

 // Close on route change
 useEffect(() => {
 setOpen(false);
 }, [pathname]);

 // Reset selection when results change
 useEffect(() => {
 setSelectedIndex(0);
 }, [results]);

 // Navigate to selected item
 const navigate = useCallback(
 (item: CommandItem) => {
 setOpen(false);
 router.push(item.href);
 },
 [router]
 );

 // Keyboard navigation
 const handleKeyDown = useCallback(
 (e: React.KeyboardEvent) => {
 if (e.key ==="ArrowDown") {
 e.preventDefault();
 setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
 } else if (e.key ==="ArrowUp") {
 e.preventDefault();
 setSelectedIndex((prev) => Math.max(prev - 1, 0));
 } else if (e.key ==="Enter" && results[selectedIndex]) {
 e.preventDefault();
 navigate(results[selectedIndex]);
 }
 },
 [results, selectedIndex, navigate]
 );

 // Scroll selected item into view
 useEffect(() => {
 const list = listRef.current;
 if (!list) return;
 const selected = list.querySelector("[data-selected='true']");
 if (selected) {
 selected.scrollIntoView({ block:"nearest" });
 }
 }, [selectedIndex]);

 if (!open) return null;

 let flatIndex = 0;

 return createPortal(
 <div
 className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-[2px]"
 onClick={(e) => {
 if (e.target === e.currentTarget) setOpen(false);
 }}
 >
 <div className="w-full max-w-[560px] overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg animate-in fade-in slide-in-from-top-4 duration-150">
 {/* Search Input */}
 <div className="flex items-center gap-3 border-b border-[rgb(var(--border))] px-4">
 <SearchIcon cls="h-5 w-5 text-[rgb(var(--muted-foreground))] shrink-0" />
 <input
 ref={inputRef}
 type="text"
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder="Search commands, pages, actions..."
 className="h-12 flex-1 bg-transparent text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] outline-none"
 />
 <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 px-1.5 text-[10px] font-medium text-[rgb(var(--muted-foreground))]">ESC</kbd>
 </div>

 {/* Results */}
 <div ref={listRef} className="max-h-[360px] overflow-y-auto overscroll-contain p-2">
 {results.length === 0 ? (
 <div className="p-8 text-center">
 <HashtagIcon cls="mx-auto h-8 w-8 text-[rgb(var(--muted-foreground))]/40" />
 <p className="mt-2 text-sm font-medium text-[rgb(var(--muted-foreground))]">No results found</p>
 <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]/60">Try a different search term</p>
 </div>
 ) : (
 Array.from(grouped.entries()).map(([section, items]) => (
 <div key={section}>
 <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted-foreground))]/60">
 {section}
 </p>
 {items.map((item) => {
 const idx = flatIndex++;
 const isSelected = idx === selectedIndex;
 const isCurrentPage = pathname === item.href;
 return (
 <button
 key={item.id}
 data-selected={isSelected}
 onClick={() => navigate(item)}
 onMouseEnter={() => setSelectedIndex(idx)}
 className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
 isSelected
 ?"bg-[rgb(var(--primary))]/10 text-[rgb(var(--foreground))]"
 :"text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
 }`}
 >
 <span
 className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
 isSelected
 ?"bg-[rgb(var(--primary))]/15 text-[rgb(var(--primary))]"
 :"bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted-foreground))]"
 }`}
 >
 <NavIcon name={item.icon} className="h-4 w-4" />
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate font-medium">{item.label}</p>
 {item.description && (
 <p className="truncate text-xs text-[rgb(var(--muted-foreground))]">{item.description}</p>
 )}
 </div>
 {isCurrentPage && (
 <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
 Current
 </span>
 )}
 {isSelected && (
 <ReturnIcon cls="h-4 w-4 shrink-0 text-[rgb(var(--muted-foreground))]" />
 )}
 </button>
 );
 })}
 </div>
 ))
 )}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between border-t border-[rgb(var(--border))] px-4 py-2">
 <div className="flex items-center gap-3 text-[11px] text-[rgb(var(--muted-foreground))]">
 <span className="flex items-center gap-1">
 <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 px-1 text-[10px] font-medium">↑↓</kbd>
 Navigate
 </span>
 <span className="flex items-center gap-1">
 <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 px-1 text-[10px] font-medium">↵</kbd>
 Open
 </span>
 <span className="flex items-center gap-1">
 <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 px-1 text-[10px] font-medium">esc</kbd>
 Close
 </span>
 </div>
 <span className="text-[10px] text-[rgb(var(--muted-foreground))]/40">NewsTRNT Command Palette</span>
 </div>
 </div>
 </div>,
 document.body
 );
}
