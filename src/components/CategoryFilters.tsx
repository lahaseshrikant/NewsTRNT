"use client";

import React from 'react';

interface CategoryFiltersProps {
  // Content Type Filter
  contentType: 'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview';
  onContentTypeChange: (type: 'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview') => void;
  
  // Sort Filter
  sortBy: 'latest' | 'trending' | 'popular' | 'breaking';
  onSortByChange: (sort: 'latest' | 'trending' | 'popular' | 'breaking') => void;
  
  // Counts for badges (optional)
  counts?: {
    latest?: number;
    popular?: number;
  };
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  contentType,
  onContentTypeChange,
  sortBy,
  onSortByChange,
  counts
}) => {
  const contentTypes = [
    { value: 'all', label: 'All' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Articles' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' },
    { value: 'review', label: 'Reviews' },
    { value: 'interview', label: 'Interviews' },
  ] as const;

  const sortOptions = [
    { value: 'latest', label: 'Latest', badge: counts?.latest },
    { value: 'trending', label: 'Trending', badge: null },
    { value: 'popular', label: 'Popular', badge: counts?.popular },
    { value: 'breaking', label: 'Breaking', badge: null },
  ] as const;

  return (
    <div className="mb-6">
      {/* Compact Single-Line Filter Bar */}
      <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/50 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:divide-x divide-border/50">
          
          {/* Content Type Pills - Horizontal Scrollable */}
          <div className="flex-1 px-3 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap mr-1">Type:</span>
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onContentTypeChange(type.value as any)}
                  className={`
                    relative px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap
                    transition-all duration-200 ease-in-out
                    ${
                      contentType === type.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {type.label}
                  {contentType === type.value && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options - Horizontal Scrollable */}
          <div className="flex-1 px-3 py-2.5 lg:border-t-0 border-t border-border/50">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap mr-1">Sort:</span>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortByChange(option.value as any)}
                  className={`
                    relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap
                    transition-all duration-200 ease-in-out
                    ${
                      sortBy === option.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {option.label}
                  {option.badge && (
                    <span className={`
                      px-1.5 py-0.5 rounded text-[10px] font-bold
                      ${sortBy === option.value 
                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                        : 'bg-primary/10 text-primary'
                      }
                    `}>
                      {option.badge}
                    </span>
                  )}
                  {sortBy === option.value && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button - Only show when filters are active */}
          {(contentType !== 'all' || sortBy !== 'latest') && (
            <div className="px-3 py-2.5 lg:border-t-0 border-t border-border/50">
              <button
                onClick={() => {
                  onContentTypeChange('all');
                  onSortByChange('latest');
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                title="Reset all filters"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subtle active filter indicator */}
      {(contentType !== 'all' || sortBy !== 'latest') && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters active</span>
        </div>
      )}
    </div>
  );
};

export default CategoryFilters;
