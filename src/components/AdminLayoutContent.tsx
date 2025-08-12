"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';

interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavigationItem[];
  requiredPermission?: string;
  requireSuperAdmin?: boolean;
}

export default function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [adminInfo, setAdminInfo] = useState<any>(null);

  // Initialize dark mode from localStorage and get admin info
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('admin-dark-mode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
    
    // Get current admin info
    const currentAdmin = UnifiedAdminAuth.getCurrentAdmin();
    setAdminInfo(currentAdmin);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('admin-dark-mode', darkMode.toString());
  }, [darkMode]);

  const handleLogout = () => {
    UnifiedAdminAuth.logout();
    router.push('/admin/login');
  };

  // Function to check if admin has permission for a navigation item
  const hasPermission = (item: NavigationItem): boolean => {
    if (!adminInfo) return false;
    
    // If requireSuperAdmin is true, check if user is super admin
    if (item.requireSuperAdmin) {
      return adminInfo.role === 'SUPER_ADMIN';
    }
    
    // If requiredPermission is specified, check if user has that permission
    if (item.requiredPermission) {
      return UnifiedAdminAuth.hasPermission(item.requiredPermission);
    }
    
    // If no specific permission required, allow access
    return true;
  };

  // Filter navigation items based on permissions
  const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter(item => hasPermission(item))
      .map(item => ({
        ...item,
        children: item.children ? filterNavigationItems(item.children) : undefined
      }))
      .filter(item => !item.children || item.children.length > 0); // Remove items with no accessible children
  };

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: '🏠',
      requiredPermission: 'content.read'
    },
    {
      label: 'Site Configuration',
      href: '/admin/config',
      icon: '⚙️',
      badge: 'Essential',
      requiredPermission: 'content.write'
    },
    {
      label: 'Content Management',
      href: '/admin/content',
      icon: '📝',
      requiredPermission: 'content.read',
      children: [
        { label: 'All Articles', href: '/admin/content', icon: '📄', requiredPermission: 'content.read' },
        { label: 'Web Stories', href: '/admin/content/web-stories', icon: '📱', requiredPermission: 'content.read' },
        { label: 'Categories', href: '/admin/content/categories', icon: '🏷️', requiredPermission: 'content.read' },
        { label: 'Tags', href: '/admin/content/tags', icon: '🔖', requiredPermission: 'content.read' },
        { label: 'Drafts', href: '/admin/content/drafts', icon: '✏️', requiredPermission: 'content.write' }
      ]
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: '👥',
      requiredPermission: 'users.read',
      children: [
        { label: 'All Users', href: '/admin/users', icon: '👤', requiredPermission: 'users.read' },
        { label: 'Subscribers', href: '/admin/users/subscribers', icon: '📧', requiredPermission: 'users.read' },
        { label: 'Permissions', href: '/admin/users/permissions', icon: '🔐', requireSuperAdmin: true }
      ]
    },
    {
      label: 'Analytics & Reports',
      href: '/admin/analytics',
      icon: '📊',
      requiredPermission: 'analytics.read',
      children: [
        { label: 'Overview', href: '/admin/analytics', icon: '📈', requiredPermission: 'analytics.read' },
        { label: 'Traffic', href: '/admin/analytics/traffic', icon: '🌐', requiredPermission: 'analytics.read' },
        { label: 'Content Performance', href: '/admin/analytics/content', icon: '📊', requiredPermission: 'analytics.read' },
        { label: 'User Engagement', href: '/admin/analytics/engagement', icon: '🎯', requiredPermission: 'analytics.read' }
      ]
    },
    {
      label: 'Advertisement',
      href: '/admin/advertising',
      icon: '💼',
      requiredPermission: 'content.read',
      children: [
        { label: 'Campaigns', href: '/admin/advertising', icon: '📢', requiredPermission: 'content.read' },
        { label: 'Ad Requests', href: '/admin/advertising/requests', icon: '📋', requiredPermission: 'content.read' },
        { label: 'Performance', href: '/admin/advertising/performance', icon: '📈', requiredPermission: 'analytics.read' }
      ]
    },
    {
      label: 'Newsletter',
      href: '/admin/newsletter',
      icon: '📧',
      requiredPermission: 'content.read',
      children: [
        { label: 'Campaigns', href: '/admin/newsletter', icon: '📨', requiredPermission: 'content.read' },
        { label: 'Templates', href: '/admin/newsletter/templates', icon: '📄', requiredPermission: 'content.write' },
        { label: 'Subscribers', href: '/admin/newsletter/subscribers', icon: '👥', requiredPermission: 'users.read' }
      ]
    },
    {
      label: 'Media Library',
      href: '/admin/media',
      icon: '🎬',
      requiredPermission: 'content.read'
    },
    {
      label: 'Logo Management',
      href: '/admin/logo-manager',
      icon: '🎨',
      requireSuperAdmin: true,
      children: [
        { label: 'Logo Manager', href: '/admin/logo-manager', icon: '🎛️', requireSuperAdmin: true },
        { label: 'Logo Gallery', href: '/admin/logo-gallery', icon: '🖼️', requireSuperAdmin: true },
        { label: 'Logo History', href: '/admin/logo-history', icon: '📜', requireSuperAdmin: true }
      ]
    },
    {
      label: 'Moderation',
      href: '/admin/moderation',
      icon: '💬',
      requiredPermission: 'content.write',
      children: [
        { label: 'Comments', href: '/admin/moderation', icon: '💬', requiredPermission: 'content.write' },
        { label: 'Reports', href: '/admin/moderation/reports', icon: '⚠️', requiredPermission: 'content.write' },
        { label: 'Spam Filter', href: '/admin/moderation/spam', icon: '🚫', requiredPermission: 'content.write' }
      ]
    },
    {
      label: 'System Settings',
      href: '/admin/system',
      icon: '🔒',
      requireSuperAdmin: true,
      children: [
        { label: 'General', href: '/admin/system', icon: '⚙️', requireSuperAdmin: true },
        { label: 'Security', href: '/admin/system/security', icon: '🔐', requireSuperAdmin: true },
        { label: 'Integrations', href: '/admin/system/integrations', icon: '🔗', requireSuperAdmin: true },
        { label: 'Backup', href: '/admin/system/backup', icon: '💾', requireSuperAdmin: true }
      ]
    }
  ];

  // Apply permission filtering to navigation items
  const filteredNavigationItems = filterNavigationItems(navigationItems);

  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    const isActive = isActiveLink(item.href);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.href} className={isChild ? 'ml-6' : ''}>
        <Link
          href={item.href}
          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
          } ${isChild ? 'ml-2' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex items-center space-x-3 relative z-10">
            <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'drop-shadow-sm' : ''}`}>
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
            {hasChildren && !isChild && (
              <span className={`text-xs transition-transform duration-300 ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`}>
                ▶
              </span>
            )}
          </div>
        </Link>
        
        {hasChildren && !isChild && isActive && (
          <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
            {item.children!.map(child => renderNavigationItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-foreground transition-all duration-500 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gradient-to-r from-black/60 via-black/40 to-transparent backdrop-blur-sm lg:hidden transition-all duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-r-0 backdrop-blur-sm shadow-xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:relative lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-[73px]">
              <Link href="/admin" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NewsTRNT</h1>
                  <p className="text-xs text-muted-foreground font-medium">Admin Dashboard</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-all duration-200"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3">Main Menu</p>
              </div>
              {filteredNavigationItems.map(item => renderNavigationItem(item))}
            </nav>

            {/* User Profile */}
            <div className="border-t border-border/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-[85px]">
              <div className="flex items-center space-x-3 px-6 py-4 h-full rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 cursor-pointer group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <span className="text-white text-sm font-semibold">A</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors">Admin User</p>
                  <p className="text-xs text-muted-foreground truncate">admin@NewsTRNT.com</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <span className="text-sm">🚪</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-h-screen flex flex-col lg:ml-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          {/* Admin Top bar */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-border/30 shadow-sm z-30 flex-shrink-0 h-[73px]">
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
                  {pathname !== '/admin' && (
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
                  onClick={() => setDarkMode(!darkMode)}
                  className="relative p-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 group shadow-sm hover:shadow-md"
                  title="Toggle dark mode"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                    {darkMode ? '☀️' : '🌙'}
                  </span>
                </button>

                {/* Quick actions */}
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    href="/admin/content/new"
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
                <button className="relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 transition-all duration-300 group">
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">🔔</span>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg animate-bounce">
                    3
                  </span>
                </button>

                {/* Admin Profile Info */}
                {adminInfo && (
                  <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {adminInfo.role === 'SUPER_ADMIN' ? '👑' : '👤'}
                      </span>
                      <div className="text-sm">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {adminInfo.username}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                          {adminInfo.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
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
          <main className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
}
