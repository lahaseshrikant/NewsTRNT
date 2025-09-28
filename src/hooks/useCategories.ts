import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface UseCategoriesOptions {
  includeInactive?: boolean;
  includeStats?: boolean;
}

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (options: UseCategoriesOptions = {}): UseCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { includeInactive = false, includeStats = false } = options;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (includeInactive) params.append('includeInactive', 'true');
      if (includeStats) params.append('includeStats', 'true');

      const response = await fetch(`/api/categories?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      const categoriesList = data.categories || [];
      
      // Sort categories by sortOrder and then by name
      const sortedCategories = categoriesList.sort((a: Category, b: Category) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });

      setCategories(sortedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      // Set fallback categories for graceful degradation
      setCategories([
        { id: 'tech', name: 'Technology', slug: 'technology', color: '#3182CE', isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
        { id: 'business', name: 'Business', slug: 'business', color: '#059669', isActive: true, sortOrder: 2, createdAt: '', updatedAt: '' },
        { id: 'health', name: 'Health', slug: 'health', color: '#DC2626', isActive: true, sortOrder: 3, createdAt: '', updatedAt: '' },
        { id: 'sports', name: 'Sports', slug: 'sports', color: '#EA580C', isActive: true, sortOrder: 4, createdAt: '', updatedAt: '' },
        { id: 'science', name: 'Science', slug: 'science', color: '#7C3AED', isActive: true, sortOrder: 5, createdAt: '', updatedAt: '' },
        { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', color: '#F59E0B', isActive: true, sortOrder: 6, createdAt: '', updatedAt: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeInactive, includeStats]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

export default useCategories;