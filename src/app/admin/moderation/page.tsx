"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

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
  
  const [comments] = useState<Comment[]>([
    {
      id: '1',
      author: 'John Smith',
      email: 'john@example.com',
      content: 'Great article! I really learned a lot about AI in healthcare. Looking forward to more content like this.',
      articleTitle: 'AI Breakthrough in Healthcare Technology',
      articleId: 'article-1',
      status: 'pending',
      submitDate: '2024-01-15 14:30',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      author: 'Sarah Johnson',
      email: 'sarah@example.com',
      content: 'I disagree with some of the points made here. The research seems incomplete and biased.',
      articleTitle: 'Climate Change: Latest Research Findings',
      articleId: 'article-2',
      status: 'pending',
      submitDate: '2024-01-15 13:45',
      ipAddress: '192.168.1.101'
    },
    {
      id: '3',
      author: 'Mike Wilson',
      email: 'mike@example.com',
      content: 'Thanks for sharing this information. Very helpful and well-researched.',
      articleTitle: 'Economic Outlook for 2024',
      articleId: 'article-3',
      status: 'approved',
      submitDate: '2024-01-14 16:20',
      ipAddress: '192.168.1.102'
    },
    {
      id: '4',
      author: 'Anonymous User',
      email: 'spam@fake.com',
      content: 'BUY CHEAP PRODUCTS NOW!!! CLICK HERE FOR AMAZING DEALS!!!',
      articleTitle: 'AI Breakthrough in Healthcare Technology',
      articleId: 'article-1',
      status: 'spam',
      submitDate: '2024-01-14 12:15',
      ipAddress: '192.168.1.103'
    },
    {
      id: '5',
      author: 'Emily Davis',
      email: 'emily@example.com',
      content: 'This article contains false information and should be fact-checked.',
      articleTitle: 'Climate Change: Latest Research Findings',
      articleId: 'article-2',
      status: 'rejected',
      submitDate: '2024-01-13 10:30',
      ipAddress: '192.168.1.104'
    }
  ]);

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

  const handleCommentAction = (commentId: string, action: 'approve' | 'reject' | 'spam') => {
    // In a real application, this would update the comment status in the database
    console.log(`${action} comment ${commentId}`);
    alert(`Comment ${action}ed successfully!`);
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'spam' | 'delete') => {
    if (selectedComments.length === 0) return;
    
    const actionText = action === 'delete' ? 'deleted' : `${action}ed`;
    if (confirm(`Are you sure you want to ${action} ${selectedComments.length} comment(s)?`)) {
      console.log(`Bulk ${action}:`, selectedComments);
      alert(`${selectedComments.length} comment(s) ${actionText} successfully!`);
      setSelectedComments([]);
    }
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
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Comments & Moderation' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Comments & Moderation</h1>
            <p className="text-muted-foreground">Review comments, moderate user-generated content, and manage discussions</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              ⚙️ Moderation Settings
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              📊 Export Report
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{comments.length}</div>
            <div className="text-sm text-muted-foreground">Total Comments</div>
            <div className="text-xs text-blue-600 mt-1">All time</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-yellow-600">{commentCounts.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
            <div className="text-xs text-yellow-600 mt-1">Needs attention</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-green-600">{commentCounts.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-xs text-green-600 mt-1">Live on site</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-red-600">{commentCounts.spam}</div>
            <div className="text-sm text-muted-foreground">Spam Detected</div>
            <div className="text-xs text-red-600 mt-1">Auto-filtered</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
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
                    className={`bg-muted/20 border border-border rounded-lg p-6 ${
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
                              <div className="text-sm text-muted-foreground">{comment.email}</div>
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
                        <div className="flex space-x-2">
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
        <div className="bg-card border border-border rounded-lg p-6">
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
      </div>
    </div>
  );
};

export default CommentModeration;
