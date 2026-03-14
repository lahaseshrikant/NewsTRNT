"use client";

import React, { useState, useEffect } from'react';
import Link from'next/link';
import { articleAPI } from'@/lib/api';
import { useCategories } from'@/hooks/useCategories';
import { showToast } from'@/lib/utils/toast';
import {
 PlusIcon, DocumentTextIcon, EyeIcon, ClockIcon,
 ChartBarIcon, SparklesIcon,
} from'@/components/icons/AdminIcons';
import { FollowIcon } from '@/components/icons/EditorialIcons';

/* ─── Types ─── */
interface Article {
 id: string;
 title: string;
 slug?: string;
 category: { name: string; slug: string } | null;
 author: { fullName: string } | null;
 status:'draft' |'published' |'scheduled';
 publishedAt: string | null;
 updatedAt: string;
 viewCount?: number;
 isFeatured?: boolean;
 excerpt?: string;
 readTime?: number;
 tags?: Array<{ name: string; slug: string }>;
}

/* ─── Helpers ─── */
const fmt = (n: number) => {
 if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
 if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
 return n.toLocaleString();
};

const fmtDate = (d: string | null) => {
 if (!d) return'—';
 return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
};

const statusStyle: Record<string, string> = {
 published:'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
 draft:'bg-amber-500/10 text-amber-700 dark:text-amber-400',
 scheduled:'bg-[rgb(var(--primary))]/50/10 text-[rgb(var(--primary))]',
};

