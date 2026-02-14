'use client';

import { useState, useEffect, useCallback } from 'react';
import { statsApi, SiteStats, FormattedStats, CategoryStats } from '@/lib/api-client';

// Default formatted stats (used during loading or on error)
const defaultFormattedStats: FormattedStats = {
  totalArticles: '0',
  monthlyVisitors: '0',
  pageViews: '0',
  emailSubscribers: '0',
  socialFollowers: '0',
  totalCategories: '0',
  totalWebStories: '0',
  engagements: '0'
};

// Default raw stats
const defaultSiteStats: SiteStats = {
  totalArticles: 0,
  totalViews: 0,
  totalCategories: 0,
  totalWebStories: 0,
  publishedArticles: 0,
  trendingArticles: 0,
  featuredArticles: 0,
  breakingNews: 0,
  totalComments: 0,
  totalShares: 0,
  topCategories: [],
  recentActivityCount: 0
};

interface UseSiteStatsReturn {
  stats: SiteStats;
  formattedStats: FormattedStats;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch real site statistics from the backend API
 */
export function useSiteStats(): UseSiteStatsReturn {
  const [stats, setStats] = useState<SiteStats>(defaultSiteStats);
  const [formattedStats, setFormattedStats] = useState<FormattedStats>(defaultFormattedStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both raw and formatted stats in parallel
      const [rawStats, formatted] = await Promise.all([
        statsApi.getSiteStats(),
        statsApi.getFormattedStats()
      ]);
      
      setStats(rawStats);
      setFormattedStats(formatted);
    } catch (err) {
      console.error('Failed to fetch site stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    formattedStats,
    loading,
    error,
    refetch: fetchStats
  };
}

interface UseCategoryStatsReturn {
  stats: CategoryStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch category-specific statistics
 */
export function useCategoryStats(slug: string): UseCategoryStatsReturn {
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      const categoryStats = await statsApi.getCategoryStats(slug);
      setStats(categoryStats);
    } catch (err) {
      console.error(`Failed to fetch stats for category ${slug}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch category stats'));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

/**
 * Helper function to format numbers for display (client-side fallback)
 */
export function formatStatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
  return num.toString();
}

export default useSiteStats;
