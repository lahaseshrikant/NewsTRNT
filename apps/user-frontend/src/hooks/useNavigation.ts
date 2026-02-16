import { useState, useEffect } from 'react';

export interface NavigationItem {
  id: string;
  name: string;
  label: string;
  href: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const NAVIGATION_STORAGE_KEY = 'newstrnt-navigation-data';

// Default header placeholders (show immediately to avoid layout shift). These are UI-only — server data is authoritative.
const defaultNavigation: NavigationItem[] = [
  { id: 'home', name: 'home', label: 'Home', href: '/', icon: '🏠', isActive: true, sortOrder: 1, isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'underreported', name: 'underreported', label: 'Underreported', href: '/underreported', icon: '🕵️‍♀️', isActive: true, sortOrder: 2, isSystem: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'world', name: 'world', label: 'World', href: '/world', icon: '🌍', isActive: true, sortOrder: 3, isSystem: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'shorts', name: 'shorts', label: 'Shorts', href: '/shorts', icon: '⚡', isActive: true, sortOrder: 4, isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'stories', name: 'stories', label: 'Stories', href: '/web-stories', icon: '📖', isActive: true, sortOrder: 5, isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'trending', name: 'trending', label: 'Trending', href: '/trending', icon: '🔥', isActive: true, sortOrder: 6, isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'politics', name: 'politics', label: 'Politics', href: '/category/politics', icon: '🏛️', isActive: true, sortOrder: 7, isSystem: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sports', name: 'sports', label: 'Sports', href: '/category/sports', icon: '🏅', isActive: true, sortOrder: 8, isSystem: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'business', name: 'business', label: 'Business', href: '/category/business', icon: '💼', isActive: true, sortOrder: 9, isSystem: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'entertainment', name: 'entertainment', label: 'Entertainment', href: '/category/entertainment', icon: '🎬', isActive: true, sortOrder: 10, isSystem: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'science', name: 'science', label: 'Science', href: '/category/science', icon: '🔬', isActive: true, sortOrder: 11, isSystem: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'technology', name: 'technology', label: 'Technology', href: '/category/technology', icon: '💻', isActive: true, sortOrder: 12, isSystem: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const useNavigation = () => {
  // Start with UI-only placeholders so header renders immediately and avoids layout shift.
  const [navigation, setNavigation] = useState<NavigationItem[]>(defaultNavigation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false); // true when server-provided navigation has been loaded

  useEffect(() => {
    const loadNavigation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prefer server-provided navigation (proxied to admin backend)
        const resp = await fetch('/api/navigation', { method: 'GET', cache: 'no-cache' });
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            setNavigation(data);
            setHydrated(true); // server data now authoritative
            try { localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(data)); } catch {}
            setLoading(false);
            return;
          }
        }

        // If server returned nothing or failed, we keep the placeholder/default navigation in-place.
        // Try localStorage only as optional cache (won't replace placeholders unless valid data exists).
        const stored = localStorage.getItem(NAVIGATION_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setNavigation(parsed);
              setLoading(false);
              return;
            }
          } catch (err) {
            /* ignore parse errors */
          }
        }

        // Keep defaultNavigation (placeholders) as UI-first fallback.
      } catch (err) {
        console.error('Error loading navigation from server/localStorage:', err);
        setError(err instanceof Error ? err.message : 'Failed to load navigation');
        setNavigation(defaultNavigation);
      } finally {
        setLoading(false);
      }
    };

    loadNavigation();

    // Listen for storage changes (when admin updates navigation)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NAVIGATION_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNavigation(parsed);
          }
        } catch (error) {
          console.error('Error parsing navigation from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { navigation, loading, error, hydrated };
};