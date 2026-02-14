import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

interface SiteStats {
  totalArticles: number;
  totalViews: number;
  totalCategories: number;
  totalWebStories: number;
  publishedArticles: number;
  trendingArticles: number;
  featuredArticles: number;
  breakingNews: number;
  totalComments: number;
  totalShares: number;
  topCategories: Array<{ name: string; count: number }>;
  recentActivityCount: number;
}

// Get overall site statistics
router.get('/', async (req: Request, res: Response) => {
  try {
    // Run all queries in parallel for performance
    const [
      totalArticles,
      publishedArticles,
      trendingArticles,
      featuredArticles,
      breakingNews,
      totalCategories,
      totalWebStories,
      aggregateStats,
      topCategories,
      recentActivity
    ] = await Promise.all([
      // Total articles count
      prisma.article.count({
        where: { isDeleted: false }
      }),
      // Published articles count
      prisma.article.count({
        where: { isDeleted: false, isPublished: true }
      }),
      // Trending articles count
      prisma.article.count({
        where: { isDeleted: false, isPublished: true, isTrending: true }
      }),
      // Featured articles count
      prisma.article.count({
        where: { isDeleted: false, isPublished: true, isFeatured: true }
      }),
      // Breaking news count
      prisma.article.count({
        where: { isDeleted: false, isPublished: true, isBreaking: true }
      }),
      // Total categories count
      prisma.category.count({
        where: { isActive: true }
      }),
      // Total web stories count
      prisma.webStory.count({
        where: { status: 'published', isDeleted: false }
      }),
      // Aggregate stats (views, comments, shares)
      prisma.article.aggregate({
        _sum: {
          viewCount: true,
          commentCount: true,
          shareCount: true,
          likeCount: true
        },
        where: { isDeleted: false }
      }),
      // Top categories by article count
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          name: true,
          _count: {
            select: { articles: true }
          }
        },
        orderBy: {
          articles: { _count: 'desc' }
        },
        take: 10
      }),
      // Recent activity (articles published in last 24 hours)
      prisma.article.count({
        where: {
          isDeleted: false,
          isPublished: true,
          publishedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const stats: SiteStats = {
      totalArticles,
      totalViews: aggregateStats._sum.viewCount || 0,
      totalCategories,
      totalWebStories,
      publishedArticles,
      trendingArticles,
      featuredArticles,
      breakingNews,
      totalComments: aggregateStats._sum.commentCount || 0,
      totalShares: aggregateStats._sum.shareCount || 0,
      topCategories: topCategories.map(cat => ({
        name: cat.name,
        count: cat._count.articles
      })),
      recentActivityCount: recentActivity
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching site stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get formatted metrics for display (e.g., "2.5M+")
router.get('/formatted', async (req: Request, res: Response) => {
  try {
    const [articleStats, totalCategories, totalWebStories] = await Promise.all([
      prisma.article.aggregate({
        _sum: {
          viewCount: true,
          commentCount: true,
          shareCount: true
        },
        _count: true,
        where: { isDeleted: false, isPublished: true }
      }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.webStory.count({ where: { status: 'published', isDeleted: false } })
    ]);

    const formatNumber = (num: number): string => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
      return num.toString();
    };

    res.json({
      totalArticles: formatNumber(articleStats._count),
      monthlyVisitors: formatNumber(articleStats._sum.viewCount || 0),
      pageViews: formatNumber((articleStats._sum.viewCount || 0) * 3), // Estimate: 3 pages per visit
      emailSubscribers: formatNumber(Math.floor((articleStats._sum.viewCount || 0) * 0.02)), // Estimate 2% conversion
      socialFollowers: formatNumber(articleStats._sum.shareCount || 0),
      totalCategories: totalCategories.toString(),
      totalWebStories: totalWebStories.toString(),
      engagements: formatNumber(
        (articleStats._sum.viewCount || 0) + 
        (articleStats._sum.commentCount || 0) + 
        (articleStats._sum.shareCount || 0)
      )
    });
  } catch (error) {
    console.error('Error fetching formatted stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get category-specific statistics
router.get('/category/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findFirst({
      where: { slug, isActive: true },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const articleStats = await prisma.article.aggregate({
      _sum: {
        viewCount: true,
        commentCount: true,
        shareCount: true
      },
      where: {
        categoryId: category.id,
        isDeleted: false,
        isPublished: true
      }
    });

    res.json({
      category: category.name,
      slug: category.slug,
      totalArticles: category._count.articles,
      totalViews: articleStats._sum.viewCount || 0,
      totalComments: articleStats._sum.commentCount || 0,
      totalShares: articleStats._sum.shareCount || 0
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});

export default router;
