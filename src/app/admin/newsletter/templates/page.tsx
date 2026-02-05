// src/app/admin/newsletter/templates/page.tsx - Newsletter Templates Management
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminRoute } from '@/components/admin/RouteGuard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'newsletter' | 'welcome' | 'notification' | 'promotional' | 'digest';
  thumbnail: string;
  lastModified: string;
  status: 'active' | 'draft' | 'archived';
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
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/newsletter/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
      newsletter: 'bg-blue-100 text-blue-800',
      welcome: 'bg-green-100 text-green-800',
      notification: 'bg-red-100 text-red-800',
      promotional: 'bg-purple-100 text-purple-800',
      digest: 'bg-orange-100 text-orange-800'
    };
    return colors[category];
  };

  const getStatusColor = (status: EmailTemplate['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const filteredTemplates = templates.filter(t => 
    filterCategory === 'all' || t.category === filterCategory
  );

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/newsletter/templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/admin/newsletter/templates/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
          <p className="text-muted-foreground">Create and manage newsletter templates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Create Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Templates</p>
          <p className="text-2xl font-bold text-foreground">{templates.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{templates.filter(t => t.status === 'active').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">{templates.filter(t => t.status === 'draft').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Sends</p>
          <p className="text-2xl font-bold text-blue-600">{templates.reduce((acc, t) => acc + t.usageCount, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'newsletter', 'welcome', 'notification', 'promotional', 'digest'].map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {category === 'all' ? 'All Templates' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Template Preview */}
            <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-5xl">
              {template.thumbnail}
            </div>
            
            {/* Template Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  <p className="text-sm text-muted-foreground truncate" title={template.subject}>
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
                <span className="text-xs text-muted-foreground">
                  📤 {template.usageCount} sends
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Modified {new Date(template.lastModified).toLocaleDateString()}
              </p>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDuplicate(template)}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted"
                >
                  📋
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-foreground mb-4">Create New Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g., Weekly Update"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Subject Line</label>
                <input
                  type="text"
                  placeholder="Use {{name}}, {{date}} for personalization"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground">
                  <option value="newsletter">Newsletter</option>
                  <option value="welcome">Welcome</option>
                  <option value="notification">Notification</option>
                  <option value="promotional">Promotional</option>
                  <option value="digest">Digest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start From</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-4 border-2 border-border rounded-lg hover:border-blue-500 text-center">
                    <span className="text-2xl">📄</span>
                    <p className="text-xs mt-1">Blank</p>
                  </button>
                  <button className="p-4 border-2 border-border rounded-lg hover:border-blue-500 text-center">
                    <span className="text-2xl">📰</span>
                    <p className="text-xs mt-1">News Layout</p>
                  </button>
                  <button className="p-4 border-2 border-border rounded-lg hover:border-blue-500 text-center">
                    <span className="text-2xl">🎨</span>
                    <p className="text-xs mt-1">Rich Media</p>
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Would create template here
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Edit: {selectedTemplate.name}</h2>
              <button onClick={() => setSelectedTemplate(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Subject Line</label>
                  <input
                    type="text"
                    defaultValue={selectedTemplate.subject}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email Content</label>
                  <textarea
                    defaultValue="<!-- Email HTML content here -->"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground h-64 font-mono text-sm"
                  />
                </div>
              </div>
              
              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Preview</label>
                <div className="border border-border rounded-lg p-4 bg-white h-80 overflow-y-auto">
                  <div className="text-center py-8 text-muted-foreground">
                    Email preview will appear here
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-6 mt-6 border-t border-border">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Save as Draft
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
    <AdminRoute requiredPermissions={['newsletter.manage_templates']}>
      <NewsletterTemplatesContent />
    </AdminRoute>
  );
}
