# Quick Reference: Add Filters to Any Category Page

## Copy-Paste Template

### Step 1: Add Import
```tsx
import CategoryFilters from '@/components/CategoryFilters';
```

### Step 2: Add State (replace existing filter state)
```tsx
// Content Type and Sort Filters
const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview'>('all');
const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');

// Category-specific sub-category filter
const [selectedSubCategory, setSelectedSubCategory] = useState('all');

const subCategoryFilters = [
  { id: 'all', label: 'All [Category]', count: 234 },
  { id: 'topic1', label: 'Topic 1', count: 89 },
  { id: 'topic2', label: 'Topic 2', count: 67 },
  // Add more...
];
```

### Step 3: Add Filter UI (replace old filter tabs)
```tsx
{/* Modern Category Filters */}
<CategoryFilters
  contentType={contentType}
  onContentTypeChange={setContentType}
  sortBy={sortBy}
  onSortByChange={setSortBy}
  counts={{
    latest: 234,  // Total articles
    popular: 89   // Popular count
  }}
/>

{/* Category Sub-Filters */}
<div className="mb-8">
  <div className="flex items-center gap-2 mb-4">
    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      [Category Name] Topics
    </span>
    <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent"></div>
  </div>
  <div className="flex flex-wrap gap-2">
    {subCategoryFilters.map(filter => (
      <button
        key={filter.id}
        onClick={() => setSelectedSubCategory(filter.id)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
          selectedSubCategory === filter.id
            ? 'bg-gradient-to-r from-[color1]-500 to-[color2]-600 text-white shadow-lg shadow-[color1]-500/25 scale-105'
            : 'bg-muted/50 text-foreground hover:bg-muted hover:scale-105 hover:shadow-md'
        }`}
      >
        {filter.label} <span className={`ml-1 ${selectedSubCategory === filter.id ? 'text-white/80' : 'text-muted-foreground'}`}>({filter.count})</span>
      </button>
    ))}
  </div>
</div>
```

## Category-Specific Configurations

### Politics
```tsx
subCategoryFilters: [
  { id: 'all', label: 'All Politics', count: 198 },
  { id: 'domestic', label: 'Domestic', count: 89 },
  { id: 'international', label: 'International', count: 67 },
  { id: 'elections', label: 'Elections', count: 25 },
  { id: 'policy', label: 'Policy', count: 17 }
]
gradient: 'from-red-500 to-orange-600'
counts: { latest: 198, popular: 89 }
```

### Science
```tsx
subCategoryFilters: [
  { id: 'all', label: 'All Science', count: 167 },
  { id: 'space', label: 'Space', count: 54 },
  { id: 'biology', label: 'Biology', count: 48 },
  { id: 'physics', label: 'Physics', count: 35 },
  { id: 'climate', label: 'Climate', count: 30 }
]
gradient: 'from-purple-500 to-indigo-600'
counts: { latest: 167, popular: 54 }
```

### Sports
```tsx
subCategoryFilters: [
  { id: 'all', label: 'All Sports', count: 212 },
  { id: 'football', label: 'Football', count: 78 },
  { id: 'basketball', label: 'Basketball', count: 56 },
  { id: 'baseball', label: 'Baseball', count: 43 },
  { id: 'other', label: 'Other Sports', count: 35 }
]
gradient: 'from-yellow-500 to-orange-600'
counts: { latest: 212, popular: 78 }
```

### Entertainment
```tsx
subCategoryFilters: [
  { id: 'all', label: 'All Entertainment', count: 187 },
  { id: 'movies', label: 'Movies', count: 67 },
  { id: 'music', label: 'Music', count: 54 },
  { id: 'tv', label: 'TV Shows', count: 45 },
  { id: 'celebrity', label: 'Celebrity', count: 21 }
]
gradient: 'from-fuchsia-500 to-pink-600'
counts: { latest: 187, popular: 67 }
```

### World
```tsx
subCategoryFilters: [
  { id: 'all', label: 'All World News', count: 234 },
  { id: 'europe', label: 'Europe', count: 78 },
  { id: 'asia', label: 'Asia', count: 67 },
  { id: 'americas', label: 'Americas', count: 54 },
  { id: 'africa', label: 'Africa & Middle East', count: 35 }
]
gradient: 'from-teal-500 to-cyan-600'
counts: { latest: 234, popular: 78 }
```

## Gradient Color Reference

Replace `[color1]` and `[color2]` in the gradient class:

| Category | Colors | Full Class |
|----------|--------|------------|
| Technology | cyan → blue | `from-cyan-500 to-blue-600` |
| Business | green → emerald | `from-green-500 to-emerald-600` |
| Health | pink → rose | `from-pink-500 to-rose-600` |
| Politics | red → orange | `from-red-500 to-orange-600` |
| Science | purple → indigo | `from-purple-500 to-indigo-600` |
| Sports | yellow → orange | `from-yellow-500 to-orange-600` |
| Entertainment | fuchsia → pink | `from-fuchsia-500 to-pink-600` |
| World | teal → cyan | `from-teal-500 to-cyan-600` |

## Testing Checklist

- [ ] Import added
- [ ] State variables defined
- [ ] Old filter code removed
- [ ] CategoryFilters component rendered
- [ ] Sub-category filters added
- [ ] Gradient colors applied
- [ ] Counts are accurate
- [ ] Filter logic works
- [ ] Dark mode looks good
- [ ] Mobile responsive

## 5-Minute Update Guide

1. **Open category page** (e.g., `src/app/category/politics/page.tsx`)
2. **Add import** at top
3. **Replace state** with template from Step 2
4. **Find old filter UI** (usually has `{filters.map...}`)
5. **Replace with new UI** from Step 3
6. **Customize**: Update category name, gradient, counts
7. **Save and test**

Done! 🎉
