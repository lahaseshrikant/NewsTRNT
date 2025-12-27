"use client";

import React, { useState, useEffect } from 'react';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isAnonymous: boolean;
  likes: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/comments?articleId=${articleId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadComments();
    }
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: newComment,
          author: isAnonymous ? 'Anonymous' : (authorName || 'Guest'),
          isAnonymous
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        setAuthorName('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          parentId,
          content: replyContent,
          author: isAnonymous ? 'Anonymous' : (authorName || 'Guest'),
          isAnonymous
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data.comment]
            };
          }
          return comment;
        }));
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes: comment.likes + 1 };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply
            )
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 mt-3' : 'border-b border-border pb-4 mb-4'}`}>
      <div className="flex items-start space-x-3">
        <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
          <span className={`${isReply ? 'text-sm' : 'text-lg'}`}>
            {comment.isAnonymous ? '🎭' : comment.author.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-foreground text-sm">
              {comment.isAnonymous ? 'Anonymous' : comment.author}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-foreground text-sm leading-relaxed mb-2">
            {comment.content}
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={() => handleLike(comment.id)}
              className="text-muted-foreground hover:text-primary flex items-center space-x-1"
            >
              <span>👍</span>
              <span>{comment.likes || 0}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-muted-foreground hover:text-primary"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={2}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReply(comment.id)}
                  className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
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
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
            required
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isAnonymous}
            />
          </div>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">Post anonymously</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      ) : comments.length > 0 ? (
        <div>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
