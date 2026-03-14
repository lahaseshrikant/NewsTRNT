'use client';

import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '@/config/api';
import showToast from '@/lib/toast';

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

export interface CommentItemModel {
  id: string;
  content: string;
  displayName: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
  likeCount: number;
  createdAt: string;
  replyCount: number;
  replies?: CommentItemModel[];
}

export type CommentItemProps = {
  comment: CommentItemModel;
  isReply?: boolean;
  replyingTo: string | null;
  replyContent: string;
  submitting: boolean;
  onToggleReply: (commentId: string) => void;
  onChangeReply: (value: string) => void;
  onSubmitReply: (commentId: string) => void;
  onCancelReply: () => void;
  onLike: (commentId: string) => void;
  onFlag: (commentId: string, opts?: { reason?: string; details?: string }) => void;
};

export const CommentItem = React.memo(function CommentItem({
  comment,
  isReply = false,
  replyingTo,
  replyContent,
  submitting,
  onToggleReply,
  onChangeReply,
  onSubmitReply,
  onCancelReply,
  onLike,
  onFlag,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replies, setReplies] = useState<CommentItemModel[] | undefined>(comment.replies);

  const fetchReplies = async () => {
    if (replies || comment.replyCount === 0) return;

    setLoadingReplies(true);
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/comments/${comment.id}/replies`);
      if (!res.ok) throw new Error('Failed to load replies');
      const data = await res.json();
      setReplies(data.replies || []);
    } catch (err) {
      console.error('Error loading replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    if (showReplies) {
      fetchReplies();
    }
  }, [showReplies]);

  useEffect(() => {
    // Keep local reply cache in sync when parent updates (e.g., new reply posted)
    if (comment.replies) {
      setReplies(comment.replies);
    }
  }, [comment.replies]);

  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  const submitReport = async () => {
    if (!reportReason) {
      showToast('Please select a reason for reporting.', 'error');
      return;
    }

    setReporting(true);
    try {
      await onFlag(comment.id, { reason: reportReason, details: reportDetails });
      showToast('Thanks — this report has been sent for review.', 'success');
      setIsReporting(false);
      setReportReason('');
      setReportDetails('');
    } catch (err) {
      console.error('Error reporting comment:', err);
      showToast('Failed to send report. Please try again.', 'error');
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className={isReply ? 'ml-10 mt-4' : ''}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`${
            isReply ? 'w-7 h-7 text-[11px]' : 'w-9 h-9 text-xs'
          } rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 font-medium text-muted-foreground`}
        >
          {comment.avatarUrl ? (
            <img
              src={comment.avatarUrl}
              alt={comment.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            comment.displayName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">
              {comment.displayName}
            </span>
            {comment.isAnonymous && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                Anon
              </span>
            )}
            <span className="text-[11px] text-muted-foreground font-mono">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2.5">
            <button
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-vermillion transition-colors group"
            >
              <svg
                className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span>{comment.likeCount > 0 ? comment.likeCount : ''}</span>
            </button>

            <button
              onClick={() => onToggleReply(comment.id)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Reply
            </button>

            <button
              onClick={() => setIsReporting(true)}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              Report
            </button>
          </div>

          {isReporting && (
            <div className="mt-3 rounded-sm border border-border bg-muted p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Report comment</span>
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              <div className="mt-2 space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground">Reason</label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-border rounded-sm bg-background text-foreground"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam or advertising</option>
                  <option value="abuse">Harassment or hate</option>
                  <option value="misinfo">Misinformation</option>
                  <option value="other">Other</option>
                </select>

                <label className="text-[11px] font-medium text-muted-foreground">Details (optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-border rounded-sm bg-background text-foreground resize-none"
                  rows={2}
                />

                <button
                  type="button"
                  onClick={submitReport}
                  disabled={reporting || !reportReason}
                  className="w-full px-3 py-2 text-xs font-semibold text-white rounded-sm bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {reporting ? 'Reporting...' : 'Send report'}
                </button>
              </div>
            </div>
          )}

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={e => onChangeReply(e.target.value)}
                placeholder="Write a reply..."
                autoFocus
                dir="ltr"
                className="w-full p-3 border border-border rounded-sm bg-background text-foreground text-sm resize-none focus:outline-none focus:border-vermillion focus:ring-1 focus:ring-vermillion/20 transition-colors"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={onCancelReply}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSubmitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                  className="px-4 py-1.5 bg-vermillion text-white rounded-sm text-xs font-semibold hover:bg-vermillion-dark disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replyCount > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowReplies(prev => !prev)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {showReplies
                  ? `Hide replies (${comment.replyCount})`
                  : `View replies (${comment.replyCount})`}
              </button>

              {showReplies && (
                <div className="mt-4 space-y-4 border-l-2 border-border/50">
                  {loadingReplies ? (
                    <div className="text-xs text-muted-foreground">Loading replies...</div>
                  ) : (
                    (replies || []).map(reply => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        isReply
                        replyingTo={replyingTo}
                        replyContent={replyContent}
                        submitting={submitting}
                        onToggleReply={onToggleReply}
                        onChangeReply={onChangeReply}
                        onSubmitReply={onSubmitReply}
                        onCancelReply={onCancelReply}
                        onLike={onLike}
                        onFlag={onFlag}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
