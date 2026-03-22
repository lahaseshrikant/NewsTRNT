/**
 * File Upload Routes
 * Image upload for articles, web stories, and media library
 * Mounted at: /api/upload
 */
import { Router, Response } from 'express';
import multer from 'multer';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { uploadMediaFromBuffer } from '../lib/media';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
});

type UploadedInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
  return false;
};

// Proxy remote image URLs to avoid client-side CORS issues when drawing images to canvas.
router.get('/proxy', async (req, res) => {
  const url = String(req.query.url || '').trim();
  if (!url) {
    return res.status(400).json({ error: 'Missing required url parameter.' });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'Unsupported URL protocol.' });
  }

  // Allowlist remote sources where R2 uploads are stored; adapt as needed.
  const allowedHostSuffixes = ['r2.dev', 'cloudflare.com', 'localhost', '127.0.0.1'];
  if (!allowedHostSuffixes.some((allowed) => parsedUrl.hostname.endsWith(allowed))) {
    return res.status(403).json({ error: 'Remote host is not permitted.' });
  }

  try {
    const fetched = await fetch(url);
    if (!fetched.ok) {
      return res.status(502).json({ error: 'Failed to fetch remote image.' });
    }

    const contentType = fetched.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const arrayBuffer = await fetched.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (error) {
    console.error('[Upload proxy] failed', error);
    return res.status(500).json({ error: 'Image proxy fetch failed' });
  }
});

const parseCsvField = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => String(entry).split(',')).map((entry) => entry.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
};

const parseNumberField = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseDataUrl = (value: string): UploadedInput => {
  const match = value.match(/^data:([a-z0-9/+.-]+);base64,(.+)$/i);
  if (!match) {
    throw new Error('Invalid base64 data URL format');
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
    originalName: `upload-${Date.now()}`,
  };
};

const parseJsonPayload = (payload: unknown): UploadedInput[] => {
  const body = payload as {
    image?: unknown;
    images?: unknown[];
    filename?: string;
  };

  const list = body.images || (body.image ? [body.image] : []);
  if (list.length === 0) return [];

  return list.map((entry, index) => {
    if (typeof entry === 'string') {
      if (entry.startsWith('data:')) {
        const parsed = parseDataUrl(entry);
        return {
          ...parsed,
          originalName: body.filename || `${parsed.originalName}-${index + 1}`,
        };
      }

      return {
        buffer: Buffer.from(entry, 'base64'),
        mimeType: 'image/jpeg',
        originalName: body.filename || `upload-${Date.now()}-${index + 1}`,
      };
    }

    const obj = entry as { data?: string; mimeType?: string; filename?: string };
    if (typeof obj.data === 'string' && typeof obj.mimeType === 'string') {
      return {
        buffer: Buffer.from(obj.data, 'base64'),
        mimeType: obj.mimeType,
        originalName: obj.filename || body.filename || `upload-${Date.now()}-${index + 1}`,
      };
    }

    throw new Error('Invalid image format. Expected base64 string or {data, mimeType}');
  });
};

const parseMultipartFiles = (files: AuthRequest['files']): UploadedInput[] => {
  if (!files) return [];

  if (Array.isArray(files)) {
    return files.map((file) => ({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    }));
  }

  const grouped = files as Record<string, Express.Multer.File[]>;
  const entries = [...(grouped.image || []), ...(grouped.images || []), ...(grouped.file || [])];
  return entries.map((file) => ({
    buffer: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
  }));
};

/**
 * POST /api/upload/images — Upload one or more images
 *
 * Uses raw body parsing since multer may not be installed.
 * Expects multipart/form-data with field name "images" or "file".
 *
 * For now, this is a JSON-based endpoint that accepts base64 data.
 * If multer is present, it can be swapped in.
 */
router.post(
  '/images',
  authenticateToken,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 20 },
    { name: 'file', maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response) => {
  try {
    const multipartFiles = parseMultipartFiles(req.files);
    const jsonFiles = multipartFiles.length === 0 ? parseJsonPayload(req.body) : [];
    const inputFiles = multipartFiles.length > 0 ? multipartFiles : jsonFiles;
    const generatePlacementCrops = parseBoolean((req.body as any)?.generatePlacementCrops);
    const placementCropRatios = parseCsvField((req.body as any)?.placementCropRatios);
    const cropMode = ((req.body as any)?.cropMode === 'manual' ? 'manual' : 'auto') as 'auto' | 'manual';
    const cropFitMode = (['cover', 'contain', 'fill'].includes(String((req.body as any)?.cropFitMode))
      ? String((req.body as any)?.cropFitMode)
      : 'cover') as 'cover' | 'contain' | 'fill';
    const focalX = parseNumberField((req.body as any)?.focalX, 50);
    const focalY = parseNumberField((req.body as any)?.focalY, 50);
    const backgroundTheme = (['auto', 'light', 'dark'].includes(String((req.body as any)?.backgroundTheme))
      ? String((req.body as any)?.backgroundTheme)
      : 'auto') as 'auto' | 'light' | 'dark';
    const repeatPattern = parseBoolean((req.body as any)?.repeatPattern);
    const repeatDirection = (['both', 'x', 'y'].includes(String((req.body as any)?.repeatDirection))
      ? String((req.body as any)?.repeatDirection)
      : 'both') as 'both' | 'x' | 'y';

    if (inputFiles.length === 0) {
      res.status(400).json({
        error: 'No files provided. Send multipart files in image/images/file or base64 data in image/images.',
      });
      return;
    }

    const results = [];

    for (const input of inputFiles) {
      const uploaded = await uploadMediaFromBuffer(input.buffer, input.originalName, input.mimeType, {
        generatePlacementCrops,
        placementCropRatios,
        cropMode,
        cropFitMode,
        focalX,
        focalY,
        backgroundTheme,
        repeatPattern,
        repeatDirection,
      });

      results.push({
        filename: uploaded.filename,
        key: uploaded.key,
        url: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        size: uploaded.size,
        mimeType: uploaded.mimeType,
        type: uploaded.type,
        variants: uploaded.variants,
      });
    }

    res.status(201).json({
      success: true,
      files: results,
      url: results.length === 1 ? results[0]?.url : undefined,
      thumbnailUrl: results.length === 1 ? results[0]?.thumbnailUrl : undefined,
      variants: results.length === 1 ? results[0]?.variants : undefined,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload media';
    const payload: any = { error: message };
    if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
      payload.stack = error.stack;
    }
    res.status(500).json(payload);
  }
});

export default router;
