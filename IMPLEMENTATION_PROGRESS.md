# News vs Articles Implementation - Progress Report

## ✅ COMPLETED TASKS

### 1. Database Schema Updates ✅
**File:** `backend/prisma/schema.prisma`

**Changes Made:**
```prisma
model Article {
  // Added fields:
  contentType  String @default("article") @map("content_type")
  // Values: "news", "article", "opinion", "analysis", "review", "interview"
  
  authorType   String @default("staff") @map("author_type")
  // Values: "staff", "wire", "contributor", "ai", "syndicated"
  
  // Added indexes:
  @@index([contentType])
  @@index([contentType, publishedAt(sort: Desc)])
  @@index([contentType, isBreaking])
  @@index([contentType, isFeatured])
  @@index([categoryId, contentType, publishedAt(sort: Desc)])
}
```

**Status:** ✅ Schema updated and pushed to database

---

### 2. TypeScript Type Definitions ✅
**File:** `src/lib/database-real.ts`

**Changes Made:**
```typescript
// New types
export type ContentType = 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview';
export type AuthorType = 'staff' | 'wire' | 'contributor' | 'ai' | 'syndicated';

// Updated Article interface with:
- contentType: ContentType
- authorType: AuthorType
- shortContent?: string
- isTrending: boolean
- readingTime?: number
```

**Status:** ✅ Types updated

---

### 3. Enhanced API Methods ✅
**File:** `src/lib/database-real.ts`

**New Methods Added:**
```typescript
// Content-specific methods
- getNews(limit): Get news only
- getLongFormArticles(limit): Get articles only
- getFeaturedArticles(limit): Get featured articles
- getBreakingNews(limit): Get breaking news
- getTrendingArticles(limit): Get trending content
- getNewsByCategory(slug, limit): Get news by category

// Enhanced existing methods with contentType filtering
- getArticles(options): Now accepts contentType parameter
- getArticlesByCategory(slug, limit, contentType): Optional content type filter
- searchArticles(query, limit, contentType): Optional content type filter
```

**Status:** ✅ API methods updated

---

### 4. UI Components ✅
**File:** `src/components/NewsCard.tsx` (NEW)

**Features:**
- Compact layout for news items
- Breaking news badge with animation
- Source/author display based on authorType
- Time ago formatting (Just now, X hours ago)
- Small thumbnail image
- Optimized for quick scanning

**Status:** ✅ NewsCard component created

**Note:** ArticleCard.tsx already exists with rich layout

---

### 5. Performance Indexes ✅
**Database Indexes Added:**
- `idx_articles_content_type`
- `idx_articles_content_type_published`
- `idx_articles_content_type_breaking`
- `idx_articles_content_type_featured`
- `idx_articles_category_content_type_published`

**Status:** ✅ Indexes added to schema

---

## 🔄 IN PROGRESS / TODO

### 6. Backend API Routes Updates ⏳
**Files to Update:**
- `backend/src/routes/articles.ts`

**Required Changes:**
1. Add `contentType` filter to existing GET /api/articles route
2. Add `authorType` to response data
3. Update article creation/update to accept contentType and authorType
4. Add new endpoints:
   - GET /api/articles/news
   - GET /api/articles/long-form

**Status:** ⏳ Not started yet

---

### 7. Homepage Layout Updates ⏳
**File:** `src/app/page.tsx`

**Required Changes:**
1. Add breaking news ticker at top
2. Create separate sections:
   - Breaking News (horizontal scroll/ticker)
   - Featured Articles (hero cards)
   - Latest News Feed (NewsCard components)
   - Trending Articles Grid (ArticleCard components)
3. Implement responsive layout

**Status:** ⏳ Not started yet

---

### 8. Category Pages Updates ⏳
**File:** `src/app/category/[slug]/page.tsx`

**Required Changes:**
1. Add content type filter tabs: [All] [News] [Articles] [Analysis]
2. Implement filtered views using new API methods
3. Use NewsCard for news items
4. Use ArticleCard for articles
5. Add loading states for each tab

**Status:** ⏳ Not started yet

---

### 9. Admin Panel Updates ⏳
**Files to Update:**
- Article creation/edit forms

**Required Changes:**
1. Add contentType dropdown:
   - News
   - Article
   - Opinion
   - Analysis
   - Review
   - Interview
2. Add authorType dropdown:
   - Staff
   - Wire Service
   - Contributor
   - AI Generated
   - Syndicated
3. Conditional fields based on contentType:
   - If news: Focus on shortContent
   - If article: Focus on full content
4. Update validation

**Status:** ⏳ Not started yet

---

