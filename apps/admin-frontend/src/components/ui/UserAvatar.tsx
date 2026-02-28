"use client";

import React from"react";

/* ─── Types ─────────────────────────────────────────────── */
type Status ="online" |"away" |"busy" |"offline";

interface AvatarProps {
 name: string;
 imageUrl?: string;
 status?: Status;
 size?:"sm" |"md" |"lg";
 color?: string;
 className?: string;
}

interface AvatarGroupProps {
 users: AvatarProps[];
 max?: number;
 className?: string;
}

/* ─── Status colors ─────────────────────────────────────── */
const STATUS_COLORS: Record<Status, string> = {
 online:"bg-emerald-500",
 away:"bg-amber-500",
 busy:"bg-red-500",
 offline:"bg-[rgb(var(--muted))]",
};

const SIZE_MAP = {
 sm: { avatar:"h-7 w-7 text-[10px]", dot:"h-2 w-2 -bottom-0 -right-0 ring-1", ring:"ring-[1.5px]" },
 md: { avatar:"h-9 w-9 text-xs", dot:"h-2.5 w-2.5 -bottom-0.5 -right-0.5 ring-[1.5px]", ring:"ring-2" },
 lg: { avatar:"h-11 w-11 text-sm", dot:"h-3 w-3 -bottom-0.5 -right-0.5 ring-2", ring:"ring-2" },
};

const PRESET_COLORS = ["bg-violet-600","bg-sky-600","bg-emerald-600","bg-amber-600","bg-fuchsia-600","bg-rose-600","bg-teal-600","bg-indigo-600",
];

function getColor(name: string, colorProp?: string): string {
 if (colorProp) return colorProp;
 const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
 return PRESET_COLORS[hash % PRESET_COLORS.length];
}

/* ─── Single Avatar ─────────────────────────────────────── */
export function UserAvatar({ name, imageUrl, status, size ="md", color, className ="" }: AvatarProps) {
 const s = SIZE_MAP[size];
 const initial = (name ||"U").charAt(0).toUpperCase();
 const bg = getColor(name, color);

 return (
 <div className={`relative inline-flex shrink-0 ${className}`}>
 {imageUrl ? (
 <img
 src={imageUrl}
 alt={name}
 className={`${s.avatar} rounded-full object-cover`}
 title={name}
 />
 ) : (
 <span
 className={`${s.avatar} ${bg} inline-flex items-center justify-center rounded-full font-bold text-white`}
 title={name}
 >
 {initial}
 </span>
 )}
 {status && (
 <span
 className={`absolute ${s.dot} rounded-full ${STATUS_COLORS[status]} ring-[rgb(var(--card))]`}
 title={status}
 />
 )}
 </div>
 );
}

/* ─── Avatar Group ──────────────────────────────────────── */
export function UserAvatarGroup({ users, max = 4, className ="" }: AvatarGroupProps) {
 const visible = users.slice(0, max);
 const overflow = users.length - max;

 return (
 <div className={`flex items-center -space-x-2 ${className}`}>
 {visible.map((user, i) => (
 <div key={i} className="relative ring-2 ring-[rgb(var(--card))] rounded-full">
 <UserAvatar {...user} size="sm" />
 </div>
 ))}
 {overflow > 0 && (
 <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--muted))]/20 text-[10px] font-bold text-[rgb(var(--muted-foreground))] ring-2 ring-[rgb(var(--card))]">
 +{overflow}
 </div>
 )}
 </div>
 );
}

/* ─── Status Dot standalone ─────────────────────────────── */
export function StatusDot({ status, label }: { status: Status; label?: string }) {
 return (
 <span className="inline-flex items-center gap-1.5">
 <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]} ${status ==="online" ?"animate-pulse" :""}`} />
 {label && <span className="text-[11px] text-[rgb(var(--muted-foreground))] capitalize">{label ?? status}</span>}
 </span>
 );
}

export type { Status, AvatarProps };
