-- ============================================================
-- Article Classification Script
-- Classifies existing articles into content types
-- Run this in your PostgreSQL database or via Prisma Studio
-- ============================================================

-- 1. Classify breaking news as 'news'
UPDATE "Article" 
SET "contentType" = 'news' 
WHERE "isBreaking" = true 
  AND ("contentType" IS NULL OR "contentType" = '');

-- 2. Classify short articles (< 5 min read) as 'news'
UPDATE "Article" 
SET "contentType" = 'news' 
WHERE "readingTime" < 5 
  AND ("contentType" IS NULL OR "contentType" = '')
  AND "isBreaking" = false;

-- 3. Classify featured content as 'article'
UPDATE "Article" 
SET "contentType" = 'article' 
WHERE "isFeatured" = true 
  AND ("contentType" IS NULL OR "contentType" = '');

-- 4. Classify by category (example: Opinion category articles)
-- Uncomment and adjust based on your category IDs
-- UPDATE "Article" 
-- SET "contentType" = 'opinion' 
-- WHERE "categoryId" IN (SELECT id FROM "Category" WHERE slug = 'opinion')
--   AND ("contentType" IS NULL OR "contentType" = '');

-- 5. Set remaining articles to default 'article' type
UPDATE "Article" 
SET "contentType" = 'article' 
WHERE "contentType" IS NULL OR "contentType" = '';

-- 6. Set default authorType to 'staff' for all articles
UPDATE "Article" 
SET "authorType" = 'staff' 
WHERE "authorType" IS NULL OR "authorType" = '';

-- 7. Verify the classification
SELECT 
  "contentType",
  COUNT(*) as count,
  ROUND(AVG("readingTime"), 1) as avg_reading_time,
  SUM(CASE WHEN "isBreaking" = true THEN 1 ELSE 0 END) as breaking_count,
  SUM(CASE WHEN "isFeatured" = true THEN 1 ELSE 0 END) as featured_count
FROM "Article"
WHERE "isDeleted" = false
GROUP BY "contentType"
ORDER BY count DESC;

-- 8. Check authorType distribution
SELECT 
  "authorType",
  COUNT(*) as count
FROM "Article"
WHERE "isDeleted" = false
GROUP BY "authorType"
ORDER BY count DESC;

SELECT 
  "contentType",
  "title",
  "readingTime",
  "isBreaking",
  "isFeatured",
  "authorType"
FROM "Article"
WHERE "isDeleted" = false
ORDER BY "contentType", "publishedAt" DESC
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;
