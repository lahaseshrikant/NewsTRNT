"use client";

import { useState, useEffect, useRef } from"react";
import { API_CONFIG } from"@/config/api";
import adminAuth from"@/lib/auth/admin-auth";

/* ─── Types ─────────────────────────────────────────────── */
export interface Notification {
 id: string;
 type:"info" |"warning" |"success" |"error" |"system";
 title: string;
 message: string;
 read: boolean;
 createdAt: string;
 link?: string;
}

/* ─── Icons per type ────────────────────────────────────── */
const TYPE_ICON: Record<string, React.ReactNode> = {
 info: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
 </svg>
 ),
 warning: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
 </svg>
 ),
 success: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ),
 error: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
 </svg>
 ),
 system: (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 ),
};

const TYPE_COLORS: Record<string, string> = {
 info:"bg-sky-100 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
 warning:"bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
 success:"bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
 error:"bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
 system:"bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
};

/* ─── Mock data ─────────────────────────────────────────── */
const MOCK_NOTIFICATIONS: Notification[] = [
 { id:"1", type:"info", title:"New Article Published", message:"Tech Innovations article is now live", read: false, createdAt: new Date(Date.now() - 300000).toISOString(), link:"/content" },
 { id:"2", type:"warning", title:"API Rate Limit Warning", message:"NewsAPI usage at 85% of daily limit", read: false, createdAt: new Date(Date.now() - 1800000).toISOString(), link:"/external-apis" },
 { id:"3", type:"success", title:"Backup Complete", message:"Automatic backup finished successfully", read: false, createdAt: new Date(Date.now() - 7200000).toISOString(), link:"/system/backup" },
 { id:"4", type:"system", title:"System Update Available", message:"NewsTRNT v2.1.0 is ready to install", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
 { id:"5", type:"error", title:"Scraper Error", message:"Reuters feed scraper failed 3 times", read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), link:"/dev-tools/debug" },
];

/* ─── Helpers ───────────────────────────────────────────── */
function timeAgo(dateStr: string) {
 const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
 if (seconds < 60) return"Just now";
 if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
 if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
 return `${Math.floor(seconds / 86400)}d ago`;
}

/* ─── Component ─────────────────────────────────────────── */
export default function NotificationDropdown() {
 const [isOpen, setIsOpen] = useState(false);
 const [activeTab, setActiveTab] = useState<"all" |"unread">("all");
 const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
 const ref = useRef<HTMLDivElement>(null);

 const unreadCount = notifications.filter((n) => !n.read).length;
 const displayed = activeTab ==="unread" ? notifications.filter((n) => !n.read) : notifications;

 useEffect(() => {
 const loadNotifications = async () => {
 try {
 const res = await fetch(`${API_CONFIG.baseURL}/admin/notifications`, {
 headers: { ...(adminAuth.getAuthHeaders() as Record<string, string>) },
 });
 if (res.ok) {
 const data = await res.json();
 if (Array.isArray(data.notifications)) setNotifications(data.notifications);
 }
 } catch {
 // Backend may not have this endpoint yet — use mock data
 }
 };
 loadNotifications();
 }, []);

 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const markAsRead = (id: string) => {
 setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
 fetch(`${API_CONFIG.baseURL}/admin/notifications/${id}/read`, {
 method:"PATCH",
 headers: { ...(adminAuth.getAuthHeaders() as Record<string, string>) },
 }).catch(() => {});
 };

 const markAllRead = () => {
 setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
 fetch(`${API_CONFIG.baseURL}/admin/notifications/mark-all-read`, {
 method:"PATCH",
 headers: { ...(adminAuth.getAuthHeaders() as Record<string, string>) },
 }).catch(() => {});
 };

 const clearAll = () => setNotifications([]);

 return (
 <div className="relative" ref={ref}>
 {/* Bell trigger — kept minimal since parent layout renders the bell icon */}
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="relative p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10 transition-colors"
 aria-label="Notifications"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-[18px] w-[18px]">
 <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
 </svg>
 {unreadCount > 0 && (
 <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[rgb(var(--primary))] px-1 text-[10px] font-bold text-white">
 {unreadCount > 9 ?"9+" : unreadCount}
 </span>
 )}
 </button>

 {/* Dropdown */}
 {isOpen && (
 <div className="absolute right-0 top-full mt-2 w-[380px] overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3">
 <div className="flex items-center gap-2">
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">Notifications</h3>
 {unreadCount > 0 && (
 <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-[rgb(var(--primary))]/10 px-1.5 text-[10px] font-bold text-[rgb(var(--primary))]">
 {unreadCount}
 </span>
 )}
 </div>
 <div className="flex items-center gap-2">
 {unreadCount > 0 && (
 <button onClick={markAllRead} className="text-[11px] font-medium text-[rgb(var(--primary))] hover:underline">
 Mark all read
 </button>
 )}
 {notifications.length > 0 && (
 <button onClick={clearAll} className="text-[11px] font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
 Clear
 </button>
 )}
 </div>
 </div>

 {/* Tabs */}
 <div className="flex border-b border-[rgb(var(--border))]">
 {(["all","unread"] as const).map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`flex-1 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${
 activeTab === tab
 ?"border-b-2 border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
 :"text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
 }`}
 >
 {tab ==="all" ?"All" : `Unread (${unreadCount})`}
 </button>
 ))}
 </div>

 {/* List */}
 <div className="max-h-[340px] overflow-y-auto">
 {displayed.length === 0 ? (
 <div className="py-12 text-center">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto h-8 w-8 text-[rgb(var(--muted-foreground))]/30">
 <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
 </svg>
 <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
 {activeTab ==="unread" ?"All caught up" :"No notifications"}
 </p>
 </div>
 ) : (
 <div className="divide-y divide-[rgb(var(--border))]">
 {displayed.map((n) => (
 <button
 key={n.id}
 onClick={() => {
 markAsRead(n.id);
 if (n.link) window.location.href = n.link;
 }}
 className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
 n.read
 ?"hover:bg-[rgb(var(--muted))]/5"
 :"bg-[rgb(var(--primary))]/[0.03] hover:bg-[rgb(var(--primary))]/[0.06]"
 }`}
 >
 <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${TYPE_COLORS[n.type] ?? TYPE_COLORS.info}`}>
 {TYPE_ICON[n.type] ?? TYPE_ICON.info}
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between gap-2">
 <p className={`truncate text-sm ${n.read ?"text-[rgb(var(--muted-foreground))]" :"font-medium text-[rgb(var(--foreground))]"}`}>
 {n.title}
 </p>
 <span className="shrink-0 text-[10px] tabular-nums text-[rgb(var(--muted-foreground))]/60">
 {timeAgo(n.createdAt)}
 </span>
 </div>
 <p className="mt-0.5 truncate text-xs text-[rgb(var(--muted-foreground))]">{n.message}</p>
 </div>
 {!n.read && (
 <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[rgb(var(--primary))]" />
 )}
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="border-t border-[rgb(var(--border))] px-4 py-2.5 text-center">
 <a
 href="/system/settings"
 className="text-[11px] font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
 >
 Notification Preferences
 </a>
 </div>
 </div>
 )}
 </div>
 );
}
