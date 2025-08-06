'use client';

import React from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots';
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
    <div className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size as keyof typeof sizeClasses]}`}></div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="bg-muted rounded-lg h-48 w-full"></div>
    <div className="space-y-2">
      <div className="bg-muted rounded h-4 w-3/4"></div>
      <div className="bg-muted rounded h-4 w-1/2"></div>
      <div className="bg-muted rounded h-4 w-5/6"></div>
    </div>
    <div className="flex space-x-2">
      <div className="bg-muted rounded h-6 w-16"></div>
      <div className="bg-muted rounded h-6 w-20"></div>
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
  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md animate-pulse">
    <div className="bg-muted h-48 w-full"></div>
    <div className="p-4 space-y-3">
      <div className="bg-muted rounded h-4 w-3/4"></div>
      <div className="bg-muted rounded h-4 w-1/2"></div>
      <div className="space-y-2">
        <div className="bg-muted rounded h-3 w-full"></div>
        <div className="bg-muted rounded h-3 w-5/6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="bg-muted rounded h-4 w-24"></div>
        <div className="bg-muted rounded h-6 w-16"></div>
      </div>
    </div>
  </div>
);

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
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
      default:
        return <LoadingSpinner size={size} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoading()}
      {text && (
        <p className="text-muted-foreground text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Export individual skeleton components for specific use cases
export { ArticleCardSkeleton, LoadingSkeleton, LoadingSpinner, LoadingPulse, LoadingDots };
export default Loading;
