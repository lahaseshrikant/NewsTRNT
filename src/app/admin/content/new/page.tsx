"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface ArticleForm {
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published';
  featured: boolean;
  publishDate: string;
  metaDescription: string;
  featuredImage: string;
}

const NewArticle: React.FC = () => {
  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    content: '',
    category: '',
    tags: [],
    status: 'draft',
    featured: false,
    publishDate: '',
    metaDescription: '',
    featuredImage: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const categories = [
    'Technology', 'Business', 'Environment', 'Politics', 'Sports',
    'Health', 'Science', 'Entertainment', 'World News', 'Opinion'
  ];

  const handleInputChange = (field: keyof ArticleForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (status: 'draft' | 'scheduled' | 'published') => {
    const finalData = { ...formData, status };
    console.log('Submitting article:', finalData);
    // Here you would typically send the data to your API
    alert(`Article ${status === 'draft' ? 'saved as draft' : status === 'scheduled' ? 'scheduled' : 'published'} successfully!`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'New Article', href: '/admin/content/new' }
        ]}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-border/50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Article
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Write and publish engaging content for your audience
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-300"
            >
              {isPreview ? '📝 Edit' : '👁️ Preview'}
            </button>
          </div>
        </div>

        {!isPreview ? (
          <div className="space-y-8">
            {/* Article Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter article title..."
                className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground transition-all duration-300"
              />
            </div>

            {/* Category and Featured */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Publish Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.publishDate}
                  onChange={(e) => handleInputChange('publishDate', e.target.value)}
                  className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-2 border-border/50 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    ⭐ Featured Article
                  </span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tags
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                placeholder="Brief description for SEO (150-160 characters)..."
                rows={2}
                maxLength={160}
                className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.featuredImage}
                onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Article Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your article content here... You can use Markdown formatting."
                rows={15}
                className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground resize-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Supports Markdown formatting. Word count: {formData.content.split(' ').filter(word => word.length > 0).length}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-border/50">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSubmit('draft')}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-300 font-medium"
                >
                  💾 Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('scheduled')}
                  disabled={!formData.publishDate}
                  className="px-6 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏰ Schedule
                </button>
              </div>
              <button
                onClick={() => handleSubmit('published')}
                disabled={!formData.title || !formData.content || !formData.category}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Publish Article
              </button>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="mb-8">
              {formData.featuredImage && (
                <img
                  src={formData.featuredImage}
                  alt={formData.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}
              <div className="flex items-center space-x-4 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {formData.category || 'No Category'}
                </span>
                {formData.featured && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {formData.title || 'Article Title'}
              </h1>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {formData.content || 'Article content will appear here...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArticle;
