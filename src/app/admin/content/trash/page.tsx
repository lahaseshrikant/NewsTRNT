'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, RotateCcw, AlertTriangle, Search, Filter } from 'lucide-react';
import { showToast } from '@/lib/toast';
import UnifiedAdminGuard from '@/components/UnifiedAdminGuard';
import AdminJWTBridge from '@/lib/admin-jwt-bridge';
import Breadcrumb from '@/components/Breadcrumb';
import api from '@/lib/api-client';

interface TrashItem {
  id: string;
  title?: string;
  name?: string;
  type: 'article' | 'category' | 'tag' | 'webstory';
  deletedAt: string;
  deletedBy: string;
  articleCount?: number;
  slides?: number;
  author?: string;
  category?: {
    name: string;
    slug: string;
  };
}

const TrashPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'category' | 'tag' | 'webstory'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Get admin auth headers using the JWT bridge
  const getAuthHeaders = (): Record<string, string> => {
    try {
      const token = AdminJWTBridge.getJWTToken();
      if (!token) {
        console.warn('No admin token found');
        return {
          'Content-Type': 'application/json'
        };
      }
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
  };

  const fetchTrashItems = async () => {
    try {
      setLoading(true);
      
      // Use secure API client - NEVER touches database directly
      const [articlesResult, categoriesResult, webstoriesResult] = await Promise.all([
        api.articles.getTrash(),
        api.categories.getTrash(),
        api.webstories.getTrash()
      ]);

      const trashItems: TrashItem[] = [];

      // Process articles
      if (articlesResult.success && articlesResult.data) {
        const articlesData = articlesResult.data as any;
        const articles = articlesData.articles || articlesData;
        (Array.isArray(articles) ? articles : []).forEach((article: any) => {
          trashItems.push({
            id: article.id,
            title: article.title,
            type: 'article',
            deletedAt: article.deletedAt,
            deletedBy: article.deletedBy,
            category: article.category
          });
        });
      }

      // Process categories
      if (categoriesResult.success && categoriesResult.data) {
        const categoriesData = categoriesResult.data as any;
        const categories = categoriesData.categories || categoriesData;
        (Array.isArray(categories) ? categories : []).forEach((category: any) => {
          trashItems.push({
            id: category.id,
            name: category.name,
            type: 'category',
            deletedAt: category.deletedAt,
            deletedBy: category.deletedBy,
            articleCount: category.articleCount
          });
        });
      }

      // Process web stories
      if (webstoriesResult.success && webstoriesResult.data) {
        const webstoriesData = webstoriesResult.data as any;
        const webStories = webstoriesData.webStories || webstoriesData;
        (Array.isArray(webStories) ? webStories : []).forEach((webStory: any) => {
          trashItems.push({
            id: webStory.id,
            title: webStory.title,
            type: 'webstory',
            deletedAt: webStory.deletedAt,
            deletedBy: webStory.deletedBy,
            slides: webStory.slides,
            author: webStory.author,
            category: webStory.category ? {
              name: webStory.category,
              slug: webStory.categorySlug
            } : undefined
          });
        });
      }

      // Sort by deletion date (newest first)
      trashItems.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
      
      setItems(trashItems);
      
      // Handle any API errors
      if (!articlesResult.success) {
        console.warn('Failed to fetch articles from trash:', articlesResult.error?.message);
      }
      if (!categoriesResult.success) {
        console.warn('Failed to fetch categories from trash:', categoriesResult.error?.message);
      }
      if (!webstoriesResult.success) {
        console.warn('Failed to fetch web stories from trash:', webstoriesResult.error?.message);
      }
    } catch (error) {
      console.error('Error fetching trash items:', error);
      showToast('Failed to load trash items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashItems();
  }, []);

  const handleRestore = async (item: TrashItem) => {
    try {
      let endpoint = '';
      if (item.type === 'article') {
        endpoint = `/api/articles/${item.id}/restore`;
      } else if (item.type === 'category') {
        endpoint = `/api/categories/${item.id}/restore`;
      } else if (item.type === 'webstory') {
        endpoint = `/api/webstories/admin/${item.id}/restore`;
      }
      
      const headers = getAuthHeaders();
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers
      });

      if (response.ok) {
        const displayName = item.type === 'category' ? item.name : item.title;
        showToast(`${displayName} restored successfully`, 'success');
        fetchTrashItems(); // Refresh the list
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to restore item', 'error');
      }
    } catch (error) {
      console.error('Error restoring item:', error);
      showToast('Failed to restore item', 'error');
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    const displayName = item.type === 'category' ? item.name : item.title;
    const confirmDelete = confirm(`Are you sure you want to permanently delete "${displayName}"? This action cannot be undone.`);
    
    if (!confirmDelete) return;

    try {
      let endpoint = '';
      if (item.type === 'article') {
        endpoint = `/api/articles/${item.id}?permanent=true`;
      } else if (item.type === 'category') {
        endpoint = `/api/categories/${item.id}?permanent=true`;
      } else if (item.type === 'webstory') {
        endpoint = `/api/webstories/admin/${item.id}?permanent=true`;
      }
      
      const headers = getAuthHeaders();
        
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        showToast(`${item.type === 'article' ? item.title : item.name} permanently deleted`, 'success');
        fetchTrashItems(); // Refresh the list
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to delete item permanently', 'error');
      }
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      showToast('Failed to delete item permanently', 'error');
    }
  };

  const handleBulkRestore = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      const headers = getAuthHeaders();
      
      const promises = selectedItems.map(async (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        
        const endpoint = item.type === 'article' 
          ? `/api/articles/${item.id}/restore`
          : `/api/categories/${item.id}/restore`;
          
        return fetch(endpoint, {
          method: 'POST',
          headers
        });
      });

      await Promise.all(promises);
      showToast(`${selectedItems.length} items restored successfully`, 'success');
      setSelectedItems([]);
      fetchTrashItems();
    } catch (error) {
      console.error('Error restoring items:', error);
      showToast('Failed to restore selected items', 'error');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'category':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'tag':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'webstory':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-background text-foreground">
      <Breadcrumb 
        items={[
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'Content Management', href: '/admin/content' },
          { label: 'Trash' }
        ]} 
        className="mb-6" 
      />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            Trash
          </h1>
          <p className="text-muted-foreground mt-1">
            Recover or permanently delete content
          </p>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleBulkRestore}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Restore Selected ({selectedItems.length})
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg shadow-md">
        {/* Search and Filter */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search trash..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="relative">
              <Filter className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <select
                className="pl-10 pr-8 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-background text-foreground"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="article">Articles</option>
                <option value="category">Categories</option>
                <option value="tag">Tags</option>
                <option value="webstory">Web Stories</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="overflow-x-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || filterType !== 'all' ? 'No items found' : 'Trash is empty'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Deleted items will appear here'
                }
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Deleted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {item.title || item.name}
                        </div>
                        {item.category && (
                          <div className="text-sm text-muted-foreground">
                            Category: {item.category.name}
                          </div>
                        )}
                        {item.articleCount !== undefined && (
                          <div className="text-sm text-muted-foreground">
                            {item.articleCount} articles
                          </div>
                        )}
                        {item.type === 'webstory' && item.slides !== undefined && (
                          <div className="text-sm text-muted-foreground">
                            {item.slides} slides
                          </div>
                        )}
                        {item.type === 'webstory' && item.author && (
                          <div className="text-sm text-muted-foreground">
                            Author: {item.author}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(item.deletedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(item)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminTrashPage() {
  return (
    <UnifiedAdminGuard>
      <TrashPage />
    </UnifiedAdminGuard>
  );
}