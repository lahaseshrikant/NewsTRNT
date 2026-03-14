import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get top-level comments for an article (paginated)
// Replies are loaded lazily via the /comments/:commentId/replies endpoint.
router.get('/article/:articleId', async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [comments, totalThreads, metrics] = await Promise.all([
      prisma.comment.findMany({
        where: {
          articleId,
          parentId: null,
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
          _count: {
            select: { replies: true }
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
      }),
      prisma.articleMetrics.findUnique({
        where: { articleId },
        select: { commentCount: true }
      })
    ]);

    const total = metrics?.commentCount ?? await prisma.comment.count({
      where: { articleId, isApproved: true }
    });

    const formattedComments = comments.map(c => ({
      id: c.id,
      content: c.content,
      displayName: c.isAnonymous
        ? (c.displayName || 'Anonymous')
        : (c.user?.fullName || c.user?.username || 'User'),
      avatarUrl: c.isAnonymous ? null : c.user?.avatarUrl,
      isAnonymous: c.isAnonymous,
      likeCount: c.likeCount,
      createdAt: c.createdAt,
      replyCount: c._count?.replies ?? 0,
    }));

    res.json({
      comments: formattedComments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalThreads,
        totalPages: Math.ceil(totalThreads / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get direct replies for a comment (lazy-loaded)
router.get('/:commentId/replies', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [replies, totalReplies] = await Promise.all([
      prisma.comment.findMany({
        where: {
          parentId: commentId,
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
          _count: {
            select: { replies: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.comment.count({
        where: {
          parentId: commentId,
          isApproved: true
        }
      })
    ]);

    const formattedReplies = replies.map(r => ({
      id: r.id,
      content: r.content,
      displayName: r.isAnonymous
        ? (r.displayName || 'Anonymous')
        : (r.user?.fullName || r.user?.username || 'User'),
      avatarUrl: r.isAnonymous ? null : r.user?.avatarUrl,
      isAnonymous: r.isAnonymous,
      likeCount: r.likeCount,
      createdAt: r.createdAt,
      replyCount: r._count?.replies ?? 0,
    }));

    res.json({
      replies: formattedReplies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalReplies,
        totalPages: Math.ceil(totalReplies / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// Create a new comment (supports anonymous)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { articleId, content, parentId, userId, displayName, isAnonymous = false } = req.body;

    if (!articleId || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Article ID and content are required' });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 2 || trimmedContent.length > 2000) {
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
        content: trimmedContent,
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

    // Update metric totals in a separate table (avoids requiring article update permissions).
    // If the table doesn't exist / we lack permissions (e.g., running as a low-priv role),
    // fall back to computing the count via a simple query.
    let commentCount = 0;
    try {
      const metric = await prisma.articleMetrics.upsert({
        where: { articleId },
        create: { articleId, commentCount: 1 },
        update: { commentCount: { increment: 1 } },
      });
      commentCount = metric.commentCount;
    } catch (e) {
      commentCount = await prisma.comment.count({
        where: {
          articleId,
          isApproved: true,
        }
      });
    }

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
      replyCount: 0,
      commentCount,
    });
  } catch (error) {
    console.error('Error creating comment:', error, error instanceof Error ? error.stack : undefined);
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
    const { reason, details } = req.body as { reason?: string; details?: string };

    try {
      // Prisma client may not yet be generated with the new `flagReason`/`flagDetails` fields.
      // Cast to any temporarily so the code compiles; regenerate `prisma client` after running the migration.
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          isFlagged: true,
          flagReason: reason ?? null,
          flagDetails: details ?? null
        } as any
      });
    } catch (innerError) {
      // If the schema doesn't include the new columns yet (e.g. migration pending),
      // fall back to flagging without storing reason/details.
      const msg = (innerError as Error).message || '';
      if (msg.includes('column') || msg.includes('flag_reason') || msg.includes('flag_details')) {
        await prisma.comment.update({
          where: { id: commentId },
          data: { isFlagged: true }
        });
      } else {
        throw innerError;
      }
    }

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

    // Delete the comment and its replies.
    const deleteResult = await prisma.comment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId }
        ]
      }
    });

    // Update metrics table if tracked. If this role can't write to article_metrics,
    // just ignore and keep going (the frontend can always compute totals from /api/comments).
    if (deleteResult.count > 0) {
      try {
        await prisma.articleMetrics.updateMany({
          where: { articleId: comment.articleId },
          data: { commentCount: { decrement: deleteResult.count } }
        });
      } catch {
        // ignore permission/table missing errors
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
