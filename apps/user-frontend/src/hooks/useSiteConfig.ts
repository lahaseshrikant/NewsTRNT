// src/hooks/useSiteConfig.ts
// Hook for fetching public site configuration (site name, social links, contact info, etc.)
// Only returns configs marked as isPublic=true in the database
import { useState, useEffect } from 'react';

interface SiteConfig {
  site_name?: string;
  site_tagline?: string;
  contact_email?: string;
  social_links?: any;
  [key: string]: any;
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  const fetchSiteConfig = async () => {
    try {
      const response = await fetch('/api/site-config/public');
      if (!response.ok) throw new Error('Failed to fetch config');
      const data = await response.json();
      setConfig(data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error, refetch: fetchSiteConfig };
}