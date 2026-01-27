# News vs Articles: Differentiation Strategy for NewsTRNT

## 🤔 Your Question:
"Should I handle news and articles differently, and how can I differentiate them? What data should they have? What changes should we make? What is better?"

---

## 📊 Current Analysis

### What You Have Now:
- **Single "Article" model** that handles everything
- Fields like `isBreaking`, `isFeatured`, `isTrending` to indicate article type
- No explicit distinction between "news" and "articles"

### Industry Standard Approaches:

#### **Option 1: Keep Single Model (RECOMMENDED) ✅**
Most modern news platforms (BBC, CNN, The Guardian) use a **single content model** with metadata to differentiate content types.

#### **Option 2: Separate Models** 
Some platforms separate by content lifecycle (e.g., Substack separates newsletters from articles)

---

## 🎯 RECOMMENDATION: Enhanced Single Model with Content Type Field

### Why This Is Better:

1. **Simpler Architecture** - One model, one set of APIs
2. **Flexible** - Easy to convert content types (promote news to article, etc.)
3. **Consistent UI** - Same components work for all content
4. **SEO Friendly** - Single URL structure `/article/slug`
5. **Future Proof** - Easy to add new types (opinion, review, video, podcast)

---

## 📝 Proposed Schema Changes

### Add `contentType` Enum to Article Model:

```prisma
model Article {
  // ... existing fields ...
  
  // NEW FIELD
  contentType      String    @default("article") @map("content_type") // article, news, opinion, analysis, feature, review, interview
  
  // Existing fields that help differentiate:
  isBreaking       Boolean   @default(false) @map("is_breaking")
  isFeatured       Boolean   @default(false) @map("is_featured")
  isTrending       Boolean   @default(false) @map("is_trending")
  readingTime      Int?      @map("reading_time")
  publishedAt      DateTime? @map("published_at")
  
  // ... rest of fields ...
}
```

---

## 🔍 Content Type Definitions

### 1. **NEWS** 📰
**Characteristics:**
- Time-sensitive, breaking information
- Short-form (100-300 words)
- Frequent updates (hourly/daily)
- Focus on "what happened"
- Minimal opinion/analysis

**Data Fields:**
```typescript
{
  contentType: "news",
  isBreaking: true/false,
  readingTime: 1-3 minutes,
  shortContent: "Brief 50-100 word summary",
  summary: "100-300 word full news story",
  content: null or full story,
  publishedAt: "within 24 hours",
  sourceName: "Reuters, AP, etc.",
  sourceUrl: "original source"
}
```

**Use Cases:**
- Breaking news alerts
- Quick news briefs
- Ticker updates
- Live coverage

---

### 2. **ARTICLE** 📝
**Characteristics:**
- In-depth, evergreen content
- Long-form (800-3000+ words)
- Less time-sensitive
- Focus on "why it matters" and context
- Includes analysis, opinion, research

**Data Fields:**
```typescript
{
  contentType: "article",
  isFeatured: true/false,
  readingTime: 5-15+ minutes,
  content: "Full long-form content",
  summary: "150-300 word summary",
  excerpt: "Hook paragraph",
  author: "Staff writer or contributor",
  isFactChecked: true,
  seoTitle: "Optimized title",
  seoDescription: "SEO meta description"
}
```

**Use Cases:**
- Feature stories
- Investigative journalism
- Deep dives
- Analysis pieces
- Opinion columns

---

### 3. **OTHER CONTENT TYPES** (Future)

#### **OPINION** 💭
```typescript
{
  contentType: "opinion",
  author: "Columnist name",
  authorBio: "Author credentials",
  isEditorial: true/false
}
```

#### **ANALYSIS** 📊
```typescript
{
  contentType: "analysis",
  expertSources: ["source1", "source2"],
  dataVisualizations: [...],
  relatedArticles: [...]
}
```

#### **REVIEW** ⭐
```typescript
{
  contentType: "review",
  rating: 4.5,
  reviewedItem: "Product/Service name",
  pros: [...],
  cons: [...]
}
```

---

## 🎨 UI/UX Differences

### NEWS Display:
```
┌─────────────────────────────────────┐
│ 🔴 BREAKING                          │
│ Title: "Markets Fall 3% on Fed News" │
│ 📰 Brief summary in 2-3 lines       │
│ 🕐 2 hours ago • 2 min read         │
│ [Read More →]                        │
└─────────────────────────────────────┘
```

### ARTICLE Display:
```
┌─────────────────────────────────────┐
│ [Featured Image]                     │
│                                      │
│ Title: "The Future of AI: Complete  │
│        Guide to Machine Learning"   │
│ 👤 By Dr. Jane Smith                │
│ 🕐 Published Mar 15 • 12 min read   │
│                                      │
│ Summary: Comprehensive look at how  │
│ AI is transforming industries...    │
│                                      │
│ [Read Full Article →]               │
└─────────────────────────────────────┘
```

---

## 💾 Database Migration Plan

