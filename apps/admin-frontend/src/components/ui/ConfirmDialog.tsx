"use client";

import React, { useEffect, useRef } from"react";
import { createPortal } from"react-dom";

/* ─── Types ─────────────────────────────────────────────── */
type DialogVariant ="danger" |"warning" |"info";

interface Props {
 open: boolean;
 onClose: () => void;
 onConfirm: () => void;
 title: string;
 description?: string;
 confirmLabel?: string;
 cancelLabel?: string;
 variant?: DialogVariant;
 loading?: boolean;
}

/* ─── Variant config ────────────────────────────────────── */
const VARIANTS: Record<DialogVariant, { icon: React.ReactNode; iconBg: string; button: string }> = {
 danger: {
 icon: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
 </svg>
 ),
 iconBg:"bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
 button:"bg-red-600 text-white hover:bg-red-700",
 },
 warning: {
 icon: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
 </svg>
 ),
 iconBg:"bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
 button:"bg-amber-600 text-white hover:bg-amber-700",
 },
 info: {
 icon: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
 </svg>
 ),
 iconBg:"bg-sky-100 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
 button:"bg-[rgb(var(--primary))] text-white hover:opacity-90",
 },
};

/* ─── Component ─────────────────────────────────────────── */
export default function ConfirmDialog({
 open,
 onClose,
 onConfirm,
 title,
 description,
 confirmLabel ="Confirm",
 cancelLabel ="Cancel",
 variant ="danger",
 loading = false,
}: Props) {
 const confirmRef = useRef<HTMLButtonElement>(null);
 const v = VARIANTS[variant];

 // Focus confirm button when opened
 useEffect(() => {
 if (open) {
 requestAnimationFrame(() => confirmRef.current?.focus());
 }
 }, [open]);

 // Close on Escape
 useEffect(() => {
 if (!open) return;
 const handleKey = (e: KeyboardEvent) => {
 if (e.key ==="Escape") onClose();
 };
 window.addEventListener("keydown", handleKey);
 return () => window.removeEventListener("keydown", handleKey);
 }, [open, onClose]);

 if (!open) return null;

 return createPortal(
 <div
 className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
 onClick={(e) => {
 if (e.target === e.currentTarget) onClose();
 }}
 >
 <div className="w-full max-w-[400px] overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg animate-in fade-in zoom-in-95 duration-150">
 <div className="p-5">
 <div className="flex items-start gap-3.5">
 <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${v.iconBg}`}>
 {v.icon}
 </span>
 <div className="min-w-0 flex-1">
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">{title}</h3>
 {description && (
 <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--muted-foreground))]">{description}</p>
 )}
 </div>
 </div>
 </div>
 <div className="flex items-center justify-end gap-2 border-t border-[rgb(var(--border))] bg-[rgb(var(--muted))]/5 px-5 py-3">
 <button
 onClick={onClose}
 disabled={loading}
 className="rounded-lg border border-[rgb(var(--border))] px-3.5 py-1.5 text-sm font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10 transition-colors disabled:opacity-50"
 >
 {cancelLabel}
 </button>
 <button
 ref={confirmRef}
 onClick={onConfirm}
 disabled={loading}
 className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${v.button}`}
 >
 {loading && (
 <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
 </svg>
 )}
 {confirmLabel}
 </button>
 </div>
 </div>
 </div>,
 document.body
 );
}
