"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { showToast } from '@/lib/toast';
import { getEmailString } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  articleTitle: string;
  articleId: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  submitDate: string;
  ipAddress: string;
  replies?: Comment[];
}

const CommentModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'spam'>('pending');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setError(null);
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/moderation/queue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch comments');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Map API response to Comment interface
      const mappedComments: Comment[] = (data.comments || []).map((c: any) => ({
        id: c.id,
        author: c.user?.name || c.user?.email || 'Anonymous',
        email: c.user?.email || '',
        content: c.content,
        articleTitle: c.article?.title || 'Unknown Article',
        articleId: c.article?.id || c.articleId,
        status: c.status?.toLowerCase() || 'pending',
        submitDate: new Date(c.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        ipAddress: c.ipAddress || 'Unknown'
      }));

      setComments(mappedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const filteredComments = comments.filter(comment => comment.status === activeTab);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      spam: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const handleCommentAction = async (commentId: string, action: 'approve' | 'reject' | 'spam') => {
    setActionLoading(commentId);
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      const endpoint = action === 'approve' 
        ? `${API_BASE_URL}/api/admin/moderation/comments/${commentId}/approve`
        : `${API_BASE_URL}/api/admin/moderation/comments/${commentId}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: action === 'spam' ? 'Marked as spam' : undefined })
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.error || `Failed to ${action} comment`, 'error');
        return;
      }

      showToast(`Comment ${action}ed successfully!`, 'success');
      
      // Update local state
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, status: action === 'approve' ? 'approved' : (action === 'spam' ? 'spam' : 'rejected') as any }
          : c
      ));
    } catch (err) {
      console.error(`Error ${action}ing comment:`, err);
      showToast(`Failed to ${action} comment`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'spam' | 'delete') => {
    if (selectedComments.length === 0) return;
    
    const actionText = action === 'delete' ? 'deleted' : `${action}ed`;
    if (!confirm(`Are you sure you want to ${action} ${selectedComments.length} comment(s)?`)) {
      return;
    }

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Authentication required', 'error');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const commentId of selectedComments) {
      try {
        const endpoint = action === 'approve' 
          ? `${API_BASE_URL}/api/admin/moderation/comments/${commentId}/approve`
          : `${API_BASE_URL}/api/admin/moderation/comments/${commentId}/reject`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: action === 'spam' ? 'Marked as spam' : undefined })
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      showToast(`${successCount} comment(s) ${actionText} successfully!`, 'success');
      // Refresh comments
      fetchComments();
    }
    if (failCount > 0) {
      showToast(`Failed to ${action} ${failCount} comment(s)`, 'error');
    }
    
    setSelectedComments([]);
  };

  const handleSelectComment = (commentId: string) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(comment => comment.id));
    }
  };

  const commentCounts = {
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    rejected: comments.filter(c => c.status === 'rejected').length,
    spam: comments.filter(c => c.status === 'spam').length
  };

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/' },
            { label: 'Comments & Moderation' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Comments & Moderation</h1>
            <p className="text-muted-foreground">Review comments, moderate user-generated content, and manage discussions</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={fetchComments}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              🔄 Refresh
            </button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              ⚙️ Moderation Settings
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Comments</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchComments}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-2xl font-bold text-foreground">{comments.length}</div>
            <div className="text-sm text-muted-foreground">Total Comments</div>
            <div className="text-xs text-blue-600 mt-1">All time</div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-2xl font-bold text-yellow-600">{commentCounts.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
            <div className="text-xs text-yellow-600 mt-1">Needs attention</div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-2xl font-bold text-green-600">{commentCounts.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-xs text-green-600 mt-1">Live on site</div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-2xl font-bold text-red-600">{commentCounts.spam}</div>
            <div className="text-sm text-muted-foreground">Spam Detected</div>
            <div className="text-xs text-red-600 mt-1">Auto-filtered</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-lg mb-8">
          <div className="border-b border-border">
            <nav className="flex overflow-x-auto space-x-8 px-6">
              {[
                { id: 'pending', label: 'Pending', icon: '⏳', count: commentCounts.pending },
                { id: 'approved', label: 'Approved', icon: '✅', count: commentCounts.approved },
                { id: 'rejected', label: 'Rejected', icon: '❌', count: commentCounts.rejected },
                { id: 'spam', label: 'Spam', icon: '🚫', count: commentCounts.spam }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Bulk Actions */}
            {selectedComments.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 dark:text-blue-400 font-medium">
                    {selectedComments.length} comment(s) selected
                  </span>
                  <div className="flex space-x-2">
                    {activeTab === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleBulkAction('approve')}
                          className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          ✅ Approve
                        </button>
                        <button 
                          onClick={() => handleBulkAction('reject')}
                          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          ❌ Reject
                        </button>
                        <button 
                          onClick={() => handleBulkAction('spam')}
                          className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 transition-colors text-sm"
                        >
                          🚫 Mark as Spam
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleBulkAction('delete')}
                      className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            {filteredComments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No comments found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending' 
                    ? 'No comments are waiting for moderation.'
                    : `No ${activeTab} comments at this time.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-primary hover:text-primary/80 flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                    <span>{selectedComments.length === filteredComments.length ? 'Deselect All' : 'Select All'}</span>
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {filteredComments.length} comment(s) found
                  </span>
                </div>

                {filteredComments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`bg-muted/20 border border-border/50 rounded-2xl p-6 hover:shadow-md transition-all duration-300 ${
                      selectedComments.includes(comment.id) ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={() => handleSelectComment(comment.id)}
                        className="mt-1 rounded"
                      />
                      
                      <div className="flex-1">
                        {/* Comment Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">
                                {comment.author[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{comment.author}</div>
                              <div className="text-sm text-muted-foreground">{getEmailString(comment.email)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(comment.status)}`}>
                              {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">{comment.submitDate}</span>
                          </div>
                        </div>

                        {/* Comment Content */}
                        <div className="bg-background border border-border rounded-lg p-4 mb-3">
                          <p className="text-foreground">{comment.content}</p>
                        </div>

                        {/* Comment Meta */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-4">
                            <span>Article: <span className="text-foreground">{comment.articleTitle}</span></span>
                            <span>IP: {comment.ipAddress}</span>
                          </div>
                          <a 
                            href={`/articles/${comment.articleId}`}
                            className="text-primary hover:text-primary/80"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Article →
                          </a>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {activeTab === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleCommentAction(comment.id, 'approve')}
                                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                              >
                                ✅ Approve
                              </button>
                              <button 
                                onClick={() => handleCommentAction(comment.id, 'reject')}
                                className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                              >
                                ❌ Reject
                              </button>
                              <button 
                                onClick={() => handleCommentAction(comment.id, 'spam')}
                                className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 transition-colors text-sm"
                              >
                                🚫 Spam
                              </button>
                            </>
                          )}
                          <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                            ✏️ Edit
                          </button>
                          <button className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm">
                            💬 Reply
                          </button>
                          <button className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm">
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Moderation Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Auto-Moderation</h4>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-foreground">Auto-approve from trusted users</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-foreground">Auto-reject spam comments</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-foreground">Require approval for all comments</span>
              </label>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Notifications</h4>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-foreground">Email on new comments</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-foreground">Daily moderation digest</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-foreground">Slack notifications</span>
              </label>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Spam Protection</h4>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-foreground">Enable reCAPTCHA</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-foreground">Block suspicious IPs</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-foreground">Require registration to comment</span>
              </label>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default CommentModeration;


