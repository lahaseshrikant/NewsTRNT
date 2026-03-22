import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import config from './config';
import { getPublicUrl, uploadFile } from './storage';

export type MediaKind = 'image' | 'video' | 'audio' | 'document';

export interface UploadedVariant {
  key: string;
  url: string;
  width?: number;
  height?: number;
  ratio?: string;
  format: string;
  mimeType: string;
  strategy: 'prebuilt' | 'on-demand-fallback';
}

export interface UploadMediaOptions {
  generatePlacementCrops?: boolean;
  placementCropRatios?: string[];
  placementCropWidths?: number[];
  cropMode?: 'auto' | 'manual';
  cropFitMode?: 'cover' | 'contain' | 'fill';
  focalX?: number;
  focalY?: number;
  backgroundTheme?: 'auto' | 'light' | 'dark';
  repeatPattern?: boolean;
  repeatDirection?: 'both' | 'x' | 'y';
}

export interface UploadedMediaResult {
  key: string;
  url: string;
  filename: string;
  folder: string;
  mimeType: string;
  size: number;
  type: MediaKind;
  thumbnailUrl?: string;
  variants: UploadedVariant[];
}

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);

const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']);

const AUDIO_MIME_TYPES = new Set(['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg']);

const slugify = (value: string): string => {
  const name = value.trim().toLowerCase();
  const withoutExtension = name.replace(/\.[^/.]+$/, '');
  const safe = withoutExtension.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return safe || 'media';
};

const getMediaType = (mimeType: string): MediaKind => {
  if (IMAGE_MIME_TYPES.has(mimeType)) return 'image';
  if (VIDEO_MIME_TYPES.has(mimeType)) return 'video';
  if (AUDIO_MIME_TYPES.has(mimeType)) return 'audio';
  return 'document';
};

const getExtensionForMime = (mimeType: string): string => {
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/x-matroska': 'mkv',
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
  };

  return extMap[mimeType] || 'bin';
};

const createBaseKey = (filename: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const slug = slugify(filename);
  const shortId = crypto.randomBytes(3).toString('hex');

  return `${config.storage.uploadBasePath}/${year}/${month}/${slug}-${shortId}`;
};

const canTransformImage = (mimeType: string): boolean => {
  return mimeType !== 'image/svg+xml' && mimeType !== 'image/gif';
};

