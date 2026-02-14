import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ==================== SAVED ARTICLES ====================

// Get user's saved articles
router.get('/saved/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [savedArticles, total] = await Promise.all([
      prisma.savedArticle.findMany({
        where: { userId },
        include: {
          article: {
            include: {
              category: true
            }
          }
        },
        orderBy: { savedAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.savedArticle.count({ where: { userId } })
    ]);

    res.json({
      articles: savedArticles.map(sa => ({
        ...sa.article,
        savedAt: sa.savedAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    res.status(500).json({ error: 'Failed to fetch saved articles' });
  }
});

// Save an article
router.post('/saved', async (req: Request, res: Response) => {
  try {
    const { userId, articleId } = req.body;

    if (!userId || !articleId) {
      return res.status(400).json({ error: 'User ID and Article ID are required' });
    }

    const saved = await prisma.savedArticle.create({
      data: { userId, articleId }
    });

    return res.status(201).json({ success: true, savedAt: saved.savedAt });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Article already saved' });
    }
    console.error('Error saving article:', error);
    return res.status(500).json({ error: 'Failed to save article' });
  }
});

// Remove saved article
router.delete('/saved/:userId/:articleId', async (req: Request, res: Response) => {
  try {
    const { userId, articleId } = req.params;

    await prisma.savedArticle.delete({
      where: {
        userId_articleId: { userId, articleId }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing saved article:', error);
    res.status(500).json({ error: 'Failed to remove saved article' });
  }
});

// Check if article is saved
router.get('/saved/:userId/:articleId/check', async (req: Request, res: Response) => {
  try {
    const { userId, articleId } = req.params;

    const saved = await prisma.savedArticle.findUnique({
      where: {
        userId_articleId: { userId, articleId }
      }
    });

    res.json({ isSaved: !!saved });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({ error: 'Failed to check saved status' });
  }
});

// ==================== CATEGORY FOLLOWS ====================

// Get user's followed categories
router.get('/categories/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const followedCategories = await prisma.categoryFollow.findMany({
      where: { userId },
      include: {
        category: true
      },
      orderBy: { followedAt: 'desc' }
    });

    res.json({
      categories: followedCategories.map(fc => ({
        id: fc.category.id,
        name: fc.category.name,
        slug: fc.category.slug,
        color: fc.category.color,
        icon: fc.category.icon,
        followedAt: fc.followedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching followed categories:', error);
    res.status(500).json({ error: 'Failed to fetch followed categories' });
  }
});

// Follow a category
router.post('/categories', async (req: Request, res: Response) => {
  try {
    const { userId, categoryId } = req.body;

    if (!userId || !categoryId) {
      return res.status(400).json({ error: 'User ID and Category ID are required' });
    }

    const follow = await prisma.categoryFollow.create({
      data: { userId, categoryId },
      include: { category: true }
    });

    return res.status(201).json({ 
      success: true, 
      category: {
        id: follow.category.id,
        name: follow.category.name,
        slug: follow.category.slug
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Already following this category' });
    }
    console.error('Error following category:', error);
    return res.status(500).json({ error: 'Failed to follow category' });
  }
});

// Unfollow a category
router.delete('/categories/:userId/:categoryId', async (req: Request, res: Response) => {
  try {
    const { userId, categoryId } = req.params;

    await prisma.categoryFollow.delete({
      where: {
        userId_categoryId: { userId, categoryId }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing category:', error);
    res.status(500).json({ error: 'Failed to unfollow category' });
  }
});

// Check if following a category
router.get('/categories/:userId/:categoryId/check', async (req: Request, res: Response) => {
  try {
    const { userId, categoryId } = req.params;

    const following = await prisma.categoryFollow.findUnique({
      where: {
        userId_categoryId: { userId, categoryId }
      }
    });

    res.json({ isFollowing: !!following });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// ==================== TOPIC FOLLOWS ====================

// Get user's followed topics
router.get('/topics/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const followedTopics = await prisma.topicFollow.findMany({
      where: { userId },
      orderBy: { followedAt: 'desc' }
    });

    res.json({
      topics: followedTopics.map(ft => ({
        id: ft.id,
        name: ft.topicName,
        slug: ft.topicSlug,
        parentCategory: ft.parentCategory,
        followedAt: ft.followedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching followed topics:', error);
    res.status(500).json({ error: 'Failed to fetch followed topics' });
  }
});

// Follow a topic
router.post('/topics', async (req: Request, res: Response) => {
  try {
    const { userId, topicName, topicSlug, parentCategory } = req.body;

    if (!userId || !topicName || !topicSlug) {
      return res.status(400).json({ error: 'User ID, topic name, and slug are required' });
    }

    const follow = await prisma.topicFollow.create({
      data: { 
        userId, 
        topicName, 
        topicSlug,
        parentCategory: parentCategory || null
      }
    });

    return res.status(201).json({ 
      success: true, 
      topic: {
        id: follow.id,
        name: follow.topicName,
        slug: follow.topicSlug,
        parentCategory: follow.parentCategory
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Already following this topic' });
    }
    console.error('Error following topic:', error);
    return res.status(500).json({ error: 'Failed to follow topic' });
  }
});

// Unfollow a topic
router.delete('/topics/:userId/:topicSlug', async (req: Request, res: Response) => {
  try {
    const { userId, topicSlug } = req.params;

    await prisma.topicFollow.delete({
      where: {
        userId_topicSlug: { userId, topicSlug }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing topic:', error);
    res.status(500).json({ error: 'Failed to unfollow topic' });
  }
});

// Check if following a topic
router.get('/topics/:userId/:topicSlug/check', async (req: Request, res: Response) => {
  try {
    const { userId, topicSlug } = req.params;

    const following = await prisma.topicFollow.findUnique({
      where: {
        userId_topicSlug: { userId, topicSlug }
      }
    });

    res.json({ isFollowing: !!following });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// ==================== PERSONALIZED FEED ====================

// Get personalized feed based on followed categories and topics
router.get('/feed/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get user's followed categories and topics
    const [followedCategories, followedTopics] = await Promise.all([
      prisma.categoryFollow.findMany({
        where: { userId },
        select: { categoryId: true }
      }),
      prisma.topicFollow.findMany({
        where: { userId },
        select: { topicSlug: true }
      })
    ]);

    const categoryIds = followedCategories.map(fc => fc.categoryId);
    const topicSlugs = followedTopics.map(ft => ft.topicSlug);

    // If user has no follows, return trending articles
    if (categoryIds.length === 0 && topicSlugs.length === 0) {
      const articles = await prisma.article.findMany({
        where: { 
          isPublished: true,
          isDeleted: false
        },
        include: { category: true },
        orderBy: [
          { isTrending: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limitNum
      });

      return res.json({
        articles,
        isPersonalized: false,
        message: 'Follow categories and topics to get personalized content'
      });
    }

    // Get personalized articles
    const articles = await prisma.article.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        OR: [
          { categoryId: { in: categoryIds } },
          // Topic matching would require text search on title/content
        ]
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limitNum
    });

    return res.json({
      articles,
      isPersonalized: true,
      followingCount: {
        categories: categoryIds.length,
        topics: topicSlugs.length
      }
    });
  } catch (error) {
    console.error('Error fetching personalized feed:', error);
    return res.status(500).json({ error: 'Failed to fetch personalized feed' });
  }
});

export default router;
