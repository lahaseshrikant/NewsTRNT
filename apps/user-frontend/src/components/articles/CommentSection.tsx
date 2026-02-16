'use client';

import React, { useState, useEffect } from 'react';

// Simple relative time formatter
const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

interface Comment {
  id: string;
  content: string;
  displayName: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
  likeCount: number;
  createdAt: string;
  replies: Comment[];
}

interface CommentSectionProps {
  articleId: string;
  userId?: string | null;
  userDisplayName?: string;
}

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

const CommentSection: React.FC<CommentSectionProps> = ({ 
  articleId, 
  userId,
  userDisplayName 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New comment form
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadComments();
  }, [articleId, page]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/comments/article/${articleId}?page=${page}&limit=10`
      );
      
      if (!response.ok) throw new Error('Failed to load comments');
      
      const data = await response.json();
      
      if (page === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
      
      setHasMore(page < data.pagination.totalPages);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    if (newComment.length < 2) {
      setError('Comment must be at least 2 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: newComment.trim(),
          userId: isAnonymous ? null : userId,
          displayName: isAnonymous ? (anonymousName.trim() || 'Anonymous') : userDisplayName,
          isAnonymous
        })
      });
      
      if (!response.ok) throw new Error('Failed to post comment');
      
      const comment = await response.json();
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setAnonymousName('');
      setIsAnonymous(false);
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: replyContent.trim(),
          parentId,
          userId: isAnonymous ? null : userId,
          displayName: isAnonymous ? 'Anonymous' : userDisplayName,
          isAnonymous
        })
      });
      
      if (!response.ok) throw new Error('Failed to post reply');
      
      const reply = await response.json();
      
      // Add reply to the parent comment
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply]
          };
        }
        return comment;
      }));
      
      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/like`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to like comment');
      
      const data = await response.json();
      
      // Update like count in state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likeCount: data.likeCount };
        }
        // Check replies
        return {
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId 
              ? { ...reply, likeCount: data.likeCount }
              : reply
          )
        };
      }));
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleFlagComment = async (commentId: string) => {
    if (!confirm('Report this comment for review?')) return;
    
    try {
      await fetch(`${API_URL}/comments/${commentId}/flag`, {
        method: 'POST'
      });
      alert('Comment reported. Thank you for helping keep our community safe.');
    } catch (err) {
      console.error('Error flagging comment:', err);
    }
  };

  const formatTime = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => (
    <div className={`${isReply ? 'ml-8 mt-3' : 'border-b border-border pb-4 mb-4'}`}>
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0`}>
          {comment.avatarUrl ? (
            <img 
              src={comment.avatarUrl} 
              alt={comment.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-sm font-medium">
              {comment.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-foreground text-sm">
              {comment.displayName}
            </span>
            {comment.isAnonymous && (
              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                Anonymous
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          
          <p className="text-foreground text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          
          {/* Actions */}
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => handleLikeComment(comment.id)}
              className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{comment.likeCount > 0 ? comment.likeCount : 'Like'}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Reply
              </button>
            )}
            
            <button
              onClick={() => handleFlagComment(comment.id)}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              Report
            </button>
          </div>
          
          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={2}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        💬 Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        )}
      </h3>
      
      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={3}
          maxLength={2000}
        />
        
        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">Post anonymously</span>
            </label>
            
            {isAnonymous && (
              <input
                type="text"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                placeholder="Display name (optional)"
                className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                maxLength={30}
              />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/2000
            </span>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>
      
      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded">
          {error}
        </div>
      )}
      
      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <>
          <div className="space-y-0">
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
          
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
              className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more comments'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;
