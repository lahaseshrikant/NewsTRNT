// src/lib/site-config-cache.ts
// Frontend cache module - fetches public site config from API

interface CachedConfig {
  publicData: Record<string, any>;
  timestamp: number;
  version: number;
}

let configCache: CachedConfig | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get public site config
export async function getSiteConfig(): Promise<Record<string, any>> {
  const now = Date.now();

  // Return cached public config if valid
  if (configCache && (now - configCache.timestamp) < CACHE_DURATION) {
    return configCache.publicData;
  }

  // Fetch from public API
  try {
    const response = await fetch('/api/site-config/public');
    if (!response.ok) throw new Error('Failed to fetch config');
    const data = await response.json();
    
    configCache = {
      publicData: data.config || {},
      timestamp: now,
      version: (configCache?.version || 0) + 1
    };

    return configCache.publicData;
  } catch (error) {
    console.error('Error fetching public site config:', error);
    return configCache?.publicData || {};
  }
}

export function clearSiteConfigCache(): void {
  configCache = null;
}

export function invalidateConfigCache(): void {
  clearSiteConfigCache();
}