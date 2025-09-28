"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { articleAPI } from '@/lib/api';
import { useCategories, Category } from '@/hooks/useCategories';

interface ArticleForm {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tags: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category?: { id: string; name: string };
  categoryId?: string;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published';
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  author?: { name: string };
  createdAt: string;
  updatedAt: string;
}

const EditArticle: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use categories hook for admin (include inactive categories)
  const { categories, loading: categoriesLoading } = useCategories({ includeInactive: true });
  
  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: '',
    status: 'draft',
    scheduledAt: '',
    seoTitle: '',
    seoDescription: '',
    featuredImage: ''
  });

  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await articleAPI.getArticle(articleId);
        if (data.success && data.article) {
          const articleData = data.article;
          // Map API Article to local Article interface
          const mappedArticle: Article = {
            id: articleData.id,
            title: articleData.title,
            content: articleData.content || '',
            excerpt: articleData.summary || '', // Map summary to excerpt
            category: articleData.category ? { id: articleData.category.id, name: articleData.category.name } : undefined,
            tags: articleData.tags || [],
            status: articleData.status,
            publishedAt: articleData.publishedAt || undefined,
            author: articleData.author ? { name: articleData.author.fullName } : undefined,
            createdAt: articleData.createdAt,
            updatedAt: articleData.updatedAt
          };
          setArticle(mappedArticle);
          
          // Populate form with existing data
          setFormData({
            title: articleData.title || '',
            content: articleData.content || '',
            excerpt: articleData.summary || '', // Use summary as excerpt
            categoryId: articleData.category?.id || '',
            tags: Array.isArray(articleData.tags) ? articleData.tags.join(', ') : '',
            status: articleData.status || 'draft',
            scheduledAt: articleData.publishedAt && articleData.status === 'scheduled' ? new Date(articleData.publishedAt).toISOString().slice(0, 16) : '',
            seoTitle: articleData.title || '', // Fallback to title
            seoDescription: articleData.summary || '', // Fallback to summary
            featuredImage: articleData.imageUrl || ''
          });
        } else {
          throw new Error('Article not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const handleInputChange = (field: keyof ArticleForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (status?: 'draft' | 'scheduled' | 'published'): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.content.trim()) return 'Content is required';
    if (!formData.categoryId) return 'Category is required';
    
    // Check if selected category is active when publishing
    if ((status === 'published' || status === 'scheduled') && formData.categoryId) {
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
      if (selectedCategory && !selectedCategory.isActive) {
        return 'Cannot publish article with inactive category. Please select an active category.';
      }
    }
    
    if (formData.status === 'scheduled' && !formData.scheduledAt) {
      return 'Scheduled date is required for scheduled articles';
    }
    return null;
  };

  const handleSave = async (newStatus: 'draft' | 'scheduled' | 'published') => {
    const validationError = validateForm(newStatus);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updateData = {
        title: formData.title,
        content: formData.content,
        summary: formData.excerpt, // Map excerpt to summary
        categoryId: formData.categoryId, // Keep as string
        tags: tagsArray,
        isPublished: newStatus === 'published',
        ...(newStatus === 'scheduled' && formData.scheduledAt && {
          publishedAt: new Date(formData.scheduledAt).toISOString()
        }),
        ...(newStatus === 'published' && { publishedAt: new Date().toISOString() }),
        imageUrl: formData.featuredImage
      };

      const result = await articleAPI.updateArticle(articleId, updateData);

      if (result.success) {
        // Show success message
        const statusText = newStatus === 'draft' ? 'saved as draft' : 
                          newStatus === 'scheduled' ? 'scheduled for publication' : 'published';
        
        // Redirect back to content list
        router.push(`/admin/content?success=${encodeURIComponent(`Article ${statusText} successfully!`)}`);
      } else {
        throw new Error('Failed to update article');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article');
      console.error('Error updating article:', err);
    } finally {
      setSaving(false);
    }
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading article...</span>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-2">Error Loading Article</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link
            href="/admin/content"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            ← Back to Content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: 'Edit Article', href: `/admin/content/edit/${articleId}` }
        ]}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
        {/* Header */}
        <div className="p-8 border-b border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Article
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Update your article content and settings
              </p>
              {article && (
                <div className="mt-2 text-sm text-slate-500">
                  Created: {new Date(article.createdAt).toLocaleDateString()} • 
                  Last updated: {new Date(article.updatedAt).toLocaleDateString()} • 
                  Author: {article.author?.name || 'Unknown'}
                </div>
              )}
            </div>
            <Link
              href="/admin/content"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-300"
            >
              ← Back to Content
            </Link>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">⚠️ {error}</p>
            </div>
          )}

          {/* Article Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{getWordCount(formData.content)}</div>
              <div className="text-sm text-blue-600/70">Word Count</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600 capitalize">{formData.status}</div>
              <div className="text-sm text-green-600/70">Status</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{formData.tags.split(',').filter(t => t.trim()).length}</div>
              <div className="text-sm text-purple-600/70">Tags</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600">{getWordCount(formData.excerpt)}</div>
              <div className="text-sm text-orange-600/70">Excerpt Words</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/50">
          <div className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              📝 Content
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'seo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              🔍 SEO & Meta
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                previewMode
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              👁️ {previewMode ? 'Exit Preview' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {!previewMode ? (
            <>
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground text-lg"
                      placeholder="Enter article title..."
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground resize-none"
                      rows={3}
                      placeholder="Brief description of the article..."
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground resize-none"
                      rows={20}
                      placeholder="Write your article content here..."
                    />
                  </div>

                  {/* Category and Tags Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => handleInputChange('categoryId', e.target.value)}
                        className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name} {!category.isActive && '(Inactive)'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
                        placeholder="Enter tags separated by commas"
                      />
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.featuredImage}
                      onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Scheduling */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Schedule Publication
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Leave empty to publish immediately or save as draft
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground"
                      placeholder="SEO optimized title..."
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      {formData.seoTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      SEO Meta Description
                    </label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground resize-none"
                      rows={4}
                      placeholder="SEO meta description..."
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      {formData.seoDescription.length}/160 characters
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Preview Mode */
            <div className="prose dark:prose-invert max-w-none">
              <h1>{formData.title || 'Untitled Article'}</h1>
              {formData.excerpt && <p className="text-lg text-slate-600 dark:text-slate-400">{formData.excerpt}</p>}
              {formData.featuredImage && (
                <img src={formData.featuredImage} alt="Featured" className="w-full rounded-lg" />
              )}
              <div className="whitespace-pre-wrap">{formData.content}</div>
              {formData.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-8 border-t border-border/50 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Last saved: {article ? new Date(article.updatedAt).toLocaleString() : 'Never'}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '💾 Saving...' : '💾 Save Draft'}
              </button>
              {formData.scheduledAt && (
                <button
                  onClick={() => handleSave('scheduled')}
                  disabled={saving}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '📅 Scheduling...' : '📅 Schedule'}
                </button>
              )}
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
              >
                {saving ? '🚀 Publishing...' : '🚀 Update & Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArticle;