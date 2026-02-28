// src/app/admin/content/workflow/page.tsx - Content Workflow Management
'use client';

import React, { useState, useEffect, useCallback } from'react';
import { AdminRoute } from'@/components/auth/RouteGuard';
import adminAuth from'@/lib/auth/admin-auth';

import { API_CONFIG } from'@/config/api';
const API_BASE_URL = API_CONFIG.baseURL;

interface ContentItem {
 id: string;
 title: string;
 author: string;
 authorAvatar?: string;
 type:'article' |'feature' |'opinion' |'breaking';
 category: string;
 stage:'draft' |'writing' |'editing' |'review' |'approved' |'published';
 priority:'low' |'medium' |'high' |'urgent';
 deadline?: string;
 assignedTo?: string;
 createdAt: string;
 updatedAt: string;
 comments: number;
}

const stages: { id: ContentItem['stage']; label: string; color: string }[] = [
 { id:'draft', label:'Draft', color:'bg-[rgb(var(--muted))]/30 border-[rgb(var(--border))]' },
 { id:'writing', label:'Writing', color:'bg-[rgb(var(--primary))]/10 border-blue-300' },
 { id:'editing', label:'Editing', color:'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700' },
 { id:'review', label:'Review', color:'bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700' },
 { id:'approved', label:'Approved', color:'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700' },
 { id:'published', label:'Published', color:'bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700' },
];

