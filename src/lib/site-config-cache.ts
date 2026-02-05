// src/lib/site-config-cache.ts
// Note: This is a frontend cache module - it fetches from API endpoints

interface CachedConfig {
  allData: Record<string, any>;  // All config data
  publicData: Record<string, any>;  // Only public config data
  timestamp: number;
  version: number;
}

let configCache: CachedConfig | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get ALL configs (for admin use) - fetches from API
export async function getAllSiteConfig(): Promise<Record<string, any>> {
  const now = Date.now();

  // Return cached config if valid
  if (configCache && (now - configCache.timestamp) < CACHE_DURATION) {
    return configCache.allData;
  }

  // Fetch from API
  try {
    const response = await fetch('/api/admin/site-config');
    if (!response.ok) throw new Error('Failed to fetch config');
    const data = await response.json();
    
    // Update cache with both all and public data
    configCache = {
      allData: data.config || {},
      publicData: data.config || {},
      timestamp: now,
      version: (configCache?.version || 0) + 1
    };

    return configCache.allData;
  } catch (error) {
    console.error('Error fetching site config:', error);
    return configCache?.allData || {};
  }
}

// Get only PUBLIC configs (for frontend/website use)
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
    
    // Update cache
    if (!configCache) {
      configCache = {
        allData: {},
        publicData: data.config || {},
        timestamp: now,
        version: 1
      };
    } else {
      configCache.publicData = data.config || {};
      configCache.timestamp = now;
      configCache.version++;
    }

    return configCache.publicData;
  } catch (error) {
    console.error('Error fetching public site config:', error);
    return configCache?.publicData || {};
  }
}

export function clearSiteConfigCache(): void {
  configCache = null;
}

// Auto-clear cache when config is updated
export function invalidateConfigCache(): void {
  clearSiteConfigCache();
}