"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import RBACAuth from '@/lib/rbac-auth';
import { ADMIN_NAVIGATION, NavItem, ROLES, UserRole, RBACUtils } from '@/config/rbac';
import { getEmailString } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { RoleBadge, CurrentUserRole, useRBAC } from '@/components/rbac';
import AdminFooter from './AdminFooter';
import NotificationDropdown from './NotificationDropdown';

export default function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { session, role, roleLevel, isSuperAdmin, isAdmin, getRoleInfo } = useRBAC();

  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);

  // Get filtered navigation based on user's role
  useEffect(() => {
    if (session?.role) {
      const filtered = RBACUtils.filterNavigation(session.role as UserRole, ADMIN_NAVIGATION);
      setFilteredNavItems(filtered);
    }
  }, [session]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await RBACAuth.logout();
    router.push('/login');
  };

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderNavigationItem = (item: NavItem, isChild = false, isGrandchild = false) => {
    const isActive = isActiveLink(item.href);
    const hasChildren = item.children && item.children.length > 0;
    
    const toggleExpand = (href: string) => {
      const currentlyExpanded = expandedItems.has(href) || (isActive && !collapsedItems.has(href));
      if (currentlyExpanded) {
        // Collapse explicitly (even if the active route would auto-open it)
        setExpandedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(href);
          return newSet;
        });
        setCollapsedItems(prev => {
          const newSet = new Set(prev);
          newSet.add(href);
          return newSet;
        });
      } else {
        // Expand and clear any collapsed override
        setExpandedItems(prev => {
          const newSet = new Set(prev);
          newSet.add(href);
          return newSet;
        });
        setCollapsedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(href);
          return newSet;
        });
      }
    };
    
    const isExpanded = expandedItems.has(item.href) || (isActive && !collapsedItems.has(item.href));

    return (
      <div key={item.href} className={isGrandchild ? 'ml-4' : isChild ? 'ml-6' : ''}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(item.href)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden text-left ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-muted-foreground hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
            } ${isChild ? 'ml-2' : ''} ${isGrandchild ? 'ml-2 text-xs' : ''}`}
          >
            <div className="flex items-center space-x-3 relative z-10">
              <span className={`${isGrandchild ? 'text-sm' : 'text-lg'} transition-transform duration-300 group-hover:scale-110 ${isActive ? 'drop-shadow-sm' : ''}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2 relative z-10">
              {item.badge && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
              <span className={`text-xs transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-1'}`}>
                ▶
              </span>
            </div>
          </button>
        ) : (
          <Link
            href={item.href}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-muted-foreground hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
            } ${isChild ? 'ml-2' : ''} ${isGrandchild ? 'ml-2 text-xs' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center space-x-3 relative z-10">
              <span className={`${isGrandchild ? 'text-sm' : 'text-lg'} transition-transform duration-300 group-hover:scale-110 ${isActive ? 'drop-shadow-sm' : ''}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2 relative z-10">
              {item.badge && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        )}
        
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
            {item.children!.map(child => renderNavigationItem(child, true, isChild))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen admin-container">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gradient-to-r from-black/60 via-black/40 to-transparent backdrop-blur-sm lg:hidden transition-all duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-card text-foreground border-r border-border shadow-xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:relative lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card h-[73px]">
              <Link href="/admin" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NewsTRNT</h1>
                  <p className="text-xs text-muted-foreground font-medium">Admin Dashboard</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-all duration-200"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 bg-card">
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">Main Menu</p>
              </div>
              {filteredNavItems.map(item => renderNavigationItem(item))}
            </nav>

            {/* User Profile with Role Badge */}
            <div className="border-t border-border bg-card">
              <div className="flex flex-col px-4 py-4">
                {/* Role Badge */}
                <div className="mb-3 px-2">
                  {session?.role && (
                    <RoleBadge role={session.role as UserRole} size="sm" />
                  )}
                </div>
                
                {/* User Info */}
                <div className="flex items-center space-x-3 px-2 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 cursor-pointer group">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 ${
                      isSuperAdmin ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                      isAdmin ? 'bg-gradient-to-br from-red-500 to-orange-600' :
                      'bg-gradient-to-br from-blue-500 to-cyan-600'
                    }`}>
                      <span className="text-white text-lg">
                        {getRoleInfo()?.icon || '👤'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                      {session?.displayName || session?.username || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{getEmailString(session?.email)}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Logout"
                  >
                    <span className="text-sm">🚪</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
  <div className="flex-1 min-h-screen flex flex-col lg:ml-0 bg-background">
          {/* Admin Top bar */}
          <header className="bg-card border-b border-border shadow-sm z-30 flex-shrink-0 h-[73px] transition-colors">
            <div className="flex items-center justify-between px-6 py-4 h-full">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">☰</span>
                </button>
                
                {/* Breadcrumb */}
                <div className="hidden md:flex items-center space-x-3 text-sm">
                  <Link 
                    href="/admin" 
                    className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors duration-300 group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300">🏠</span>
                    <span className="font-medium">Admin</span>
                  </Link>
                  {pathname !== '/' && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">→</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold capitalize">
                          {pathname.split('/').pop()?.replace('-', ' ')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleTheme}
                  className="relative p-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 group shadow-sm hover:shadow-md"
                  title="Toggle dark mode"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                    {resolvedTheme === 'dark' ? '☀️' : '🌙'}
                  </span>
                </button>

                {/* Quick actions */}
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    href="/content/new"
                    className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>✨</span>
                      <span>New Article</span>
                    </span>
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 group"
                  >
                    <span className="flex items-center space-x-2">
                      <span>🌐</span>
                      <span>View Site</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </Link>
                </div>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Admin Profile Info with Role Badge */}
                {session && (
                  <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getRoleInfo()?.icon || '👤'}
                      </span>
                      <div className="text-sm">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {session.username || session.displayName}
                        </div>
                        <div className={`text-xs ${getRoleInfo()?.color || 'text-slate-500'}`}>
                          {getRoleInfo()?.displayName || session.role}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 bg-background overflow-y-auto transition-colors">
            <div className="relative min-h-full">
              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-xl"></div>
                <div className="absolute top-32 right-20 w-48 h-48 bg-purple-500/5 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-emerald-500/5 rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}

