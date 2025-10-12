# CategoryFilters Component - Integration Guide

## Overview
The `CategoryFilters` component provides a modern, reusable filtering UI for category pages with:
- **Content Type Filtering**: All, News, Article, Analysis, Opinion, Review, Interview
- **Sort Options**: Latest, Trending, Popular, Breaking
- **Active Filter Display**: Shows current filters with clear badges
- **Responsive Design**: Works on mobile and desktop
- **Dark Mode Support**: Automatically adapts to theme

## Installation

The component is located at: `src/components/CategoryFilters.tsx`

## Usage

### 1. Import the Component

```tsx
import CategoryFilters from '@/components/CategoryFilters';
```

### 2. Add State Management

```tsx
const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview'>('all');
const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
```

### 3. Implement Filtering Logic

```tsx
const getFilteredArticles = () => {
  let filtered = [...articles];
  
  // Filter by content type
  if (contentType !== 'all') {
    filtered = filtered.filter(article => 
      article.contentType === contentType
    );
  }
  
  // Apply sort
  switch (sortBy) {
    case 'latest':
      return filtered.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    case 'trending':
      return filtered.sort((a, b) => b.views - a.views);
    case 'popular':
      return filtered.sort((a, b) => b.views - a.views).slice(0, 10);
    case 'breaking':
      return filtered.filter(article => article.isBreaking);
    default:
      return filtered;
  }
};
```

### 4. Render the Component

```tsx
<CategoryFilters
  contentType={contentType}
  onContentTypeChange={setContentType}
  sortBy={sortBy}
  onSortByChange={setSortBy}
  counts={{
    latest: articles.length,
    popular: Math.min(10, articles.length)
  }}
/>
```

## Complete Example

```tsx
"use client";

import React, { useState, useEffect } from 'react';
import CategoryFilters from '@/components/CategoryFilters';

const TechnologyPage = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Fetch articles
    fetchArticles();
  }, []);

  const getFilteredArticles = () => {
    let filtered = [...articles];
    
    if (contentType !== 'all') {
      filtered = filtered.filter(article => 
        article.contentType === contentType
      );
    }
    
    switch (sortBy) {
      case 'latest':
        return filtered.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      case 'trending':
        return filtered.sort((a, b) => b.views - a.views);
      case 'popular':
        return filtered.sort((a, b) => b.views - a.views).slice(0, 10);
      case 'breaking':
        return filtered.filter(article => article.isBreaking);
      default:
        return filtered;
    }
  };

  const filteredArticles = getFilteredArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">💻 Technology</h1>
      <p className="text-muted-foreground mb-6">Latest Technology news and updates</p>
      
      <CategoryFilters
        contentType={contentType}
        onContentTypeChange={setContentType}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        counts={{
          latest: articles.length,
          popular: Math.min(10, articles.length)
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default TechnologyPage;
```

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `contentType` | `'all' \| 'news' \| 'article' \| 'opinion' \| 'analysis' \| 'review' \| 'interview'` | Yes | Current content type filter |
| `onContentTypeChange` | `(type) => void` | Yes | Handler for content type changes |
| `sortBy` | `'latest' \| 'trending' \| 'popular' \| 'breaking'` | Yes | Current sort option |
| `onSortByChange` | `(sort) => void` | Yes | Handler for sort changes |
| `counts` | `{ latest?: number, popular?: number }` | No | Badge counts for filters |

## Features

### Visual Indicators
- **Active Filters**: Highlighted with gradient backgrounds
- **Badges**: Show article counts for Latest and Popular
- **Icons**: Each filter has a unique emoji icon
- **Animations**: Smooth transitions and hover effects

### User Experience
- **Clear All**: Button to reset all filters at once
- **Active Summary**: Shows currently applied filters with remove buttons
- **Tooltips**: Descriptive text on hover for content types
- **Responsive**: Wraps filters on smaller screens

### Theme Support
- Automatically adapts to light/dark mode
- Uses Tailwind CSS theme variables
- Consistent with existing design system

## Pages to Update

Apply this component to:
- ✅ `/category/[slug]` - Dynamic category pages (DONE)
- 📋 Static category pages:
  - Technology
  - Business
  - Health
  - Politics
  - Science
  - Sports

## Migration Checklist

For each page:
1. [ ] Import `CategoryFilters` component
2. [ ] Update state types to use proper unions
3. [ ] Replace old filter UI with `<CategoryFilters />`
4. [ ] Test filtering logic
5. [ ] Verify counts are correct
6. [ ] Check dark mode appearance

## Testing

```bash
# Start dev server
npm run dev

# Navigate to:
# http://localhost:3000/category/technology
# http://localhost:3000/category/business
# etc.

# Test:
# - Click different content types
# - Click different sort options
# - Click "Clear All"
# - Check counts update
# - Toggle dark mode
```

## Notes

- Content types match the `ArticleForm.contentType` field
- Sort options align with existing article metadata
- Component is fully TypeScript typed
- Uses client-side filtering for instant response
- Backend API integration ready (just pass filtered params)
