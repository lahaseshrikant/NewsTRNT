'use client';

import React from 'react';
import { DivergenceMark } from './DivergenceMark';

interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots' | 'editorial';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<{ size: string }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-ash dark:border-neutral-700 border-t-primary ${sizeClasses[size as keyof typeof sizeClasses]}`}></div>
  );
};

/** Branded editorial loading — Divergence Mark pulse */
const LoadingEditorial: React.FC = () => (
  <div className="flex flex-col items-center gap-4">
    <DivergenceMark size={48} animated className="text-primary" />
    <div className="flex items-center gap-1">
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="skeleton-warm h-48 w-full"></div>
    <div className="space-y-2">
      <div className="skeleton-warm h-4 w-3/4"></div>
      <div className="skeleton-warm h-4 w-1/2"></div>
      <div className="skeleton-warm h-4 w-5/6"></div>
    </div>
    <div className="flex space-x-2">
      <div className="skeleton-warm h-6 w-16"></div>
      <div className="skeleton-warm h-6 w-20"></div>
    </div>
  </div>
);

const LoadingPulse: React.FC = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
  </div>
);

const LoadingDots: React.FC = () => (
  <div className="flex justify-center items-center space-x-1">
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  </div>
);

const ArticleCardSkeleton: React.FC = () => (
  <div className="editorial-card overflow-hidden">
    <div className="skeleton-warm h-48 w-full"></div>
    <div className="p-4 space-y-3">
      <div className="skeleton-warm h-3 w-20"></div>
      <div className="skeleton-warm h-5 w-3/4"></div>
      <div className="space-y-2">
        <div className="skeleton-warm h-3 w-full"></div>
        <div className="skeleton-warm h-3 w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="skeleton-warm h-3 w-24"></div>
        <div className="skeleton-warm h-3 w-16"></div>
      </div>
    </div>
  </div>
);

const Loading: React.FC<LoadingProps> = ({
  variant = 'editorial',
  size = 'md',
  text,
  fullScreen = false
}) => {
  const renderLoading = () => {
    switch (variant) {
      case 'skeleton':
        return <LoadingSkeleton />;
      case 'pulse':
        return <LoadingPulse />;
      case 'dots':
        return <LoadingDots />;
      case 'editorial':
        return <LoadingEditorial />;
      default:
        return <LoadingSpinner size={size} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoading()}
      {text && (
        <p className="text-muted-foreground text-caption font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-editorial p-8 shadow-editorial-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export { ArticleCardSkeleton, LoadingSkeleton, LoadingSpinner, LoadingPulse, LoadingDots, LoadingEditorial };
export default Loading;
