import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get comments for an article
router.get('/article/:articleId', async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const { page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { 
          articleId,
          parentId: null, // Only get top-level comments
          isApproved: true
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true
            }
          },
          replies: {
            where: { isApproved: true },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatarUrl: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.comment.count({
        where: { 
          articleId,
          parentId: null,
          isApproved: true
        }
      })
    ]);

    // Format comments for response
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      displayName: comment.isAnonymous 
        ? (comment.displayName || 'Anonymous') 
        : (comment.user?.fullName || comment.user?.username || 'User'),
      avatarUrl: comment.isAnonymous ? null : comment.user?.avatarUrl,
      isAnonymous: comment.isAnonymous,
      likeCount: comment.likeCount,
      createdAt: comment.createdAt,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        displayName: reply.isAnonymous 
          ? (reply.displayName || 'Anonymous') 
          : (reply.user?.fullName || reply.user?.username || 'User'),
        avatarUrl: reply.isAnonymous ? null : reply.user?.avatarUrl,
        isAnonymous: reply.isAnonymous,
        likeCount: reply.likeCount,
        createdAt: reply.createdAt
      }))
    }));

    res.json({
      comments: formattedComments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a new comment (supports anonymous)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { articleId, content, parentId, userId, displayName, isAnonymous = false } = req.body;

    if (!articleId || !content) {
      return res.status(400).json({ error: 'Article ID and content are required' });
    }

    if (content.length < 2 || content.length > 2000) {
      return res.status(400).json({ error: 'Comment must be between 2 and 2000 characters' });
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        articleId,
        content: content.trim(),
        userId: isAnonymous ? null : userId,
        parentId: parentId || null,
        displayName: isAnonymous ? (displayName || 'Anonymous') : null,
        isAnonymous,
        isApproved: true // Auto-approve for now, can add moderation later
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Update article comment count
    await prisma.article.update({
      where: { id: articleId },
      data: { commentCount: { increment: 1 } }
    });

    return res.status(201).json({
      id: comment.id,
      content: comment.content,
      displayName: comment.isAnonymous 
        ? (comment.displayName || 'Anonymous') 
        : (comment.user?.fullName || comment.user?.username || 'User'),
      avatarUrl: comment.isAnonymous ? null : comment.user?.avatarUrl,
      isAnonymous: comment.isAnonymous,
      likeCount: 0,
      createdAt: comment.createdAt,
      replies: []
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Like a comment
router.post('/:commentId/like', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } }
    });

    return res.json({ likeCount: comment.likeCount });
  } catch (error) {
    console.error('Error liking comment:', error);
    return res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Flag a comment (for moderation)
router.post('/:commentId/flag', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    await prisma.comment.update({
      where: { id: commentId },
      data: { isFlagged: true }
    });

    return res.json({ success: true, message: 'Comment flagged for review' });
  } catch (error) {
    console.error('Error flagging comment:', error);
    return res.status(500).json({ error: 'Failed to flag comment' });
  }
});

// Delete a comment (only by owner or admin)
router.delete('/:commentId', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment (skip for anonymous)
    if (comment.userId && comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete the comment and its replies
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId }
        ]
      }
    });

    // Update article comment count
    await prisma.article.update({
      where: { id: comment.articleId },
      data: { commentCount: { decrement: 1 } }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
