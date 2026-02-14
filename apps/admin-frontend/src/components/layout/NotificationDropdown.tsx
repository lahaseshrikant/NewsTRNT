"use client";

import { useState, useEffect, useRef } from 'react';
import { API_CONFIG } from '@/config/api';
import adminAuth from '@/lib/admin-auth';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  icon?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'info', title: 'New Article Published', message: 'Tech Innovations article is now live', read: false, createdAt: new Date(Date.now() - 300000).toISOString(), link: '/content', icon: '📰' },
  { id: '2', type: 'warning', title: 'API Rate Limit Warning', message: 'NewsAPI usage at 85% of daily limit', read: false, createdAt: new Date(Date.now() - 1800000).toISOString(), link: '/external-apis', icon: '⚠️' },
  { id: '3', type: 'success', title: 'Backup Complete', message: 'Automatic backup finished successfully', read: false, createdAt: new Date(Date.now() - 7200000).toISOString(), link: '/system/backup', icon: '✅' },
  { id: '4', type: 'system', title: 'System Update Available', message: 'NewsTRNT v2.1.0 is ready to install', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), icon: '🔄' },
  { id: '5', type: 'error', title: 'Scraper Error', message: 'Reuters feed scraper failed 3 times', read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), link: '/debug', icon: '🚨' },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch(`${API_CONFIG.baseURL}/admin/notifications`, {
          headers: { ...adminAuth.getAuthHeaders() as Record<string, string> }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
        }
      } catch {
        // Backend may not have this endpoint yet — use defaults
      }
    };
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    fetch(`${API_CONFIG.baseURL}/admin/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...adminAuth.getAuthHeaders() as Record<string, string> }
    }).catch(() => {});
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetch(`${API_CONFIG.baseURL}/admin/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: { ...adminAuth.getAuthHeaders() as Record<string, string> }
    }).catch(() => {});
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const typeBorder = (type: string) => {
    const map: Record<string, string> = {
      info: 'border-l-blue-500',
      warning: 'border-l-yellow-500',
      success: 'border-l-green-500',
      error: 'border-l-red-500',
      system: 'border-l-purple-500',
    };
    return map[type] || map.info;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 transition-all duration-300 group"
        aria-label="Notifications"
      >
        <span className="text-lg group-hover:scale-110 transition-transform duration-300">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground font-medium">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <span className="text-3xl block mb-2">🔕</span>
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { markAsRead(n.id); if (n.link) window.location.href = n.link; }}
                  className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer border-l-4 transition-colors ${typeBorder(n.type)} ${
                    n.read
                      ? 'bg-card hover:bg-muted/40'
                      : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <span className="text-lg mt-0.5 shrink-0">{n.icon || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border bg-muted/30">
            <a href="/system/settings" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Notification Settings →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
