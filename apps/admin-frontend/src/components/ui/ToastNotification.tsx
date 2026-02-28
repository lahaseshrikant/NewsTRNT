"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from"react";
import { createPortal } from"react-dom";

/* ─── Types ─────────────────────────────────────────────── */
type ToastVariant ="success" |"error" |"warning" |"info";

interface Toast {
 id: string;
 variant: ToastVariant;
 title: string;
 description?: string;
 duration?: number;
 dismissible?: boolean;
 action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
 toast: (options: Omit<Toast,"id">) => string;
 success: (title: string, description?: string) => string;
 error: (title: string, description?: string) => string;
 warning: (title: string, description?: string) => string;
 info: (title: string, description?: string) => string;
 dismiss: (id: string) => void;
 dismissAll: () => void;
}

/* ─── Context ───────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
 const ctx = useContext(ToastContext);
 if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
 return ctx;
}

/* ─── Variant styles ────────────────────────────────────── */
const VARIANT_STYLES: Record<ToastVariant, { icon: React.ReactNode; accent: string; bg: string }> = {
 success: {
 icon: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
 </svg>
 ),
 accent:"text-emerald-600 dark:text-emerald-400",
 bg:"bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40",
 },
 error: {
 icon: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
 </svg>
 ),
 accent:"text-red-600 dark:text-red-400",
 bg:"bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40",
 },
 warning: {
 icon: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
 </svg>
 ),
 accent:"text-amber-600 dark:text-amber-400",
 bg:"bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40",
 },
 info: {
 icon: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
 </svg>
 ),
 accent:"text-sky-600 dark:text-sky-400",
 bg:"bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/40",
 },
};

/* ─── Individual Toast ──────────────────────────────────── */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
 const [exiting, setExiting] = useState(false);
 const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
 const style = VARIANT_STYLES[toast.variant];

 const handleDismiss = useCallback(() => {
 setExiting(true);
 setTimeout(() => onDismiss(toast.id), 200);
 }, [toast.id, onDismiss]);

 useEffect(() => {
 const dur = toast.duration ?? 5000;
 if (dur > 0) {
 timerRef.current = setTimeout(handleDismiss, dur);
 return () => clearTimeout(timerRef.current);
 }
 }, [toast.duration, handleDismiss]);

 return (
 <div
 className={`pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-xl border p-3.5 shadow-lg transition-all duration-200 ${style.bg} ${
 exiting ?"translate-x-full opacity-0" :"translate-x-0 opacity-100"
 }`}
 role="alert"
 onMouseEnter={() => clearTimeout(timerRef.current)}
 onMouseLeave={() => {
 const dur = toast.duration ?? 5000;
 if (dur > 0) timerRef.current = setTimeout(handleDismiss, 2000);
 }}
 >
 <span className={`mt-0.5 shrink-0 ${style.accent}`}>{style.icon}</span>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium text-[rgb(var(--foreground))]">{toast.title}</p>
 {toast.description && (
 <p className="mt-0.5 text-xs text-[rgb(var(--muted-foreground))]">{toast.description}</p>
 )}
 {toast.action && (
 <button
 onClick={() => {
 toast.action!.onClick();
 handleDismiss();
 }}
 className="mt-2 text-xs font-semibold text-[rgb(var(--primary))] hover:underline"
 >
 {toast.action.label}
 </button>
 )}
 </div>
 {(toast.dismissible ?? true) && (
 <button
 onClick={handleDismiss}
 className="shrink-0 rounded p-0.5 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>
 );
}

/* ─── Provider + Container ──────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
 const [toasts, setToasts] = useState<Toast[]>([]);
 const [mounted, setMounted] = useState(false);

 useEffect(() => setMounted(true), []);

 const idCounter = useRef(0);

 const addToast = useCallback((options: Omit<Toast,"id">): string => {
 const id = `toast-${++idCounter.current}-${Date.now()}`;
 setToasts((prev) => [...prev.slice(-4), { ...options, id }]); // max 5 visible
 return id;
 }, []);

 const dismiss = useCallback((id: string) => {
 setToasts((prev) => prev.filter((t) => t.id !== id));
 }, []);

 const dismissAll = useCallback(() => setToasts([]), []);

 const contextValue = React.useMemo<ToastContextValue>(
 () => ({
 toast: addToast,
 success: (title, description) => addToast({ variant:"success", title, description }),
 error: (title, description) => addToast({ variant:"error", title, description }),
 warning: (title, description) => addToast({ variant:"warning", title, description }),
 info: (title, description) => addToast({ variant:"info", title, description }),
 dismiss,
 dismissAll,
 }),
 [addToast, dismiss, dismissAll]
 );

 return (
 <ToastContext.Provider value={contextValue}>
 {children}
 {mounted &&
 createPortal(
 <div className="pointer-events-none fixed bottom-0 right-0 z-[9997] flex flex-col items-end gap-2 p-4 sm:p-6">
 {toasts.map((t) => (
 <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
 ))}
 </div>,
 document.body
 )}
 </ToastContext.Provider>
 );
}