const fallbackVariantUrl = (baseUrl: string, width: number, format: 'webp' | 'avif'): string => {
  const delimiter = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${delimiter}width=${width}&format=${format}`;
};

const parseRatio = (ratio: string): { width: number; height: number } | null => {
  const match = ratio.match(/^(\d+)x(\d+)$/i);
  if (!match) return null;
  const width = Number.parseInt(match[1], 10);
  const height = Number.parseInt(match[2], 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  return { width, height };
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const getBackgroundColor = (theme: UploadMediaOptions['backgroundTheme']): { r: number; g: number; b: number; alpha: number } => {
  if (theme === 'dark') {
    return { r: 22, g: 24, b: 29, alpha: 1 };
  }
  return { r: 245, g: 245, b: 245, alpha: 1 };
};

const buildRepeatedBackground = async (
  buffer: Buffer,
  width: number,
  height: number,
  background: { r: number; g: number; b: number; alpha: number },
  direction: UploadMediaOptions['repeatDirection'] = 'both',
): Promise<Buffer> => {
  const tileWidth = Math.max(40, Math.floor(width / 5));
  const tileHeight = Math.max(40, Math.floor(height / 5));
  const tile = await sharp(buffer)
    .rotate()
    .resize({ width: tileWidth, height: tileHeight, fit: 'cover', withoutEnlargement: true })
    .toBuffer();

  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  const yStep = direction === 'x' ? height : tileHeight;
  const xStep = direction === 'y' ? width : tileWidth;
  for (let top = 0; top < height; top += yStep) {
    for (let left = 0; left < width; left += xStep) {
      composites.push({ input: tile, left, top });
    }
  }

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    },
  })
    .composite(composites)
    .toBuffer();
};

const generatePlacementVariantBuffer = async (
  sourceBuffer: Buffer,
  outputWidth: number,
  outputHeight: number,
  format: 'webp' | 'avif',
  options: UploadMediaOptions,
): Promise<Buffer> => {
  const fitMode = options.cropFitMode || 'cover';
  const cropMode = options.cropMode || 'auto';
  const background = getBackgroundColor(options.backgroundTheme);

  if (fitMode === 'cover' && cropMode === 'manual') {
    const meta = await sharp(sourceBuffer).rotate().metadata();
    const srcWidth = meta.width || outputWidth;
    const srcHeight = meta.height || outputHeight;

    const scale = Math.max(outputWidth / srcWidth, outputHeight / srcHeight);
    const resizedWidth = Math.max(outputWidth, Math.round(srcWidth * scale));
    const resizedHeight = Math.max(outputHeight, Math.round(srcHeight * scale));

    const focalX = clamp((options.focalX ?? 50) / 100, 0, 1);
    const focalY = clamp((options.focalY ?? 50) / 100, 0, 1);

    const centerX = Math.round(focalX * resizedWidth);
    const centerY = Math.round(focalY * resizedHeight);

    const left = clamp(Math.round(centerX - outputWidth / 2), 0, Math.max(0, resizedWidth - outputWidth));
    const top = clamp(Math.round(centerY - outputHeight / 2), 0, Math.max(0, resizedHeight - outputHeight));

    const manualCropped = sharp(sourceBuffer)
      .rotate()
      .resize({ width: resizedWidth, height: resizedHeight })
      .extract({ left, top, width: outputWidth, height: outputHeight });

    return format === 'avif'
      ? manualCropped.avif({ quality: 50 }).toBuffer()
      : manualCropped.webp({ quality: 80 }).toBuffer();
  }

  if (fitMode === 'contain' && options.repeatPattern) {
    const repeatedBg = await buildRepeatedBackground(
      sourceBuffer,
      outputWidth,
      outputHeight,
      background,
      options.repeatDirection || 'both',
    );
    const foreground = await sharp(sourceBuffer)
      .rotate()
      .resize({
        width: outputWidth,
        height: outputHeight,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    const composited = sharp(repeatedBg).composite([{ input: foreground, left: 0, top: 0 }]);
    return format === 'avif'
      ? composited.avif({ quality: 50 }).toBuffer()
      : composited.webp({ quality: 80 }).toBuffer();
  }

  const fit = fitMode === 'fill' ? 'fill' : fitMode === 'contain' ? 'contain' : 'cover';
  const position = cropMode === 'auto' ? 'attention' : 'centre';

  const transformed = sharp(sourceBuffer)
    .rotate()
    .resize({
      width: outputWidth,
      height: outputHeight,
      fit,
      position,
      background,
      withoutEnlargement: true,
    });

  return format === 'avif'
    ? transformed.avif({ quality: 50 }).toBuffer()
    : transformed.webp({ quality: 80 }).toBuffer();
};

const uploadImageWithVariants = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  options: UploadMediaOptions = {},
): Promise<UploadedMediaResult> => {
  const baseKey = createBaseKey(originalName);
  const variants: UploadedVariant[] = [];

  const transformable = canTransformImage(mimeType);
  const canonicalFormat: 'webp' | 'avif' = 'webp';

  let canonicalBuffer = buffer;
  let canonicalExt = getExtensionForMime(mimeType);
  let canonicalMime = mimeType;

  if (transformable) {
    canonicalBuffer = await sharp(buffer)
      .rotate()
      .webp({ quality: 82 })
      .toBuffer();
    canonicalExt = canonicalFormat;
    canonicalMime = 'image/webp';
  }

  const canonicalKey = `${baseKey}.${canonicalExt}`;
  const canonicalUrl = await uploadFile(canonicalBuffer, canonicalKey, canonicalMime);

  if (transformable) {
    const seenKeys = new Set<string>();

    for (const width of config.media.imageVariantWidths) {
      for (const format of config.media.imageVariantFormats) {
        const variantKey = `${baseKey}-w${width}.${format}`;
        if (seenKeys.has(variantKey)) continue;
        seenKeys.add(variantKey);

        const transformed = format === 'avif'
          ? await sharp(buffer)
              .rotate()
              .resize({ width, withoutEnlargement: true })
              .avif({ quality: 50 })
              .toBuffer()
          : await sharp(buffer)
              .rotate()
              .resize({ width, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

        const mime = format === 'avif' ? 'image/avif' : 'image/webp';
        const url = await uploadFile(transformed, variantKey, mime);

        variants.push({
          key: variantKey,
          url,
          width,
          format,
          mimeType: mime,
          strategy: 'prebuilt',
        });
      }
    }

    if (options.generatePlacementCrops) {
      const selectedRatios = (options.placementCropRatios?.length ? options.placementCropRatios : config.media.placementCropRatios)
        .map((ratio) => ratio.trim().toLowerCase())
        .filter(Boolean);
      const selectedWidths = (options.placementCropWidths?.length ? options.placementCropWidths : config.media.placementCropWidths)
        .filter((width) => Number.isFinite(width) && width > 0);

      for (const ratio of selectedRatios) {
        const parsedRatio = parseRatio(ratio);
        if (!parsedRatio) continue;

        for (const targetWidth of selectedWidths) {
          const targetHeight = Math.round(targetWidth * (parsedRatio.height / parsedRatio.width));

          for (const format of config.media.imageVariantFormats) {
            const variantKey = `${baseKey}-r${ratio}-w${targetWidth}.${format}`;
            if (seenKeys.has(variantKey)) continue;
            seenKeys.add(variantKey);

            const transformed = await generatePlacementVariantBuffer(
              buffer,
              targetWidth,
              targetHeight,
              format,
              options,
            );

            const cropMime = format === 'avif' ? 'image/avif' : 'image/webp';
            const cropUrl = await uploadFile(transformed, variantKey, cropMime);

            variants.push({
              key: variantKey,
              url: cropUrl,
              width: targetWidth,
              height: targetHeight,
              ratio,
              format,
              mimeType: cropMime,
              strategy: 'prebuilt',
            });
          }
        }
      }
    }

    if (config.media.enableResizeFallback) {
      for (const width of config.media.imageVariantWidths) {
        for (const format of config.media.imageVariantFormats) {
          variants.push({
            key: `${canonicalKey}?width=${width}&format=${format}`,
            url: fallbackVariantUrl(canonicalUrl, width, format),
            width,
            format,
            mimeType: format === 'avif' ? 'image/avif' : 'image/webp',
            strategy: 'on-demand-fallback',
          });
        }
      }
    }
  }

  const parsed = path.parse(canonicalKey);

  return {
    key: canonicalKey,
    url: canonicalUrl,
    filename: parsed.base,
    folder: parsed.dir,
    mimeType: canonicalMime,
    size: canonicalBuffer.length,
    type: 'image',
    variants,
  };
};

const createVideoPoster = async (
  width: number,
  height: number,
  title: string,
): Promise<Buffer> => {
  const safeTitle = title.replace(/[<>&'\"]/g, '').slice(0, 28);
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111827" />
        <stop offset="100%" stop-color="#1f2937" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <polygon points="${Math.round(width * 0.42)},${Math.round(height * 0.3)} ${Math.round(width * 0.42)},${Math.round(height * 0.7)} ${Math.round(width * 0.68)},${Math.round(height * 0.5)}" fill="#ffffff" fill-opacity="0.9"/>
    <text x="50%" y="88%" text-anchor="middle" fill="#e5e7eb" font-size="${Math.max(12, Math.round(width * 0.03))}" font-family="Arial, sans-serif">${safeTitle}</text>
  </svg>`;

  return sharp(Buffer.from(svg))
    .webp({ quality: 78 })
    .toBuffer();
};

