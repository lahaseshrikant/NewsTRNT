// src/app/admin/newsletter/templates/page.tsx - Newsletter Templates Management
'use client';

import React, { useState, useEffect, useCallback } from'react';
import { AdminRoute } from'@/components/auth/RouteGuard';
import { API_CONFIG } from'@/config/api';
import adminAuth from'@/lib/auth/admin-auth';

const API_BASE_URL = API_CONFIG.baseURL;

interface EmailTemplate {
 id: string;
 name: string;
 subject: string;
 category:'newsletter' |'welcome' |'notification' |'promotional' |'digest';
 thumbnail: string;
 lastModified: string;
 status:'active' |'draft' |'archived';
 usageCount: number;
}

function NewsletterTemplatesContent() {
 const [templates, setTemplates] = useState<EmailTemplate[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [filterCategory, setFilterCategory] = useState<string>('all');
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

 const fetchTemplates = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const token = adminAuth.getToken();
 const response = await fetch(`${API_BASE_URL}/admin/newsletter/templates`, {
 headers: {'Authorization': `Bearer ${token}`,'Content-Type':'application/json'
 }
 });
 
 if (response.ok) {
 const data = await response.json();
 setTemplates(data.templates || []);
 } else {
 setTemplates([]);
 }
 } catch (err) {
 console.error('Error fetching templates:', err);
 setError('Failed to load templates');
 setTemplates([]);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchTemplates();
 }, [fetchTemplates]);

 const getCategoryColor = (category: EmailTemplate['category']) => {
 const colors = {
 newsletter:'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]',
 welcome:'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
 notification:'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
 promotional:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
 digest:'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
 };
 return colors[category];
 };

 const getStatusColor = (status: EmailTemplate['status']) => {
 const colors = {
 active:'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
 draft:'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
 archived:'bg-[rgb(var(--muted))]/30 text-[rgb(var(--foreground))]'
 };
 return colors[status];
 };

 const filteredTemplates = templates.filter(t => 
 filterCategory ==='all' || t.category === filterCategory
 );

 const handleDuplicate = async (template: EmailTemplate) => {
 try {
 const response = await fetch(`${API_BASE_URL}/admin/newsletter/templates/${template.id}/duplicate`, {
 method:'POST',
 headers: {
 ...adminAuth.getAuthHeaders(),'Content-Type':'application/json'
 }
 });
 
 if (response.ok) {
 fetchTemplates();
 }
 } catch (err) {
 console.error('Error duplicating template:', err);
 }
 };

 const handleDelete = async (id: string) => {
 if (confirm('Are you sure you want to delete this template?')) {
 try {
 const response = await fetch(`${API_BASE_URL}/admin/newsletter/templates/${id}`, {
 method:'DELETE',
 headers: {
 ...adminAuth.getAuthHeaders(),'Content-Type':'application/json'
 }
 });
 
 if (response.ok) {
 fetchTemplates();
 }
 } catch (err) {
 console.error('Error deleting template:', err);
 }
 }
 };

 if (loading) {
 return (
 <div className="p-6 flex items-center justify-center min-h-[400px]">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))]"></div>
 </div>
 );
 }

 return (
 <div className="p-6 space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Email Templates</h1>
 <p className="text-[rgb(var(--muted-foreground))]">Create and manage newsletter templates</p>
 </div>
 <button
 onClick={() => setShowCreateModal(true)}
 className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90 transition-colors"
 >
 Create Template
 </button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Total Templates</p>
 <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{templates.length}</p>
 </div>
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Active</p>
 <p className="text-2xl font-bold text-green-600">{templates.filter(t => t.status ==='active').length}</p>
 </div>
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Drafts</p>
 <p className="text-2xl font-bold text-yellow-600">{templates.filter(t => t.status ==='draft').length}</p>
 </div>
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <p className="text-sm text-[rgb(var(--muted-foreground))]">Total Sends</p>
 <p className="text-2xl font-bold text-[rgb(var(--primary))]">{templates.reduce((acc, t) => acc + t.usageCount, 0).toLocaleString()}</p>
 </div>
 </div>

 {/* Filters */}
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
 <div className="flex flex-wrap gap-2">
 {['all','newsletter','welcome','notification','promotional','digest'].map(category => (
 <button
 key={category}
 onClick={() => setFilterCategory(category)}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
 filterCategory === category
 ?'bg-[rgb(var(--primary))] text-white'
 :'bg-[rgb(var(--muted))]/10 hover:bg-[rgb(var(--muted))]/10/80 text-[rgb(var(--foreground))]'
 }`}
 >
 {category ==='all' ?'All Templates' : category.charAt(0).toUpperCase() + category.slice(1)}
 </button>
 ))}
 </div>
 </div>

 {/* Templates Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredTemplates.map(template => (
 <div
 key={template.id}
 className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
 >
 {/* Template Preview */}
 <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-5xl">
 {template.thumbnail}
 </div>
 
 {/* Template Info */}
 <div className="p-4 space-y-3">
 <div className="flex items-start justify-between">
 <div>
 <h3 className="font-semibold text-[rgb(var(--foreground))]">{template.name}</h3>
 <p className="text-sm text-[rgb(var(--muted-foreground))] truncate" title={template.subject}>
 {template.subject}
 </p>
 </div>
 <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(template.status)}`}>
 {template.status}
 </span>
 </div>
 
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(template.category)}`}>
 {template.category}
 </span>
 <span className="text-xs text-[rgb(var(--muted-foreground))]">
 {template.usageCount} sends
 </span>
 </div>
 
 <p className="text-xs text-[rgb(var(--muted-foreground))]">
 Modified {new Date(template.lastModified).toLocaleDateString()}
 </p>
 
 {/* Actions */}
 <div className="flex gap-2 pt-2 border-t border-[rgb(var(--border))]">
 <button
 onClick={() => setSelectedTemplate(template)}
 className="flex-1 px-3 py-1.5 text-sm bg-[rgb(var(--primary))] text-white rounded hover:opacity-90"
 >
 Edit
 </button>
 <button
 onClick={() => handleDuplicate(template)}
 className="px-3 py-1.5 text-sm border border-[rgb(var(--border))] rounded hover:bg-[rgb(var(--muted))]/10"
 >
 
 </button>
 <button
 onClick={() => handleDelete(template.id)}
 className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
 >
 
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Create Template Modal */}
 {showCreateModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 w-full max-w-lg">
 <h2 className="text-xl font-bold text-[rgb(var(--foreground))] mb-4">Create New Template</h2>
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">Template Name</label>
 <input
 type="text"
 placeholder="e.g., Weekly Update"
 className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">Subject Line</label>
 <input
 type="text"
 placeholder="Use {{name}}, {{date}} for personalization"
 className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">Category</label>
 <select className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
 <option value="newsletter">Newsletter</option>
 <option value="welcome">Welcome</option>
 <option value="notification">Notification</option>
 <option value="promotional">Promotional</option>
 <option value="digest">Digest</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">Start From</label>
 <div className="grid grid-cols-3 gap-2">
 <button className="p-4 border-2 border-[rgb(var(--border))] rounded-lg hover:border-[rgb(var(--primary))] text-center">
 <span className="text-2xl">📄</span>
 <p className="text-xs mt-1">Blank</p>
 </button>
 <button className="p-4 border-2 border-[rgb(var(--border))] rounded-lg hover:border-[rgb(var(--primary))] text-center">
 <span className="text-2xl">📰</span>
 <p className="text-xs mt-1">News Layout</p>
 </button>
 <button className="p-4 border-2 border-[rgb(var(--border))] rounded-lg hover:border-[rgb(var(--primary))] text-center">
 <span className="text-2xl">🎨</span>
 <p className="text-xs mt-1">Rich Media</p>
 </button>
 </div>
 </div>
 <div className="flex gap-2 pt-4">
 <button
 onClick={() => setShowCreateModal(false)}
 className="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))]/10"
 >
 Cancel
 </button>
 <button
 onClick={() => {
 // Would create template here
 setShowCreateModal(false);
 }}
 className="flex-1 px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90"
 >
 Create Template
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Edit Template Modal */}
 {selectedTemplate && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Edit: {selectedTemplate.name}</h2>
 <button onClick={() => setSelectedTemplate(null)} className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">✕</button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Editor */}
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">Subject Line</label>
 <input
 type="text"
 defaultValue={selectedTemplate.subject}
 className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">Email Content</label>
 <textarea
 defaultValue="<!-- Email HTML content here -->"
 className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] h-64 font-mono text-sm"
 />
 </div>
 </div>
 
 {/* Preview */}
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">Preview</label>
 <div className="border border-[rgb(var(--border))] rounded-lg p-4 bg-[rgb(var(--card))] h-80 overflow-y-auto">
 <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
 Email preview will appear here
 </div>
 </div>
 </div>
 </div>
 
 <div className="flex gap-2 pt-6 mt-6 border-t border-[rgb(var(--border))]">
 <button
 onClick={() => setSelectedTemplate(null)}
 className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--muted))]/10"
 >
 Cancel
 </button>
 <button className="px-4 py-2 bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] rounded-lg hover:opacity-80">
 Save as Draft
 </button>
 <button className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90">
 Save & Activate
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

export default function NewsletterTemplatesPage() {
 return (
 <AdminRoute>
 <NewsletterTemplatesContent />
 </AdminRoute>
 );
}

