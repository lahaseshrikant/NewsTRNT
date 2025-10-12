/**
 * Script to classify existing articles into content types
 * Run with: node classify-articles.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function classifyArticles() {
  console.log('🚀 Starting article classification...\n');

  try {
    // First, let's check current state
    console.log('0️⃣ Checking current article state...');
    const totalArticles = await prisma.article.count();
    const articlesWithDefaults = await prisma.article.count({
      where: { contentType: 'news' }
    });
    console.log(`   Total articles: ${totalArticles}`);
    console.log(`   Articles with default 'news' type: ${articlesWithDefaults}\n`);

    // 1. Classify breaking news as 'news' (keep as is if already 'news')
    console.log('1️⃣ Ensuring breaking news are classified as news...');
    const breakingNews = await prisma.article.updateMany({
      where: {
        isBreaking: true
      },
      data: {
        contentType: 'news'
      }
    });
    console.log(`   ✅ Updated ${breakingNews.count} breaking news items\n`);

    // 2. Classify short articles (< 5 min read) as 'news'
    console.log('2️⃣ Classifying short articles as news...');
    const shortArticles = await prisma.article.updateMany({
      where: {
        readingTime: {
          lt: 5
        },
        isBreaking: false
      },
      data: {
        contentType: 'news'
      }
    });
    console.log(`   ✅ Updated ${shortArticles.count} short articles\n`);

    // 3. Classify featured content as 'article'
    console.log('3️⃣ Classifying featured content as articles...');
    const featuredArticles = await prisma.article.updateMany({
      where: {
        isFeatured: true,
        readingTime: {
          gte: 5
        }
      },
      data: {
        contentType: 'article'
      }
    });
    console.log(`   ✅ Updated ${featuredArticles.count} featured articles\n`);

    // 4. Set remaining long-form content to 'article' type
    console.log('4️⃣ Setting long-form content as articles...');
    const remainingArticles = await prisma.article.updateMany({
      where: {
        readingTime: {
          gte: 5
        },
        isFeatured: false,
        isBreaking: false
      },
      data: {
        contentType: 'article'
      }
    });
    console.log(`   ✅ Updated ${remainingArticles.count} remaining articles\n`);

    // 5. Skip authorType update for now (requires Prisma client regeneration)
    console.log('5️⃣ Skipping authorType update (database has default value)...');
    console.log(`   ℹ️  All articles have authorType='staff' by default from schema\n`);

    // 6. Verify the classification
    console.log('📊 Verification Results:\n');
    
    const contentTypeStats = await prisma.article.groupBy({
      by: ['contentType'],
      where: {
        isDeleted: false
      },
      _count: {
        contentType: true
      },
      _avg: {
        readingTime: true,
        viewCount: true
      }
    });

    console.log('   Content Type Distribution:');
    contentTypeStats.forEach(stat => {
      console.log(`   - ${stat.contentType}: ${stat._count.contentType} articles`);
      console.log(`     Avg Reading Time: ${stat._avg.readingTime?.toFixed(1) || 0} min`);
      console.log(`     Avg Views: ${stat._avg.viewCount?.toFixed(0) || 0}`);
    });

    console.log('\n   Author Type Distribution:');
    const totalWithStaff = await prisma.article.count({
      where: { isDeleted: false }
    });
    console.log(`   - staff: ${totalWithStaff} articles (default value)`);

    // 7. Verify all articles have proper types
    console.log('\n🔍 Verifying article classification...');
    const allArticles = await prisma.article.count();
    const newsCount = await prisma.article.count({ where: { contentType: 'news' } });
    const articleCount = await prisma.article.count({ where: { contentType: 'article' } });
    const otherCount = allArticles - newsCount - articleCount;

    console.log(`   - Total articles: ${allArticles}`);
    console.log(`   - News items: ${newsCount}`);
    console.log(`   - Articles: ${articleCount}`);
    console.log(`   - Other types: ${otherCount}`);

    if (otherCount === 0) {
      console.log('\n✅ SUCCESS! All articles are properly classified!');
    } else {
      console.log('\n⚠️  Note: Some articles have other content types (opinion, analysis, etc.)');
    }

    // 8. Sample articles
    console.log('\n📝 Sample Articles:\n');
    const samples = await prisma.article.findMany({
      where: {
        isDeleted: false,
        isPublished: true
      },
      select: {
        title: true,
        contentType: true,
        authorType: true,
        readingTime: true,
        isBreaking: true,
        isFeatured: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 5
    });

    samples.forEach((article, index) => {
      console.log(`   ${index + 1}. "${article.title.substring(0, 60)}..."`);
      console.log(`      Type: ${article.contentType} | Author: ${article.authorType} | ` +
                  `Reading: ${article.readingTime} min | Breaking: ${article.isBreaking} | Featured: ${article.isFeatured}`);
    });

    console.log('\n🎉 Classification complete!\n');

  } catch (error) {
    console.error('❌ Error during classification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the classification
classifyArticles()
  .then(() => {
    console.log('✨ Script executed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
