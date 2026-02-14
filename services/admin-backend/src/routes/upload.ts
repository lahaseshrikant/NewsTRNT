/**
 * File Upload Routes
 * Image upload for articles, web stories, and media library
 * Mounted at: /api/upload
 */
import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Ensure upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads', 'images');

function ensureUploadDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];

/**
 * POST /api/upload/images — Upload one or more images
 *
 * Uses raw body parsing since multer may not be installed.
 * Expects multipart/form-data with field name "images" or "file".
 *
 * For now, this is a JSON-based endpoint that accepts base64 data.
 * If multer is present, it can be swapped in.
 */
router.post('/images', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    ensureUploadDir(UPLOAD_DIR);

    // Handle JSON payload with base64 image(s)
    const { image, images, filename, folder } = req.body;

    // Determine target folder
    const targetFolder = folder || 'uploads/images';
    const targetDir = path.join(process.cwd(), 'public', targetFolder);
    ensureUploadDir(targetDir);

    const imageList = images || (image ? [image] : []);

    if (imageList.length === 0) {
      res.status(400).json({ error: 'No images provided. Send base64 image data in "image" or "images" field.' });
      return;
    }

    const results: { filename: string; url: string; size: number }[] = [];

    for (const img of imageList) {
      let base64Data: string;
      let mimeType: string;
      let ext: string;

      if (typeof img === 'string' && img.startsWith('data:')) {
        // Data URL format: data:image/png;base64,iVBOR...
        const match = img.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
        if (!match) {
          res.status(400).json({ error: 'Invalid base64 data URL format' });
          return;
        }
        mimeType = match[1];
        base64Data = match[2];
      } else if (typeof img === 'string') {
        // Raw base64 string — assume JPEG
        base64Data = img;
        mimeType = 'image/jpeg';
      } else if (img.data && img.mimeType) {
        // Object format: { data: "...", mimeType: "image/png", filename: "..." }
        base64Data = img.data;
        mimeType = img.mimeType;
      } else {
        res.status(400).json({ error: 'Invalid image format. Expected base64 string or {data, mimeType}' });
        return;
      }

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        res.status(400).json({ error: `Unsupported image type: ${mimeType}` });
        return;
      }

      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > MAX_FILE_SIZE) {
        res.status(400).json({ error: `Image exceeds max size of ${MAX_FILE_SIZE / 1024 / 1024}MB` });
        return;
      }

      // Determine extension
      const extMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'image/avif': '.avif',
      };
      ext = extMap[mimeType] || '.jpg';

      // Generate unique filename
      const safeFilename = filename
        ? filename.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/\.[^.]+$/, '') + ext
        : `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

      const filePath = path.join(targetDir, safeFilename);
      fs.writeFileSync(filePath, buffer);

      results.push({
        filename: safeFilename,
        url: `/${targetFolder}/${safeFilename}`,
        size: buffer.length,
      });
    }

    res.status(201).json({
      success: true,
      files: results,
      url: results.length === 1 ? results[0].url : undefined,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
