"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import RBACAuth from '@/lib/auth/rbac-auth';
import { ADMIN_NAVIGATION, NavItem, UserRole, RBACUtils } from '@/config/rbac';
import { getEmailString } from '@/lib/utils/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useRBAC } from '@/components/rbac';
import NavIcon from '@/components/icons/NavIcon';
import {
  SunIcon, MoonIcon, Bars3Icon, XMarkIcon, ChevronRightIcon,
  ChevronDownIcon, PlusIcon, ArrowRightOnRectangleIcon,
  BellIcon, GlobeIcon,
} from '@/components/icons/AdminIcons';

/* ─── Sidebar Width ──────────────────────────────────────── */
const SIDEBAR_W = 'w-64';
const SIDEBAR_W_MINI = 'w-[68px]';

/* ─── Component ──────────────────────────────────────────── */
export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [manualCollapsed, setManualCollapsed] = useState<Set<string>>(new Set());
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const router   = useRouter();
  const { session, isSuperAdmin, isAdmin, getRoleInfo } = useRBAC();

  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    if (session?.role) {
      setNavItems(RBACUtils.filterNavigation(session.role as UserRole, ADMIN_NAVIGATION));
    }
  }, [session]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = useCallback((href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
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

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const handleLogout = async () => {
    await RBACAuth.logout();
    router.push('/login');
  };

  const breadcrumb = pathname === '/'
    ? null
    : pathname.split('/').filter(Boolean).map(s => s.replace(/-/g, ' '));

  /* ── Render Nav Item ──────────────────────────────────── */
  const renderItem = (item: NavItem, depth = 0) => {
    const active       = isActive(item.href);
    const parentActive = isParentActive(item);
    const hasKids      = (item.children?.length ?? 0) > 0;
    const isOpen       = expandedSections.has(item.id) || (parentActive && !manualCollapsed.has(item.id));
    const isChild      = depth > 0;

    if (hasKids) {
      return (
        <div key={item.id}>
          <button
            onClick={() => collapsed ? null : toggleSection(item.id, isOpen)}
            className={`
              group w-full flex items-center justify-between rounded-lg text-[13px] font-medium
              transition-colors duration-150
              ${isChild ? 'pl-9 pr-3 py-1.5' : 'px-3 py-2'}
              ${parentActive
                ? 'text-primary bg-primary/[0.06] dark:bg-primary/[0.08]'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }
            `}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              {!isChild && <NavIcon name={item.icon} className="w-[18px] h-[18px] flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </span>
            {!collapsed && (
              <span className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
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
          ${isChild ? 'pl-9 pr-3 py-1.5' : 'px-3 py-2'}
          ${active
            ? 'text-primary bg-primary/[0.08] dark:bg-primary/[0.10]'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
          }
        `}
      >
        {!isChild && <NavIcon name={item.icon} className={`w-[18px] h-[18px] flex-shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />}
        {isChild && (
          <span className={`w-1 h-1 rounded-full flex-shrink-0 ml-0.5 ${active ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
        )}
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  /* ═══════════════ RENDER ═══════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
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
          bg-card border-r border-border
          transition-all duration-200 ease-in-out
          lg:relative lg:z-auto
          ${collapsed ? SIDEBAR_W_MINI : SIDEBAR_W}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-foreground leading-none tracking-tight">NewsTRNT</h1>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Admin</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => { if (window.innerWidth >= 1024) setCollapsed(c => !c); else setMobileOpen(false); }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors hidden lg:block"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRightIcon className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors lg:hidden"
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
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1.5">
                    {item.label}
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

        <div className="border-t border-border p-3 flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                isSuperAdmin ? 'bg-violet-600' : isAdmin ? 'bg-primary' : 'bg-sky-600'
              }`}>
                {(session?.displayName || session?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate leading-tight">
                  {session?.displayName || session?.username || 'User'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight">
                  {getEmailString(session?.email)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Column ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card flex-shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
              {breadcrumb?.map((segment, i) => (
                <React.Fragment key={i}>
                  <ChevronRightIcon className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                  <span className={`capitalize truncate ${i === breadcrumb.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {segment}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/content/new"
              className="hidden sm:inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Article</span>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              title="View site"
            >
              <GlobeIcon className="w-[18px] h-[18px]" />
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
            </button>

            <button
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              title="Notifications"
            >
              <BellIcon className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>

            {session && (
              <Link
                href="/profile"
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-border hover:ring-primary/40 transition-all ${
                  isSuperAdmin ? 'bg-violet-600' : isAdmin ? 'bg-primary' : 'bg-sky-600'
                }`}
                title={session.displayName || session.username}
              >
                {(session?.displayName || session?.username || 'U').charAt(0).toUpperCase()}
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
    </div>
  );
}