### Step 1: Add `contentType` Column
```sql
ALTER TABLE articles 
ADD COLUMN content_type VARCHAR(50) DEFAULT 'article';

CREATE INDEX idx_articles_content_type ON articles(content_type);
```

### Step 2: Backfill Existing Data
```sql
-- Classify existing content based on characteristics
UPDATE articles 
SET content_type = 'news'
WHERE (is_breaking = true OR reading_time < 5)
  AND published_at > NOW() - INTERVAL '7 days';

UPDATE articles 
SET content_type = 'article'
WHERE content_type IS NULL;
```

### Step 3: Update Prisma Schema
```bash
npx prisma db pull
npx prisma generate
```

---

## 🔧 API Changes Needed

### 1. **Update Article Model** (TypeScript)
```typescript
export interface Article {
  id: string;
  title: string;
  slug: string;
  contentType: 'news' | 'article' | 'opinion' | 'analysis' | 'review';
  summary?: string;
  content?: string;
  shortContent?: string; // For news briefs
  isBreaking: boolean;
  isFeatured: boolean;
  readingTime?: number;
  publishedAt: Date;
  // ... other fields
}
```

### 2. **Add Filtering Endpoints**
```typescript
// Get only news
GET /api/articles?contentType=news

// Get only articles
GET /api/articles?contentType=article

// Get breaking news
GET /api/articles?contentType=news&isBreaking=true

// Get featured articles
GET /api/articles?contentType=article&isFeatured=true
```

### 3. **Update Components**
```typescript
// src/components/NewsCard.tsx - For news items
// src/components/ArticleCard.tsx - For full articles
// src/components/ContentCard.tsx - Generic, switches based on contentType
```

---

## 📱 Page Structure Recommendations

### Homepage:
```
┌─────────────────────────────────────┐
│ BREAKING NEWS (Ticker)              │
│ 🔴 Latest updates (contentType=news)│
├─────────────────────────────────────┤
│ FEATURED ARTICLES                   │
│ 📝 In-depth stories                 │
│    (contentType=article, featured)  │
├─────────────────────────────────────┤
│ LATEST NEWS                         │
│ 📰 Recent updates (contentType=news)│
└─────────────────────────────────────┘
```

### Category Pages:
```
Technology Category
├── NEWS Tab (contentType=news)
│   ├── Breaking tech news
│   └── Latest updates
├── ARTICLES Tab (contentType=article)
│   ├── Featured articles
│   └── In-depth coverage
└── ANALYSIS Tab (contentType=analysis)
    └── Expert opinions
```

---

## 🚀 Implementation Priority

### Phase 1: IMMEDIATE (Week 1) ✅
1. Add `contentType` field to schema
2. Run migration
3. Update TypeScript interfaces
4. Add filtering to existing APIs

### Phase 2: SHORT TERM (Week 2-3)
1. Create separate UI components for news vs articles
2. Update homepage to show both types
3. Add content type filters to category pages
4. Update admin panel to select content type

### Phase 3: MEDIUM TERM (Month 1-2)
1. Add more content types (opinion, analysis)
2. Create specialized editors for each type
3. Add content type analytics
4. Implement content type recommendations

---

## 📊 Comparison Table

| Feature | NEWS | ARTICLE |
|---------|------|---------|
| **Length** | 100-500 words | 800-3000+ words |
| **Reading Time** | 1-3 min | 5-15+ min |
| **Update Frequency** | Hourly/Daily | Weekly/Monthly |
| **Lifespan** | 24-48 hours | Evergreen/Long-term |
| **Focus** | What happened | Why it matters |
| **Style** | Factual, brief | Analytical, detailed |
| **SEO Priority** | Freshness | Depth & authority |
| **Social Sharing** | High immediacy | High engagement |
| **Monetization** | Ads, sponsored | Premium content |

---

## 🎯 Final Recommendation

### ✅ DO THIS:
1. **Keep single Article model** with `contentType` field
2. **Add content type enum**: `news | article | opinion | analysis | review`
3. **Differentiate in UI/UX** based on contentType
4. **Use existing flags** (`isBreaking`, `isFeatured`, `isTrending`) as supplements
5. **Filter by type** in APIs and UI components

### ❌ DON'T DO THIS:
1. Create separate News and Article models (too complex)
2. Use only boolean flags to differentiate (not scalable)
3. Force all content into one type (limits flexibility)

---

## 💡 Key Benefits of This Approach:

1. **Flexibility** - Easy to add new content types
2. **Simplicity** - Single codebase, single database table
3. **SEO** - Consistent URL structure
4. **User Experience** - Clear content differentiation
5. **Analytics** - Easy to track by content type
6. **Monetization** - Different strategies per type
7. **Scalability** - Grows with your platform

---

## 📝 Next Steps:

1. Review this document
2. Decide on initial content types (I recommend: `news` and `article` only)
3. I'll help you implement the schema changes
4. Update the UI components
5. Test with sample content

**Want me to start implementing these changes?** 🚀

---

**Created:** October 12, 2025
**Status:** 📋 Proposal - Awaiting Your Decision
