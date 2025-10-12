#!/usr/bin/env node

/**
 * Batch Update Script for Category Pages
 * Updates all static category pages with CategoryFilters component
 */

const fs = require('fs');
const path = require('path');

const categoryConfigs = {
  health: {
    subCategories: [
      { id: 'all', label: 'All Health', count: 145 },
      { id: 'medical', label: 'Medical Research', count: 56 },
      { id: 'wellness', label: 'Wellness', count: 43 },
      { id: 'mental', label: 'Mental Health', count: 28 },
      { id: 'nutrition', label: 'Nutrition', count: 18 }
    ],
    gradient: 'from-pink-500 to-rose-600',
    latestCount: 145,
    popularCount: 56
  },
  politics: {
    subCategories: [
      { id: 'all', label: 'All Politics', count: 198 },
      { id: 'domestic', label: 'Domestic', count: 89 },
      { id: 'international', label: 'International', count: 67 },
      { id: 'elections', label: 'Elections', count: 25 },
      { id: 'policy', label: 'Policy', count: 17 }
    ],
    gradient: 'from-red-500 to-orange-600',
    latestCount: 198,
    popularCount: 89
  },
  science: {
    subCategories: [
      { id: 'all', label: 'All Science', count: 167 },
      { id: 'space', label: 'Space', count: 54 },
      { id: 'biology', label: 'Biology', count: 48 },
      { id: 'physics', label: 'Physics', count: 35 },
      { id: 'climate', label: 'Climate', count: 30 }
    ],
    gradient: 'from-purple-500 to-indigo-600',
    latestCount: 167,
    popularCount: 54
  },
  sports: {
    subCategories: [
      { id: 'all', label: 'All Sports', count: 212 },
      { id: 'football', label: 'Football', count: 78 },
      { id: 'basketball', label: 'Basketball', count: 56 },
      { id: 'baseball', label: 'Baseball', count: 43 },
      { id: 'other', label: 'Other Sports', count: 35 }
    ],
    gradient: 'from-yellow-500 to-orange-600',
    latestCount: 212,
    popularCount: 78
  },
  entertainment: {
    subCategories: [
      { id: 'all', label: 'All Entertainment', count: 187 },
      { id: 'movies', label: 'Movies', count: 67 },
      { id: 'music', label: 'Music', count: 54 },
      { id: 'tv', label: 'TV Shows', count: 45 },
      { id: 'celebrity', label: 'Celebrity', count: 21 }
    ],
    gradient: 'from-fuchsia-500 to-pink-600',
    latestCount: 187,
    popularCount: 67
  },
  world: {
    subCategories: [
      { id: 'all', label: 'All World News', count: 234 },
      { id: 'europe', label: 'Europe', count: 78 },
      { id: 'asia', label: 'Asia', count: 67 },
      { id: 'americas', label: 'Americas', count: 54 },
      { id: 'africa', label: 'Africa & Middle East', count: 35 }
    ],
    gradient: 'from-teal-500 to-cyan-600',
    latestCount: 234,
    popularCount: 78
  }
};

const baseDir = path.join(__dirname, '../src/app/category');

// Template for the imports section
const getImportsTemplate = () => `"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilters from '@/components/CategoryFilters';`;

// Template for state management
const getStateTemplate = (categoryName) => {
  const config = categoryConfigs[categoryName];
  const subCategoriesStr = JSON.stringify(config.subCategories, null, 4).replace(/"/g, "'");
  
  return `  // Content Type and Sort Filters
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis' | 'review' | 'interview'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  
  // ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}-specific sub-category filter
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  const subCategoryFilters = ${subCategoriesStr};`;
};

// Template for filter UI
const getFiltersUITemplate = (categoryName) => {
  const config = categoryConfigs[categoryName];
  const categoryTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  
  return `            {/* Modern Category Filters */}
            <CategoryFilters
              contentType={contentType}
              onContentTypeChange={setContentType}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              counts={{
                latest: ${config.latestCount},
                popular: ${config.popularCount}
              }}
            />

            {/* ${categoryTitle} Sub-Category Filters */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  ${categoryTitle} Topics
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent"></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {subCategoryFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedSubCategory(filter.id)}
                    className={\`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 \${
                      selectedSubCategory === filter.id
                        ? 'bg-gradient-to-r ${config.gradient} text-white shadow-lg shadow-${config.gradient.split('-')[1]}-500/25 scale-105'
                        : 'bg-muted/50 text-foreground hover:bg-muted hover:scale-105 hover:shadow-md'
                    }\`}
                  >
                    {filter.label} <span className={\`ml-1 \${selectedSubCategory === filter.id ? 'text-white/80' : 'text-muted-foreground'}\`}>({filter.count})</span>
                  </button>
                ))}
              </div>
            </div>`;
};

console.log('🚀 Starting batch update of category pages...\n');

Object.keys(categoryConfigs).forEach(categoryName => {
  const filePath = path.join(baseDir, categoryName, 'page.tsx');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${categoryName} - file not found`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already updated
    if (content.includes('CategoryFilters')) {
      console.log(`✅ ${categoryName} - already updated`);
      return;
    }

    // Update imports
    content = content.replace(
      /import Breadcrumb from '@\/components\/Breadcrumb';/,
      `import Breadcrumb from '@/components/Breadcrumb';\nimport CategoryFilters from '@/components/CategoryFilters';`
    );

    // Update state management
    const stateRegex = /const \[selectedFilter, setSelectedFilter\] = useState\('all'\);\s*const filters = \[[\s\S]*?\];/;
    content = content.replace(stateRegex, getStateTemplate(categoryName));

    // Update filters UI
    const filtersUIRegex = /{\/\* Filters \*\/}\s*<div className="flex flex-wrap gap-2 mb-8">[\s\S]*?<\/div>/;
    content = content.replace(filtersUIRegex, getFiltersUITemplate(categoryName));

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${categoryName} - updated successfully`);
    
  } catch (error) {
    console.error(`❌ ${categoryName} - error:`, error.message);
  }
});

console.log('\n✨ Batch update complete!');
console.log('\n📝 Next steps:');
console.log('   1. Review the changes');
console.log('   2. Test each category page');
console.log('   3. Run: npm run dev');
console.log('   4. Navigate to: http://localhost:3000/category/[category-name]\n');
