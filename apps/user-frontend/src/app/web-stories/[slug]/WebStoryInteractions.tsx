'use client';

import { useState, useCallback } from 'react';

interface WebStoryInteractionsProps {
  storyId: string;
  storySlug: string;
  initialLikes?: number;
  initialShares?: number;
}

// Simple toast notification component
const showNotification = (message: string, duration = 2000) => {
  const div = document.createElement('div');
  div.textContent = message;
  div.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    backdrop-filter: blur(10px);
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;
  
  if (!document.head.querySelector('style[data-notification="true"]')) {
    style.setAttribute('data-notification', 'true');
    document.head.appendChild(style);
  }
  
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => div.remove(), 300);
  }, duration);
};

export default function WebStoryInteractions({
  storyId,
  storySlug,
  initialLikes = 0,
  initialShares = 0,
}: WebStoryInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [shares, setShares] = useState(initialShares);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleLike = useCallback(async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`${API_URL}/webstories/${encodeURIComponent(storySlug)}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to like story');
      }

      const data = await response.json();
      setLikes(data.likeCount || likes + 1);
      showNotification('❤️ Added to your likes');
    } catch (error) {
      console.error('Error liking story:', error);
      showNotification('❌ Failed to like story');
    } finally {
      setIsLiking(false);
    }
  }, [storySlug, API_URL, isLiking, likes]);

  const handleShare = useCallback(async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      // First, increment the share count on backend
      const response = await fetch(`${API_URL}/webstories/${encodeURIComponent(storySlug)}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to record share');
      }

      const data = await response.json();
      setShares(data.shareCount || shares + 1);

      // Then try native share if available
      const storyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/web-stories/${storySlug}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Check out this Web Story`,
            text: `A compelling web story you might enjoy`,
            url: storyUrl,
          });
          showNotification('🔗 Story shared');
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      } else {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(storyUrl);
          showNotification('📋 Link copied to clipboard');
        } catch {
          showNotification('❌ Failed to copy link');
        }
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      showNotification('❌ Failed to share story');
    } finally {
      setIsSharing(false);
    }
  }, [storySlug, API_URL, isSharing, shares]);

  return (
    <div className="flex items-center gap-3">
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={isLiking}
        className="group relative inline-flex items-center justify-center px-4 py-2 rounded-full border border-[rgb(var(--border))] bg-background hover:bg-[rgb(var(--primary))]/10 hover:border-[rgb(var(--primary))]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Like this story"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 transition-transform ${isLiking ? 'scale-110' : 'group-hover:scale-110'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-sm font-medium">{likes}</span>
        </div>
        <div className="absolute inset-0 rounded-full bg-[rgb(var(--primary))]/20 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="group relative inline-flex items-center justify-center px-4 py-2 rounded-full border border-[rgb(var(--border))] bg-background hover:bg-[rgb(var(--primary))]/10 hover:border-[rgb(var(--primary))]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Share this story"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 transition-transform ${isSharing ? 'scale-110' : 'group-hover:scale-110'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C9.589 12.938 10 11.914 10 10.5c0-2.485-2.686-4.5-6-4.5s-6 2.015-6 4.5S.684 15.5 4 15.5c.342 0 .672-.034 1-.094m8.684-13.342c.94.925 1.316 2.325 1.316 3.842 0 2.485-2.686 4.5-6 4.5s-6-2.015-6-4.5c0-1.517.376-2.917 1.316-3.842m0 0A9.978 9.978 0 0112 3c5.592 0 10 2.686 10 6s-4.408 6-10 6S2 15.314 2 12s4.408-6 10-6zm0 0a9.978 9.978 0 0 0 0 11.842"
            />
          </svg>
          <span className="text-sm font-medium">{shares}</span>
        </div>
        <div className="absolute inset-0 rounded-full bg-[rgb(var(--primary))]/20 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
      </button>
    </div>
  );
}
