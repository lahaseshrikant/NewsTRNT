import { Router, Request, Response } from 'express';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken);

// =============================================================================
// MEDIA LIBRARY ENDPOINTS
// =============================================================================

// GET /api/admin/media - Get all media files
router.get('/media', requireAdmin, async (req: Request, res: Response) => {
  try {
    const files = await prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ files });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/admin/media - Upload media file
router.post('/media', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { filename, originalName, mimeType, size, url, thumbnailUrl, folder, alt, caption } = req.body;
    
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: filename || `file_${Date.now()}`,
        originalName: originalName || 'unknown',
        mimeType: mimeType || 'application/octet-stream',
        size: size || 0,
        url: url || '',
        thumbnailUrl,
        folder: folder || 'uploads',
        alt,
        caption,
        uploadedBy: req.user?.id
      }
    });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'UPLOAD_MEDIA',
        targetType: 'media',
        targetId: mediaFile.id,
        details: { filename: mediaFile.filename }
      }
    });

    res.json({ message: 'Media uploaded', file: mediaFile });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// DELETE /api/admin/media/:id - Delete media file
router.delete('/media/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.mediaFile.delete({ where: { id } });
    
    await prisma.adminLog.create({
      data: {
        adminId: req.user?.id,
        action: 'DELETE_MEDIA',
        targetType: 'media',
        targetId: id,
        details: {}
      }
    });

    res.json({ message: 'Media deleted' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

export default router;
