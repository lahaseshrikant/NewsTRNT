import { Category } from '@/types/api';

// Partial category type for cases where we don't have all fields
interface PartialCategory {
  name?: string;
  slug?: string;
  color?: string;
}

// Generate category badge styles based on category name or color
export const getCategoryBadgeStyle = (category: Category | PartialCategory | string | null | undefined): string => {
  if (!category) return 'bg-ash/50 text-ink dark:bg-ink dark:text-ivory';
  
  // If category is a Category object with a color, use it
  if (typeof category === 'object' && category.color) {
    // Convert hex color to tailwind-compatible editorial classes
    const hexToTailwind = (hex: string): string => {
      const colorMap: Record<string, string> = {
        '#3182CE': 'bg-vermillion/10 text-vermillion dark:bg-vermillion/20 dark:text-vermillion/80',
        '#059669': 'bg-ink/10 text-ink dark:bg-ivory/10 dark:text-ivory',
        '#DC2626': 'bg-vermillion/10 text-vermillion dark:bg-vermillion/20 dark:text-vermillion/80',
        '#EA580C': 'bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold/80',
        '#7C3AED': 'bg-ink/10 text-ink dark:bg-ivory/10 dark:text-ivory',
        '#F59E0B': 'bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold/80',
        '#DB2777': 'bg-vermillion/10 text-vermillion dark:bg-vermillion/20 dark:text-vermillion/80',
      };
      
      return colorMap[hex] || 'bg-ash/50 text-ink dark:bg-ink dark:text-ivory';
    };
    
    return hexToTailwind(category.color);
  }

  // Fallback: generate style based on category name
  const categoryName = typeof category === 'string' ? category : (category.name || '');
  if (!categoryName) return 'bg-ash/50 text-ink dark:bg-ink dark:text-ivory';
  
  const categoryStyles: Record<string, string> = {
    'Technology': 'bg-vermillion/10 text-vermillion dark:bg-vermillion/20 dark:text-vermillion/80',
    'Business': 'bg-ink/10 text-ink dark:bg-ivory/10 dark:text-ivory',
    'Politics': 'bg-vermillion/10 text-vermillion dark:bg-vermillion/20 dark:text-vermillion/80',
    'Sports': 'bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold/80',
    'Health': 'bg-vermillion/10 text-vermillion dark:bg-vermillion/20 dark:text-vermillion/80',
    'Science': 'bg-ink/10 text-ink dark:bg-ivory/10 dark:text-ivory',
    'Entertainment': 'bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold/80',
    'World': 'bg-vermillion/10 text-vermillion dark:bg-vermillion/20 dark:text-vermillion/80',
    'Environment': 'bg-ink/10 text-ink dark:bg-ivory/10 dark:text-ivory'
  };

  return categoryStyles[categoryName] || 'bg-ash/50 text-ink dark:bg-ink dark:text-ivory';
};

// Get category by name or slug
export const findCategoryByName = (categories: Category[], name: string): Category | undefined => {
  return categories.find(cat => 
    cat.name.toLowerCase() === name.toLowerCase() || 
    cat.slug.toLowerCase() === name.toLowerCase()
  );
};

// Get category display name (with fallback)
export const getCategoryDisplayName = (category: Category | string | null): string => {
  if (!category) return 'Uncategorized';
  if (typeof category === 'string') return category;
  return category.name;
};

// Get category slug (with fallback)
export const getCategorySlug = (category: Category | string | null): string => {
  if (!category) return 'uncategorized';
  if (typeof category === 'string') return category.toLowerCase().replace(/\s+/g, '-');
  return category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
};

// Generate consistent colors for categories that don't have defined colors
export const generateCategoryColor = (categoryName: string): string => {
  const colors = [
    '#3182CE', // Blue
    '#059669', // Green  
    '#DC2626', // Red
    '#EA580C', // Orange
    '#7C3AED', // Purple
    '#F59E0B', // Amber
    '#DB2777', // Pink
    '#0D9488', // Teal
    '#7C2D12', // Brown
    '#6366F1'  // Indigo
  ];
  
  // Generate consistent color based on category name
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    const char = categoryName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
};

