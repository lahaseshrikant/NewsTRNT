"use client";

import React, { useState, useEffect, useCallback } from"react";
import adminAuth from"@/lib/auth/admin-auth";
import { showToast } from"@/lib/utils/toast";
import { getEmailString } from"@/lib/utils/utils";
import { API_CONFIG } from"@/config/api";
import {
 ChatBubbleIcon,
 ShieldCheckIcon,
 XMarkIcon,
 EyeIcon,
 CogIcon,
} from"@/components/icons/AdminIcons";

const API_BASE_URL = API_CONFIG.baseURL;

/* ── Types ── */
interface Comment {
 id: string;
 author: string;
 email: string;
 content: string;
 articleTitle: string;
 articleId: string;
 status:"pending" |"approved" |"rejected" |"spam";
 submitDate: string;
 ipAddress: string;
 replies?: Comment[];
}

/* ── Helpers ── */
const STATUS_STYLES: Record<string, string> = {
 pending:"bg-amber-50 text-amber-700 dark:bg-amber-900/15 dark:text-amber-400",
 approved:"bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-400",
 rejected:"bg-red-50 text-red-700 dark:bg-red-900/15 dark:text-red-400",
 spam:"bg-orange-50 text-orange-700 dark:bg-orange-900/15 dark:text-orange-400",
};

const Badge = ({ status }: { status: string }) => (
 <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
 {status}
 </span>
);

