"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
  color: string;
  isActive: boolean;
  createdAt: string;
}

const Tags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      name: 'AI',
      slug: 'ai',
      description: 'Artificial Intelligence related content',
      articleCount: 23,
      color: '#8B5CF6',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Machine Learning',
      slug: 'machine-learning',
      description: 'ML algorithms, models, and applications',
      articleCount: 18,
      color: '#06B6D4',
      isActive: true,
      createdAt: '2024-01-02'
    },
    {
      id: '3',
      name: 'Climate Change',
      slug: 'climate-change',
      description: 'Environmental impact and climate issues',
      articleCount: 15,
      color: '#10B981',
      isActive: true,
      createdAt: '2024-01-03'
    },
    {
      id: '4',
      name: 'Cryptocurrency',
      slug: 'cryptocurrency',
      description: 'Digital currencies and blockchain technology',
      articleCount: 12,
      color: '#F59E0B',
      isActive: true,
      createdAt: '2024-01-04'
    },
    {
      id: '5',
      name: 'Breaking News',
      slug: 'breaking-news',
      description: 'Latest urgent news updates',
      articleCount: 31,
      color: '#EF4444',
      isActive: true,
      createdAt: '2024-01-05'
    },
    {
      id: '6',
      name: 'Tutorial',
      slug: 'tutorial',
      description: 'How-to guides and educational content',
      articleCount: 8,
      color: '#8B5CF6',
      isActive: false,
      createdAt: '2024-01-06'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const openModal = (tag: Tag | null = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        description: tag.description,
        color: tag.color
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        description: '',
        color: '#8B5CF6'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormData({ name: '', description: '', color: '#8B5CF6' });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingTag) {
      setTags(prev => prev.map(tag => 
        tag.id === editingTag.id 
          ? { ...tag, ...formData, slug: generateSlug(formData.name) }
          : tag
      ));
    } else {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description,
        articleCount: 0,
        color: formData.color,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTags(prev => [...prev, newTag]);
    }
    closeModal();
  };

  const toggleTag = (id: string) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, isActive: !tag.isActive } : tag
    ));
  };

  const deleteTag = (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setTags(prev => prev.filter(tag => tag.id !== id));
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && tag.isActive) ||
                         (filterStatus === 'inactive' && !tag.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalArticles = tags.reduce((sum, tag) => sum + tag.articleCount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'Tags', href: '/admin/content/tags' }
        ]}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
        {/* Header */}
        <div className="p-8 border-b border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Content Tags
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage tags to help organize and categorize your content
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              🏷️ Add Tag
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
              <div className="text-sm text-blue-600/70">Total Tags</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{tags.filter(t => t.isActive).length}</div>
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
        <div className="p-6 border-b border-border/50 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
            >
              <option value="all">All Tags</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Tags List */}
        <div className="p-8">
          {filteredTags.length > 0 ? (
            <div className="space-y-4">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-foreground">{tag.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tag.isActive 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {tag.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        {tag.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span>Slug: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{tag.slug}</code></span>
                        <span>Created: {new Date(tag.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{tag.articleCount}</div>
                      <div className="text-xs text-slate-500">Articles</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-300 ${
                          tag.isActive
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {tag.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openModal(tag)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-300"
                        title="Edit tag"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTag(tag.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-300"
                        title="Delete tag"
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
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No tags found
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first tag to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground">
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter tag name..."
                  className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
                />
                {formData.name && (
                  <p className="text-xs text-slate-500 mt-1">
                    Slug: <code>{generateSlug(formData.name)}</code>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this tag..."
                  rows={3}
                  className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-12 h-12 border border-border/50 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="flex-1 px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTag ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;

