"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { articleAPI, type Article } from '@/lib/api';
import Breadcrumb from '@/components/Breadcrumb';
import ArticlePreview from '@/components/ArticlePreview';

interface ArticleForm {
  title: string;
  content: string; // HTML content (rich text)
  summary: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published';
  featured: boolean;
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  imageUrl: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Dynamically import BeautifulEditor client-side only - MOVED OUTSIDE COMPONENT
const BeautifulEditor = dynamic(() => import('@/components/BeautifulEditor'), { 
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-8">
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading editor...</span>
      </div>
    </div>
  )
});

const NewArticle: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editingId = searchParams.get('id'); // Get article ID for editing
  const isEditing = !!editingId;

  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    content: '',
    summary: '',
    categoryId: '',
    tags: [],
    status: 'draft',
    featured: false,
    publishDate: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    imageUrl: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  
  // Debounced content for preview updates
  const [debouncedContent, setDebouncedContent] = useState(formData.content);
  const [previewUpdating, setPreviewUpdating] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(formData.content);

  // Auto-save to localStorage
  useEffect(() => {
    if (!isEditing && formData.title) { // Only auto-save for new articles with content
      setAutoSaveStatus('saving');
      const timeoutId = setTimeout(() => {
        localStorage.setItem('newArticleDraft', JSON.stringify({
          ...formData,
          timestamp: Date.now()
        }));
        setAutoSaveStatus('saved');
      }, 2000); // Save 2 seconds after last change
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, isEditing]);

  // Debounce content updates for preview
  useEffect(() => {
    // Only proceed if content actually changed
    if (formData.content === lastContentRef.current) {
      return;
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Show updating status when content changes
    setPreviewUpdating(true);
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedContent(formData.content);
      setPreviewUpdating(false);
      lastContentRef.current = formData.content;
    }, 500); // Update preview 500ms after user stops typing
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [formData.content]); // Remove debouncedContent from dependencies to prevent infinite loop

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save as draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit('draft');
      }
      
      // Ctrl+Shift+P or Cmd+Shift+P to toggle preview
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setViewMode(prev => prev === 'preview' ? 'edit' : 'preview');
      }
      
      // Ctrl+Shift+S or Cmd+Shift+S to toggle split view
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setViewMode(prev => prev === 'split' ? 'edit' : 'split');
      }
      
      // Ctrl+Enter or Cmd+Enter to publish
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (formData.title && formData.content && formData.categoryId) {
          handleSubmit('published');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formData.title, formData.content, formData.categoryId]);

  // Load draft on mount
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem('newArticleDraft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          // Only load if it's less than 24 hours old
          if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
            const shouldLoad = confirm('Found a saved draft from your last session. Load it?');
            if (shouldLoad) {
              setFormData(draft);
              setAutoSaveStatus('unsaved');
            }
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [isEditing]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load categories and article (if editing) on component mount
  useEffect(() => {
    fetchCategories();
    if (isEditing && editingId) {
      fetchArticleForEditing(editingId);
    }
  }, [isEditing, editingId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories if API fails
      setCategories([
        { id: '1', name: 'Technology', slug: 'technology' },
        { id: '2', name: 'Business', slug: 'business' },
        { id: '3', name: 'Environment', slug: 'environment' },
        { id: '4', name: 'Politics', slug: 'politics' },
        { id: '5', name: 'Sports', slug: 'sports' },
        { id: '6', name: 'Health', slug: 'health' },
        { id: '7', name: 'Science', slug: 'science' },
        { id: '8', name: 'Entertainment', slug: 'entertainment' }
      ]);
    }
  };

  const fetchArticleForEditing = async (articleId: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await articleAPI.getArticle(articleId);
      if (response.success && response.article) {
        const article = response.article;
        
        // Populate form with existing article data
        setFormData({
          title: article.title || '',
          content: article.content || '',
          summary: article.summary || '',
          categoryId: article.category?.id || '',
          tags: Array.isArray(article.tags) ? article.tags : [],
          status: article.status || 'draft',
          featured: article.isFeatured || false,
          publishDate: article.publishedAt ? 
            new Date(article.publishedAt).toISOString().slice(0, 16) : '',
          seoTitle: '', // TODO: Add SEO fields to API
          seoDescription: '',
          seoKeywords: [],
          imageUrl: article.imageUrl || ''
        });

        // Content will be loaded directly into the editor via the value prop
      } else {
        throw new Error('Article not found');
      }
    } catch (err) {
      let message = 'Failed to load article';
      if (err instanceof Error) {
        message = err.message;
        // Enhance network diagnostics
        if (/Backend server is not accessible/i.test(err.message)) {
          message += '\nTroubleshooting: Ensure Express API is running on ' + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api') + '\nIf your backend uses a different port, set NEXT_PUBLIC_API_URL accordingly.';
        } else if (/401|Invalid or expired token/i.test(err.message)) {
          message += '\nAuthentication issue: Re-login to admin panel.';
        } else if (/Failed to fetch|NetworkError/i.test(err.message)) {
          message += '\nNetwork error: Check CORS, server status, or mixed content (HTTP vs HTTPS).';
        }
      }
      setError(message);
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field: keyof ArticleForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user makes changes
  }, []);

  // Optimize editor onChange to prevent re-renders
  const handleEditorChange = useCallback((html: string, plain: string) => {
    handleInputChange('content', html);
    setPlainTextCount(plain.split(/\s+/).filter((w: string) => w.length).length);
  }, [handleInputChange]);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return result.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }, []);
  const [plainTextCount, setPlainTextCount] = useState(0);

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

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seoKeywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const validateForm = (status: 'draft' | 'scheduled' | 'published') => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    if (status === 'published' || status === 'scheduled') {
      if (!formData.categoryId) {
        setError('Category is required for published articles');
        return false;
      }
      if (!formData.summary.trim()) {
        setError('Summary is required for published articles');
        return false;
      }
    }
    if (status === 'scheduled' && !formData.publishDate) {
      setError('Publish date is required for scheduled articles');
      return false;
    }
    return true;
  };

  const handleSubmit = async (status: 'draft' | 'scheduled' | 'published') => {
    if (!validateForm(status)) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const articleData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        categoryId: formData.categoryId || undefined,
        imageUrl: formData.imageUrl || undefined,
        tags: formData.tags,
        isPublished: status === 'published',
        publishedAt: status === 'scheduled' ? formData.publishDate : undefined,
        isFeatured: formData.featured,
        isTrending: false,
        isBreaking: false
      };

      let response;
      if (isEditing && editingId) {
        response = await articleAPI.updateArticle(editingId, articleData);
      } else {
        response = await articleAPI.createArticle(articleData);
      }

      if (response.success) {
        const actionText = isEditing ? 'updated' : 
          (status === 'draft' ? 'saved as draft' : 
           status === 'scheduled' ? 'scheduled' : 'published');
        
        alert(`Article ${actionText} successfully!`);
        
        // Redirect to content management
        router.push('/admin/content');
        
        // Reset form only for new articles (not when editing)
        if (!isEditing) {
          setFormData({
            title: '',
            content: '',
            summary: '',
            categoryId: '',
            tags: [],
            status: 'draft',
            featured: false,
            publishDate: '',
            seoTitle: '',
            seoDescription: '',
            seoKeywords: [],
            imageUrl: ''
          });
        }
      } else {
        setError('Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setError(error instanceof Error ? error.message : 'Failed to save article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Form renderer (shared between Edit & Split modes)
  const renderArticleForm = () => (
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
          placeholder="Enter a compelling article title..."
          className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
        />
      </div>

      {/* Category / Publish Date / Featured */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Category *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
            className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
          >
            <option value="">Select category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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

      {/* Summary */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Summary *
        </label>
        <textarea
          value={formData.summary}
          onChange={(e) => handleInputChange('summary', e.target.value)}
          placeholder="Brief summary of the article (50-300 characters)..."
          rows={3}
          maxLength={300}
          className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">{formData.summary.length}/300 characters</p>
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
            type="button"
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
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* SEO Settings */}
      <div className="space-y-6 border-t border-border/50 pt-6">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">SEO Settings</h3>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            SEO Title
          </label>
          <input
            type="text"
            value={formData.seoTitle}
            onChange={(e) => handleInputChange('seoTitle', e.target.value)}
            placeholder="SEO-optimized title (leave blank to use article title)"
            maxLength={60}
            className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
          />
          <p className="text-xs text-slate-500 mt-1">{formData.seoTitle.length}/60 characters</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            SEO Description
          </label>
          <textarea
            value={formData.seoDescription}
            onChange={(e) => handleInputChange('seoDescription', e.target.value)}
            placeholder="Brief description for SEO (150-160 characters)..."
            rows={2}
            maxLength={160}
            className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">{formData.seoDescription.length}/160 characters</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            SEO Keywords
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              placeholder="Add SEO keyword..."
              className="flex-1 px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.seoKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Featured Image URL
        </label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
        />
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Article Content *
        </label>
        <BeautifulEditor
          value={formData.content}
          onChange={handleEditorChange}
          onImageUpload={handleImageUpload}
        />
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>HTML length: {formData.content.length}</span>
          <span>Words: {plainTextCount}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-border/50">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-300 font-medium disabled:opacity-50"
          >
            {saving ? '⏳ Saving...' : '💾 Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('scheduled')}
            disabled={!formData.publishDate || saving}
            className="px-6 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '⏳ Scheduling...' : '⏰ Schedule'}
          </button>
        </div>
        <button
          onClick={() => handleSubmit('published')}
          disabled={!formData.title || !formData.content || !formData.categoryId || saving}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '⏳ Processing...' : (isEditing ? '✨ Update & Publish' : '✨ Publish Article')}
        </button>
      </div>
    </div>
  );

  const renderPreview = (tall: boolean) => (
    <div className={`space-y-4 ${tall ? '' : ''}`}>
      <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
        <span className="mr-2">👁️</span>
        Live Preview
        {previewUpdating && (
          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full animate-pulse">
            Updating...
          </span>
        )}
      </div>
      <div 
        className={`bg-slate-50 dark:bg-slate-800 rounded-xl p-6 ${tall ? 'h-[80vh] overflow-y-auto scroll-smooth' : ''}`}
      >
        <ArticlePreview
          title={formData.title}
          summary={formData.summary}
          content={debouncedContent}
          author="Admin"
          category={categories.find(cat => cat.id === formData.categoryId)?.name || ''}
          tags={formData.tags}
          imageUrl={formData.imageUrl}
          publishDate={formData.publishDate}
          seoTitle={formData.seoTitle}
          seoDescription={formData.seoDescription}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content', href: '/admin/content' },
          { label: isEditing ? 'Edit Article' : 'New Article', href: '/admin/content/new' }
        ]}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-border/50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {isEditing ? 'Update your article content and settings' : 'Write and publish engaging content for your audience'}
            </p>
            {loading && (
              <div className="flex items-center mt-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading article...
              </div>
            )}
            {/* Auto-save Status */}
            {!isEditing && (
              <div className="flex items-center mt-2 text-sm">
                {autoSaveStatus === 'saving' && (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-600">Saving draft...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600">Draft saved</span>
                  </>
                )}
                {autoSaveStatus === 'unsaved' && (
                  <>
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-orange-600">Unsaved changes</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'edit' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📝 Edit
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'split' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Split view - content editor and live preview side-by-side with debounced updates"
              >
                🔀 Split
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'preview' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                👁️ Preview
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {viewMode === 'split' && (
            <div className="space-y-8">
              {/* Metadata Section at Top */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Summary *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Brief summary of the article..."
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.summary.length}/300 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
                  />
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishDate}
                      onChange={(e) => handleInputChange('publishDate', e.target.value)}
                      className="w-full px-4 py-2 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-start space-y-4">
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
                  <div className="text-xs text-slate-500 bg-white dark:bg-slate-900 p-3 rounded-lg">
                    <strong>Shortcuts:</strong><br/>
                    Ctrl+S (Save)<br/>
                    Ctrl+Enter (Publish)<br/>
                    Ctrl+Shift+S (Split)
                  </div>
                </div>
              </div>

              {/* Title Section - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a compelling article title..."
                    className="w-full px-4 py-3 border border-border/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Title Preview
                  </label>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border/50 min-h-[3.25rem] flex items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formData.title || 'Your title will appear here...'}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Content Section - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Article Content *
                  </label>
                  <BeautifulEditor
                    value={formData.content}
                    onChange={handleEditorChange}
                    onImageUpload={handleImageUpload}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>HTML length: {formData.content.length}</span>
                    <span>Words: {plainTextCount}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Content Preview
                    </label>
                    {previewUpdating && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full animate-pulse">
                        Updating...
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 min-h-[320px] max-h-[600px] overflow-y-auto border border-border/50">
                    <article className="prose prose-lg dark:prose-invert max-w-none">
                      {debouncedContent ? (
                        <div 
                          className="text-slate-700 dark:text-slate-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: debouncedContent }}
                        />
                      ) : (
                        <div className="text-slate-400 dark:text-slate-500 italic text-center py-12">
                          Content preview will appear here as you write...
                        </div>
                      )}
                    </article>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-border/50">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleSubmit('draft')}
                    disabled={saving}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-300 font-medium disabled:opacity-50"
                  >
                    {saving ? '⏳ Saving...' : '💾 Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('scheduled')}
                    disabled={!formData.publishDate || saving}
                    className="px-6 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '⏳ Scheduling...' : '⏰ Schedule'}
                  </button>
                </div>
                <button
                  onClick={() => handleSubmit('published')}
                  disabled={!formData.title || !formData.content || !formData.categoryId || saving}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '⏳ Processing...' : (isEditing ? '✨ Update & Publish' : '✨ Publish Article')}
                </button>
              </div>
            </div>
          )}
          
          {viewMode === 'edit' && renderArticleForm()}
          
          {viewMode === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
                  <span className="mr-2">👁️</span> Full Article Preview
                </h2>
                <button
                  onClick={() => setViewMode('edit')}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  ← Back to Edit
                </button>
              </div>
              {renderPreview(false)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewArticle;
