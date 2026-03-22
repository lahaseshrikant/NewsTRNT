import { Router, Request, Response } from 'express';
import multer from 'multer';
import prisma from '../../config/database';
import { authenticateToken, AuthRequest, requireAdmin } from '../../middleware/auth';
import config from '../../lib/config';
import {
  deriveExpectedVariantKeys,
  deriveVariantUrls,
  getMediaTypeLabel,
  uploadMediaFromBuffer,
} from '../../lib/media';
import { deleteFile, extractStorageKeyFromUrl } from '../../lib/storage';

const router = Router();
router.use(authenticateToken);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const toSizeLabel = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const isVideo = (mimeType: string): boolean => mimeType.startsWith('video/');

const deleteMediaObjectSet = async (file: { url: string; mimeType: string; thumbnailUrl: string | null }): Promise<void> => {
  const mainKey = extractStorageKeyFromUrl(file.url);
  if (mainKey) {
    for (const key of deriveExpectedVariantKeys(mainKey, file.mimeType)) {
      await deleteFile(key);
    }
  }

  if (file.thumbnailUrl) {
    const thumbKey = extractStorageKeyFromUrl(file.thumbnailUrl);
    if (thumbKey) {
      await deleteFile(thumbKey);
    }
  }
};

// =============================================================================
// MEDIA LIBRARY ENDPOINTS
// =============================================================================

// GET /api/admin/media - Get all media files
router.get('/media', requireAdmin, async (req: Request, res: Response) => {
  try {
    const files = await prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const enriched = files.map((file) => ({
      ...file,
      name: file.originalName || file.filename,
      type: getMediaTypeLabel(file.mimeType),
      sizeLabel: toSizeLabel(file.size),
      uploadDate: file.createdAt,
      variants: deriveVariantUrls(file.url, file.mimeType),
      dimensions: isVideo(file.mimeType) ? undefined : `${config.media.imageVariantWidths.join('/')}w`,
      previewUrl: file.thumbnailUrl || file.url,
    }));

    res.json({ files: enriched });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// GET /api/admin/media/stats - Summary stats for storage dashboard
router.get('/media/stats', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [aggregate, groupedByMime] = await Promise.all([
      prisma.mediaFile.aggregate({
        _count: { id: true },
        _sum: { size: true },
      }),
      prisma.mediaFile.groupBy({
        by: ['mimeType'],
        _count: { id: true },
        _sum: { size: true },
      }),
    ]);

    const totalObjects = aggregate._count.id;
    const totalBytes = aggregate._sum.size || 0;
    const totalGb = totalBytes / 1024 / 1024 / 1024;

    const byType = groupedByMime.reduce<Record<string, { count: number; bytes: number }>>((acc, row) => {
      const kind = getMediaTypeLabel(row.mimeType);
      const current = acc[kind] || { count: 0, bytes: 0 };
      current.count += row._count.id;
      current.bytes += row._sum.size || 0;
      acc[kind] = current;
      return acc;
    }, {});

    res.json({
      totalObjects,
      totalBytes,
      totalSizeLabel: toSizeLabel(totalBytes),
      estimatedMonthlyCostUsd: Number((totalGb * config.media.cleanupCostPerGbUsd).toFixed(4)),
      costPerGbUsd: config.media.cleanupCostPerGbUsd,
      byType,
    });
  } catch (error) {
    console.error('Error fetching media stats:', error);
    res.status(500).json({ error: 'Failed to fetch media stats' });
  }
});

// POST /api/admin/media/upload - Upload media object and save record
router.post('/media/upload', requireAdmin, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file received. Use multipart/form-data with field "file".' });
      return;
    }

    const { alt, caption } = req.body as { alt?: string; caption?: string };

    const uploaded = await uploadMediaFromBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: uploaded.filename,
        originalName: req.file.originalname,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        url: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        folder: uploaded.folder,
        alt,
        caption,
        uploadedBy: req.user?.id,
      }
    });
    
    await prisma.adminLog.create({
      data: {
        // Super Admins are env-based and don't exist in the user table; avoid FK violations.
        adminId: req.user?.isSuperAdmin ? null : req.user?.id,
        adminAccountId: req.user?.isSuperAdmin ? null : undefined,
        action: 'UPLOAD_MEDIA',
        targetType: 'media',
        targetId: mediaFile.id,
        details: {
          filename: mediaFile.filename,
          url: mediaFile.url,
          variantCount: uploaded.variants.length,
        }
      }
    });

    res.json({ message: 'Media uploaded', file: mediaFile, variants: uploaded.variants });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload media' });
  }
});

// Legacy JSON create endpoint for compatibility with older admin pages
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
        uploadedBy: req.user?.id,
      },
    });

    res.json({ message: 'Media metadata saved', file: mediaFile });
  } catch (error) {
    console.error('Error creating media entry:', error);
    res.status(500).json({ error: 'Failed to save media metadata' });
  }
});

// POST /api/admin/media/cleanup - Bulk remove low-usage or old assets
router.post('/media/cleanup', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as {
      olderThanDays?: number;
      maxUsageCount?: number;
      dryRun?: boolean;
    };

    const olderThanDays = Number.isFinite(body.olderThanDays) ? Number(body.olderThanDays) : 30;
    const maxUsageCount = Number.isFinite(body.maxUsageCount) ? Number(body.maxUsageCount) : 0;
    const dryRun = body.dryRun !== false;

    const thresholdDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const candidates = await prisma.mediaFile.findMany({
      where: {
        createdAt: { lt: thresholdDate },
        usageCount: { lte: maxUsageCount },
      },
      orderBy: { createdAt: 'asc' },
    });

    const reclaimBytes = candidates.reduce((sum, file) => sum + file.size, 0);

    if (!dryRun) {
      for (const file of candidates) {
        await deleteMediaObjectSet(file);
        await prisma.mediaFile.delete({ where: { id: file.id } });
      }

      await prisma.adminLog.create({
        data: {
          adminId: req.user?.id,
          action: 'CLEANUP_MEDIA',
          targetType: 'media',
          details: {
            olderThanDays,
            maxUsageCount,
            deletedCount: candidates.length,
            reclaimedBytes: reclaimBytes,
          },
        },
      });
    }

    res.json({
      dryRun,
      matchedCount: candidates.length,
      reclaimedBytes: reclaimBytes,
      reclaimedSizeLabel: toSizeLabel(reclaimBytes),
      files: candidates.map((file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        size: file.size,
        usageCount: file.usageCount,
        createdAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error cleaning media:', error);
    res.status(500).json({ error: 'Failed to cleanup media' });
  }
});

// DELETE /api/admin/media/:id - Delete media file
router.delete('/media/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.mediaFile.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Media file not found' });
      return;
    }

    await deleteMediaObjectSet(existing);
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