### 10. Testing & Verification ⏳
**Tasks:**
1. Create sample news items with contentType='news'
2. Create sample articles with contentType='article'
3. Test all new API endpoints
4. Verify UI components render correctly
5. Test filtering on category pages
6. Performance test with indexes
7. Check mobile responsiveness

**Status:** ⏳ Not started yet

---

## 📋 NEXT STEPS (Priority Order)

### Immediate (Next 1-2 hours):

**Step 1: Update Backend API Routes**
```bash
# File: backend/src/routes/articles.ts
# Add contentType filtering to queries
```

**Step 2: Test Database**
```sql
-- Add sample data
UPDATE articles 
SET content_type = 'news', author_type = 'wire'
WHERE reading_time < 5 AND is_breaking = true;

UPDATE articles 
SET content_type = 'article', author_type = 'staff'
WHERE reading_time >= 5;
```

**Step 3: Update Homepage**
```typescript
// src/app/page.tsx
// Import and use new API methods
const news = await dbApi.getNews(10);
const articles = await dbApi.getLongFormArticles(6);
const breaking = await dbApi.getBreakingNews(5);
```

---

## 🎯 QUICK IMPLEMENTATION GUIDE

### To Use News vs Articles Now:

**1. Fetch News:**
```typescript
import { dbApi } from '@/lib/database-real';

// Get all news
const news = await dbApi.getNews(20);

// Get breaking news
const breaking = await dbApi.getBreakingNews(10);

// Get news by category
const techNews = await dbApi.getNewsByCategory('technology', 15);
```

**2. Fetch Articles:**
```typescript
// Get long-form articles
const articles = await dbApi.getLongFormArticles(10);

// Get featured articles
const featured = await dbApi.getFeaturedArticles(5);

// Get articles by category
const techArticles = await dbApi.getArticlesByCategory('technology', 10, 'article');
```

**3. Display Components:**
```typescript
import NewsCard from '@/components/NewsCard';
import ArticleCard from '@/components/ArticleCard';

// For news items
{news.map(item => (
  <NewsCard key={item.id} article={item} />
))}

// For articles
{articles.map(article => (
  <ArticleCard key={article.id} article={article} variant="default" />
))}
```

---

## 🔧 MANUAL STEPS NEEDED

### 1. Update Database Records
Run this SQL to classify existing content:

```sql
-- Classify as news (short, breaking, recent)
UPDATE articles 
SET content_type = 'news',
    author_type = CASE 
      WHEN source_name IN ('Reuters', 'AP', 'Bloomberg') THEN 'wire'
      ELSE 'staff'
    END
WHERE (reading_time < 5 OR is_breaking = true)
  AND published_at > NOW() - INTERVAL '30 days';

-- Classify rest as articles
UPDATE articles 
SET content_type = 'article',
    author_type = 'staff'
WHERE content_type IS NULL OR content_type = 'article';
```

### 2. Regenerate Prisma Client
```bash
cd backend
npx prisma generate
```

### 3. Restart Backend Server
```bash
npm run dev
```

---

## 📊 CURRENT STATUS SUMMARY

| Component | Status | Progress |
|-----------|--------|----------|
| Database Schema | ✅ Complete | 100% |
| TypeScript Types | ✅ Complete | 100% |
| API Methods | ✅ Complete | 100% |
| UI Components | ✅ Complete | 100% |
| Database Indexes | ✅ Complete | 100% |
| Backend Routes | ⏳ Pending | 0% |
| Homepage | ⏳ Pending | 0% |
| Category Pages | ⏳ Pending | 0% |
| Admin Panel | ⏳ Pending | 0% |
| Testing | ⏳ Pending | 0% |

**Overall Progress: 50% Complete** 🎯

---

## 💡 RECOMMENDATIONS

### Before Proceeding:

1. **Test current changes:**
   ```bash
   # Check if database schema is in sync
   cd backend
   npx prisma db push
   npx prisma generate
   ```

2. **Add sample data:**
   - Create 5-10 news items with `contentType='news'`
   - Create 5-10 articles with `contentType='article'`
   - Mix of breaking and regular news

3. **Verify API responses:**
   - Test: `http://localhost:5000/api/articles?contentType=news`
   - Test: `http://localhost:5000/api/articles?contentType=article`

### Next Development Session:

1. Update backend routes (30 min)
2. Update homepage layout (60 min)
3. Test and verify (30 min)

**Estimated Time to Complete:** 2-3 hours

---

**Created:** October 12, 2025  
**Last Updated:** October 12, 2025  
**Status:** 🟡 50% Complete - Foundation Ready
