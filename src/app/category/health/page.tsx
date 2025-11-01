"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const HealthCategoryPage: React.FC = () => {
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const contentTypes = [
    { value: 'all', label: 'All Content' },
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Articles' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'opinion', label: 'Opinion' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: '🕐' },
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⭐' },
    { value: 'breaking', label: 'Breaking', icon: '🚨' }
  ];

  const subCategoryFilters = [
    { id: 'all', label: 'All Health', count: 145 },
    { id: 'medical', label: 'Medical Research', count: 56 },
    { id: 'wellness', label: 'Wellness', count: 43 },
    { id: 'mental', label: 'Mental Health', count: 28 },
    { id: 'nutrition', label: 'Nutrition', count: 18 }
  ];

  // Mock health articles data
  const healthArticles = [
    {
      id: 1,
      title: 'Breakthrough Gene Therapy Shows Promise for Alzheimer\'s Treatment',
      summary: 'New clinical trials demonstrate significant improvement in cognitive function using innovative gene editing techniques.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '1 hour ago',
      readingTime: 6,
      isBreaking: true,
      author: 'Dr. Sarah Mitchell',
      category: 'Medical Research'
    },
    {
      id: 2,
      title: 'WHO Updates Global Health Guidelines for Mental Wellness',
      summary: 'World Health Organization releases comprehensive framework for mental health support in post-pandemic era.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '3 hours ago',
      readingTime: 4,
      isBreaking: false,
      author: 'Dr. Michael Zhang',
      category: 'Global Health'
    },
    {
      id: 3,
      title: 'Revolutionary Cancer Immunotherapy Reaches Phase 3 Trials',
      summary: 'Personalized cancer treatment shows 90% success rate in early testing phases.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '5 hours ago',
      readingTime: 5,
      isBreaking: false,
      author: 'Dr. Emily Rodriguez',
      category: 'Cancer Research'
    },
    {
      id: 4,
      title: 'Study Reveals Link Between Diet and Cognitive Decline Prevention',
      summary: 'Mediterranean diet significantly reduces risk of dementia in long-term study of 50,000 participants.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '8 hours ago',
      readingTime: 3,
      isBreaking: false,
      author: 'Dr. James Wilson',
      category: 'Nutrition'
    },
    {
      id: 5,
      title: 'AI-Powered Early Detection System for Heart Disease Approved by FDA',
      summary: 'Machine learning algorithm can predict heart attacks up to 5 years in advance with 95% accuracy.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '12 hours ago',
      readingTime: 4,
      isBreaking: false,
      author: 'Dr. Lisa Chen',
      category: 'Medical Technology'
    },
    {
      id: 6,
      title: 'Global Vaccine Initiative Targets Emerging Infectious Diseases',
      summary: 'International coalition announces $2 billion investment in next-generation vaccine development.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '1 day ago',
      readingTime: 5,
      isBreaking: false,
      author: 'Dr. Robert Kim',
      category: 'Public Health'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArticles(healthArticles);
      setLoading(false);
    }, 800);
  }, []);

  const filteredArticles = () => {
    let filtered = [...healthArticles];
    
    // Filter by content type
    if (contentType !== 'all') {
      filtered = filtered.filter(article => 
        (article as any).contentType === contentType
      );
    }
    
    // Filter by sub-category
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.category === selectedSubCategory
      );
    }
    
    // Apply sort
    switch (sortBy) {
      case 'latest':
        return filtered;
      case 'trending':
        return filtered.slice(0, 4);
      case 'popular':
        return filtered.slice(1, 5);
      case 'breaking':
        return filtered.filter(article => article.isBreaking);
      default:
        return filtered;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner with Tabs */}
      <div className="bg-gradient-to-r from-pink-600/5 to-rose-600/5 border-b border-border/50">
  <div className="container mx-auto py-4">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Health' }
          ]} className="mb-3" />
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Health
              </h1>
              <p className="text-sm text-muted-foreground">
                Medical research, wellness & health insights
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2">
                <div className="text-lg font-bold text-primary">145</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Articles</div>
              </div>
            </div>
          </div>

          {/* Content type tabs moved below header into compact filter bar */}

          {/* Sub-category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {subCategoryFilters.map((subCat) => (
              <button
                key={subCat.id}
                onClick={() => setSelectedSubCategory(subCat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSubCategory === subCat.id
                    ? 'bg-pink-400 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                {subCat.label}
                <span className={`ml-1.5 text-[10px] ${selectedSubCategory === subCat.id ? 'opacity-80' : 'opacity-50'}`}>
                  {subCat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

  <div className="container mx-auto py-6">
        <div className="max-w-6xl mx-auto">
          {/* Compact Filter Bar: content type + sort */}
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 p-2 mb-5">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    contentType === type.value
                      ? 'bg-pink-500 text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {type.label}
                </button>
              ))}

              <span className="hidden sm:inline-block mx-2 h-4 w-px bg-border/60" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Sort</span>

              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    sortBy === option.value
                      ? 'bg-pink-500 text-white shadow'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Articles */}
            <div className="lg:col-span-2 space-y-6">
              {filteredArticles().map((article, index) => (
                <article
                  key={article.id}
                  className={`bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow ${
                    index === 0 && sortBy === 'latest' ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className={`flex ${index === 0 && sortBy === 'latest' ? 'flex-col lg:flex-row' : 'flex-col sm:flex-row'} gap-4`}>
                    <div className={`relative ${index === 0 && sortBy === 'latest' ? 'lg:w-2/3' : 'sm:w-1/3'}`}>
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        width={600}
                        height={300}
                        className={`w-full object-cover ${
                          index === 0 && sortBy === 'latest' ? 'h-64 lg:h-full' : 'h-48 sm:h-full'
                        }`}
                      />
                      {article.isBreaking && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          BREAKING
                        </span>
                      )}
                    </div>
                    
                    <div className={`p-6 flex-1 ${index === 0 && sortBy === 'latest' ? 'lg:w-1/3' : 'sm:w-2/3'}`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="text-muted-foreground text-sm">{article.readingTime} min read</span>
                      </div>
                      
                      <Link href={`/article/${article.id}`}>
                        <h2 className={`font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors ${
                          index === 0 && sortBy === 'latest' ? 'text-2xl' : 'text-lg'
                        }`}>
                          {article.title}
                        </h2>
                      </Link>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>By {article.author}</span>
                        <span>{article.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Health Categories */}
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Health Topics</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Medical Research', count: 45, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
                    { name: 'Mental Health', count: 32, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
                    { name: 'Nutrition', count: 28, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
                    { name: 'Public Health', count: 24, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
                    { name: 'Medical Technology', count: 19, color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300' }
                  ].map((topic) => (
                    <Link
                      key={topic.name}
                      href={`/category/health?topic=${topic.name.toLowerCase().replace(' ', '-')}`}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-foreground">{topic.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${topic.color}`}>
                        {topic.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200/50 dark:border-green-800/50">
                <div className="text-center">
                  <div className="text-3xl mb-3">📧</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Health Newsletter</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Get weekly health insights and medical breakthroughs delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCategoryPage;
