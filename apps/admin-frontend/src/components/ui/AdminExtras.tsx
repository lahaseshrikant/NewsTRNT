'use client';

import React, { useState } from'react';

/* ─── Tabs ──────────────────────────────────────────────── */

interface Tab {
 id: string;
 label: string;
 icon?: React.ReactNode;
 badge?: string | number;
 disabled?: boolean;
}

interface AdminTabsProps {
 tabs: Tab[];
 activeTab: string;
 onChange: (tabId: string) => void;
 variant?:'underline' |'pills';
 size?:'sm' |'md';
 className?: string;
}

export function AdminTabs({ tabs, activeTab, onChange, variant ='underline', size ='md', className ='' }: AdminTabsProps) {
 const isUnderline = variant ==='underline';
 const textSize = size ==='sm' ?'text-xs' :'text-sm';

 return (
 <div className={`${isUnderline ?'border-b border-[rgb(var(--border))]' :''} ${className}`}>
 <nav className={`flex ${isUnderline ?'gap-6 -mb-px' :'gap-1 bg-[rgb(var(--muted))]/5 p-1 rounded-lg'}`}>
 {tabs.map(tab => {
 const active = tab.id === activeTab;
 return (
 <button
 key={tab.id}
 onClick={() => !tab.disabled && onChange(tab.id)}
 disabled={tab.disabled}
 className={`
 inline-flex items-center gap-1.5 font-medium whitespace-nowrap transition-all duration-150
 ${textSize}
 ${tab.disabled ?'opacity-40 cursor-not-allowed' :'cursor-pointer'}
 ${isUnderline ? `
 pb-3 pt-1 border-b-2
 ${active
 ?'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
 :'border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--border))]'
 }
 ` : `
 px-3 py-1.5 rounded-md
 ${active
 ?'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm'
 :'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
 }
 `}
 `}
 >
 {tab.icon}
 <span>{tab.label}</span>
 {tab.badge !== undefined && (
 <span className={`
 px-1.5 py-0.5 text-[10px] font-semibold rounded-full
 ${active ?'bg-primary/10 text-[rgb(var(--primary))]' :'bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted-foreground))]'}
 `}>
 {tab.badge}
 </span>
 )}
 </button>
 );
 })}
 </nav>
 </div>
 );
}

/* ─── Modal / Dialog ────────────────────────────────────── */

interface AdminModalProps {
 open: boolean;
 onClose: () => void;
 title?: string;
 description?: string;
 children: React.ReactNode;
 maxWidth?:'sm' |'md' |'lg' |'xl';
 footer?: React.ReactNode;
}

const widthMap = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-xl' };

export function AdminModal({ open, onClose, title, description, children, maxWidth ='md', footer }: AdminModalProps) {
 if (!open) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 onClick={onClose}
 />
 {/* Panel */}
 <div className={`relative bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] shadow-editorial-lg ${widthMap[maxWidth]} w-full mx-4 animate-fade-in`}>
 {title && (
 <div className="px-6 pt-6 pb-0">
 <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">{title}</h2>
 {description && <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">{description}</p>}
 </div>
 )}
 <div className="px-6 py-5">{children}</div>
 {footer && (
 <div className="px-6 py-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--muted))]/5 rounded-b-xl flex items-center justify-end gap-3">
 {footer}
 </div>
 )}
 </div>
 </div>
 );
}

/* ─── Empty State ───────────────────────────────────────── */

interface EmptyStateProps {
 icon?: React.ReactNode;
 title: string;
 description?: string;
 action?: React.ReactNode;
 className?: string;
}

export function EmptyState({ icon, title, description, action, className ='' }: EmptyStateProps) {
 return (
 <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
 {icon && <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--muted))]/5 text-[rgb(var(--muted-foreground))] flex items-center justify-center mb-4">{icon}</div>}
 <h3 className="font-semibold text-[rgb(var(--foreground))] text-base">{title}</h3>
 {description && <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1 max-w-sm">{description}</p>}
 {action && <div className="mt-4">{action}</div>}
 </div>
 );
}

/* ─── Tooltip ───────────────────────────────────────────── */

interface TooltipProps {
 content: string;
 children: React.ReactNode;
 side?:'top' |'bottom' |'left' |'right';
}

export function Tooltip({ content, children, side ='top' }: TooltipProps) {
 const [show, setShow] = useState(false);
 const positionClasses = {
 top:'bottom-full left-1/2 -translate-x-1/2 mb-2',
 bottom:'top-full left-1/2 -translate-x-1/2 mt-2',
 left:'right-full top-1/2 -translate-y-1/2 mr-2',
 right:'left-full top-1/2 -translate-y-1/2 ml-2',
 };

 return (
 <div
 className="relative inline-flex"
 onMouseEnter={() => setShow(true)}
 onMouseLeave={() => setShow(false)}
 >
 {children}
 {show && (
 <div className={`absolute z-50 ${positionClasses[side]} pointer-events-none`}>
 <div className="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
 {content}
 </div>
 </div>
 )}
 </div>
 );
}

/* ─── Progress Bar ──────────────────────────────────────── */

interface ProgressBarProps {
 value: number;
 max?: number;
 label?: string;
 showValue?: boolean;
 size?:'sm' |'md';
 color?:'primary' |'success' |'warning' |'danger';
 className?: string;
}

const progressColors = {
 primary:'bg-[rgb(var(--primary))]',
 success:'bg-emerald-500',
 warning:'bg-amber-500',
 danger:'bg-red-500',
};

export function ProgressBar({ value, max = 100, label, showValue = true, size ='sm', color ='primary', className ='' }: ProgressBarProps) {
 const pct = Math.min(100, Math.max(0, (value / max) * 100));
 const barHeight = size ==='sm' ?'h-1.5' :'h-2.5';

 return (
 <div className={`space-y-1.5 ${className}`}>
 {(label || showValue) && (
 <div className="flex items-center justify-between text-xs">
 {label && <span className="text-[rgb(var(--muted-foreground))] font-medium">{label}</span>}
 {showValue && <span className="text-[rgb(var(--foreground))] font-semibold">{Math.round(pct)}%</span>}
 </div>
 )}
 <div className={`w-full ${barHeight} bg-[rgb(var(--muted))]/10 rounded-full overflow-hidden`}>
 <div
 className={`${barHeight} ${progressColors[color]} rounded-full transition-all duration-500 ease-out`}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 );
}
