'use client';

import React, { useState, useEffect } from 'react';
import showToast from '@/lib/toast';
import { API_CONFIG } from '@/config/api';
import { CommentItem } from './CommentItem';

const API_URL = API_CONFIG.baseURL;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Comment {
  id: string;
  content: string;
  displayName: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
  likeCount: number;
  createdAt: string;
  replyCount: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId: string;
  userId?: string | null;
  userDisplayName?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  userId,
  userDisplayName,
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
  const [totalComments, setTotalComments] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (articleId) loadComments();
  }, [articleId, page]);

  const loadComments = async () => {
    if (!articleId) return;
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

      setTotalComments(data.pagination.total);
      setHasMore(page < data.pagination.totalPages);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Unable to load comments.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    if (trimmedComment.length < 2) {
      setError('Comment must be at least 2 characters.');
      return;
    }

    if (!articleId) {
      setError('Cannot post comment: article not loaded.');
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
          content: trimmedComment,
          userId: isAnonymous ? null : (userId || null),
          displayName: isAnonymous ? (anonymousName.trim() || 'Anonymous') : (userDisplayName || 'Reader'),
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to post comment');
      }

      const comment = await response.json();
      setComments(prev => [comment, ...prev]);
      setTotalComments(prev => comment.commentCount ?? prev + 1);
      setNewComment('');
      setAnonymousName('');
      setIsAnonymous(false);
      showToast('Comment posted successfully.', 'success');
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const insertReply = (nodes: any[], parentId: string, reply: any): any[] => {
    return nodes.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          replyCount: (node.replyCount ?? 0) + 1,
          replies: [...(node.replies || []), reply]
        };
      }

      return {
        ...node,
        replies: node.replies ? insertReply(node.replies, parentId, reply) : node.replies
      };
    });
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
          userId: isAnonymous ? null : (userId || null),
          displayName: isAnonymous ? 'Anonymous' : (userDisplayName || 'Reader'),
          isAnonymous,
        }),
      });

      if (!response.ok) throw new Error('Failed to post reply');

      const reply = await response.json();

      setComments(prev => insertReply(prev, parentId, reply));
      setTotalComments(prev => reply.commentCount ?? prev + 1);

      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error posting reply:', err);
      showToast('Failed to post reply. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like comment');

      const data = await response.json();

      setComments(prev =>
        prev.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, likeCount: data.likeCount };
          }
          return {
            ...comment,
            replies: (comment.replies || []).map(reply =>
              reply.id === commentId
                ? { ...reply, likeCount: data.likeCount }
                : reply
            ),
          };
        })
      );
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleFlagComment = async (
    commentId: string,
    opts?: { reason?: string; details?: string }
  ) => {
    try {
      await fetch(`${API_URL}/comments/${commentId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: opts?.reason,
          details: opts?.details
        })
      });
      showToast('Comment reported. Thank you for helping keep our community safe.', 'info');
    } catch (err) {
      console.error('Error flagging comment:', err);
      showToast('Failed to send report. Please try again.', 'error');
    }
  };

  /* ---------- Comment Item ---------- */

  // The CommentItem component is defined outside of CommentSection so it
  // doesn't get re-created on every render. This prevents focus loss when
  // typing inside the reply textarea.

  /* ---------- Render ---------- */

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-5 bg-vermillion rounded-full" />
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Discussion
        </h3>
        {totalComments > 0 && (
          <span className="text-xs font-mono text-muted-foreground ml-1">
            ({totalComments})
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ml-auto px-3 py-1.5 text-xs font-medium rounded-sm bg-background border border-border text-foreground hover:bg-muted transition-colors"
        >
          View comments
        </button>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={
            userId
              ? 'Share your thoughts...'
              : 'Share your thoughts as a guest...'
          }
          className="w-full p-4 border border-border rounded-sm bg-background text-foreground text-sm resize-none focus:outline-none focus:border-vermillion focus:ring-1 focus:ring-vermillion/20 transition-colors placeholder:text-muted-foreground"
          rows={3}
          maxLength={2000}
        />

        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="w-3.5 h-3.5 rounded-sm border-border text-vermillion focus:ring-vermillion/30 accent-vermillion"
              />
              <span className="text-xs text-muted-foreground">
                Post anonymously
              </span>
            </label>

            {isAnonymous && (
              <input
                type="text"
                value={anonymousName}
                onChange={e => setAnonymousName(e.target.value)}
                placeholder="Display name (optional)"
                className="px-2.5 py-1 text-xs border border-border rounded-sm bg-background text-foreground focus:outline-none focus:border-vermillion transition-colors"
                maxLength={30}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground">
              {newComment.length}/2000
            </span>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-5 py-2 bg-vermillion text-white rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-vermillion-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 rounded-sm text-red-700 dark:text-red-400 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Comments List */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-xl bg-background shadow-2xl border border-border">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Discussion</h3>
                <p className="text-xs text-muted-foreground">
                  {totalComments} comments • scroll to browse
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="flex h-[calc(80vh-80px)] flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading && comments.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading comments...
                    </div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="py-12 text-center">
                    <svg className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    <p className="text-sm text-muted-foreground">
                      No comments yet. Be the first to share your thoughts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map(comment => (
                      <div key={comment.id} className="pb-6 border-b border-border last:border-0">
                        <CommentItem
                          comment={comment}
                          replyingTo={replyingTo}
                          replyContent={replyContent}
                          submitting={submitting}
                          onToggleReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
                          onChangeReply={setReplyContent}
                          onSubmitReply={handleSubmitReply}
                          onCancelReply={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                          onLike={handleLikeComment}
                          onFlag={handleFlagComment}
                        />
                      </div>
                    ))}

                    {hasMore && (
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                        className="w-full mt-6 py-2.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-vermillion border border-border hover:border-vermillion disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Loading...' : 'Load more comments'}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="border-t border-border px-6 py-4">
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder={
                      userId
                        ? 'Share your thoughts...'
                        : 'Share your thoughts as a guest...'
                    }
                    className="w-full p-4 border border-border rounded-sm bg-background text-foreground text-sm resize-none focus:outline-none focus:border-vermillion focus:ring-1 focus:ring-vermillion/20 transition-colors placeholder:text-muted-foreground"
                    rows={3}
                    maxLength={2000}
                  />

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={e => setIsAnonymous(e.target.checked)}
                          className="w-3.5 h-3.5 rounded-sm border-border text-vermillion focus:ring-vermillion/30 accent-vermillion"
                        />
                        <span className="text-xs text-muted-foreground">
                          Post anonymously
                        </span>
                      </label>

                      {isAnonymous && (
                        <input
                          type="text"
                          value={anonymousName}
                          onChange={e => setAnonymousName(e.target.value)}
                          placeholder="Display name (optional)"
                          className="px-2.5 py-1 text-xs border border-border rounded-sm bg-background text-foreground focus:outline-none focus:border-vermillion transition-colors"
                          maxLength={30}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {newComment.length}/2000
                      </span>
                      <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="px-5 py-2 bg-vermillion text-white rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-vermillion-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;