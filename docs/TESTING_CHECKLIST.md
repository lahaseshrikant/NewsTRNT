# Testing & Verification Checklist

## 🗄️ Database Classification

### Step 1: Run SQL Classification
Open your database tool (Prisma Studio, pgAdmin, or terminal) and run:

```bash
# Using Prisma Studio (Recommended)
cd backend
npx prisma studio

# Or connect to PostgreSQL directly
psql -d your_database_name -f database/classify-articles.sql
```

Or run the SQL file we created: `database/classify-articles.sql`

**Expected Results:**
- [ ] All articles have `contentType` set (no NULL values)
- [ ] All articles have `authorType` set (default 'staff')
- [ ] Breaking news articles are classified as 'news'
- [ ] Short articles (< 5 min) are classified as 'news'
- [ ] Featured articles are classified as 'article'

---

## 🔌 API Endpoint Testing

### Test 1: Public Articles Endpoint with Content Type Filter

```bash
# Test fetching news items
curl "http://localhost:3001/api/articles?contentType=news&limit=10"

# Test fetching articles
curl "http://localhost:3001/api/articles?contentType=article&limit=10"

# Test breaking news
curl "http://localhost:3001/api/articles?contentType=news&isBreaking=true&limit=5"

# Test featured articles
curl "http://localhost:3001/api/articles?contentType=article&isFeatured=true&limit=5"
```

**Expected Results:**
- [ ] Returns only items matching the contentType
- [ ] Response includes `contentType` and `authorType` fields
- [ ] Breaking news filter works correctly
- [ ] Featured filter works correctly

### Test 2: Admin Article Creation

Test in Postman or via curl:

```bash
# Create a news item
curl -X POST "http://localhost:3001/api/articles/admin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Test Breaking News",
    "content": "Full content here...",
    "summary": "Test summary",
    "shortContent": "This is a test breaking news item with 60-100 words of content that provides a quick summary.",
    "categoryId": "CATEGORY_ID",
    "contentType": "news",
    "authorType": "wire",
    "author": "Associated Press",
    "isBreaking": true,
    "isPublished": true
  }'

# Create an article
curl -X POST "http://localhost:3001/api/articles/admin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Test Article",
    "content": "Full article content...",
    "summary": "Test article summary",
    "categoryId": "CATEGORY_ID",
    "contentType": "article",
    "authorType": "staff",
    "isPublished": true
  }'
```

**Expected Results:**
- [ ] News item saves with contentType='news'
- [ ] Article saves with contentType='article'
- [ ] authorType is saved correctly
- [ ] author field is saved for wire service
- [ ] shortContent is saved for news items

### Test 3: Admin Article Update

```bash
curl -X PUT "http://localhost:3001/api/articles/admin/ARTICLE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Updated Title",
    "contentType": "opinion",
    "authorType": "contributor",
    "author": "John Doe"
  }'
```

**Expected Results:**
- [ ] Article updates successfully
- [ ] New contentType is saved
- [ ] authorType changes are persisted
- [ ] author field is updated

### Test 4: Admin Articles List with Filter

```bash
curl "http://localhost:3001/api/articles/admin?contentType=news" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Results:**
- [ ] Returns only news items
- [ ] Response includes new fields
- [ ] Pagination works correctly

---

## 🎨 Frontend UI Testing

### Homepage Testing

1. **Breaking News Ticker**
   - [ ] Navigate to homepage (http://localhost:3000)
   - [ ] Breaking news ticker displays at top
   - [ ] Ticker scrolls automatically
   - [ ] Hover pauses the scroll
   - [ ] Links work correctly
   - [ ] Shows live timestamp

2. **Latest News Section**
   - [ ] "Latest News" section displays
   - [ ] Shows NewsCard components (compact layout)
   - [ ] Cards show breaking badge if applicable
   - [ ] Time-ago format displays correctly
   - [ ] Author attribution shows based on authorType
   - [ ] 2-column grid on desktop
   - [ ] Single column on mobile

3. **Featured Articles Section**
   - [ ] "Featured Articles" section displays
   - [ ] Shows 2-4 featured articles
   - [ ] Large hero-style cards with images
   - [ ] Featured badge displays
   - [ ] Author and read time visible
   - [ ] Hover effects work smoothly

4. **Trending Section**
   - [ ] Still displays mixed content
   - [ ] Shows view counts
   - [ ] Category badges display

### Category Page Testing

1. **Content Type Tabs**
   - [ ] Navigate to any category page (e.g., /category/technology)
   - [ ] Content type tabs display: All, News, Article, Analysis, Opinion
   - [ ] Default tab is "All"
   - [ ] Clicking tabs filters content
   - [ ] Article count updates per tab
   - [ ] Existing filters (Latest, Trending) still work
   - [ ] Combined filtering works (e.g., News + Trending)

2. **Content Display**
   - [ ] News items show in compact format
   - [ ] Articles show in expanded format
   - [ ] Category badge displays correctly
   - [ ] Time formatting is correct

### Admin Panel Testing

1. **Article Creation Form**
   - [ ] Navigate to /admin/content/new
   - [ ] Content Type dropdown displays with 6 options
   - [ ] Author Type dropdown displays with 5 options
   - [ ] Icons show in dropdown options

2. **Conditional Fields**
   - [ ] Select "News" → Short Content field appears
   - [ ] Short Content shows word counter
   - [ ] Select "Wire Service" → Author Name field appears
   - [ ] Select "Contributor" → Author Name field appears
   - [ ] Select "Staff Writer" → Author Name field hides
   - [ ] Placeholder text changes based on author type

3. **Form Submission**
   - [ ] Create a news item with all fields
   - [ ] Verify it saves correctly
   - [ ] Create an article without shortContent
   - [ ] Verify it saves correctly
   - [ ] Edit existing article
   - [ ] Change contentType
   - [ ] Verify changes persist

---

## 📱 Responsive Design Testing

### Mobile Testing (< 768px)
- [ ] Homepage breaking news ticker readable
- [ ] Latest news section: single column
- [ ] Featured articles: single column, images resize
- [ ] Category tabs: wrap properly or scroll horizontally
- [ ] Admin form: fields stack vertically
- [ ] NewsCard: compact layout still readable
- [ ] All buttons and links are tappable

### Tablet Testing (768px - 1024px)
- [ ] Homepage: 2-column grid works
- [ ] Category page: tabs fit in one row
- [ ] Admin form: 2-column grid where applicable
- [ ] Navigation works smoothly

### Desktop Testing (> 1024px)
- [ ] All layouts display properly
- [ ] No overflow issues
- [ ] Hover effects work
- [ ] Animations smooth

---

## 🌗 Dark Mode Testing

- [ ] Homepage: all sections readable in dark mode
- [ ] NewsCard: proper contrast in dark mode
- [ ] Category tabs: visible in dark mode
- [ ] Admin form: dropdowns readable
- [ ] Breaking news ticker: red stays red
- [ ] Featured badges: visible in both modes

---

## ⚡ Performance Testing

### Database Performance
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE 
SELECT * FROM "Article" 
WHERE "contentType" = 'news' 
AND "isPublished" = true 
ORDER BY "publishedAt" DESC 
LIMIT 10;
```

