"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const EntertainmentCategoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('latest');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock entertainment articles data
  const entertainmentArticles = [
    {
      id: 1,
      title: 'Marvel Studios Announces Phase 6 Timeline with Surprising New Characters',
      summary: 'Kevin Feige reveals unexpected heroes joining the MCU in upcoming films, including classic comic book favorites.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '2 hours ago',
      readingTime: 5,
      isBreaking: true,
      author: 'Jessica Martinez',
      category: 'Movies'
    },
    {
      id: 2,
      title: 'Grammy Awards 2025: Complete Winners List and Show Highlights',
      summary: 'Music\'s biggest night celebrates diverse talents with record-breaking performances and emotional acceptance speeches.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '4 hours ago',
      readingTime: 7,
      isBreaking: false,
      author: 'David Thompson',
      category: 'Music'
    },
    {
      id: 3,
      title: 'Netflix Original Series Breaks Streaming Records in First Week',
      summary: 'New sci-fi thriller surpasses 100 million hours watched, becoming platform\'s most successful debut.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '6 hours ago',
      readingTime: 4,
      isBreaking: false,
      author: 'Amanda Clark',
      category: 'Streaming'
    },
    {
      id: 4,
      title: 'Broadway Reopens Historic Theater After $50 Million Renovation',
      summary: 'Legendary venue returns with state-of-the-art technology while preserving century-old architectural charm.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '8 hours ago',
      readingTime: 3,
      isBreaking: false,
      author: 'Robert Lee',
      category: 'Theater'
    },
    {
      id: 5,
      title: 'AI Technology Revolutionizes Film Production with Virtual Sets',
      summary: 'Major studios adopt advanced LED wall technology, reducing costs and environmental impact.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '12 hours ago',
      readingTime: 6,
      isBreaking: false,
      author: 'Sarah Williams',
      category: 'Technology'
    },
    {
      id: 6,
      title: 'International Film Festival Announces Diverse Lineup for 2025',
      summary: 'Cannes Film Festival features record number of female directors and emerging market productions.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '1 day ago',
      readingTime: 4,
      isBreaking: false,
      author: 'Michelle Garcia',
      category: 'Film Festivals'
    }
  ];

  const tabs = [
    { id: 'latest', name: 'Latest', count: entertainmentArticles.length },
    { id: 'trending', name: 'Trending', count: 18 },
    { id: 'popular', name: 'Popular', count: 32 },
    { id: 'breaking', name: 'Breaking', count: entertainmentArticles.filter(a => a.isBreaking).length }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArticles(entertainmentArticles);
      setLoading(false);
    }, 800);
  }, []);

  const filteredArticles = () => {
    switch (activeTab) {
      case 'trending':
        return entertainmentArticles.slice(0, 4);
      case 'popular':
        return entertainmentArticles.slice(1, 5);
      case 'breaking':
        return entertainmentArticles.filter(article => article.isBreaking);
      default:
        return entertainmentArticles;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
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
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-6xl mr-4">🎬</span>
              <h1 className="text-5xl font-bold">Entertainment</h1>
            </div>
            <p className="text-xl text-purple-100 mb-6">
              Your gateway to movies, music, TV, celebrity news, and pop culture updates
            </p>
            <div className="flex items-center justify-center space-x-6 text-purple-200">
              <span>Movie News</span>
              <span>•</span>
              <span>Music Updates</span>
              <span>•</span>
              <span>Celebrity Stories</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tab.name}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {tab.count}
                  </span>
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
                    index === 0 && activeTab === 'latest' ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className={`flex ${index === 0 && activeTab === 'latest' ? 'flex-col lg:flex-row' : 'flex-col sm:flex-row'} gap-4`}>
                    <div className={`relative ${index === 0 && activeTab === 'latest' ? 'lg:w-2/3' : 'sm:w-1/3'}`}>
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        width={600}
                        height={300}
                        className={`w-full object-cover ${
                          index === 0 && activeTab === 'latest' ? 'h-64 lg:h-full' : 'h-48 sm:h-full'
                        }`}
                      />
                      {article.isBreaking && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          BREAKING
                        </span>
                      )}
                    </div>
                    
                    <div className={`p-6 flex-1 ${index === 0 && activeTab === 'latest' ? 'lg:w-1/3' : 'sm:w-2/3'}`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 px-2 py-1 rounded text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="text-muted-foreground text-sm">{article.readingTime} min read</span>
                      </div>
                      
                      <Link href={`/article/${article.id}`}>
                        <h2 className={`font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors ${
                          index === 0 && activeTab === 'latest' ? 'text-2xl' : 'text-lg'
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
              {/* Entertainment Categories */}
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Entertainment Categories</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Movies', count: 67, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
                    { name: 'Music', count: 54, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
                    { name: 'TV Shows', count: 43, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
                    { name: 'Celebrity News', count: 38, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
                    { name: 'Gaming', count: 29, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' }
                  ].map((category) => (
                    <Link
                      key={category.name}
                      href={`/category/entertainment?topic=${category.name.toLowerCase().replace(' ', '-')}`}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-foreground">{category.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${category.color}`}>
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Now */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border border-purple-200/50 dark:border-purple-800/50">
                <div className="text-center">
                  <div className="text-3xl mb-3">🔥</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Trending Now</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <span className="text-foreground">#MarvelPhase6</span>
                      <span className="text-muted-foreground">125K tweets</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <span className="text-foreground">#Grammys2025</span>
                      <span className="text-muted-foreground">89K tweets</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <span className="text-foreground">#NetflixOriginal</span>
                      <span className="text-muted-foreground">67K tweets</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Entertainment Newsletter */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border border-purple-200/50 dark:border-purple-800/50">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎭</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Entertainment Weekly</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Get the latest entertainment news, reviews, and celebrity updates.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
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

export default EntertainmentCategoryPage;
