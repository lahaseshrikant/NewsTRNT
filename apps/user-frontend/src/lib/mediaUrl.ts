const FALLBACK_FORMAT = 'webp';

const AVAILABLE_WIDTHS = [320, 640, 1024];

export type ImagePlacement =
  | 'hero'
  | 'featured'
  | 'card'
  | 'list'
  | 'thumb';

const PLACEMENT_WIDTH_HINTS: Record<ImagePlacement, number> = {
  hero: 1024,
  featured: 1024,
  card: 640,
  list: 640,
  thumb: 320,
};

const PLACEMENT_RATIO_HINTS: Record<ImagePlacement, '16x9' | '2x1' | '4x3' | '1x1'> = {
  hero: '16x9',
  featured: '2x1',
  card: '2x1',
  list: '4x3',
  thumb: '1x1',
};

const isAbsoluteHttp = (value: string): boolean => /^https?:\/\//i.test(value);

export const buildResponsiveMediaUrl = (
  src: string,
  width?: number,
  format: 'webp' | 'avif' = FALLBACK_FORMAT as 'webp' | 'avif',
): string => {
  if (!src || !isAbsoluteHttp(src)) return src;

  const enableResize = process.env.NEXT_PUBLIC_ENABLE_CF_IMAGE_RESIZE !== 'false';
  if (!enableResize) return src;

  try {
    const url = new URL(src);
    if (width && width > 0) {
      url.searchParams.set('width', String(width));
    }
    url.searchParams.set('format', format);
    return url.toString();
  } catch {
    return src;
  }
};

const pickBestAvailableWidth = (targetWidth: number): number => {
  const sorted = [...AVAILABLE_WIDTHS].sort((a, b) => a - b);
  const firstMatch = sorted.find((width) => width >= targetWidth);
  return firstMatch || sorted[sorted.length - 1];
};

const derivePlacementVariantUrl = (
  src: string,
  placement: ImagePlacement,
  width: number,
  format: 'webp' | 'avif',
): string | null => {
  try {
    const parsed = new URL(src);
    const pathname = parsed.pathname;
    const extMatch = pathname.match(/\.[^.\/]+$/);
    if (!extMatch) return null;

    const extension = extMatch[0];
    const stem = pathname.slice(0, -extension.length);
    const ratio = PLACEMENT_RATIO_HINTS[placement];
    const variantPath = `${stem}-r${ratio}-w${width}.${format}`;

    parsed.pathname = variantPath;
    parsed.search = '';
    return parsed.toString();
  } catch {
    return null;
  }
};

export const buildPlacementMediaUrl = (
  src: string,
  placement: ImagePlacement,
  format: 'webp' | 'avif' = FALLBACK_FORMAT as 'webp' | 'avif',
): string => {
  const preferredWidth = PLACEMENT_WIDTH_HINTS[placement];
  const bestWidth = pickBestAvailableWidth(preferredWidth);

  const enableStoredCropPreference = process.env.NEXT_PUBLIC_PREFER_STORED_CROPS === 'true';
  if (enableStoredCropPreference) {
    const candidate = derivePlacementVariantUrl(src, placement, bestWidth, format);
    if (candidate) return candidate;
  }

  return buildResponsiveMediaUrl(src, bestWidth, format);
};