**Expected:**
- [ ] Query uses index on (contentType, publishedAt)
- [ ] Query time < 50ms
- [ ] No full table scans

### Page Load Testing
- [ ] Homepage loads in < 3 seconds
- [ ] Category page loads in < 2 seconds
- [ ] Admin form loads in < 2 seconds
- [ ] No console errors
- [ ] No failed network requests

---

## 🐛 Error Handling Testing

### API Error Cases
- [ ] Try to create article with invalid contentType → Should reject
- [ ] Try to create news without shortContent → Should accept (optional)
- [ ] Try to filter by non-existent contentType → Should return empty array
- [ ] Try to access admin routes without auth → Should return 403

### UI Error Cases
- [ ] No breaking news available → Ticker shows loading message
- [ ] No articles in category → Shows empty state
- [ ] Network error → Shows error message
- [ ] Image fails to load → Shows placeholder

---

## ✅ Final Verification

### Data Integrity
```sql
-- Verify all articles have contentType
SELECT COUNT(*) FROM "Article" WHERE "contentType" IS NULL;
-- Should return 0

-- Verify all articles have authorType
SELECT COUNT(*) FROM "Article" WHERE "authorType" IS NULL;
-- Should return 0

-- Check distribution
SELECT "contentType", COUNT(*) FROM "Article" GROUP BY "contentType";
```

**Expected:**
- [ ] Zero NULL values in contentType
- [ ] Zero NULL values in authorType
- [ ] Reasonable distribution across content types

### Backward Compatibility
- [ ] Existing article URLs still work
- [ ] Old API requests (without contentType) still work
- [ ] Admin panel doesn't crash on old articles
- [ ] Search functionality still works

---

## 🚀 Ready for Production Checklist

- [ ] All database records classified
- [ ] All API endpoints tested and working
- [ ] All UI components display correctly
- [ ] Mobile responsive design verified
- [ ] Dark mode works properly
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Error handling works
- [ ] Documentation updated
- [ ] Team trained on new fields

---

## 📊 Success Metrics to Monitor

After deployment, monitor:

1. **User Engagement**
   - [ ] News items CTR vs articles CTR
   - [ ] Time spent on news vs articles
   - [ ] Breaking news ticker clicks

2. **Content Distribution**
   - [ ] Ratio of news to articles published
   - [ ] Most used content types
   - [ ] Author type distribution

3. **Performance**
   - [ ] Page load times
   - [ ] API response times
   - [ ] Database query performance

4. **Admin Adoption**
   - [ ] Are content creators using new fields?
   - [ ] Error rates in admin panel
   - [ ] Time to publish (before vs after)

---

## 🆘 Troubleshooting

### Issue: Prisma client not recognizing new fields
**Solution:** 
```bash
cd backend
rm -rf node_modules/.prisma
npx prisma generate
npm run dev
```

### Issue: API returns null for new fields
**Solution:** Check database has been migrated and records updated with SQL script

### Issue: Frontend TypeScript errors
**Solution:** Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "Restart TS Server")

### Issue: Breaking news ticker not scrolling
**Solution:** Check `globals.css` has the `@keyframes scroll` animation

### Issue: Admin form not showing conditional fields
**Solution:** Check browser console for React errors, verify state management logic

---

**Testing Progress:** [ ] / [ ] Complete
**Estimated Time:** 2-3 hours for full testing
**Status:** Ready to begin testing ✅