const uploadVideo = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<UploadedMediaResult> => {
  const baseKey = createBaseKey(originalName);
  const ext = getExtensionForMime(mimeType);
  const key = `${baseKey}.${ext}`;
  const url = await uploadFile(buffer, key, mimeType);

  const posterBuffer = await createVideoPoster(
    config.media.videoPosterWidth,
    config.media.videoPosterHeight,
    originalName,
  );

  const posterKey = `${baseKey}-poster.webp`;
  const thumbnailUrl = await uploadFile(posterBuffer, posterKey, 'image/webp');

  const parsed = path.parse(key);

  return {
    key,
    url,
    filename: parsed.base,
    folder: parsed.dir,
    mimeType,
    size: buffer.length,
    thumbnailUrl,
    type: 'video',
    variants: [
      {
        key: posterKey,
        url: thumbnailUrl,
        width: config.media.videoPosterWidth,
        format: 'webp',
        mimeType: 'image/webp',
        strategy: 'prebuilt',
      },
    ],
  };
};

const uploadOther = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<UploadedMediaResult> => {
  const ext = getExtensionForMime(mimeType);
  const key = `${createBaseKey(originalName)}.${ext}`;
  const url = await uploadFile(buffer, key, mimeType);
  const parsed = path.parse(key);

  return {
    key,
    url,
    filename: parsed.base,
    folder: parsed.dir,
    mimeType,
    size: buffer.length,
    type: getMediaType(mimeType),
    variants: [],
  };
};

