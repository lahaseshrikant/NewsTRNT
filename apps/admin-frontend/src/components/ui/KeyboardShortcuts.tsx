"use client";

import React, { useState, useEffect } from"react";
import { createPortal } from"react-dom";

/* ─── Icons ─────────────────────────────────────────────── */
const KeyboardIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
 </svg>
);

/* ─── Shortcut definitions ──────────────────────────────── */
interface Shortcut {
 keys: string[];
 description: string;
}

interface ShortcutGroup {
 title: string;
 shortcuts: Shortcut[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
 {
 title:"General",
 shortcuts: [
 { keys: ["Ctrl","K"], description:"Open command palette" },
 { keys: ["?"], description:"Show keyboard shortcuts" },
 { keys: ["Esc"], description:"Close modal / dialog" },
 ],
 },
 {
 title:"Navigation",
 shortcuts: [
 { keys: ["G","then","H"], description:"Go to Dashboard" },
 { keys: ["G","then","A"], description:"Go to Analytics" },
 { keys: ["G","then","C"], description:"Go to Content" },
 { keys: ["G","then","U"], description:"Go to Users" },
 { keys: ["G","then","S"], description:"Go to Settings" },
 ],
 },
 {
 title:"Content",
 shortcuts: [
 { keys: ["N"], description:"New article" },
 { keys: ["E"], description:"Edit selected item" },
 { keys: ["/"], description:"Focus search on current page" },
 ],
 },
 {
 title:"Command Palette",
 shortcuts: [
 { keys: ["↑","↓"], description:"Navigate results" },
 { keys: ["Enter"], description:"Open selected result" },
 { keys: ["Esc"], description:"Close palette" },
 ],
 },
];

/* ─── Component ─────────────────────────────────────────── */
export default function KeyboardShortcuts() {
 const [open, setOpen] = useState(false);

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 // Only open on"?" when not in an input/textarea/contenteditable
 const target = e.target as HTMLElement;
 const isInput =
 target.tagName ==="INPUT" ||
 target.tagName ==="TEXTAREA" ||
 target.isContentEditable;

 if (e.key ==="?" && !isInput && !e.metaKey && !e.ctrlKey) {
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

 if (!open) return null;

 return createPortal(
 <div
 className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
 onClick={(e) => {
 if (e.target === e.currentTarget) setOpen(false);
 }}
 >
 <div className="w-full max-w-[520px] overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg animate-in fade-in zoom-in-95 duration-150">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-3.5">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
 <KeyboardIcon />
 </span>
 <div>
 <h2 className="text-sm font-semibold text-[rgb(var(--foreground))]">Keyboard Shortcuts</h2>
 <p className="text-[11px] text-[rgb(var(--muted-foreground))]">Quick navigation and actions</p>
 </div>
 </div>
 <button
 onClick={() => setOpen(false)}
 className="rounded-lg p-1.5 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10 transition-colors"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 {/* Body */}
 <div className="max-h-[420px] overflow-y-auto p-5 space-y-5">
 {SHORTCUT_GROUPS.map((group) => (
 <div key={group.title}>
 <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted-foreground))]/60">
 {group.title}
 </h3>
 <div className="space-y-1">
 {group.shortcuts.map((sc, i) => (
 <div
 key={i}
 className="flex items-center justify-between py-1.5"
 >
 <span className="text-sm text-[rgb(var(--foreground))]">{sc.description}</span>
 <div className="flex items-center gap-1">
 {sc.keys.map((key, j) =>
 key ==="then" ? (
 <span key={j} className="text-[10px] text-[rgb(var(--muted-foreground))]/50 mx-0.5">
 then
 </span>
 ) : (
 <kbd
 key={j}
 className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 px-1.5 text-[11px] font-medium text-[rgb(var(--muted-foreground))] shadow-sm"
 >
 {key}
 </kbd>
 )
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>

 {/* Footer */}
 <div className="border-t border-[rgb(var(--border))] px-5 py-2.5">
 <p className="text-center text-[10px] text-[rgb(var(--muted-foreground))]/40">
 Press <kbd className="mx-0.5 inline-flex h-4 items-center rounded border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 px-1 text-[10px] font-medium text-[rgb(var(--muted-foreground))]">?</kbd> to toggle this panel
 </p>
 </div>
 </div>
 </div>,
 document.body
 );
}
