'use client';

import React from'react';

interface AdminCardProps {
 children: React.ReactNode;
 className?: string;
 padding?:'none' |'sm' |'md' |'lg';
 hover?: boolean;
 onClick?: () => void;
}

const paddingMap = {
 none:'',
 sm:'p-4',
 md:'p-6',
 lg:'p-8',
};

export function AdminCard({ children, className ='', padding ='md', hover = false, onClick }: AdminCardProps) {
 return (
 <div
 onClick={onClick}
 className={`
 bg-[rgb(var(--card))] text-[rgb(var(--foreground))] rounded-xl border border-[rgb(var(--border))]
 ${paddingMap[padding]}
 ${hover ?'hover:shadow-editorial-lg hover:border-[rgb(var(--border))]/80 transition-all duration-200 cursor-pointer' :''}
 ${onClick ?'cursor-pointer' :''}
 ${className}
 `}
 >
 {children}
 </div>
 );
}

interface AdminCardHeaderProps {
 title: string;
 description?: string;
 action?: React.ReactNode;
 icon?: React.ReactNode;
 className?: string;
}

export function AdminCardHeader({ title, description, action, icon, className ='' }: AdminCardHeaderProps) {
 return (
 <div className={`flex items-start justify-between gap-4 ${className}`}>
 <div className="flex items-start gap-3 min-w-0">
 {icon && (
 <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-[rgb(var(--primary))] flex items-center justify-center">
 {icon}
 </div>
 )}
 <div className="min-w-0">
 <h3 className="font-semibold text-[rgb(var(--foreground))] text-base leading-tight">{title}</h3>
 {description && <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">{description}</p>}
 </div>
 </div>
 {action && <div className="flex-shrink-0">{action}</div>}
 </div>
 );
}

/* ─── Stat Card ────────────────────────────────────────── */

interface StatCardProps {
 label: string;
 value: string | number;
 change?: { value: number; positive?: boolean };
 icon?: React.ReactNode;
 className?: string;
 trend?:'up' |'down' |'neutral';
}

export function StatCard({ label, value, change, icon, className ='', trend }: StatCardProps) {
 const isPositive = trend ==='up' || change?.positive;
 const isNegative = trend ==='down' || (change && !change.positive);

 return (
 <AdminCard className={`relative overflow-hidden ${className}`}>
 <div className="flex items-start justify-between">
 <div className="space-y-2">
 <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">{label}</p>
 <p className="text-2xl font-bold text-[rgb(var(--foreground))] tracking-tight">{value}</p>
 {change && (
 <div className={`flex items-center gap-1 text-xs font-medium ${
 isPositive ?'text-emerald-600 dark:text-emerald-400' :
 isNegative ?'text-red-500 dark:text-red-400' :'text-[rgb(var(--muted-foreground))]'
 }`}>
 <span>{isPositive ?'↑' : isNegative ?'↓' :'→'}</span>
 <span>{Math.abs(change.value)}%</span>
 <span className="text-[rgb(var(--muted-foreground))] font-normal">vs last period</span>
 </div>
 )}
 </div>
 {icon && (
 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
 isPositive ?'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' :
 isNegative ?'bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400' :'bg-primary/10 text-[rgb(var(--primary))]'
 }`}>
 {icon}
 </div>
 )}
 </div>
 </AdminCard>
 );
}
