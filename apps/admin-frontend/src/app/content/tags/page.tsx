"use client";

import React, { useState, useEffect, useCallback } from'react';
import adminAuth from'@/lib/auth/admin-auth';
import { API_CONFIG } from'@/config/api';

const API_BASE_URL = API_CONFIG.baseURL;

interface Tag {
 id: string;
 name: string;
 slug: string;
 usageCount: number;
 isDeleted: boolean;
 createdAt: string;
 deletedAt: string | null;
}

const Tags: React.FC = () => {
 const [tags, setTags] = useState<Tag[]>([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingTag, setEditingTag] = useState<Tag | null>(null);
 const [formData, setFormData] = useState({ name:'' });
 const [searchTerm, setSearchTerm] = useState('');
 const [filterStatus, setFilterStatus] = useState<'all' |'active' |'deleted'>('active');
 const [saving, setSaving] = useState(false);

 const loadTags = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams({
 status: filterStatus,
 search: searchTerm,
 sort:'name',
 order:'asc'
 });
 const res = await fetch(`${API_BASE_URL}/admin/tags?${params}`, {
 headers: { ...adminAuth.getAuthHeaders() }
 });
 if (res.ok) {
 const data = await res.json();
 setTags(data.tags || []);
 }
 } catch (error) {
 console.error('Failed to load tags:', error);
 }
 setLoading(false);
 }, [filterStatus, searchTerm]);

 useEffect(() => {
 loadTags();
 }, [loadTags]);

 const generateSlug = (name: string) => {
 return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
 };

 const openModal = (tag: Tag | null = null) => {
 if (tag) {
 setEditingTag(tag);
 setFormData({ name: tag.name });
 } else {
 setEditingTag(null);
 setFormData({ name:'' });
 }
 setIsModalOpen(true);
 };

 const closeModal = () => {
 setIsModalOpen(false);
 setEditingTag(null);
 setFormData({ name:'' });
 };

 const handleSubmit = async () => {
 if (!formData.name.trim()) return;
 setSaving(true);

 try {
 const url = editingTag
 ? `${API_BASE_URL}/admin/tags/${editingTag.id}`
 : `${API_BASE_URL}/admin/tags`;

 const res = await fetch(url, {
 method: editingTag ?'PUT' :'POST',
 headers: {'Content-Type':'application/json',
 ...adminAuth.getAuthHeaders()
 },
 body: JSON.stringify({ name: formData.name.trim() })
 });

 if (!res.ok) {
 const err = await res.json().catch(() => ({}));
 throw new Error(err.error ||'Failed to save tag');
 }

 closeModal();
 loadTags();
 } catch (error: any) {
 alert(error.message ||'Failed to save tag');
 }
 setSaving(false);
 };

 const deleteTag = async (id: string) => {
 if (!confirm('Are you sure you want to delete this tag?')) return;

 try {
 const res = await fetch(`${API_BASE_URL}/admin/tags/${id}`, {
 method:'DELETE',
 headers: { ...adminAuth.getAuthHeaders() }
 });
 if (!res.ok) throw new Error('Failed to delete tag');
 loadTags();
 } catch (error) {
 console.error('Failed to delete tag:', error);
 alert('Failed to delete tag');
 }
 };

 const restoreTag = async (id: string) => {
 try {
 const res = await fetch(`${API_BASE_URL}/admin/tags/${id}/restore`, {
 method:'POST',
 headers: { ...adminAuth.getAuthHeaders() }
 });
 if (!res.ok) throw new Error('Failed to restore tag');
 loadTags();
 } catch (error) {
 console.error('Failed to restore tag:', error);
 alert('Failed to restore tag');
 }
 };

 const activeTags = tags.filter(t => !t.isDeleted);
 const totalArticles = tags.reduce((sum, tag) => sum + tag.usageCount, 0);

 return (
 <div className="p-6 max-w-7xl mx-auto">

 <div className="bg-[rgb(var(--card))] rounded-xl shadow-sm border border-[rgb(var(--border))]/50">
 {/* Header */}
 <div className="p-8 border-b border-[rgb(var(--border))]/50">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
 Content Tags
 </h1>
 <p className="text-[rgb(var(--muted-foreground))] mt-2">
 Manage tags to help organize and categorize your content
 </p>
 </div>
 <button
 onClick={() => openModal()}
 className="px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-sm"
 >
 Add Tag
 </button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
 <div className="bg-[rgb(var(--primary))]/5 rounded-xl p-4">
 <div className="text-2xl font-bold text-[rgb(var(--primary))]">{tags.length}</div>
 <div className="text-sm text-[rgb(var(--primary))]/70">Total Tags</div>
 </div>
 <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
 <div className="text-2xl font-bold text-green-600">{activeTags.length}</div>
 <div className="text-sm text-green-600/70">Active Tags</div>
 </div>
 <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
 <div className="text-2xl font-bold text-purple-600">{totalArticles}</div>
 <div className="text-sm text-purple-600/70">Total Articles</div>
 </div>
 <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
 <div className="text-2xl font-bold text-orange-600">
 {tags.length > 0 ? Math.round(totalArticles / tags.length) : 0}
 </div>
 <div className="text-sm text-orange-600/70">Avg per Tag</div>
 </div>
 </div>
 </div>

 {/* Filters */}
 <div className="p-6 border-b border-[rgb(var(--border))]/50 bg-[rgb(var(--muted))]/5">
 <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
 <div className="flex-1">
 <input
 type="text"
 placeholder="Search tags..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full px-4 py-2 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 />
 </div>
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value as any)}
 className="px-4 py-2 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 >
 <option value="all">All Tags</option>
 <option value="active">Active Only</option>
 <option value="deleted">Deleted Only</option>
 </select>
 </div>
 </div>

 {/* Tags List */}
 <div className="p-8">
 {loading ? (
 <div className="text-center py-12">
 <div className="animate-spin w-8 h-8 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full mx-auto mb-4"></div>
 <p className="text-[rgb(var(--muted-foreground))]">Loading tags...</p>
 </div>
 ) : tags.length > 0 ? (
 <div className="space-y-4">
 {tags.map((tag) => (
 <div
 key={tag.id}
 className={`flex items-center justify-between p-6 rounded-xl border border-[rgb(var(--border))]/30 hover:shadow-sm transition-all duration-300 ${
 tag.isDeleted ?'bg-red-50/50 dark:bg-red-900/10 opacity-70' :'bg-[rgb(var(--muted))]/5'
 }`}
 >
 <div className="flex items-center space-x-4">
 <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary))]/10 flex items-center justify-center text-lg font-bold text-[rgb(var(--primary))]">
 {tag.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <div className="flex items-center space-x-3">
 <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">{tag.name}</h3>
 {tag.isDeleted && (
 <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
 Deleted
 </span>
 )}
 </div>
 <div className="flex items-center space-x-4 mt-1 text-xs text-[rgb(var(--muted-foreground))]">
 <span>Slug: <code className="bg-[rgb(var(--muted))]/10 px-1 rounded">{tag.slug}</code></span>
 <span>Created: {new Date(tag.createdAt).toLocaleDateString()}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center space-x-4">
 <div className="text-center">
 <div className="text-xl font-bold text-[rgb(var(--primary))]">{tag.usageCount}</div>
 <div className="text-xs text-[rgb(var(--muted-foreground))]">Articles</div>
 </div>
 <div className="flex items-center space-x-2">
 {tag.isDeleted ? (
 <button
 onClick={() => restoreTag(tag.id)}
 className="px-3 py-2 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
 >
 Restore
 </button>
 ) : (
 <>
 <button
 onClick={() => openModal(tag)}
 className="px-3 py-2 rounded-lg text-xs font-medium text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/5 transition-colors"
 >
 Edit
 </button>
 <button
 onClick={() => deleteTag(tag.id)}
 className="px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
 >
 Delete
 </button>
 </>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12">
 <h3 className="text-xl font-semibold text-[rgb(var(--muted-foreground))] mb-2">
 No tags found
 </h3>
 <p className="text-[rgb(var(--muted-foreground))]">
 {searchTerm ?'Try adjusting your search terms' :'Create your first tag to get started'}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-[rgb(var(--card))] rounded-xl shadow-lg max-w-md w-full">
 <div className="p-6 border-b border-[rgb(var(--border))]/50">
 <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
 {editingTag ?'Edit Tag' :'Add New Tag'}
 </h2>
 </div>
 <div className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
 Tag Name *
 </label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({ name: e.target.value })}
 placeholder="Enter tag name..."
 className="w-full px-4 py-3 border border-[rgb(var(--border))]/50 rounded-xl focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 onKeyDown={(e) => e.key ==='Enter' && handleSubmit()}
 />
 {formData.name && (
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
 Slug: <code className="bg-[rgb(var(--muted))]/10 px-1 rounded">{generateSlug(formData.name)}</code>
 </p>
 )}
 </div>
 </div>
 <div className="p-6 border-t border-[rgb(var(--border))]/50 flex justify-end space-x-3">
 <button
 onClick={closeModal}
 className="px-6 py-2 bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] rounded-xl hover:bg-[rgb(var(--muted))]/20 transition-colors duration-300"
 >
 Cancel
 </button>
 <button
 onClick={handleSubmit}
 disabled={!formData.name.trim() || saving}
 className="px-6 py-2 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {saving ?'Saving...' : editingTag ?'Update' :'Create'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default Tags;