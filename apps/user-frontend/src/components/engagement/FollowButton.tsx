'use client';

import React, { useState, useEffect } from 'react';

interface FollowButtonProps {
  type: 'category' | 'topic';
  id?: string; // For categories (category ID)
  name: string;
  slug: string;
  parentCategory?: string; // For topics
  userId?: string | null;
  onFollowChange?: (following: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
}

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

const FollowButton: React.FC<FollowButtonProps> = ({
  type,
  id,
  name,
  slug,
  parentCategory,
  userId,
  onFollowChange,
  size = 'md',
  variant = 'default'
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      checkFollowStatus();
    }
  }, [userId, type, id, slug]);

  const checkFollowStatus = async () => {
    try {
      const endpoint = type === 'category'
        ? `${API_URL}/user/categories/${userId}/${id}/check`
        : `${API_URL}/user/topics/${userId}/${slug}/check`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleToggleFollow = async () => {
    if (!userId) {
      alert('Please sign in to follow');
      return;
    }

    try {
      setLoading(true);
      
      if (isFollowing) {
        // Unfollow
        const endpoint = type === 'category'
          ? `${API_URL}/user/categories/${userId}/${id}`
          : `${API_URL}/user/topics/${userId}/${slug}`;
        
        const response = await fetch(endpoint, { method: 'DELETE' });
        if (response.ok) {
          setIsFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        // Follow
        const endpoint = type === 'category'
          ? `${API_URL}/user/categories`
          : `${API_URL}/user/topics`;
        
        const body = type === 'category'
          ? { userId, categoryId: id }
          : { userId, topicName: name, topicSlug: slug, parentCategory };
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (response.ok) {
          setIsFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const getVariantClasses = () => {
    if (variant === 'minimal') {
      return isFollowing
        ? 'text-primary hover:text-primary/80'
        : 'text-muted-foreground hover:text-foreground';
    }
    
    if (variant === 'outline') {
      return isFollowing
        ? 'border-2 border-primary text-primary bg-primary/10 hover:bg-primary/20'
        : 'border-2 border-border text-muted-foreground hover:border-primary hover:text-primary';
    }
    
    // Default
    return isFollowing
      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground';
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        ${getVariantClasses()}
        rounded-full font-medium transition-all duration-200
        flex items-center gap-1.5
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isFollowing ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Following</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;
