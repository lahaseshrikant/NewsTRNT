"use client";

import React, { useState, useEffect } from"react";
import Link from"next/link";
import { usePathname } from"next/navigation";
import NavIcon from"@/components/icons/NavIcon";

/* ─── Types ─────────────────────────────────────────────── */
interface Favorite {
 id: string;
 label: string;
 href: string;
 icon: string;
}

const STORAGE_KEY ="newstrnt-favorites";

const DEFAULT_FAVORITES: Favorite[] = [
 { id:"fav-dashboard", label:"Dashboard", href:"/", icon:"home" },
 { id:"fav-content", label:"Content", href:"/content", icon:"documents" },
 { id:"fav-analytics", label:"Analytics", href:"/analytics", icon:"chart" },
 { id:"fav-users", label:"Users", href:"/users", icon:"users" },
];

/* ─── Load / Save ───────────────────────────────────────── */
function loadFavorites(): Favorite[] {
 if (typeof window ==="undefined") return DEFAULT_FAVORITES;
 try {
 const stored = localStorage.getItem(STORAGE_KEY);
 return stored ? JSON.parse(stored) : DEFAULT_FAVORITES;
 } catch {
 return DEFAULT_FAVORITES;
 }
}

function saveFavorites(items: Favorite[]) {
 try {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
 } catch {}
}

/* ─── Component ─────────────────────────────────────────── */
export default function FavoritesWidget() {
 const [favorites, setFavorites] = useState<Favorite[]>(DEFAULT_FAVORITES);
 const pathname = usePathname();

 useEffect(() => {
 setFavorites(loadFavorites());
 }, []);

 const removeFavorite = (id: string) => {
 const updated = favorites.filter((f) => f.id !== id);
 setFavorites(updated);
 saveFavorites(updated);
 };

 const addFavorite = (fav: Favorite) => {
 if (favorites.some((f) => f.href === fav.href)) return;
 const updated = [...favorites, fav];
 setFavorites(updated);
 saveFavorites(updated);
 };

 return (
 <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
 <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-2.5">
 <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">Quick Access</h3>
 <span className="text-[10px] tabular-nums text-[rgb(var(--muted-foreground))]/50">{favorites.length} pinned</span>
 </div>
 <div className="p-2">
 {favorites.length === 0 ? (
 <p className="py-4 text-center text-xs text-[rgb(var(--muted-foreground))]">No pinned pages</p>
 ) : (
 <div className="grid grid-cols-2 gap-1">
 {favorites.map((fav) => {
 const active = pathname === fav.href;
 return (
 <Link
 key={fav.id}
 href={fav.href}
 className={`group flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-center transition-colors ${
 active
 ?"bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
 :"text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10"
 }`}
 >
 <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
 active
 ?"bg-[rgb(var(--primary))]/15"
 :"bg-[rgb(var(--muted))]/10 group-hover:bg-[rgb(var(--muted))]/20"
 }`}>
 <NavIcon name={fav.icon} className="h-4 w-4" />
 </span>
 <span className="text-[10px] font-medium leading-tight">{fav.label}</span>
 </Link>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}

export { loadFavorites, saveFavorites };
export type { Favorite };
