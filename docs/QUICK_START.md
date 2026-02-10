# 🚀 Quick Start Guide - News vs Articles Feature

## ⚡ Quick Commands

### Restart Backend (Required)
```bash
# Stop current backend (Ctrl+C in backend terminal)
cd backend
npx prisma generate
npm run dev
```

### Test the Feature
```bash
# Visit these URLs:
http://localhost:3000                    # Homepage with breaking news
http://localhost:3000/category/tech      # Category with content type tabs
http://localhost:3000/admin/content/new  # Admin form with selectors
```

### Check Database
```bash
cd backend
npx prisma studio  # Opens visual database browser
```

---

## 📊 Article Classification Summary

**Current Status:**
- 6 total articles in database
- 4 classified as news (66.7%)
- 2 classified as articles (33.3%)

**Classification Logic:**
- Breaking news → 'news'
- < 5 min read → 'news'  
- Featured + ≥ 5 min → 'article'
- Everything else → 'article'

---

## 🎨 UI Features Added

### Homepage
✅ Breaking news ticker (red banner, auto-scroll)
✅ Latest news section (8 items, compact cards)
✅ Featured articles (2-4 items, large cards)

### Category Pages
✅ Content type tabs: All | News | Articles | Analysis | Opinion
✅ Combined with existing filters: Latest | Trending | Popular | Breaking

### Admin Panel
✅ Content Type dropdown (6 options)
✅ Author Type dropdown (5 options)
✅ Conditional fields:
   - shortContent (shows for news only)
   - author (shows for wire/contributor/syndicated)

---

## 🔧 API Endpoints

### Public
```bash
# Get all news
GET /api/articles?contentType=news

# Get all articles  
GET /api/articles?contentType=article

# Get breaking news
GET /api/articles?contentType=news&isBreaking=true

# Get featured articles
GET /api/articles?contentType=article&isFeatured=true
```

### Admin (requires auth)
```bash
# Create news item
POST /api/articles/admin
{
  "title": "Breaking News",
  "contentType": "news",
  "authorType": "wire",
  "author": "Reuters",
  "shortContent": "60-100 word summary...",
  "isBreaking": true
}

# Create article
POST /api/articles/admin
{
  "title": "In-Depth Analysis",
  "contentType": "article",
  "authorType": "staff",
  "content": "Full article content..."
}
```

---

## 📁 Key Files

### Modified
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/routes/articles.ts` - API routes
- `src/lib/database-real.ts` - Frontend API client
- `src/app/page.tsx` - Homepage
- `src/app/category/[slug]/page.tsx` - Category pages
- `src/app/admin/content/new/page.tsx` - Admin form
- `src/app/globals.css` - Animations

### Created
- `src/components/NewsCard.tsx` - Compact news component
- `backend/classify-articles.js` - Classification script
- `deprecated/database/classify-articles.sql` - SQL script (deprecated)
- `TESTING_CHECKLIST.md` - Testing guide
- `NEWS_VS_ARTICLES_IMPLEMENTATION.md` - Full docs
- `IMPLEMENTATION_COMPLETE.md` - Summary

---

## 🧪 Quick Tests

### 1. Homepage Test
```
✓ Visit http://localhost:3000
✓ See breaking news ticker
✓ See "Latest News" section with compact cards
✓ See "Featured Articles" with large cards
```

### 2. Category Test
```
✓ Visit http://localhost:3000/category/technology
✓ Click "News" tab → see only news
✓ Click "Article" tab → see only articles
✓ Click "All" tab → see everything
```

### 3. Admin Test
```
✓ Visit http://localhost:3000/admin/content/new
✓ Select Content Type: "News"
✓ Verify "Short Content" field appears
✓ Select Author Type: "Wire Service"
✓ Verify "Author Name" field appears
✓ Save and verify in database
```

---

## 🐛 Troubleshooting

### Backend won't restart
```bash
# Kill all node processes
taskkill /F /IM node.exe  # Windows
# or
killall node  # Mac/Linux

# Then restart
cd backend
npm run dev
```

### Prisma errors
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Frontend TypeScript errors
```
Ctrl+Shift+P → "Restart TS Server"
```

### Database out of sync
```bash
cd backend  
npx prisma db push --force-reset  # WARNING: Resets data
```

---

## 📈 Performance Checks

### Database Indexes (should be fast)
```sql
EXPLAIN ANALYZE 
SELECT * FROM "Article" 
WHERE "contentType" = 'news' 
AND "isPublished" = true 
ORDER BY "publishedAt" DESC 
LIMIT 10;

-- Should use index, < 50ms
```

### Page Load (should be < 3s)
```
Open DevTools → Network tab
Load homepage
Check "DOMContentLoaded" time
```

---

## 👥 Content Team Guide

### Creating News (Quick Updates)
1. Content Type: **News**
2. Author Type: **Wire Service** or **Staff**
3. Fill **Short Content** (60-100 words)
4. Check **Breaking** if urgent
5. Publish immediately

### Creating Articles (Long-Form)
1. Content Type: **Article**
2. Author Type: **Staff**
3. Write full content (no short content needed)
4. Add to Featured if important
5. Schedule or publish

### Content Types Guide
- **News** = Breaking, quick updates (< 5 min read)
- **Article** = In-depth, evergreen (≥ 5 min read)
- **Opinion** = Editorial, commentary
- **Analysis** = Deep dive, investigative
- **Review** = Product/event reviews
- **Interview** = Q&A format

---

## 🎯 Success Checklist

Day 1:
- [ ] Backend restarted successfully
- [ ] Homepage loads with all sections
- [ ] Category tabs work
- [ ] Admin form functional
- [ ] Can create news items
- [ ] Can create articles

Week 1:
- [ ] All API endpoints tested
- [ ] Mobile responsive verified
- [ ] Content team trained
- [ ] 10+ articles classified correctly
- [ ] No production errors

Month 1:
- [ ] User engagement measured
- [ ] Performance metrics good
- [ ] Content strategy working
- [ ] Team adoption successful

---

## 📞 Need Help?

**Check These First:**
1. `IMPLEMENTATION_COMPLETE.md` - Full summary
2. `TESTING_CHECKLIST.md` - Testing guide
3. `NEWS_VS_ARTICLES_IMPLEMENTATION.md` - Technical details
4. Browser console for errors
5. Backend logs for API errors

**Common Issues:**
- Backend not restarted → authorType missing in responses
- Prisma client outdated → regenerate with `npx prisma generate`
- TypeScript errors → restart TS server in VS Code
- Database out of sync → run `npx prisma db push`

---

**Status:** ✅ Ready to Use
**Implementation:** 100% Complete
**Next:** Restart backend and start testing!

---

*Last Updated: October 12, 2025*
