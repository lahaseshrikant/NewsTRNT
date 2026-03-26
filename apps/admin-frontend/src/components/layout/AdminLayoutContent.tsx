"use client";

import React, { useState, useEffect, useCallback } from'react';
import Link from'next/link';
import { usePathname, useRouter } from'next/navigation';
import RBACAuth from'@/lib/auth/rbac-auth';
import { ADMIN_NAVIGATION, NavItem, UserRole, RBACUtils } from'@/config/rbac';
import { getEmailString } from'@/lib/utils/utils';
import { useTheme } from'@/contexts/ThemeContext';
import { useRBAC } from'@/components/rbac';
import NavIcon from'@/components/icons/NavIcon';
import CommandPalette from'@/components/ui/CommandPalette';
import KeyboardShortcuts from'@/components/ui/KeyboardShortcuts';
import NotificationDropdown from'@/components/layout/NotificationDropdown';
import {
 SunIcon, MoonIcon, Bars3Icon, XMarkIcon, ChevronRightIcon,
 ChevronDownIcon, PlusIcon, ArrowRightOnRectangleIcon,
 BellIcon, GlobeIcon,
} from'@/components/icons/AdminIcons';

/* ─── Sidebar Width ──────────────────────────────────────── */
const SIDEBAR_W ='w-64';
const SIDEBAR_W_MINI ='w-[68px]';

