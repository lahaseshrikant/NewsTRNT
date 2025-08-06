"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const WorldCategoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('latest');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock world news articles data
  const worldArticles = [
    {
      id: 1,
      title: 'G20 Summit Reaches Historic Climate Agreement Despite Economic Tensions',
      summary: 'World leaders commit to ambitious carbon reduction targets while addressing concerns about economic impact on developing nations.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '30 minutes ago',
      readingTime: 8,
      isBreaking: true,
      author: 'Maria Rodriguez',
      category: 'International Relations',
      location: 'New Delhi, India'
    },
    {
      id: 2,
      title: 'European Union Announces New Trade Partnership with Southeast Asia',
      summary: 'Comprehensive trade deal promises to boost economic cooperation and reduce tariffs across multiple sectors.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '2 hours ago',
      readingTime: 6,
      isBreaking: false,
      author: 'James Wilson',
      category: 'Trade & Economy',
      location: 'Brussels, Belgium'
    },
    {
      id: 3,
      title: 'UN Peacekeeping Mission Expands in West Africa Amid Regional Conflicts',
      summary: 'Security Council approves additional resources for stabilization efforts in response to escalating tensions.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '4 hours ago',
      readingTime: 7,
      isBreaking: false,
      author: 'Fatima Al-Zahra',
      category: 'Security & Defense',
      location: 'New York, USA'
    },
    {
      id: 4,
      title: 'Antarctic Research Reveals Accelerated Ice Sheet Melting Patterns',
      summary: 'International scientific team documents unprecedented changes in polar ice formations over past decade.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '6 hours ago',
      readingTime: 5,
      isBreaking: false,
      author: 'Dr. Erik Larsen',
      category: 'Environment',
      location: 'Antarctica'
    },
    {
      id: 5,
      title: 'Middle East Peace Talks Resume After Six-Month Hiatus',
      summary: 'Diplomatic efforts intensify as regional leaders gather for renewed negotiations mediated by international observers.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '8 hours ago',
      readingTime: 6,
      isBreaking: false,
      author: 'Sarah Ahmed',
      category: 'Diplomacy',
      location: 'Geneva, Switzerland'
    },
    {
      id: 6,
      title: 'Global Food Security Summit Addresses Rising Hunger Concerns',
      summary: 'World leaders and aid organizations coordinate response to increasing food insecurity affecting 200 million people.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '12 hours ago',
      readingTime: 4,
      isBreaking: false,
      author: 'Michael Chen',
      category: 'Humanitarian',
      location: 'Rome, Italy'
    }
  ];

  const tabs = [
    { id: 'latest', name: 'Latest', count: worldArticles.length },
    { id: 'trending', name: 'Trending', count: 24 },
    { id: 'popular', name: 'Popular', count: 31 },
    { id: 'breaking', name: 'Breaking', count: worldArticles.filter(a => a.isBreaking).length }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArticles(worldArticles);
      setLoading(false);
    }, 800);
  }, []);

  const filteredArticles = () => {
    switch (activeTab) {
      case 'trending':
        return worldArticles.slice(0, 4);
      case 'popular':
        return worldArticles.slice(1, 5);
      case 'breaking':
        return worldArticles.filter(article => article.isBreaking);
      default:
        return worldArticles;
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-6xl mr-4">🌍</span>
              <h1 className="text-5xl font-bold">World News</h1>
            </div>
            <p className="text-xl text-blue-100 mb-6">
              Breaking global news, international relations, and worldwide developments that shape our world
            </p>
            <div className="flex items-center justify-center space-x-6 text-blue-200">
              <span>Global Politics</span>
              <span>•</span>
              <span>International Trade</span>
              <span>•</span>
              <span>World Events</span>
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
                        <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                          BREAKING
                        </span>
                      )}
                      <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        📍 {article.location}
                      </div>
                    </div>
                    
                    <div className={`p-6 flex-1 ${index === 0 && activeTab === 'latest' ? 'lg:w-1/3' : 'sm:w-2/3'}`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
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
              {/* World Regions */}
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Regions</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Europe', count: 78, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', flag: '🇪🇺' },
                    { name: 'Asia-Pacific', count: 65, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', flag: '🌏' },
                    { name: 'Americas', count: 54, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', flag: '🌎' },
                    { name: 'Middle East', count: 43, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', flag: '🕌' },
                    { name: 'Africa', count: 36, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300', flag: '🌍' }
                  ].map((region) => (
                    <Link
                      key={region.name}
                      href={`/category/world?region=${region.name.toLowerCase().replace('-', '')}`}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{region.flag}</span>
                        <span className="font-medium text-foreground">{region.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${region.color}`}>
                        {region.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Live Updates */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg p-6 border border-red-200/50 dark:border-red-800/50">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    <h3 className="text-lg font-bold text-foreground">Live Updates</h3>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-background/50 rounded border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-foreground">UN Security Council</span>
                      <span className="text-xs text-muted-foreground">2 min ago</span>
                    </div>
                    <p className="text-muted-foreground">Emergency session called to address humanitarian crisis</p>
                  </div>
                  <div className="p-3 bg-background/50 rounded border-l-4 border-orange-500">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-foreground">G7 Summit</span>
                      <span className="text-xs text-muted-foreground">15 min ago</span>
                    </div>
                    <p className="text-muted-foreground">Joint statement on economic cooperation released</p>
                  </div>
                  <div className="p-3 bg-background/50 rounded border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-foreground">Climate Conference</span>
                      <span className="text-xs text-muted-foreground">32 min ago</span>
                    </div>
                    <p className="text-muted-foreground">New carbon emission targets announced</p>
                  </div>
                </div>
              </div>

              {/* World Newsletter */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="text-center">
                  <div className="text-3xl mb-3">📰</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">World Brief</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Daily digest of global events and international developments.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
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

export default WorldCategoryPage;
