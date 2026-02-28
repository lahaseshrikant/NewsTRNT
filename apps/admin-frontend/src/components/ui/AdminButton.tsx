'use client';

import React from'react';

type ButtonVariant ='primary' |'secondary' |'ghost' |'danger' |'outline' |'success';
type ButtonSize ='xs' |'sm' |'md' |'lg';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: ButtonVariant;
 size?: ButtonSize;
 icon?: React.ReactNode;
 iconRight?: React.ReactNode;
 loading?: boolean;
 fullWidth?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
 xs:'px-2.5 py-1 text-xs gap-1',
 sm:'px-3 py-1.5 text-sm gap-1.5',
 md:'px-4 py-2 text-sm gap-2',
 lg:'px-5 py-2.5 text-base gap-2.5',
};

const variantClasses: Record<ButtonVariant, string> = {
 primary:'bg-[rgb(var(--primary))] text-white hover:bg-primary/90 shadow-sm hover:shadow',
 secondary:'bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] hover:bg-secondary/80 border border-[rgb(var(--border))]',
 ghost:'text-[rgb(var(--foreground))] hover:bg-accent/50',
 danger:'bg-red-600 text-white hover:bg-red-700 shadow-sm',
 outline:'border border-[rgb(var(--border))] bg-transparent text-[rgb(var(--foreground))] hover:bg-accent/50',
 success:'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
};

export function AdminButton({
 variant ='primary',
 size ='md',
 icon,
 iconRight,
 loading = false,
 fullWidth = false,
 className ='',
 disabled,
 children,
 ...props
}: AdminButtonProps) {
 return (
 <button
 className={`
 inline-flex items-center justify-center font-medium rounded-lg
 transition-all duration-150 ease-in-out
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
 disabled:opacity-50 disabled:cursor-not-allowed
 ${sizeClasses[size]}
 ${variantClasses[variant]}
 ${fullWidth ?'w-full' :''}
 ${className}
 `}
 disabled={disabled || loading}
 {...props}
 >
 {loading ? (
 <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
 </svg>
 ) : icon ? (
 <span className="flex-shrink-0">{icon}</span>
 ) : null}
 {children && <span>{children}</span>}
 {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
 </button>
 );
}