/* ─── Component ──────────────────────────────────────────── */
export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
 const [mobileOpen, setMobileOpen] = useState(false);
 const [collapsed, setCollapsed] = useState(false);
 const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
 const [manualCollapsed, setManualCollapsed] = useState<Set<string>>(new Set());
 const { resolvedTheme, setTheme } = useTheme();
 const pathname = usePathname();
 const router = useRouter();
 const { session, isSuperAdmin, isAdmin, getRoleInfo } = useRBAC();

 const [navItems, setNavItems] = useState<NavItem[]>([]);

 useEffect(() => {
 if (session?.role) {
 setNavItems(RBACUtils.filterNavigation(session.role as UserRole, ADMIN_NAVIGATION));
 }
 }, [session]);

 useEffect(() => { setMobileOpen(false); }, [pathname]);

 const isActive = useCallback((href: string) => {
 if (href ==='/') return pathname ==='/';
 return pathname === href || pathname.startsWith(href +'/');
 }, [pathname]);

 const isParentActive = useCallback((item: NavItem): boolean => {
 if (isActive(item.href)) return true;
 return item.children?.some(c => isActive(c.href)) ?? false;
 }, [isActive]);

 const toggleSection = (id: string, currentlyOpen: boolean) => {
 if (currentlyOpen) {
 setExpandedSections(prev => { const s = new Set(prev); s.delete(id); return s; });
 setManualCollapsed(prev => { const s = new Set(prev); s.add(id); return s; });
 } else {
 setExpandedSections(prev => { const s = new Set(prev); s.add(id); return s; });
 setManualCollapsed(prev => { const s = new Set(prev); s.delete(id); return s; });
 }
 };

 const toggleTheme = () => setTheme(resolvedTheme ==='dark' ?'light' :'dark');

 /* ── G-key navigation shortcuts ────────────────────────── */
 useEffect(() => {
 let gPressed = false;
 let gTimer: ReturnType<typeof setTimeout> | undefined;

 const handleKey = (e: KeyboardEvent) => {
 const target = e.target as HTMLElement;
 const isInput = target.tagName ==='INPUT' || target.tagName ==='TEXTAREA' || target.isContentEditable;
 if (isInput) return;

 if (e.key ==='n' && !e.metaKey && !e.ctrlKey) {
 e.preventDefault();
 router.push('/content/new');
 return;
 }

 if (e.key ==='g' && !e.metaKey && !e.ctrlKey) {
 gPressed = true;
 clearTimeout(gTimer);
 gTimer = setTimeout(() => { gPressed = false; }, 800);
 return;
 }

 if (gPressed) {
 gPressed = false;
 clearTimeout(gTimer);
 const map: Record<string, string> = {
 h:'/', a:'/analytics', c:'/content',
 u:'/users', s:'/system/settings',
 };
 if (map[e.key]) {
 e.preventDefault();
 router.push(map[e.key]);
 }
 }
 };

 window.addEventListener('keydown', handleKey);
 return () => {
 window.removeEventListener('keydown', handleKey);
 clearTimeout(gTimer);
 };
 }, [router]);

 const handleLogout = async () => {
 await RBACAuth.logout();
 router.push('/login');
 };

 const breadcrumb = pathname ==='/'
 ? null
 : pathname.split('/').filter(Boolean).map(s => s.replace(/-/g,''));

 /* ── Render Nav Item ──────────────────────────────────── */
 const renderItem = (item: NavItem, depth = 0) => {
 const active = isActive(item.href);
 const parentActive = isParentActive(item);
 const hasKids = (item.children?.length ?? 0) > 0;
 const isOpen = expandedSections.has(item.id) || (parentActive && !manualCollapsed.has(item.id));
 const isChild = depth > 0;

 if (hasKids) {
 return (
 <div key={item.id}>
 <button
 onClick={() => collapsed ? null : toggleSection(item.id, isOpen)}
 className={`
 group w-full flex items-center justify-between rounded-lg text-[13px] font-medium
 transition-colors duration-150
 ${isChild ?'pl-9 pr-3 py-1.5' :'px-3 py-2'}
 ${parentActive
 ?'text-[rgb(var(--primary))] bg-primary/[0.06] dark:bg-primary/[0.08]'
 :'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-accent/40'
 }
 `}
 >
 <span className="flex items-center gap-2.5 min-w-0">
 {!isChild && <NavIcon name={item.icon} className="w-[18px] h-[18px] flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />}
 {!collapsed && <span className="truncate">{item.label}</span>}
 </span>
 {!collapsed && (
 <span className={`flex-shrink-0 transition-transform duration-200 ${isOpen ?'rotate-0' :'-rotate-90'}`}>
 <ChevronDownIcon className="w-3.5 h-3.5 opacity-50" />
 </span>
 )}
 </button>
 {isOpen && !collapsed && (
 <div className="mt-0.5 space-y-0.5">
 {item.children!.map(child => renderItem(child, depth + 1))}
 </div>
 )}
 </div>
 );
 }

 return (
 <Link
 key={item.id}
 href={item.href}
 className={`
 group flex items-center gap-2.5 rounded-lg text-[13px] font-medium
 transition-colors duration-150
 ${isChild ?'pl-9 pr-3 py-1.5' :'px-3 py-2'}
 ${active
 ?'text-[rgb(var(--primary))] bg-primary/[0.08] dark:bg-primary/[0.10]'
 :'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-accent/40'
 }
 `}
 >
 {!isChild && <NavIcon name={item.icon} className={`w-[18px] h-[18px] flex-shrink-0 transition-opacity ${active ?'opacity-100' :'opacity-60 group-hover:opacity-100'}`} />}
 {isChild && (
 <span className={`w-1 h-1 rounded-full flex-shrink-0 ml-0.5 ${active ?'bg-[rgb(var(--primary))]' :'bg-muted-foreground/40'}`} />
 )}
 {!collapsed && <span className="truncate">{item.label}</span>}
 {!collapsed && item.badge && (
 <span className="ml-auto text-[10px] font-semibold bg-primary/10 text-[rgb(var(--primary))] px-1.5 py-0.5 rounded-full">
 {item.badge}
 </span>
 )}
 </Link>
 );
 };

 /* ═══════════════ RENDER ═══════════════════════════════ */
 return (
 <div className="flex h-screen overflow-hidden bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
 {mobileOpen && (
 <div
 className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
 onClick={() => setMobileOpen(false)}
 />
 )}

 {/* ── Sidebar ──────────────────────────────────────── */}
 <aside
 className={`
 fixed inset-y-0 left-0 z-50 flex flex-col
 bg-[rgb(var(--card))] border-r border-[rgb(var(--border))]
 transition-all duration-200 ease-in-out
 lg:relative lg:z-auto
 ${collapsed ? SIDEBAR_W_MINI : SIDEBAR_W}
 ${mobileOpen ?'translate-x-0' :'-translate-x-full lg:translate-x-0'}
 `}
 >
 <div className="flex items-center justify-between h-14 px-4 border-b border-[rgb(var(--border))] flex-shrink-0">
 <Link href="/" className="flex items-center gap-2.5 min-w-0">
 <div className="w-8 h-8 rounded-lg bg-[rgb(var(--primary))] flex items-center justify-center flex-shrink-0">
 <span className="text-white font-bold text-sm">N</span>
 </div>
 {!collapsed && (
 <div className="min-w-0">
 <h1 className="text-sm font-bold text-[rgb(var(--foreground))] leading-none tracking-tight">NewsTRNT</h1>
 <p className="text-[10px] text-[rgb(var(--muted-foreground))] leading-tight mt-0.5">Admin</p>
 </div>
 )}
 </Link>
 <button
 onClick={() => { if (window.innerWidth >= 1024) setCollapsed(c => !c); else setMobileOpen(false); }}
 className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-accent/40 transition-colors hidden lg:block"
 title={collapsed ?'Expand sidebar' :'Collapse sidebar'}
 >
 <ChevronRightIcon className={`w-4 h-4 transition-transform duration-200 ${collapsed ?'' :'rotate-180'}`} />
 </button>
 <button
 onClick={() => setMobileOpen(false)}
 className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-accent/40 transition-colors lg:hidden"
 >
 <XMarkIcon className="w-4 h-4" />
 </button>
 </div>

 <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-5 scrollbar-hide">
 {navItems.map((item) => {
 const isSection = (item.children?.length ?? 0) > 0;
 return (
 <div key={item.id}>
 {isSection && !collapsed && (
 <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted-foreground))]/60 px-3 mb-1.5">
 <span className="inline-flex items-center gap-2">
 <NavIcon name={item.icon} className="w-[14px] h-[14px] opacity-70" />
 {item.label}
 </span>
 </p>
 )}
 {isSection ? (
 <div className="space-y-0.5">
 {item.children!.map(child => renderItem(child, 1))}
 </div>
 ) : (
 renderItem(item)
 )}
 </div>
 );
 })}
 </nav>

 <div className="border-t border-[rgb(var(--border))] p-3 flex-shrink-0">
 {!collapsed ? (
 <div className="flex items-center gap-2.5">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
 isSuperAdmin ?'bg-violet-600' : isAdmin ?'bg-[rgb(var(--primary))]' :'bg-sky-600'
 }`}>
 {(session?.fullName || session?.username ||'U').charAt(0).toUpperCase()}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate leading-tight">
 {session?.fullName || session?.username ||'User'}
 </p>
 <p className="text-[11px] text-[rgb(var(--muted-foreground))] truncate leading-tight">
 {getEmailString(session?.email)}
 </p>
 </div>
 <button
 onClick={handleLogout}
 className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
 title="Sign out"
 >
 <ArrowRightOnRectangleIcon className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <button
 onClick={handleLogout}
 className="w-full flex justify-center p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
 title="Sign out"
 >
 <ArrowRightOnRectangleIcon className="w-4 h-4" />
 </button>
 )}
 </div>
 </aside>

 {/* ── Main Column ──────────────────────────────────── */}
 <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
 <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))] flex-shrink-0 gap-4">
 <div className="flex items-center gap-3 min-w-0">
 <button
 onClick={() => setMobileOpen(true)}
 className="lg:hidden p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-accent/40 transition-colors"
 >
 <Bars3Icon className="w-5 h-5" />
 </button>
 <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
 <Link href="/" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors">
 Admin
 </Link>
 {breadcrumb?.map((segment, i) => (
 <React.Fragment key={i}>
 <ChevronRightIcon className="w-3 h-3 text-[rgb(var(--muted-foreground))]/50 flex-shrink-0" />
 <span className={`capitalize truncate ${i === breadcrumb.length - 1 ?'text-[rgb(var(--foreground))] font-medium' :'text-[rgb(var(--muted-foreground))]'}`}>
 {segment}
 </span>
 </React.Fragment>
 ))}
 </nav>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key:'k', ctrlKey: true }))}
 className="hidden md:inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/5 px-3 py-1.5 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--muted))]/40 transition-colors"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <span>Search...</span>
 <kbd className="ml-1 inline-flex h-4 items-center rounded border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 px-1 text-[10px] font-medium">Ctrl K</kbd>
 </button>

 <Link
 href="/content/new"
 className="hidden sm:inline-flex items-center gap-1.5 bg-[rgb(var(--primary))] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
 >
 <PlusIcon className="w-4 h-4" />
 <span>New Article</span>
 </Link>

 <a
 href="/"
 target="_blank"
 rel="noopener noreferrer"
 className="p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-accent/40 transition-colors"
 title="View site"
 >
 <GlobeIcon className="w-[18px] h-[18px]" />
 </a>

 <button
 onClick={toggleTheme}
 className="p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-accent/40 transition-colors"
 title={`Switch to ${resolvedTheme ==='dark' ?'light' :'dark'} mode`}
 >
 {resolvedTheme ==='dark' ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
 </button>

 <NotificationDropdown />

 {session && (
 <Link
 href="/profile"
 className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-border hover:ring-primary/40 transition-all ${
 isSuperAdmin ?'bg-violet-600' : isAdmin ?'bg-[rgb(var(--primary))]' :'bg-sky-600'
 }`}
 title={session.fullName || session.username}
 >
 {(session?.fullName || session?.username ||'U').charAt(0).toUpperCase()}
 </Link>
 )}
 </div>
 </header>

 <main className="flex-1 overflow-y-auto">
 <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
 {children}
 </div>
 </main>
 </div>

 <CommandPalette />
 <KeyboardShortcuts />
 </div>
 );
}

