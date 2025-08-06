"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

interface Draft {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  lastModified: string;
  wordCount: number;
  autoSaved: boolean;
}

const Drafts: React.FC = () => {
  const [drafts, setDrafts] = useState<Draft[]>([
    {
      id: '1',
      title: 'The Future of Quantum Computing',
      content: 'Quantum computing represents a paradigm shift in computational power. Unlike classical computers that use bits as the smallest unit of data...',
      category: 'Technology',
      tags: ['quantum', 'computing', 'technology', 'future'],
      author: 'John Doe',
      lastModified: '2024-01-15T14:30:00Z',
      wordCount: 1250,
      autoSaved: true
    },
    {
      id: '2',
      title: 'Sustainable Energy Solutions for 2024',
      content: 'As the world continues to grapple with climate change, sustainable energy solutions have become more critical than ever...',
      category: 'Environment',
      tags: ['energy', 'sustainability', 'climate'],
      author: 'Jane Smith',
      lastModified: '2024-01-14T16:45:00Z',
      wordCount: 890,
      autoSaved: false
    },
    {
      id: '3',
      title: 'Market Analysis: Tech Stocks in Q1',
      content: 'The technology sector has shown remarkable resilience in the first quarter of 2024...',
      category: 'Business',
      tags: ['market', 'stocks', 'technology', 'analysis'],
      author: 'Mike Johnson',
      lastModified: '2024-01-13T09:15:00Z',
      wordCount: 675,
      autoSaved: true
    },
    {
      id: '4',
      title: '',
      content: 'AI has revolutionized the way we approach healthcare diagnosis...',
      category: 'Technology',
      tags: ['ai', 'healthcare'],
      author: 'Sarah Wilson',
      lastModified: '2024-01-12T11:20:00Z',
      wordCount: 234,
      autoSaved: true
    }
  ]);

  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'lastModified' | 'title' | 'wordCount'>('lastModified');
  const [filterCategory, setFilterCategory] = useState('all');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const categories = ['all', ...Array.from(new Set(drafts.map(d => d.category)))];

  const toggleDraftSelection = (draftId: string) => {
    setSelectedDrafts(prev => 
      prev.includes(draftId) 
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    );
  };

  const selectAllDrafts = () => {
    setSelectedDrafts(filteredDrafts.map(d => d.id));
  };

  const clearSelection = () => {
    setSelectedDrafts([]);
  };

  const deleteDraft = (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      setSelectedDrafts(prev => prev.filter(id => id !== draftId));
    }
  };

  const deleteSelectedDrafts = () => {
    if (confirm(`Are you sure you want to delete ${selectedDrafts.length} selected drafts?`)) {
      setDrafts(prev => prev.filter(d => !selectedDrafts.includes(d.id)));
      setSelectedDrafts([]);
    }
  };

  const duplicateDraft = (draft: Draft) => {
    const newDraft: Draft = {
      ...draft,
      id: Date.now().toString(),
      title: `${draft.title} (Copy)`,
      lastModified: new Date().toISOString(),
      autoSaved: false
    };
    setDrafts(prev => [newDraft, ...prev]);
  };

  const filteredDrafts = drafts
    .filter(draft => {
      const matchesSearch = draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           draft.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           draft.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || draft.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'wordCount':
          return b.wordCount - a.wordCount;
        case 'lastModified':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'Drafts', href: '/admin/content/drafts' }
        ]}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
        {/* Header */}
        <div className="p-8 border-b border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Draft Articles
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage your unpublished articles and continue writing
              </p>
            </div>
            <Link
              href="/admin/content/new"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              ✨ New Article
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{drafts.length}</div>
              <div className="text-sm text-blue-600/70">Total Drafts</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">
                {drafts.filter(d => d.autoSaved).length}
              </div>
              <div className="text-sm text-green-600/70">Auto-saved</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(drafts.reduce((sum, d) => sum + d.wordCount, 0) / drafts.length || 0)}
              </div>
              <div className="text-sm text-purple-600/70">Avg Words</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600">
                {drafts.filter(d => !d.title.trim()).length}
              </div>
              <div className="text-sm text-orange-600/70">Untitled</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-border/50 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
              >
                <option value="lastModified">Last Modified</option>
                <option value="title">Title</option>
                <option value="wordCount">Word Count</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDrafts.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {selectedDrafts.length} draft(s) selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                >
                  Clear selection
                </button>
              </div>
              <button
                onClick={deleteSelectedDrafts}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm"
              >
                🗑️ Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Drafts List */}
        <div className="p-8">
          {filteredDrafts.length > 0 ? (
            <div className="space-y-4">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    selectedDrafts.includes(draft.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-border/30 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedDrafts.includes(draft.id)}
                        onChange={() => toggleDraftSelection(draft.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-2 border-border/50 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-foreground">
                            {draft.title || <span className="text-slate-400 italic">Untitled Draft</span>}
                          </h3>
                          {draft.autoSaved && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                              Auto-saved
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                          {draft.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            {draft.category}
                          </span>
                          <span>{draft.wordCount} words</span>
                          <span>by {draft.author}</span>
                          <span>{formatDate(draft.lastModified)}</span>
                        </div>
                        {draft.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {draft.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/admin/content/edit/${draft.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-300"
                        title="Edit draft"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => duplicateDraft(draft)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-300"
                        title="Duplicate draft"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-300"
                        title="Delete draft"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No drafts found
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Start writing your first article'}
              </p>
              <Link
                href="/admin/content/new"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
              >
                <span>✨</span>
                <span>Create New Article</span>
              </Link>
            </div>
          )}
        </div>

        {/* Bulk Actions Footer */}
        {filteredDrafts.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={selectAllDrafts}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                >
                  Select All ({filteredDrafts.length})
                </button>
                {selectedDrafts.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-slate-600 hover:text-slate-800 dark:hover:text-slate-400"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              <div className="text-sm text-slate-500">
                Showing {filteredDrafts.length} of {drafts.length} drafts
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drafts;
