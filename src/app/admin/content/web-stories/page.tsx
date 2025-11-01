"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

interface WebStory {
  id: string;
  title: string;
  category: string;
  slides: number;
  status: 'published' | 'draft' | 'archived';
  publishedAt: string;
  author: string;
  views: number;
  likes: number;
  shares: number;
  duration: number;
  coverImage: string;
  isFeature: boolean;
  priority: 'high' | 'normal' | 'low';
}

const WebStoriesAdmin: React.FC = () => {
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'title' | 'performance'>('date');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Web Stories data
  const webStories: WebStory[] = [
    {
      id: '1',
      title: 'Climate Summit 2024: Key Highlights',
      category: 'Environment',
      slides: 4,
      status: 'published',
      publishedAt: '2024-01-21T10:30:00Z',
      author: 'Environmental Team',
      views: 12540,
      likes: 892,
      shares: 234,
      duration: 45,
      coverImage: '/api/placeholder/400/600',
      isFeature: true,
      priority: 'high'
    },
    {
      id: '2',
      title: 'AI Revolution in Healthcare',
      category: 'Technology',
      slides: 5,
      status: 'published',
      publishedAt: '2024-01-21T08:15:00Z',
      author: 'Tech News',
      views: 8920,
      likes: 445,
      shares: 178,
      duration: 60,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'high'
    },
    {
      id: '3',
      title: 'Space Mission Success',
      category: 'Science',
      slides: 3,
      status: 'published',
      publishedAt: '2024-01-20T16:45:00Z',
      author: 'Space Desk',
      views: 15670,
      likes: 1234,
      shares: 445,
      duration: 50,
      coverImage: '/api/placeholder/400/600',
      isFeature: true,
      priority: 'normal'
    },
    {
      id: '4',
      title: 'Economic Outlook 2024 - Draft',
      category: 'Business',
      slides: 2,
      status: 'draft',
      publishedAt: '2024-01-20T12:30:00Z',
      author: 'Business Team',
      views: 0,
      likes: 0,
      shares: 0,
      duration: 40,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'normal'
    },
    {
      id: '5',
      title: 'Sports Championship Finals',
      category: 'Sports',
      slides: 6,
      status: 'published',
      publishedAt: '2024-01-19T20:00:00Z',
      author: 'Sports Desk',
      views: 22100,
      likes: 1890,
      shares: 567,
      duration: 75,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'normal'
    },
    {
      id: '6',
      title: 'Celebrity Red Carpet Event',
      category: 'Entertainment',
      slides: 4,
      status: 'archived',
      publishedAt: '2024-01-19T18:30:00Z',
      author: 'Entertainment',
      views: 18900,
      likes: 1456,
      shares: 389,
      duration: 30,
      coverImage: '/api/placeholder/400/600',
      isFeature: false,
      priority: 'low'
    }
  ];

  const filteredStories = webStories.filter(story => {
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'views':
        return b.views - a.views;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'performance':
        return (b.likes + b.shares) - (a.likes + a.shares);
      default:
        return 0;
    }
  });

  const handleSelectAll = () => {
    if (selectedStories.length === filteredStories.length) {
      setSelectedStories([]);
    } else {
      setSelectedStories(filteredStories.map(story => story.id));
    }
  };

  const handleSelectStory = (storyId: string) => {
    setSelectedStories(prev => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} on stories:`, selectedStories);
    // Implement bulk actions
    setSelectedStories([]);
  };

  const getStatusBadge = (status: WebStory['status']) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
    };
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: WebStory['priority']) => {
    const priorityConfig = {
      high: { color: 'bg-red-100 text-red-800', label: 'High', icon: '🔥' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normal', icon: '📊' },
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low', icon: '📝' }
    };
    const config = priorityConfig[priority];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center space-x-1`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalStories = webStories.length;
  const publishedStories = webStories.filter(s => s.status === 'published').length;
  const draftStories = webStories.filter(s => s.status === 'draft').length;
  const totalViews = webStories.reduce((sum, s) => sum + s.views, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb 
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Content', href: '/admin/content' },
              { label: 'Web Stories' }
            ]} 
            className="mb-4" 
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                📱 Web Stories Management
              </h1>
              <p className="text-xl text-muted-foreground">
                Create and manage immersive visual stories
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin/content/web-stories/create"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Create New Story
              </Link>
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors">
                Import Stories
              </button>
            </div>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stories</p>
                <p className="text-2xl font-bold text-foreground">{totalStories}</p>
                <p className="text-sm text-blue-600">+3 this week</p>
              </div>
              <div className="text-3xl">📱</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-foreground">{publishedStories}</p>
                <p className="text-sm text-green-600">+2 this week</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-foreground">{draftStories}</p>
                <p className="text-sm text-yellow-600">1 pending review</p>
              </div>
              <div className="text-3xl">✏️</div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{formatViews(totalViews)}</p>
                <p className="text-sm text-green-600">+15.3% vs last week</p>
              </div>
              <div className="text-3xl">👁️</div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground w-64"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="date">Sort by Date</option>
                <option value="views">Sort by Views</option>
                <option value="title">Sort by Title</option>
                <option value="performance">Sort by Performance</option>
              </select>
            </div>

            {selectedStories.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Publish ({selectedStories.length})
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  Archive ({selectedStories.length})
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Delete ({selectedStories.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stories Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStories.length === filteredStories.length && filteredStories.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Story</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Performance</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Details</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStories.map((story) => (
                  <tr key={story.id} className="border-t border-border hover:bg-muted/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedStories.includes(story.id)}
                        onChange={() => handleSelectStory(story.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${story.coverImage})` }}
                          />
                        </div>
                        <div>
                          <Link 
                            href={`/admin/content/web-stories/${story.id}`}
                            className="font-medium text-foreground hover:text-primary line-clamp-2"
                          >
                            {story.title}
                          </Link>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                            <span>{story.category}</span>
                            <span>•</span>
                            <span>{story.slides} slides</span>
                            <span>•</span>
                            <span>{formatDuration(story.duration)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            By {story.author} • {new Date(story.publishedAt).toLocaleDateString()}
                          </div>
                          {story.isFeature && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(story.status)}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <span>👁️</span>
                          <span className="font-medium">{formatViews(story.views)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>❤️</span>
                          <span>{story.likes}</span>
                          <span>📤</span>
                          <span>{story.shares}</span>
                        </div>
                        {story.status === 'published' && (
                          <div className="text-xs text-muted-foreground">
                            {((story.likes + story.shares) / story.views * 100).toFixed(1)}% engagement
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <div>Duration: {formatDuration(story.duration)}</div>
                        <div>Slides: {story.slides}</div>
                        <div>Category: {story.category}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(story.priority)}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/web-stories/${story.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/content/web-stories/create?id=${story.id}`}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Edit
                        </Link>
                        <button className="text-yellow-600 hover:text-yellow-800 text-sm">
                          Clone
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No web stories found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first web story to get started'
              }
            </p>
            <Link
              href="/admin/content/web-stories/create"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Create First Web Story
            </Link>
          </div>
        )}

        {/* Pagination */}
        {filteredStories.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {filteredStories.length} of {totalStories} stories
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                1
              </button>
              <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                2
              </button>
              <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebStoriesAdmin;

