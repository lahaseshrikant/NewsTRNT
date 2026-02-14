import { useMemo } from 'react';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

interface SubCategoryFilter {
  id: string;
  label: string;
  count: number;
}

export const useSubCategoryFilters = (
  allArticles: Array<{ subCategory?: SubCategory }>, 
  subCategories: SubCategory[] | undefined,
  allLabel: string
): SubCategoryFilter[] => {
  return useMemo(() => {
    if (!subCategories) {
      return [{ id: 'all', label: allLabel, count: allArticles.length }];
    }

    const filters: SubCategoryFilter[] = [
      { id: 'all', label: allLabel, count: allArticles.length }
    ];

    // Count articles per subcategory
    subCategories.forEach(subCat => {
      const count = allArticles.filter(article => article.subCategory?.slug === subCat.slug).length;
      filters.push({
        id: subCat.slug,
        label: subCat.name,
        count
      });
    });

    return filters;
  }, [allArticles, subCategories, allLabel]);
};