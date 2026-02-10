import { Category } from '@/types/api';

// Partial category type for cases where we don't have all fields
interface PartialCategory {
  name?: string;
  slug?: string;
  color?: string;
}

// Generate category badge styles based on category name or color
export const getCategoryBadgeStyle = (category: Category | PartialCategory | string | null | undefined): string => {
  if (!category) return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
  
  // If category is a Category object with a color, use it
  if (typeof category === 'object' && category.color) {
    // Convert hex color to tailwind-compatible classes
    const hexToTailwind = (hex: string): string => {
      const colorMap: Record<string, string> = {
        '#3182CE': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        '#059669': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
        '#DC2626': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        '#EA580C': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
        '#7C3AED': 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        '#F59E0B': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        '#DB2777': 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
      };
      
      return colorMap[hex] || 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
    };
    
    return hexToTailwind(category.color);
  }

  // Fallback: generate style based on category name
  const categoryName = typeof category === 'string' ? category : (category.name || '');
  if (!categoryName) return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
  
  const categoryStyles: Record<string, string> = {
    'Technology': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    'Business': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    'Politics': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    'Sports': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    'Health': 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    'Science': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    'Entertainment': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    'World': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    'Environment': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  };

  return categoryStyles[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
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