function WorkflowContent() {
 const [contentItems, setContentItems] = useState<ContentItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [draggedItem, setDraggedItem] = useState<ContentItem | null>(null);
 const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
 const [filterPriority, setFilterPriority] = useState<string>('all');
 const [filterCategory, setFilterCategory] = useState<string>('all');
 const [viewMode, setViewMode] = useState<'kanban' |'list'>('kanban');

 const fetchContent = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const response = await fetch(`${API_BASE_URL}/articles?limit=50`, {
 headers: { ...adminAuth.getAuthHeaders() }
 });
 
 if (response.ok) {
 const data = await response.json();
 const articles = data.articles || [];
 
 // Transform articles to workflow items
 const items: ContentItem[] = articles.map((article: any) => ({
 id: article.id,
 title: article.title,
 author: article.author?.fullName || article.author ||'Staff Writer',
 type: article.contentType ==='breaking' ?'breaking' : 
 article.contentType ==='opinion' ?'opinion' :
 article.contentType ==='feature' ?'feature' :'article',
 category: article.category?.name ||'Uncategorized',
 stage: article.isPublished ?'published' :'draft',
 priority: article.priority ||'medium',
 createdAt: article.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
 updatedAt: article.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
 comments: article.commentCount || 0
 }));
 
 setContentItems(items);
 }
 } catch (err) {
 console.error('Error fetching content:', err);
 setError('Failed to load content');
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchContent();
 }, [fetchContent]);

 const getPriorityColor = (priority: ContentItem['priority']) => {
 const colors = {
 low:'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]',
 medium:'bg-blue-200 text-[rgb(var(--primary))]',
 high:'bg-orange-200 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
 urgent:'bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300'
 };
 return colors[priority];
 };

 const getTypeIcon = (type: ContentItem['type']) => {
 const icons = { article:'📄', feature:'⭐', opinion:'💭', breaking:'🔴' };
 return icons[type];
 };

 const handleDragStart = (item: ContentItem) => {
 setDraggedItem(item);
 };

 const handleDrop = (newStage: ContentItem['stage']) => {
 if (!draggedItem) return;
 
 setContentItems(items =>
 items.map(item =>
 item.id === draggedItem.id
 ? { ...item, stage: newStage, updatedAt: new Date().toISOString().split('T')[0] }
 : item
 )
 );
 setDraggedItem(null);
 };

 const filteredItems = contentItems.filter(item => {
 const priorityMatch = filterPriority ==='all' || item.priority === filterPriority;
 const categoryMatch = filterCategory ==='all' || item.category === filterCategory;
 return priorityMatch && categoryMatch;
 });

 const getItemsForStage = (stage: ContentItem['stage']) => {
 return filteredItems.filter(item => item.stage === stage);
 };

 const isOverdue = (deadline?: string) => {
 if (!deadline) return false;
 return new Date(deadline) < new Date();
 };

 const categories = [...new Set(contentItems.map(item => item.category))];

 return (
 <div className="p-6 space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Content Workflow</h1>
 <p className="text-[rgb(var(--muted-foreground))]">Track and manage content through the editorial pipeline</p>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => setViewMode(viewMode ==='kanban' ?'list' :'kanban')}
 className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))]/10"
 >
 {viewMode ==='kanban' ?'List View' :'Kanban View'}
 </button>
 <button className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90">
 + New Content
 </button>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
 {stages.map(stage => (
 <div key={stage.id} className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4 text-center">
 <p className="text-sm text-[rgb(var(--muted-foreground))]">{stage.label}</p>
 <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{getItemsForStage(stage.id).length}</p>
 </div>
 ))}
 </div>

 {/* Filters */}
 <div className="flex flex-wrap gap-4">
 <select
 value={filterPriority}
 onChange={(e) => setFilterPriority(e.target.value)}
 className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 >
 <option value="all">All Priorities</option>
 <option value="urgent">Urgent</option>
 <option value="high">High</option>
 <option value="medium">Medium</option>
 <option value="low">Low</option>
 </select>
 <select
 value={filterCategory}
 onChange={(e) => setFilterCategory(e.target.value)}
 className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 >
 <option value="all">All Categories</option>
 {categories.map(cat => (
 <option key={cat} value={cat}>{cat}</option>
 ))}
 </select>
 </div>

 {viewMode ==='kanban' ? (
 /* Kanban Board */
 <div className="flex gap-4 overflow-x-auto pb-4">
 {stages.map(stage => (
 <div
 key={stage.id}
 className={`flex-shrink-0 w-80 rounded-xl border-2 ${stage.color}`}
 onDragOver={(e) => e.preventDefault()}
 onDrop={() => handleDrop(stage.id)}
 >
 <div className="p-3 border-b border-inherit">
 <div className="flex items-center justify-between">
 <h3 className="font-semibold text-[rgb(var(--foreground))]">{stage.label}</h3>
 <span className="text-sm text-[rgb(var(--muted-foreground))]">
 {getItemsForStage(stage.id).length}
 </span>
 </div>
 </div>
 <div className="p-2 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
 {getItemsForStage(stage.id).map(item => (
 <div
 key={item.id}
 draggable
 onDragStart={() => handleDragStart(item)}
 onClick={() => setSelectedItem(item)}
 className={`bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow ${
 draggedItem?.id === item.id ?'opacity-50' :''
 }`}
 >
 <div className="flex items-start justify-between mb-2">
 <span className="text-lg">{getTypeIcon(item.type)}</span>
 <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
 {item.priority}
 </span>
 </div>
 <h4 className="font-medium text-[rgb(var(--foreground))] text-sm mb-2 line-clamp-2">{item.title}</h4>
 <div className="flex items-center justify-between text-xs text-[rgb(var(--muted-foreground))]">
 <span>{item.author}</span>
 <span>{item.category}</span>
 </div>
 {item.deadline && (
 <div className={`mt-2 text-xs ${isOverdue(item.deadline) ?'text-red-600' :'text-[rgb(var(--muted-foreground))]'}`}>
 {item.deadline} {isOverdue(item.deadline) &&'(Overdue!)'}
 </div>
 )}
 {item.comments > 0 && (
 <div className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
 {item.comments} comments
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 ) : (
 /* List View */
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl overflow-hidden">
 <table className="w-full">
 <thead className="bg-[rgb(var(--muted))]/5">
 <tr>
 <th className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Title</th>
 <th className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Author</th>
 <th className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Category</th>
 <th className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Stage</th>
 <th className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Priority</th>
 <th className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--muted-foreground))]">Deadline</th>
 <th className="px-4 py-3 text-right text-sm font-medium text-[rgb(var(--muted-foreground))]">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filteredItems.map(item => (
 <tr key={item.id} className="hover:bg-[rgb(var(--muted))]/10/30 transition-colors">
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <span>{getTypeIcon(item.type)}</span>
 <span className="font-medium text-[rgb(var(--foreground))]">{item.title}</span>
 </div>
 </td>
 <td className="px-4 py-3 text-[rgb(var(--muted-foreground))]">{item.author}</td>
 <td className="px-4 py-3 text-[rgb(var(--muted-foreground))]">{item.category}</td>
 <td className="px-4 py-3">
 <select
 value={item.stage}
 onChange={(e) => {
 setContentItems(items =>
 items.map(i =>
 i.id === item.id
 ? { ...i, stage: e.target.value as ContentItem['stage'] }
 : i
 )
 );
 }}
 className="text-xs px-2 py-1 rounded border border-[rgb(var(--border))] bg-[rgb(var(--background))]"
 >
 {stages.map(s => (
 <option key={s.id} value={s.id}>{s.label}</option>
 ))}
 </select>
 </td>
 <td className="px-4 py-3">
 <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
 {item.priority}
 </span>
 </td>
 <td className={`px-4 py-3 ${isOverdue(item.deadline) ?'text-red-600' :'text-[rgb(var(--muted-foreground))]'}`}>
 {item.deadline ||'—'}
 </td>
 <td className="px-4 py-3 text-right">
 <button
 onClick={() => setSelectedItem(item)}
 className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] text-sm"
 >
 View
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Item Detail Modal */}
 {selectedItem && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
 <div className="flex items-start justify-between mb-4">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className="text-2xl">{getTypeIcon(selectedItem.type)}</span>
 <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedItem.priority)}`}>
 {selectedItem.priority}
 </span>
 </div>
 <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">{selectedItem.title}</h2>
 </div>
 <button
 onClick={() => setSelectedItem(null)}
 className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
 >
 
 </button>
 </div>
 
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Author</p>
 <p className="font-medium text-[rgb(var(--foreground))]">{selectedItem.author}</p>
 </div>
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Category</p>
 <p className="font-medium text-[rgb(var(--foreground))]">{selectedItem.category}</p>
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Current Stage</p>
 <select
 value={selectedItem.stage}
 onChange={(e) => {
 const newStage = e.target.value as ContentItem['stage'];
 setContentItems(items =>
 items.map(i => i.id === selectedItem.id ? { ...i, stage: newStage } : i)
 );
 setSelectedItem({ ...selectedItem, stage: newStage });
 }}
 className="mt-1 w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))]"
 >
 {stages.map(s => (
 <option key={s.id} value={s.id}>{s.label}</option>
 ))}
 </select>
 </div>
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Deadline</p>
 <p className={`font-medium ${isOverdue(selectedItem.deadline) ?'text-red-600' :'text-[rgb(var(--foreground))]'}`}>
 {selectedItem.deadline ||'Not set'}
 {isOverdue(selectedItem.deadline) &&' (Overdue!)'}
 </p>
 </div>
 </div>
 
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Timeline</p>
 <div className="text-sm text-[rgb(var(--foreground))]">
 <p>Created: {selectedItem.createdAt}</p>
 <p>Last updated: {selectedItem.updatedAt}</p>
 </div>
 </div>
 
 <div>
 <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Comments ({selectedItem.comments})</p>
 <div className="bg-[rgb(var(--muted))]/10 rounded-lg p-3">
 <textarea
 rows={2}
 placeholder="Add a comment..."
 className="w-full bg-transparent resize-none border-none focus:outline-none text-[rgb(var(--foreground))]"
 />
 </div>
 </div>
 
 <div className="flex gap-2 pt-4">
 <button
 onClick={() => setSelectedItem(null)}
 className="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))]/10"
 >
 Close
 </button>
 <button className="flex-1 px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90">
 Edit Content
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

export default function WorkflowPage() {
 return (
 <AdminRoute>
 <WorkflowContent />
 </AdminRoute>
 );
}

