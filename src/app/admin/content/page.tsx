"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  views: number;
  featured: boolean;
}

const ContentManagement: React.FC = () => {
  const [articles] = useState<Article[]>([
    {
      id: '1',
      title: 'AI Breakthrough in Healthcare Technology',
      category: 'Technology',
      author: 'John Doe',
      status: 'published',
      publishDate: '2024-01-15',
      views: 12500,
      featured: true
    },
    {
      id: '2',
      title: 'Climate Change: Latest Research Findings',
      category: 'Environment',
      author: 'Jane Smith',
      status: 'published',
      publishDate: '2024-01-14',
      views: 8900,
      featured: false
    },
    {
      id: '3',
      title: 'Economic Outlook for 2024',
      category: 'Business',
      author: 'Mike Johnson',
      status: 'draft',
      publishDate: '2024-01-16',
      views: 0,
      featured: false
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = ['Technology', 'Environment', 'Business', 'Politics', 'Sports', 'Entertainment'];
  const statuses = ['draft', 'published', 'scheduled'];

  const filteredArticles = articles.filter(article => {
    const categoryMatch = selectedCategory === 'all' || article.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || article.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Content Management' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Content Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage articles and news content</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              📝 New Article
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              📁 Manage Categories
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{articles.length}</div>
            <div className="text-sm text-muted-foreground">Total Articles</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">
              {articles.filter(a => a.status === 'published').length}
            </div>
            <div className="text-sm text-muted-foreground">Published</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">
              {articles.filter(a => a.status === 'draft').length}
            </div>
            <div className="text-sm text-muted-foreground">Drafts</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">
              {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1"></div>
            <div className="flex space-x-2">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                🔄 Refresh
              </button>
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
                📊 Export
              </button>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Article</th>
                  <th className="text-left p-4 font-medium text-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-foreground">Author</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Publish Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Views</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article, index) => (
                  <tr key={article.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {article.featured && <span className="text-yellow-500">⭐</span>}
                        <div>
                          <div className="font-medium text-foreground">{article.title}</div>
                          <div className="text-sm text-muted-foreground">ID: {article.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                        {article.category}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">{article.author}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(article.status)}`}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">{article.publishDate}</td>
                    <td className="p-4 text-foreground">{article.views.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          ✏️
                        </button>
                        <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                          👁️
                        </button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredArticles.length} of {articles.length} articles
          </div>
          <div className="flex space-x-2">
            <button className="bg-secondary text-secondary-foreground px-3 py-2 rounded hover:bg-secondary/90 transition-colors">
              Previous
            </button>
            <button className="bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
