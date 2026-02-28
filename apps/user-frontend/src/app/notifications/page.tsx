"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import showToast from '@/lib/toast';

// ─── Notification types & storage ────────────────────────────────────────────

interface Notification {
  id: string;
  type: 'breaking' | 'digest' | 'article' | 'update' | 'recommendation' | 'welcome' | 'system';
  title: string;
  message: string;
  time: string; // ISO string
  read: boolean;
  link?: string;
}

const STORAGE_KEY = 'newstrnt_notifications';
const LAST_GENERATED_KEY = 'newstrnt_notif_last_gen';

function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotifications(notifications: Notification[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Seed initial notifications for new users */
function seedNotifications(userName: string): Notification[] {
  const now = new Date();
  return [
    {
      id: generateId(),
      type: 'welcome',
      title: 'Welcome to NewsTRNT!',
      message: `Hi ${userName || 'there'}! Start exploring trending news and save articles to your reading list.`,
      time: now.toISOString(),
      read: false,
      link: '/',
    },
    {
      id: generateId(),
      type: 'recommendation',
      title: 'Set Your Interests',
      message: 'Personalize your news feed by selecting topics you care about.',
      time: new Date(now.getTime() - 60000).toISOString(),
      read: false,
      link: '/interests',
    },
    {
      id: generateId(),
      type: 'system',
      title: 'Breaking News Alerts',
      message: "You'll receive alerts when breaking news happens in your selected topics.",
      time: new Date(now.getTime() - 120000).toISOString(),
      read: false,
    },
  ];
}

// Human-readable relative time
function formatRelativeTime(isoTime: string): string {
  const date = new Date(isoTime);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}

// Icon + color by type
function getNotifMeta(type: Notification['type']) {
  switch (type) {
    case 'breaking': return { icon: ExclamationTriangleIcon, color: 'text-red-500' };
    case 'digest': return { icon: InformationCircleIcon, color: 'text-blue-500' };
    case 'article': return { icon: CheckCircleIcon, color: 'text-green-500' };
    case 'update': return { icon: InformationCircleIcon, color: 'text-blue-500' };
    case 'welcome': return { icon: CheckCircleIcon, color: 'text-vermillion' };
    case 'system': return { icon: InformationCircleIcon, color: 'text-stone' };
    default: return { icon: CheckCircleIcon, color: 'text-green-500' };
  }
}

// ─── Page Component ──────────────────────────────────────────────────────────

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Init / load notifications
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/signin?redirect=/notifications');
      return;
    }

    let notifs = loadNotifications();
    if (notifs.length === 0) {
      notifs = seedNotifications(user?.fullName || '');
      saveNotifications(notifs);
    }
    setNotifications(notifs);
  }, [authLoading, isAuthenticated, user?.fullName, router]);

  const persist = useCallback((updated: Notification[]) => {
    setNotifications(updated);
    saveNotifications(updated);
  }, []);

  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    persist(updated);
  }, [notifications, persist]);

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    persist(updated);
    showToast('All notifications marked as read', 'success');
  }, [notifications, persist]);

  const deleteNotification = useCallback((id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    persist(updated);
  }, [notifications, persist]);

  const clearAll = useCallback(() => {
    persist([]);
    showToast('All notifications cleared', 'success');
  }, [persist]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifs = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <BellIcon className="w-8 h-8 mr-3" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-vermillion text-white">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with your latest news alerts and updates
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-vermillion hover:bg-vermillion/90 text-white font-mono text-xs tracking-wider uppercase transition-colors"
              >
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground font-mono text-xs tracking-wider uppercase transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-4 mb-6 border-b border-border">
          {(['all', 'unread'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-2 px-1 text-sm font-mono uppercase tracking-wider border-b-2 transition-colors ${
                filter === tab
                  ? 'border-vermillion text-vermillion'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {displayedNotifs.map((notification) => {
            const { icon: IconComponent, color } = getNotifMeta(notification.type);
            return (
              <div
                key={notification.id}
                className={`bg-card rounded-lg p-6 shadow-sm border-l-4 ${
                  notification.read 
                    ? 'border-border opacity-75' 
                    : 'border-vermillion'
                } transition-all duration-200 hover:shadow-md cursor-pointer`}
                onClick={() => {
                  if (!notification.read) markAsRead(notification.id);
                  if (notification.link) router.push(notification.link);
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full bg-muted ${color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          notification.read 
                            ? 'text-muted-foreground' 
                            : 'text-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`mt-1 ${
                          notification.read 
                            ? 'text-muted-foreground' 
                            : 'text-foreground/80'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {formatRelativeTime(notification.time)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        {!notification.read && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-vermillion rounded-full"></div>
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                              className="text-sm text-vermillion hover:underline"
                            >
                              Mark as read
                            </button>
                          </div>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                          className="text-muted-foreground hover:text-vermillion transition-colors p-1"
                          title="Delete notification"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {displayedNotifs.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'unread'
                ? 'You have no unread notifications. Great job staying informed!'
                : 'We\'ll notify you when there are updates on your favorite topics.'}
            </p>
          </div>
        )}

        {/* Settings Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/interests')}
            className="text-vermillion hover:underline font-mono text-xs tracking-wider uppercase"
          >
            Manage Your Interests
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
