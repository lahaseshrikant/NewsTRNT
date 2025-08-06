"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock data for demonstration
const mockCategoryData = {
  politics: {
    name: 'Politics',
    description: 'Stay updated with the latest political news, government policies, and election coverage.',
    icon: '🏛️',
    color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    articles: [
      {
        id: 1,
        title: 'Congressional Leaders Reach Bipartisan Agreement on Infrastructure Bill',
        summary: 'After months of negotiations, congressional leaders announce a comprehensive infrastructure package.',
        imageUrl: '/api/placeholder/600/300',
        publishedAt: '2 hours ago',
        readingTime: 4,
        isBreaking: true,
        author: 'Sarah Johnson'
      },
      {
        id: 2,
        title: 'Supreme Court to Hear Landmark Privacy Case This Fall',
        summary: 'The high court will review digital privacy rights in the digital age.',
        imageUrl: '/api/placeholder/600/300',
        publishedAt: '4 hours ago',
        readingTime: 3,
        isBreaking: false,
        author: 'Michael Chen'
      },
      {
        id: 5,
        title: 'New Climate Policy Initiative Gains Bipartisan Support',
        summary: 'Environmental legislation receives unexpected backing from both parties.',
        imageUrl: '/api/placeholder/600/300',
        publishedAt: '6 hours ago',
        readingTime: 5,
        isBreaking: false,
        author: 'Emily Rodriguez'
      },
      {
        id: 6,
        title: 'Federal Budget Proposal Sparks Congressional Debate',
        summary: 'New spending plan faces scrutiny over infrastructure allocations.',
        imageUrl: '/api/placeholder/600/300',
        publishedAt: '8 hours ago',
        readingTime: 4,
        isBreaking: false,
        author: 'David Thompson'
      }
    ]
  },
  technology: {
    name: 'Technology',
    description: 'Discover the latest in tech innovation, startups, and digital transformation.',
    icon: '💻',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    articles: [
      {
        id: 3,
        title: 'AI Breakthrough: New Model Achieves Human-Level Reasoning',
        summary: 'Scientists develop AI system that can solve complex logical problems.',
        imageUrl: '/api/placeholder/600/300',
        publishedAt: '1 hour ago',
        readingTime: 5,
        isBreaking: true,
        author: 'Dr. Alex Kumar'
      },
      {
        id: 7,
        title: 'Tech Giants Face New Antitrust Regulations',
        summary: 'Major technology companies prepare for stricter oversight.',
        imageUrl: '/api/placeholder/600/300',
        publishedAt: '3 hours ago',
        readingTime: 4,
        isBreaking: false,
        author: 'Jessica Park'
      },
      {
        id: 8,
        title: 'Cryptocurrency Market Sees Major Volatility',
        summary: 'Digital currencies experience significant price fluctuations.',
        imageUrl: '/api/placeholder/600/300',
        publishedAt: '5 hours ago',
        readingTime: 3,
        isBreaking: true,
        author: 'Robert Kim'
      }
    ]
  },
  business: {
    name: 'Business',
    description: 'Business news, market analysis, and economic insights.',
    icon: '💼',
    color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    articles: []
  },
  sports: {
    name: 'Sports',
    description: 'Sports news, scores, and athlete stories.',
    icon: '⚽',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    articles: []
  }
};

const CategoryPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedFilter, setSelectedFilter] = useState('latest');
  
  const categoryData = mockCategoryData[slug as keyof typeof mockCategoryData];
  
  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Filter articles based on selected filter
  const getFilteredArticles = () => {
    let articles = [...categoryData.articles];
    
    switch (selectedFilter) {
      case 'latest':
        return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      case 'trending':
        // Simulate trending articles (you can add trending logic here)
        return articles.filter(article => article.readingTime >= 4);
      case 'popular':
        // Simulate popular articles (you can add view count logic here)
        return articles.filter(article => article.readingTime <= 4);
      case 'breaking':
        return articles.filter(article => article.isBreaking);
      default:
        return articles;
    }
  };

  const filteredArticles = getFilteredArticles();

  const filters = [
    { id: 'latest', name: 'Latest', count: categoryData.articles.length },
    { id: 'trending', name: 'Trending', count: categoryData.articles.filter(a => a.readingTime >= 4).length },
    { id: 'popular', name: 'Popular', count: categoryData.articles.filter(a => a.readingTime <= 4).length },
    { id: 'breaking', name: 'Breaking', count: categoryData.articles.filter(a => a.isBreaking).length }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Category Header */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-4xl">{categoryData.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{categoryData.name}</h1>
              <p className="text-muted-foreground mt-2">{categoryData.description}</p>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 mt-6 bg-muted/50 dark:bg-muted/30 rounded-xl p-1 shadow-sm">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative flex items-center gap-2 ${
                  selectedFilter === filter.id
                    ? 'bg-primary text-blue-700 dark:text-blue-300 shadow-xl shadow-primary/40 dark:shadow-primary/50 transform scale-105 dark:bg-primary font-bold'
                    : 'text-foreground/80 dark:text-foreground/90 hover:text-foreground dark:hover:text-white hover:bg-background/70 dark:hover:bg-muted/50 hover:shadow-md hover:shadow-muted/20'
                }`}
              >
                {/* Active indicator dot */}
                {selectedFilter === filter.id && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-foreground dark:bg-primary-foreground rounded-full animate-pulse shadow-lg shadow-primary/60"></div>
                )}
                
                {filter.name}
                
                {filter.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm ${
                    selectedFilter === filter.id
                      ? 'bg-blue-100/60 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 shadow-blue-200/30 dark:shadow-blue-800/30 font-bold'
                      : 'bg-background/80 text-foreground/70 dark:bg-muted/80 dark:text-foreground/80 shadow-muted/20'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 py-8">
        {/* Filter Status */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
              {filters.find(f => f.id === selectedFilter)?.name} Articles
              {selectedFilter === 'breaking' && <span className="animate-pulse">🔴</span>}
              {selectedFilter === 'trending' && <span className="animate-bounce">📈</span>}
              {selectedFilter === 'popular' && <span className="animate-pulse">⭐</span>}
              {selectedFilter === 'latest' && <span className="animate-pulse">🆕</span>}
            </h2>
            <p className="text-muted-foreground">
              {filteredArticles.length === 0 
                ? `No ${selectedFilter} articles found in ${categoryData.name}`
                : `Showing ${filteredArticles.length} ${selectedFilter} ${filteredArticles.length === 1 ? 'article' : 'articles'} in ${categoryData.name}`
              }
            </p>
          </div>
          
          {/* Quick Filter Indicators */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter:</span>
            <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
              selectedFilter === 'latest' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 dark:from-blue-900/70 dark:to-blue-800/70 dark:text-blue-100 shadow-blue-200/50 dark:shadow-blue-800/30' :
              selectedFilter === 'trending' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 dark:from-green-900/70 dark:to-green-800/70 dark:text-green-100 shadow-green-200/50 dark:shadow-green-800/30' :
              selectedFilter === 'popular' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 dark:from-yellow-900/70 dark:to-yellow-800/70 dark:text-yellow-100 shadow-yellow-200/50 dark:shadow-yellow-800/30' :
              'bg-gradient-to-r from-red-100 to-red-200 text-red-900 dark:from-red-900/70 dark:to-red-800/70 dark:text-red-100 shadow-red-200/50 dark:shadow-red-800/30'
            }`}>
              {selectedFilter.toUpperCase()}
            </div>
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {filteredArticles.map((article) => (
                  <Link key={article.id} href={`/article/${article.id}`} className="block">
                    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <div className="relative h-48 md:h-full overflow-hidden">
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            {article.isBreaking && (
                              <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                                BREAKING
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${categoryData.color} group-hover:scale-105 transition-transform duration-300 ease-out`}>
                              {categoryData.name}
                            </span>
                            <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300 ease-out">{article.publishedAt}</span>
                          </div>
                          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 ease-out">
                            {article.title}
                          </h2>
                          <p className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors duration-300 ease-out">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 ease-out">
                            <span>By {article.author}</span>
                            <span>{article.readingTime} min read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related Topics */}
              <div className="bg-card rounded-lg shadow-sm p-6 mb-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Related Topics</h3>
                <div className="space-y-2">
                  {['Elections 2024', 'Policy Updates', 'International Relations', 'Local Government'].map((topic) => (
                    <Link
                      key={topic}
                      href="#"
                      className="block text-primary hover:text-blue-800 hover:bg-muted/50 text-sm p-2 rounded-lg transition-all duration-200 ease-out hover:translate-x-1 hover:shadow-sm group"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        {topic}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
                <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Get the latest {categoryData.name.toLowerCase()} news in your inbox.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder-gray-500 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent shadow-sm"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-900 hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      Subscribe
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{categoryData.icon}</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              No {filters.find(f => f.id === selectedFilter)?.name} Articles
            </h2>
            <p className="text-muted-foreground mb-8">
              {selectedFilter === 'latest' 
                ? `We're working on bringing you the latest ${categoryData.name.toLowerCase()} news.`
                : selectedFilter === 'breaking'
                ? `No breaking news in ${categoryData.name.toLowerCase()} right now.`
                : selectedFilter === 'trending'
                ? `No trending articles in ${categoryData.name.toLowerCase()} at the moment.`
                : `No popular articles in ${categoryData.name.toLowerCase()} currently.`
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSelectedFilter('latest')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Latest
              </button>
              <Link
                href="/"
                className="bg-muted text-muted-foreground px-6 py-3 rounded-lg hover:bg-muted/80 transition-colors"
              >
                Browse All News
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