/* ── Component ── */
const CommentModeration: React.FC = () => {
 const [activeTab, setActiveTab] = useState<"pending" |"approved" |"rejected" |"spam">("pending");
 const [selectedComments, setSelectedComments] = useState<string[]>([]);
 const [comments, setComments] = useState<Comment[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [actionLoading, setActionLoading] = useState<string | null>(null);

 /* ── Fetch ── */
 const fetchComments = useCallback(async () => {
 setError(null);
 try {
 if (!adminAuth.getToken()) { setError("Authentication required. Please log in."); setLoading(false); return; }

 const response = await fetch(`${API_BASE_URL}/admin/moderation/queue`, {
 headers: { ...adminAuth.getAuthHeaders(),"Content-Type":"application/json" },
 });

 if (!response.ok) {
 if (response.status === 401) setError("Session expired. Please log in again.");
 else if (response.status === 403) setError("Access denied. Admin privileges required.");
 else { const d = await response.json(); setError(d.error ||"Failed to fetch comments"); }
 setLoading(false);
 return;
 }

 const data = await response.json();
 setComments(
 (data.comments || []).map((c: any) => ({
 id: c.id,
 author: c.user?.name || c.user?.email ||"Anonymous",
 email: c.user?.email ||"",
 content: c.content,
 articleTitle: c.article?.title ||"Unknown Article",
 articleId: c.article?.id || c.articleId,
 status: c.status?.toLowerCase() ||"pending",
 submitDate: new Date(c.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }),
 ipAddress: c.ipAddress ||"Unknown",
 }))
 );
 } catch {
 setError("Failed to connect to server. Please try again.");
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => { fetchComments(); }, [fetchComments]);

 /* ── Derived ── */
 const filteredComments = comments.filter((c) => c.status === activeTab);
 const counts: Record<string, number> = {
 pending: comments.filter((c) => c.status ==="pending").length,
 approved: comments.filter((c) => c.status ==="approved").length,
 rejected: comments.filter((c) => c.status ==="rejected").length,
 spam: comments.filter((c) => c.status ==="spam").length,
 };

 /* ── Actions ── */
 const handleCommentAction = async (commentId: string, action:"approve" |"reject" |"spam") => {
 setActionLoading(commentId);
 try {
 if (!adminAuth.getToken()) { showToast("Authentication required","error"); return; }
 const endpoint = action ==="approve"
 ? `${API_BASE_URL}/admin/moderation/comments/${commentId}/approve`
 : `${API_BASE_URL}/admin/moderation/comments/${commentId}/reject`;
 const response = await fetch(endpoint, {
 method:"POST",
 headers: { ...adminAuth.getAuthHeaders(),"Content-Type":"application/json" },
 body: JSON.stringify({ reason: action ==="spam" ?"Marked as spam" : undefined }),
 });
 if (!response.ok) { const d = await response.json(); showToast(d.error || `Failed to ${action} comment`,"error"); return; }
 showToast(`Comment ${action}ed successfully!`,"success");
 setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, status: (action ==="approve" ?"approved" : action ==="spam" ?"spam" :"rejected") as any } : c)));
 } catch { showToast(`Failed to ${action} comment`,"error"); } finally { setActionLoading(null); }
 };

 const handleBulkAction = async (action:"approve" |"reject" |"spam" |"delete") => {
 if (selectedComments.length === 0) return;
 if (!confirm(`Are you sure you want to ${action} ${selectedComments.length} comment(s)?`)) return;
 if (!adminAuth.getToken()) { showToast("Authentication required","error"); return; }

 let ok = 0, fail = 0;
 for (const id of selectedComments) {
 try {
 const endpoint = action ==="approve"
 ? `${API_BASE_URL}/admin/moderation/comments/${id}/approve`
 : `${API_BASE_URL}/admin/moderation/comments/${id}/reject`;
 const r = await fetch(endpoint, { method:"POST", headers: { ...adminAuth.getAuthHeaders(),"Content-Type":"application/json" }, body: JSON.stringify({ reason: action ==="spam" ?"Marked as spam" : undefined }) });
 r.ok ? ok++ : fail++;
 } catch { fail++; }
 }
 if (ok) { showToast(`${ok} comment(s) ${action}ed successfully!`,"success"); fetchComments(); }
 if (fail) showToast(`Failed to ${action} ${fail} comment(s)`,"error");
 setSelectedComments([]);
 };

 const handleSelect = (id: string) => setSelectedComments((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
 const handleSelectAll = () => setSelectedComments((p) => (p.length === filteredComments.length ? [] : filteredComments.map((c) => c.id)));

 /* ── Tabs config ── */
 const tabDefs = [
 { id:"pending" as const, label:"Pending", count: counts.pending },
 { id:"approved" as const, label:"Approved", count: counts.approved },
 { id:"rejected" as const, label:"Rejected", count: counts.rejected },
 { id:"spam" as const, label:"Spam", count: counts.spam },
 ];

 /* ── Stats ── */
 const statCards = [
 { label:"Total", value: comments.length, sub:"All time", icon: <ChatBubbleIcon className="w-4 h-4" /> },
 { label:"Pending", value: counts.pending, sub:"Needs attention", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>, valueColor:"text-amber-600" },
 { label:"Approved", value: counts.approved, sub:"Live on site", icon: <ShieldCheckIcon className="w-4 h-4" />, valueColor:"text-emerald-600" },
 { label:"Spam", value: counts.spam, sub:"Auto-filtered", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>, valueColor:"text-red-600" },
 ];

 /* ── Render ── */
 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">Moderation</h1>
 <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Review comments, moderate content, and manage discussions</p>
 </div>
 <div className="flex gap-2">
 <button onClick={fetchComments} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3.5 text-sm font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>
 Refresh
 </button>
 <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[rgb(var(--primary))] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90">
 <CogIcon className="w-4 h-4" />
 Settings
 </button>
 </div>
 </div>

 {/* Loading */}
 {loading && (
 <div className="space-y-6">
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton-warm rounded-xl" />)}</div>
 <div className="h-96 skeleton-warm rounded-xl" />
 </div>
 )}

 {/* Error */}
 {error && !loading && (
 <div className="flex items-center justify-center py-16">
 <div className="max-w-sm rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/40 dark:bg-red-900/10">
 <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Error Loading Comments</h3>
 <p className="mt-1 text-xs text-red-600 dark:text-red-300">{error}</p>
 <button onClick={fetchComments} className="mt-3 h-8 rounded-lg bg-red-600 px-4 text-xs font-medium text-white transition-colors hover:bg-red-700">Try Again</button>
 </div>
 </div>
 )}

 {/* Main */}
 {!loading && !error && (
 <>
 {/* Stats */}
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
 {statCards.map((s) => (
 <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
 <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
 {s.icon}
 <span className="text-[11px] uppercase tracking-wider">{s.label}</span>
 </div>
 <div className={`mt-2 text-xl font-semibold tabular-nums ${s.valueColor ||"text-[rgb(var(--foreground))]"}`}>{s.value}</div>
 <div className="mt-0.5 text-[11px] text-[rgb(var(--muted-foreground))]">{s.sub}</div>
 </div>
 ))}
 </div>

 {/* Tabbed Panel */}
 <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
 <nav className="flex gap-1 overflow-x-auto border-b border-[rgb(var(--border))] px-4 pt-1">
 {tabDefs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
 activeTab === tab.id
 ?"border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
 :"border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
 }`}
 >
 {tab.label}
 {tab.count > 0 && (
 <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
 activeTab === tab.id
 ?"bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
 :"bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted-foreground))]"
 }`}>{tab.count}</span>
 )}
 </button>
 ))}
 </nav>

 <div className="p-5">
 {/* Bulk bar */}
 {selectedComments.length > 0 && (
 <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[rgb(var(--primary))]/20 bg-[rgb(var(--primary))]/5 px-4 py-3 /10">
 <span className="text-sm font-medium text-[rgb(var(--primary))]">{selectedComments.length} selected</span>
 <div className="flex gap-2">
 {activeTab ==="pending" && (
 <>
 <button onClick={() => handleBulkAction("approve")} className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700">Approve</button>
 <button onClick={() => handleBulkAction("reject")} className="h-8 rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700">Reject</button>
 <button onClick={() => handleBulkAction("spam")} className="h-8 rounded-lg bg-orange-600 px-3 text-xs font-medium text-white hover:bg-orange-700">Spam</button>
 </>
 )}
 <button onClick={() => handleBulkAction("delete")} className="h-8 rounded-lg border border-[rgb(var(--border))] px-3 text-xs font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10">Delete</button>
 </div>
 </div>
 )}

 {/* Select All */}
 {filteredComments.length > 0 && (
 <div className="mb-4 flex items-center gap-3">
 <input
 type="checkbox"
 checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
 onChange={handleSelectAll}
 className="rounded border-[rgb(var(--border))]"
 />
 <span className="text-xs text-[rgb(var(--muted-foreground))]">
 {selectedComments.length === filteredComments.length ?"Deselect all" :"Select all"} &middot; {filteredComments.length} comment{filteredComments.length !== 1 &&"s"}
 </span>
 </div>
 )}

 {/* Empty */}
 {filteredComments.length === 0 && (
 <div className="flex flex-col items-center py-16 text-center">
 <ChatBubbleIcon className="mb-3 h-10 w-10 text-[rgb(var(--muted-foreground))]" />
 <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">No {activeTab} comments</h3>
 <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
 {activeTab ==="pending" ?"Nothing waiting for moderation right now." : `No ${activeTab} comments at this time.`}
 </p>
 </div>
 )}

 {/* Comments */}
 <div className="space-y-3">
 {filteredComments.map((comment) => {
 const isSelected = selectedComments.includes(comment.id);
 const isActioning = actionLoading === comment.id;
 return (
 <div
 key={comment.id}
 className={`rounded-xl border p-4 transition-all ${
 isSelected
 ?"border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/5 ring-1 ring-[rgb(var(--primary))]"
 :"border-[rgb(var(--border))] hover:border-[rgb(var(--primary))]/30"
 }`}
 >
 <div className="flex gap-3">
 <input type="checkbox" checked={isSelected} onChange={() => handleSelect(comment.id)} className="mt-1 shrink-0 rounded border-[rgb(var(--border))]" />

 <div className="min-w-0 flex-1">
 {/* Meta row */}
 <div className="mb-2 flex flex-wrap items-center gap-2">
 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-xs font-semibold text-white">
 {comment.author[0].toUpperCase()}
 </div>
 <div className="min-w-0">
 <span className="text-sm font-medium text-[rgb(var(--foreground))]">{comment.author}</span>
 <span className="ml-1.5 text-[11px] text-[rgb(var(--muted-foreground))]">{getEmailString(comment.email)}</span>
 </div>
 <Badge status={comment.status} />
 <span className="ml-auto text-[11px] text-[rgb(var(--muted-foreground))]">{comment.submitDate}</span>
 </div>

 {/* Content */}
 <div className="mb-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] p-3 text-sm text-[rgb(var(--foreground))]">
 {comment.content}
 </div>

 {/* Footer */}
 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[rgb(var(--muted-foreground))]">
 <span>Article: <span className="font-medium text-[rgb(var(--foreground))]">{comment.articleTitle}</span></span>
 <span>IP: {comment.ipAddress}</span>
 <a href={`/articles/${comment.articleId}`} className="ml-auto text-[rgb(var(--primary))] hover:underline" target="_blank" rel="noopener noreferrer">
 View Article &rarr;
 </a>
 </div>

 {/* Actions */}
 <div className="mt-3 flex flex-wrap gap-1.5">
 {activeTab ==="pending" && (
 <>
 <button onClick={() => handleCommentAction(comment.id,"approve")} disabled={isActioning} className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50">Approve</button>
 <button onClick={() => handleCommentAction(comment.id,"reject")} disabled={isActioning} className="h-8 rounded-lg bg-red-600 px-3 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">Reject</button>
 <button onClick={() => handleCommentAction(comment.id,"spam")} disabled={isActioning} className="h-8 rounded-lg bg-orange-600 px-3 text-xs font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50">Spam</button>
 </>
 )}
 <button className="h-8 rounded-lg border border-[rgb(var(--border))] px-3 text-xs font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10">Reply</button>
 <button className="h-8 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800/40 dark:hover:bg-red-900/10">Delete</button>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Quick Settings */}
 <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5">
 <h3 className="mb-4 text-sm font-semibold text-[rgb(var(--foreground))]">Quick Moderation Settings</h3>
 <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
 {[
 { title:"Auto-Moderation", items: [
 { label:"Auto-approve from trusted users", checked: true },
 { label:"Auto-reject spam comments", checked: true },
 { label:"Require approval for all comments", checked: false },
 ]},
 { title:"Notifications", items: [
 { label:"Email on new comments", checked: true },
 { label:"Daily moderation digest", checked: false },
 { label:"Slack notifications", checked: true },
 ]},
 { title:"Spam Protection", items: [
 { label:"Enable reCAPTCHA", checked: true },
 { label:"Block suspicious IPs", checked: true },
 { label:"Require registration to comment", checked: false },
 ]},
 ].map((group) => (
 <div key={group.title}>
 <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">{group.title}</h4>
 <div className="space-y-2">
 {group.items.map((item) => (
 <label key={item.label} className="flex items-center gap-2">
 <input type="checkbox" defaultChecked={item.checked} className="rounded border-[rgb(var(--border))]" />
 <span className="text-sm text-[rgb(var(--foreground))]">{item.label}</span>
 </label>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 </>
 )}
 </div>
 );
};

export default CommentModeration;


