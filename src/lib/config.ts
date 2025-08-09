// src/lib/config.ts - Environment-based configuration
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
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 5242880, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
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
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 5242880, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
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