export const isAllowedMediaType = (mimeType: string): boolean => {
  return config.storage.allowedTypes.includes(mimeType);
};

export const getMediaTypeLabel = getMediaType;

export const uploadMediaFromBuffer = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  options: UploadMediaOptions = {},
): Promise<UploadedMediaResult> => {
  if (!isAllowedMediaType(mimeType)) {
    throw new Error(`Unsupported media type: ${mimeType}`);
  }

  if (buffer.length > config.storage.maxFileSize) {
    const maxMb = (config.storage.maxFileSize / 1024 / 1024).toFixed(0);
    throw new Error(`Media exceeds max size of ${maxMb}MB`);
  }

  const mediaType = getMediaType(mimeType);

  if (mediaType === 'image') {
    return uploadImageWithVariants(buffer, originalName, mimeType, options);
  }

  if (mediaType === 'video') {
    return uploadVideo(buffer, originalName, mimeType);
  }

  return uploadOther(buffer, originalName, mimeType);
};

export const deriveExpectedVariantKeys = (key: string, mimeType: string): string[] => {
  const parsed = path.parse(key);
  const keys: string[] = [key];

  if (getMediaType(mimeType) === 'image' && canTransformImage(mimeType)) {
    for (const width of config.media.imageVariantWidths) {
      for (const format of config.media.imageVariantFormats) {
        keys.push(`${parsed.dir}/${parsed.name}-w${width}.${format}`);
      }
    }

    for (const ratio of config.media.placementCropRatios) {
      const normalizedRatio = ratio.trim().toLowerCase();
      if (!parseRatio(normalizedRatio)) continue;
      for (const width of config.media.placementCropWidths) {
        for (const format of config.media.imageVariantFormats) {
          keys.push(`${parsed.dir}/${parsed.name}-r${normalizedRatio}-w${width}.${format}`);
        }
      }
    }
  }

  if (getMediaType(mimeType) === 'video') {
    keys.push(`${parsed.dir}/${parsed.name}-poster.webp`);
  }

  return keys;
};

export const deriveVariantUrls = (url: string, mimeType: string): UploadedVariant[] => {
  const variants: UploadedVariant[] = [];
  const mediaType = getMediaType(mimeType);

  if (mediaType !== 'image') return variants;

  const withoutExtension = url.replace(/\.[^./?]+(\?.*)?$/, '');
  for (const width of config.media.imageVariantWidths) {
    for (const format of config.media.imageVariantFormats) {
      variants.push({
        key: `${withoutExtension}-w${width}.${format}`,
        url: `${withoutExtension}-w${width}.${format}`,
        width,
        format,
        mimeType: format === 'avif' ? 'image/avif' : 'image/webp',
        strategy: 'prebuilt',
      });

      if (config.media.enableResizeFallback) {
        variants.push({
          key: `${url}?width=${width}&format=${format}`,
          url: fallbackVariantUrl(url, width, format),
          width,
          format,
          mimeType: format === 'avif' ? 'image/avif' : 'image/webp',
          strategy: 'on-demand-fallback',
        });
      }
    }
  }

  for (const ratio of config.media.placementCropRatios) {
    const normalizedRatio = ratio.trim().toLowerCase();
    const parsedRatio = parseRatio(normalizedRatio);
    if (!parsedRatio) continue;

    for (const width of config.media.placementCropWidths) {
      const height = Math.round(width * (parsedRatio.height / parsedRatio.width));
      for (const format of config.media.imageVariantFormats) {
        variants.push({
          key: `${withoutExtension}-r${normalizedRatio}-w${width}.${format}`,
          url: `${withoutExtension}-r${normalizedRatio}-w${width}.${format}`,
          width,
          height,
          ratio: normalizedRatio,
          format,
          mimeType: format === 'avif' ? 'image/avif' : 'image/webp',
          strategy: 'prebuilt',
        });
      }
    }
  }

  return variants;
};

export const buildStorageUrlFromKey = (key: string): string => getPublicUrl(key);
