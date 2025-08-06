"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
  color: string;
  isActive: boolean;
  createdAt: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Technology',
      slug: 'technology',
      description: 'Latest tech news, gadgets, and innovations',
      articleCount: 45,
      color: '#3B82F6',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Business',
      slug: 'business',
      description: 'Market trends, finance, and corporate news',
      articleCount: 32,
      color: '#10B981',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Environment',
      slug: 'environment',
      description: 'Climate change, sustainability, and green initiatives',
      articleCount: 28,
      color: '#059669',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '4',
      name: 'Sports',
      slug: 'sports',
      description: 'Sports coverage, tournaments, and athlete profiles',
      articleCount: 19,
      color: '#F59E0B',
      isActive: false,
      createdAt: '2024-01-05'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const openModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData, slug: generateSlug(formData.name) }
          : cat
      ));
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description,
        articleCount: 0,
        color: formData.color,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCategories(prev => [...prev, newCategory]);
    }
    closeModal();
  };

  const toggleCategory = (id: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const deleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'Categories', href: '/admin/content/categories' }
        ]}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
        {/* Header */}
        <div className="p-8 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Content Categories
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Organize your content with custom categories
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              ➕ Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-border/30 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Category Color Indicator */}
                <div 
                  className="absolute top-4 right-4 w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>

                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    category.isActive 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {category.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>

                {/* Category Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-2">{category.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Slug: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{category.slug}</code>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{category.articleCount}</div>
                    <div className="text-xs text-slate-500">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500">Created</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-300 ${
                      category.isActive
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-300"
                      title="Edit category"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-300"
                      title="Delete category"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter category name..."
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
                  placeholder="Brief description of this category..."
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
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
