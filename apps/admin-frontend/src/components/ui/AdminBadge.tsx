'use client';

import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-secondary text-secondary-foreground',
  primary:  'bg-primary/10 text-primary',
  success:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  warning:  'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  danger:   'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  info:     'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400',
  outline:  'border border-border text-muted-foreground bg-transparent',
};

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-muted-foreground',
  primary:  'bg-primary',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-red-500',
  info:     'bg-sky-500',
  outline:  'bg-muted-foreground',
};

export function AdminBadge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  icon,
}: AdminBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

/* ─── Status Badge Shortcut ─────────────────────────────── */

type StatusType = 'online' | 'offline' | 'pending' | 'error' | 'maintenance';

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant }> = {
  online:      { label: 'Online',      variant: 'success' },
  offline:     { label: 'Offline',     variant: 'default' },
  pending:     { label: 'Pending',     variant: 'warning' },
  error:       { label: 'Error',       variant: 'danger' },
  maintenance: { label: 'Maintenance', variant: 'info' },
};

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  const config = statusConfig[status];
  return (
    <AdminBadge variant={config.variant} dot size="sm" className={className}>
      {config.label}
    </AdminBadge>
  );
}
