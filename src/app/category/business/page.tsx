"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import MarketWidget from '@/components/MarketWidget';

const BusinessPage: React.FC = () => {
  // Content Type and Sort Filters
  const [contentType, setContentType] = useState<'all' | 'news' | 'article' | 'opinion' | 'analysis'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular' | 'breaking'>('latest');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

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
    { id: 'all', label: 'All Business', count: 189 },
    { id: 'markets', label: 'Markets', count: 78 },
    { id: 'economy', label: 'Economy', count: 56 },
    { id: 'companies', label: 'Companies', count: 34 },
    { id: 'finance', label: 'Finance', count: 21 }
  ];

  // Combine all articles with filtering properties
  const allArticles = [
    {
      id: 1,
      title: "Federal Reserve Signals Potential Interest Rate Cuts Amid Economic Uncertainty",
      summary: "Fed Chair indicates possible monetary policy adjustments as inflation shows signs of cooling and employment data remains mixed.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "30 minutes ago",
      readTime: "6 min read",
      author: "Michael Zhang",
      tags: ["Federal Reserve", "Interest Rates", "Economy"],
      isFeatured: true,
      contentType: 'news' as const,
      subCategory: 'economy',
      views: 15000
    },
    {
      id: 2,
      title: "Tech Giants Report Record Q3 Earnings Despite Market Volatility",
      summary: "Apple, Microsoft, and Google exceed analyst expectations with strong cloud and AI revenue growth driving performance.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "2 hours ago",
      readTime: "8 min read",
      author: "Sarah Williams",
      tags: ["Earnings", "Tech", "Markets"],
      isFeatured: true,
      contentType: 'analysis' as const,
      subCategory: 'markets',
      views: 12000
    },
    {
      id: 3,
      title: "Global Supply Chain Disruptions Ease as Shipping Costs Normalize",
      summary: "Container shipping rates fall 60% from peak levels as port congestion clears and demand stabilizes.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "4 hours ago",
      readTime: "5 min read",
      author: "David Park",
      tags: ["Supply Chain", "Logistics", "Trade"],
      isFeatured: false,
      contentType: 'news' as const,
      subCategory: 'companies',
      views: 8500
    },
    {
      id: 4,
      title: "Renewable Energy Investments Reach All-Time High in 2024",
      summary: "Global clean energy funding surpasses $2.8 trillion as governments accelerate green transition policies.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "6 hours ago",
      readTime: "7 min read",
      author: "Emma Rodriguez",
      tags: ["Energy", "Investment", "ESG"],
      isFeatured: false,
      contentType: 'article' as const,
      subCategory: 'finance',
      views: 9200
    },
    {
      id: 5,
      title: "Cryptocurrency Market Shows Signs of Recovery After Regulatory Clarity",
      summary: "Bitcoin and Ethereum gain momentum following new SEC guidelines on digital asset classification.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "8 hours ago",
      readTime: "4 min read",
      author: "James Chen",
      tags: ["Cryptocurrency", "Regulation", "Markets"],
      isFeatured: false,
      contentType: 'analysis' as const,
      subCategory: 'markets',
      views: 11000
    },
    {
      id: 6,
      title: "Manufacturing Sector Rebounds with AI-Driven Automation Investments",
      summary: "Industrial companies report increased productivity and cost savings from smart manufacturing technologies.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "12 hours ago",
      readTime: "6 min read",
      author: "Lisa Kim",
      tags: ["Manufacturing", "AI", "Automation"],
      isFeatured: false,
      contentType: 'article' as const,
      subCategory: 'companies',
      views: 7800
    }
  ];

  // Filtering logic
  const filteredArticles = () => {
    let filtered = [...allArticles];

    // Filter by content type
    if (contentType !== 'all') {
      filtered = filtered.filter(article => article.contentType === contentType);
    }

    // Filter by sub-category
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(article => article.subCategory === selectedSubCategory);
    }

    // Sort articles
    if (sortBy === 'trending') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => parseInt(b.readTime) - parseInt(a.readTime));
    }
    // 'latest' is default order

    return filtered;
  };

  const articles = filteredArticles();
  const featuredArticles = articles.filter(article => article.isFeatured);
  const recentArticles = articles.filter(article => !article.isFeatured);

  const trendingTopics = [
    { name: "Interest Rates", count: 89 },
    { name: "Inflation", count: 67 },
    { name: "Corporate Earnings", count: 54 },
    { name: "ESG Investing", count: 43 },
    { name: "Supply Chain", count: 31 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner with Tabs */}
      <div className="bg-gradient-to-r from-green-600/5 to-blue-600/5 border-b border-border/50">
  <div className="container mx-auto py-4">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Business' }
          ]} className="mb-3" />
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Business
              </h1>
              <p className="text-sm text-muted-foreground">
                Markets, economy, and corporate news
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2">
                <div className="text-lg font-bold text-primary">189</div>
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
                    ? 'bg-green-400 text-white shadow-md'
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {/* Content Type Filter */}
              <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 p-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
                  {contentTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setContentType(type.value as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                        contentType === type.value
                          ? 'bg-green-500 text-white shadow'
                          : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-card/60 supports-[backdrop-filter]:bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 p-2">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Sort By:</span>
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      title={option.label}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                        sortBy === option.value
                          ? 'bg-green-500 text-white shadow'
                          : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm">{option.icon}</span>
                      <span className="hidden sm:inline">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Articles */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Market Moving News</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground border border-dashed border-border rounded-lg py-10">
                    No feature stories match the current filters.
                  </div>
                ) : (
                  featuredArticles.map(article => (
                    <Link key={article.id} href={`/article/${article.id}`} 
                          className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                      <div className="relative h-48">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                            {article.isFeatured ? 'FEATURED' : 'MARKETS'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span>{article.author}</span>
                            <span>{article.publishedAt}</span>
                          </div>
                          <span>{article.readTime}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {article.tags.map(tag => (
                            <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* Recent Articles */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Latest Business News</h2>
              <div className="space-y-6">
                {recentArticles.length === 0 ? (
                  <div className="text-center text-muted-foreground border border-dashed border-border rounded-lg py-10">
                    No articles available for the selected filters. Adjust your selection to see more stories.
                  </div>
                ) : (
                  recentArticles.map(article => (
                    <Link key={article.id} href={`/article/${article.id}`}
                          className="group flex flex-col md:flex-row gap-4 bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
                      <div className="md:w-1/3">
                        <div className="relative h-48 md:h-32 rounded-lg overflow-hidden">
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span>{article.author}</span>
                            <span>{article.publishedAt}</span>
                          </div>
                          <span>{article.readTime}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {article.tags.map(tag => (
                            <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Load More Articles
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Market Data Widget - Location-based with real-time updates */}
            <div className="mb-6">
              <MarketWidget 
                showCommodities={true}
                showCurrencies={true}
                showCrypto={true}
                maxItems={8}
              />
            </div>

            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Trending in Business</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-foreground">{topic.name}</span>
                    <span className="text-muted-foreground text-sm">{topic.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Business Daily</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get daily business news and market updates delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Business Tools</h3>
              <div className="space-y-2">
                {[
                  { name: 'Stock Screener', href: '/tools/stocks' },
                  { name: 'Economic Calendar', href: '/tools/calendar' },
                  { name: 'Company Profiles', href: '/companies' },
                  { name: 'Market Analysis', href: '/analysis' }
                ].map(link => (
                  <Link key={link.name} href={link.href}
                        className="block text-primary hover:text-primary/80 text-sm">
                    {link.name} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;
