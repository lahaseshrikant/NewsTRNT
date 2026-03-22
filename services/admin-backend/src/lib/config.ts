// src/lib/config.ts - Environment-based configuration
const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) ? num : fallback;
};

const parseCsv = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) return fallback;
  const parsed = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
};

export const config = {
  // Database configuration
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: process.env.NODE_ENV === 'production' ? 20 : 5,
    ssl: process.env.NODE_ENV === 'production',
    pooling: process.env.DATABASE_POOLING === 'true'
  },

  // AI configuration  
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.NODE_ENV === 'production' ? 'gpt-4' : 'gpt-3.5-turbo',
    maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : 1000,
    rateLimit: process.env.AI_RATE_LIMIT ? parseInt(process.env.AI_RATE_LIMIT) : 100
  },

  // Storage configuration
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    // Base path inside storage buckets / local public directory.
    // This is used in URLs like: https://cdn.example.com/media/2026/03/<file>
    uploadBasePath: process.env.STORAGE_UPLOAD_BASE_PATH || 'media',
    localBaseDir: process.env.LOCAL_STORAGE_DIR || 'public',
    cdnDomain: process.env.CDN_DOMAIN,
    r2: {
      accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      bucket: process.env.CLOUDFLARE_R2_BUCKET,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    maxFileSize: parseNumber(process.env.MAX_FILE_SIZE, 26214400), // 25MB
    allowedTypes: parseCsv(process.env.ALLOWED_MEDIA_MIME_TYPES, [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
    ])
  },

  media: {
    imageVariantWidths: parseCsv(process.env.MEDIA_IMAGE_VARIANT_WIDTHS, ['320', '640', '1024'])
      .map((width) => Number.parseInt(width, 10))
      .filter((width) => Number.isFinite(width) && width > 0),
    imageVariantFormats: parseCsv(process.env.MEDIA_IMAGE_VARIANT_FORMATS, ['webp', 'avif']) as Array<'webp' | 'avif'>,
    placementCropRatios: parseCsv(process.env.MEDIA_PLACEMENT_CROP_RATIOS, ['16x9', '4x3', '1x1']),
    placementCropWidths: parseCsv(process.env.MEDIA_PLACEMENT_CROP_WIDTHS, ['640', '1024'])
      .map((width) => Number.parseInt(width, 10))
      .filter((width) => Number.isFinite(width) && width > 0),
    videoPosterWidth: parseNumber(process.env.MEDIA_VIDEO_POSTER_WIDTH, 640),
    videoPosterHeight: parseNumber(process.env.MEDIA_VIDEO_POSTER_HEIGHT, 360),
    cleanupCostPerGbUsd: Number.parseFloat(process.env.MEDIA_COST_PER_GB_USD || '0.015'),
    enableResizeFallback: process.env.MEDIA_ENABLE_RESIZE_FALLBACK !== 'false',
  },

  // Feature flags for scaling
  features: {
    realTimeUpdates: process.env.ENABLE_REALTIME === 'true',
    advancedAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    premiumFeatures: process.env.PLAN_TIER === 'premium',
    aiContentGeneration: process.env.ENABLE_AI_CONTENT === 'true',
    multiLanguage: process.env.ENABLE_MULTILANG === 'true'
  },

  // Performance configuration
  performance: {
    cacheDuration: process.env.CACHE_DURATION ? parseInt(process.env.CACHE_DURATION) : 3600,
    enableCdn: process.env.ENABLE_CDN === 'true',
    compressionLevel: process.env.COMPRESSION_LEVEL ? parseInt(process.env.COMPRESSION_LEVEL) : 6,
    imageOptimization: process.env.OPTIMIZE_IMAGES === 'true'
  },

  // Monitoring configuration
  monitoring: {
    enableErrorTracking: process.env.ENABLE_ERROR_TRACKING === 'true',
    enablePerformanceTracking: process.env.ENABLE_PERFORMANCE_TRACKING === 'true',
    enableUserAnalytics: process.env.ENABLE_USER_ANALYTICS === 'true',
    logLevel: process.env.LOG_LEVEL || 'info'
  }
}

// Tier-specific configurations
export const tierConfigs = {
  free: {
    maxUsers: 1000,
    maxArticlesPerDay: 50,
    maxAIRequests: 100,
    enableRealtime: false,
    enableAnalytics: false
  },
  
  growth: {
    maxUsers: 50000,
    maxArticlesPerDay: 500,
    maxAIRequests: 1000,
    enableRealtime: true,
    enableAnalytics: true
  },
  
  scale: {
    maxUsers: 500000,
    maxArticlesPerDay: 5000,
    maxAIRequests: 10000,
    enableRealtime: true,
    enableAnalytics: true,
    enablePremiumFeatures: true
  },
  
  enterprise: {
    maxUsers: Infinity,
    maxArticlesPerDay: Infinity,
    maxAIRequests: Infinity,
    enableRealtime: true,
    enableAnalytics: true,
    enablePremiumFeatures: true,
    enableCustomIntegrations: true
  }
}

export default config
