'use client';

import React, { useState, useEffect } from 'react';

interface SaveButtonProps {
  articleId: string;
  userId?: string | null;
  initialSaved?: boolean;
  onSaveChange?: (saved: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

const SaveButton: React.FC<SaveButtonProps> = ({
  articleId,
  userId,
  initialSaved = false,
  onSaveChange,
  size = 'md',
  showText = false
}) => {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && articleId) {
      checkSavedStatus();
    }
  }, [userId, articleId]);

  const checkSavedStatus = async () => {
    try {
      const response = await fetch(
        `${API_URL}/user/saved/${userId}/${articleId}/check`
      );
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!userId) {
      // Prompt login for non-authenticated users
      alert('Please sign in to save articles');
      return;
    }

    try {
      setLoading(true);
      
      if (isSaved) {
        // Unsave
        const response = await fetch(
          `${API_URL}/user/saved/${userId}/${articleId}`,
          { method: 'DELETE' }
        );
        if (response.ok) {
          setIsSaved(false);
          onSaveChange?.(false);
        }
      } else {
        // Save
        const response = await fetch(`${API_URL}/user/saved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, articleId })
        });
        if (response.ok) {
          setIsSaved(true);
          onSaveChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        ${showText ? 'flex items-center gap-2 px-3' : ''}
        rounded-lg transition-all duration-200
        ${isSaved 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={isSaved ? 'Remove from saved' : 'Save for later'}
    >
      {isSaved ? (
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ) : (
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
      {showText && (
        <span className="text-sm font-medium">
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default SaveButton;