/* ─── Page ─── */
export default function ArticlesPage() {
 const [articles, setArticles] = useState<Article[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [selectedStatus, setSelectedStatus] = useState('all');
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
 const [sortBy, setSortBy] = useState<'date' |'title' |'views' |'status'>('date');
 const [sortOrder, setSortOrder] = useState<'asc' |'desc'>('desc');
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage] = useState(20);

 const { categories, loading: categoriesLoading } = useCategories({ includeInactive: true });

 useEffect(() => { fetchArticles(); }, [selectedCategory, selectedStatus, searchTerm, sortBy, sortOrder, currentPage]);

 const fetchArticles = async () => {
 try {
 setLoading(true);
 setError('');
 const params = {
 page: currentPage,
 limit: itemsPerPage,
 ...(selectedCategory !=='all' && { category: selectedCategory }),
 ...(selectedStatus !=='all' && { status: selectedStatus }),
 ...(searchTerm && { search: searchTerm }),
 sortBy,
 sortOrder,
 };
 const response = await articleAPI.getArticles(params);
 if (response.success) {
 const raw = (response.articles || []) as any[];
 setArticles(raw.map(a => ({
 id: a.id,
 title: a.title ||'(Untitled)',
 slug: a.slug,
 category: a.category || (a.categoryName ? { name: a.categoryName, slug: a.categorySlug || a.categoryName.toLowerCase().replace(/\s+/g,'-') } : null),
 author: a.author || (a.authorName ? { fullName: a.authorName } : null),
 status: a.status ||'draft',
 publishedAt: a.publishedAt || null,
 updatedAt: a.updatedAt || a.createdAt || new Date().toISOString(),
 viewCount: typeof a.viewCount ==='number' ? a.viewCount : (a.views ?? 0),
 isFeatured: !!a.isFeatured,
 excerpt: a.excerpt || a.summary ||'',
 readTime: a.readTime || Math.ceil((a.content?.length || 0) / 1000) || 5,
 tags: a.tags || [],
 })));
 } else {
 setError('Failed to fetch articles');
 }
 } catch (err) {
 setError(`Failed to fetch articles: ${String(err)}`);
 } finally {
 setLoading(false);
 }
 };

 const handleSelectAll = () => {
 if (selectedArticles.length === filteredArticles.length) {
 setSelectedArticles([]);
 } else {
 setSelectedArticles(filteredArticles.map(a => a.id));
 }
 };

 const handleSelectArticle = (id: string) => {
 setSelectedArticles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
 };

 const handleBulkAction = async (action:'publish' |'draft' |'delete' |'feature') => {
 if (selectedArticles.length === 0) return;
 if (!confirm(`Are you sure you want to ${action} ${selectedArticles.length} article(s)?`)) return;
 try {
 showToast(`Successfully ${action}ed ${selectedArticles.length} article(s)`,'success');
 setSelectedArticles([]);
 fetchArticles();
 } catch {
 showToast(`Failed to ${action} articles`,'error');
 }
 };

 const handleDeleteArticle = async (articleId: string) => {
 if (!confirm('Move this article to trash?')) return;
 try {
 const response = await articleAPI.deleteArticle(articleId);
 if (response.success) {
 setArticles(prev => prev.filter(a => a.id !== articleId));
 showToast('Article moved to trash','success');
 } else {
 throw new Error('Failed');
 }
 } catch (err) {
 showToast(`Delete failed: ${err instanceof Error ? err.message :'Please try again.'}`,'error');
 }
 };

 /* ── Filtered / Sorted / Paged ── */
 const filteredArticles = articles.filter(a => {
 const catMatch = selectedCategory ==='all' || a.category?.name === selectedCategory;
 const statMatch = selectedStatus ==='all' || a.status === selectedStatus;
 const searchMatch = !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || (a.author?.fullName ||'').toLowerCase().includes(searchTerm.toLowerCase());
 return catMatch && statMatch && searchMatch;
 });

 const sortedArticles = [...filteredArticles].sort((a, b) => {
 let av: any, bv: any;
 switch (sortBy) {
 case'date': av = new Date(a.updatedAt).getTime(); bv = new Date(b.updatedAt).getTime(); break;
 case'title': av = a.title.toLowerCase(); bv = b.title.toLowerCase(); break;
 case'views': av = a.viewCount || 0; bv = b.viewCount || 0; break;
 case'status': av = a.status; bv = b.status; break;
 default: return 0;
 }
 return sortOrder ==='asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
 });

 const paginatedArticles = sortedArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);

 const stats = {
 total: articles.length,
 published: articles.filter(a => a.status ==='published').length,
 drafts: articles.filter(a => a.status ==='draft').length,
 scheduled: articles.filter(a => a.status ==='scheduled').length,
 totalViews: articles.reduce((s, a) => s + (a.viewCount || 0), 0),
 featured: articles.filter(a => a.isFeatured).length,
 };

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] tracking-tight">Articles</h1>
 <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Manage your news articles and blog posts.</p>
 </div>
 <div className="flex gap-2">
 <Link href="/content/new" className="inline-flex items-center gap-1.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
 <PlusIcon className="w-4 h-4" />
 New Article
 </Link>
 </div>
 </div>

 {/* Stats Row */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
 {[
 { label:'Total', value: stats.total, icon: DocumentTextIcon },
 { label:'Published', value: stats.published, icon: ChartBarIcon },
 { label:'Drafts', value: stats.drafts, icon: ClockIcon },
 { label:'Scheduled', value: stats.scheduled, icon: ClockIcon },
 { label:'Views', value: fmt(stats.totalViews), icon: EyeIcon },
 { label:'Featured', value: stats.featured, icon: SparklesIcon },
 ].map((s) => (
 <div key={s.label} className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg px-4 py-3">
 <div className="flex items-center gap-2 mb-1">
 <s.icon className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
 <span className="text-[11px] font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wider">{s.label}</span>
 </div>
 <p className="text-lg font-bold text-[rgb(var(--foreground))] tabular-nums">{s.value}</p>
 </div>
 ))}
 </div>

 {/* Filters */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <div className="flex flex-col lg:flex-row gap-3">
 <input
 type="text"
 placeholder="Search articles..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="flex-1 min-w-0 px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))/0.3] focus:border-[rgb(var(--primary))]"
 />
 <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} disabled={categoriesLoading}
 className="px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
 <option value="all">All Categories</option>
 {categories.map(c => <option key={c.id} value={c.name}>{c.name}{!c.isActive ?' (Inactive)' :''}</option>)}
 </select>
 <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
 className="px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
 <option value="all">All Statuses</option>
 <option value="draft">Draft</option>
 <option value="published">Published</option>
 <option value="scheduled">Scheduled</option>
 </select>
 <select value={`${sortBy}-${sortOrder}`}
 onChange={(e) => { const [sb, so] = e.target.value.split('-'); setSortBy(sb as any); setSortOrder(so as any); }}
 className="px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
 <option value="date-desc">Latest First</option>
 <option value="date-asc">Oldest First</option>
 <option value="title-asc">Title A–Z</option>
 <option value="views-desc">Most Views</option>
 </select>
 </div>

 {/* Bulk actions */}
 {selectedArticles.length > 0 && (
 <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgb(var(--border))]">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">{selectedArticles.length} selected</span>
 {(['publish','draft','feature','delete'] as const).map(action => (
 <button key={action} onClick={() => handleBulkAction(action)}
 className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
 action ==='delete'
 ?'text-red-600 bg-red-500/10 hover:bg-red-500/20'
 :'text-[rgb(var(--foreground))] bg-[rgb(var(--muted))] hover:bg-[rgb(var(--muted))]/80'
 }`}>
 {action.charAt(0).toUpperCase() + action.slice(1)}
 </button>
 ))}
 </div>
 )}

 <div className="flex items-center justify-between mt-3 text-xs text-[rgb(var(--muted-foreground))]">
 <span>{sortedArticles.length} articles{searchTerm ? ` matching"${searchTerm}"` :''}</span>
 <button onClick={fetchArticles} className="text-[rgb(var(--primary))] hover:underline font-medium">Refresh</button>
 </div>
 </div>

 {/* Table */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl overflow-hidden">
 {loading ? (
 <div className="p-10 text-center">
 <div className="skeleton-warm h-6 w-48 mx-auto mb-3" />
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Loading articles...</p>
 </div>
 ) : error ? (
 <div className="p-10 text-center">
 <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
 <button onClick={fetchArticles} className="text-sm font-medium text-[rgb(var(--primary))] hover:underline">Retry</button>
 </div>
 ) : paginatedArticles.length === 0 ? (
 <div className="p-10 text-center">
 <DocumentTextIcon className="w-10 h-10 text-[rgb(var(--muted-foreground))]/40 mx-auto mb-3" />
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">
 {searchTerm || selectedCategory !=='all' || selectedStatus !=='all' ?'No articles found' :'No articles yet'}
 </h3>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4">
 {searchTerm ?'Try adjusting your search or filters.' :'Create your first article to get started.'}
 </p>
 <Link href="/content/new" className="inline-flex items-center gap-1.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
 <PlusIcon className="w-4 h-4" /> Create Article
 </Link>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/50">
 <th className="pl-4 pr-2 py-3 text-left w-10">
 <input type="checkbox"
 checked={selectedArticles.length === paginatedArticles.length && paginatedArticles.length > 0}
 onChange={handleSelectAll}
 className="rounded border-[rgb(var(--border))]" />
 </th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Article</th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Status</th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider hidden md:table-cell">Category</th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider hidden lg:table-cell">Author</th>
 <th className="px-3 py-3 text-right text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider hidden sm:table-cell">Views</th>
 <th className="px-3 py-3 text-left text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider hidden lg:table-cell">Date</th>
 <th className="px-4 py-3 text-right text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[rgb(var(--border))]">
 {paginatedArticles.map((article) => (
 <tr key={article.id} className="hover:bg-[rgb(var(--muted))]/30 transition-colors">
 <td className="pl-4 pr-2 py-3">
 <input type="checkbox"
 checked={selectedArticles.includes(article.id)}
 onChange={() => handleSelectArticle(article.id)}
 className="rounded border-[rgb(var(--border))]" />
 </td>
 <td className="px-3 py-3">
 <Link href={`/content/new?id=${article.id}`} className="group">
 <div className="flex items-center gap-2">
 {article.isFeatured && <SparklesIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
 <span className="font-medium text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors line-clamp-1">{article.title}</span>
 </div>
 {article.excerpt && (
 <p className="text-[11px] text-[rgb(var(--muted-foreground))] line-clamp-1 mt-0.5 max-w-md">{article.excerpt}</p>
 )}
 </Link>
 </td>
 <td className="px-3 py-3">
 <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusStyle[article.status] || statusStyle.draft}`}>
 {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
 </span>
 </td>
 <td className="px-3 py-3 hidden md:table-cell">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">{article.category?.name ||'Uncategorized'}</span>
 </td>
 <td className="px-3 py-3 hidden lg:table-cell">
 <span className="text-xs text-[rgb(var(--foreground))]">{article.author?.fullName ||'Unknown'}</span>
 </td>
 <td className="px-3 py-3 text-right hidden sm:table-cell">
 <span className="text-xs font-medium text-[rgb(var(--foreground))] tabular-nums">{fmt(article.viewCount || 0)}</span>
 </td>
 <td className="px-3 py-3 hidden lg:table-cell">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">{fmtDate(article.publishedAt || article.updatedAt)}</span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-1">
 <Link href={`/content/new?id=${article.id}`}
 className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/8 transition-colors" title="Edit">
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
 </Link>
 <button onClick={() => window.open(`/article/${article.slug || article.id}`,'_blank')}
 className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-emerald-600 hover:bg-emerald-500/8 transition-colors" title="Preview">
 <EyeIcon className="w-3.5 h-3.5" />
 </button>
 <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/article/${article.slug || article.id}`)}
 className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-violet-600 hover:bg-violet-500/8 transition-colors" title="Copy link">
 <FollowIcon className="w-3.5 h-3.5" />
 </button>
 <button onClick={() => handleDeleteArticle(article.id)}
 className="p-1.5 rounded-md text-[rgb(var(--muted-foreground))] hover:text-red-600 hover:bg-red-500/8 transition-colors" title="Delete">
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">
 Page {currentPage} of {totalPages} ({sortedArticles.length} articles)
 </span>
 <div className="flex items-center gap-1">
 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
 className="px-3 py-1.5 text-xs font-medium border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
 Previous
 </button>
 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
 let p: number;
 if (totalPages <= 5) p = i + 1;
 else if (currentPage <= 3) p = i + 1;
 else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
 else p = currentPage - 2 + i;
 return (
 <button key={p} onClick={() => setCurrentPage(p)}
 className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
 currentPage === p
 ?'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]'
 :'border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]'
 }`}>
 {p}
 </button>
 );
 })}
 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
 className="px-3 py-1.5 text-xs font-medium border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
 Next
 </button>
 </div>
 </div>
 )}
 </div>
 );
}

