"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ScienceCategoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('latest');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock science articles data
  const scienceArticles = [
    {
      id: 1,
      title: 'CERN Physicists Discover New Subatomic Particle in Large Hadron Collider',
      summary: 'Groundbreaking discovery of exotic particle could revolutionize understanding of fundamental forces in the universe.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '1 hour ago',
      readingTime: 7,
      isBreaking: true,
      author: 'Dr. Elena Vasquez',
      category: 'Physics',
      institution: 'CERN'
    },
    {
      id: 2,
      title: 'Mars Rover Perseverance Uncovers Evidence of Ancient Microbial Life',
      summary: 'NASA scientists analyze rock samples revealing potential biosignatures from 3.5 billion years ago.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '3 hours ago',
      readingTime: 6,
      isBreaking: false,
      author: 'Dr. James Morrison',
      category: 'Space Science',
      institution: 'NASA JPL'
    },
    {
      id: 3,
      title: 'Quantum Computer Achieves Breakthrough in Error Correction',
      summary: 'IBM researchers demonstrate stable quantum computing with 99.9% fidelity using new error mitigation techniques.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '5 hours ago',
      readingTime: 8,
      isBreaking: false,
      author: 'Dr. Sarah Kim',
      category: 'Quantum Computing',
      institution: 'IBM Research'
    },
    {
      id: 4,
      title: 'CRISPR Gene Therapy Successfully Treats Inherited Blindness',
      summary: 'Clinical trial shows remarkable restoration of vision in patients with Leber congenital amaurosis.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '8 hours ago',
      readingTime: 5,
      isBreaking: false,
      author: 'Dr. Michael Zhang',
      category: 'Biotechnology',
      institution: 'Harvard Medical School'
    },
    {
      id: 5,
      title: 'Antarctica Glacier Reveals 2-Million-Year-Old Ice Containing Ancient Atmosphere',
      summary: 'Researchers extract pristine ice cores providing unprecedented insights into Earth\'s climate history.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '12 hours ago',
      readingTime: 6,
      isBreaking: false,
      author: 'Dr. Lisa Anderson',
      category: 'Climate Science',
      institution: 'Antarctic Research Station'
    },
    {
      id: 6,
      title: 'AI System Predicts Protein Structures with 95% Accuracy',
      summary: 'DeepMind\'s AlphaFold breakthrough accelerates drug discovery and disease understanding.',
      imageUrl: '/api/placeholder/600/300',
      publishedAt: '1 day ago',
      readingTime: 4,
      isBreaking: false,
      author: 'Dr. David Thompson',
      category: 'Artificial Intelligence',
      institution: 'DeepMind'
    }
  ];

  const tabs = [
    { id: 'latest', name: 'Latest', count: scienceArticles.length },
    { id: 'trending', name: 'Trending', count: 19 },
    { id: 'popular', name: 'Popular', count: 27 },
    { id: 'breaking', name: 'Breaking', count: scienceArticles.filter(a => a.isBreaking).length }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArticles(scienceArticles);
      setLoading(false);
    }, 800);
  }, []);

  const filteredArticles = () => {
    switch (activeTab) {
      case 'trending':
        return scienceArticles.slice(0, 4);
      case 'popular':
        return scienceArticles.slice(1, 5);
      case 'breaking':
        return scienceArticles.filter(article => article.isBreaking);
      default:
        return scienceArticles;
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-6xl mr-4">🔬</span>
              <h1 className="text-5xl font-bold">Science</h1>
            </div>
            <p className="text-xl text-indigo-100 mb-6">
              Discover the latest scientific breakthroughs, research findings, and innovations shaping our future
            </p>
            <div className="flex items-center justify-center space-x-6 text-indigo-200">
              <span>Research</span>
              <span>•</span>
              <span>Discoveries</span>
              <span>•</span>
              <span>Innovation</span>
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
                          BREAKTHROUGH
                        </span>
                      )}
                      <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        🏛️ {article.institution}
                      </div>
                    </div>
                    
                    <div className={`p-6 flex-1 ${index === 0 && activeTab === 'latest' ? 'lg:w-1/3' : 'sm:w-2/3'}`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 px-2 py-1 rounded text-xs font-medium">
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
              {/* Science Fields */}
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Science Fields</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Physics', count: 89, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', icon: '⚛️' },
                    { name: 'Biology', count: 67, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: '🧬' },
                    { name: 'Chemistry', count: 54, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300', icon: '🧪' },
                    { name: 'Space Science', count: 43, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300', icon: '🚀' },
                    { name: 'Earth Science', count: 38, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300', icon: '🌍' }
                  ].map((field) => (
                    <Link
                      key={field.name}
                      href={`/category/science?field=${field.name.toLowerCase().replace(' ', '-')}`}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{field.icon}</span>
                        <span className="font-medium text-foreground">{field.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${field.color}`}>
                        {field.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Research Institutions */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg p-6 border border-indigo-200/50 dark:border-indigo-800/50">
                <h3 className="text-lg font-bold text-foreground mb-4">Top Research Institutions</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { name: 'MIT', articles: 45, badge: '🏆' },
                    { name: 'CERN', articles: 38, badge: '⚛️' },
                    { name: 'NASA', articles: 34, badge: '🚀' },
                    { name: 'Harvard', articles: 29, badge: '🎓' },
                    { name: 'Stanford', articles: 26, badge: '🔬' }
                  ].map((institution) => (
                    <div key={institution.name} className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <div className="flex items-center space-x-2">
                        <span>{institution.badge}</span>
                        <span className="font-medium text-foreground">{institution.name}</span>
                      </div>
                      <span className="text-muted-foreground">{institution.articles} articles</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Discoveries */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border border-purple-200/50 dark:border-purple-800/50">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🔍</div>
                  <h3 className="text-lg font-bold text-foreground">Recent Discoveries</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-background/50 rounded border-l-4 border-purple-500">
                    <div className="font-medium text-foreground mb-1">New Exoplanet</div>
                    <p className="text-muted-foreground">Earth-like planet found in habitable zone</p>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="p-3 bg-background/50 rounded border-l-4 border-blue-500">
                    <div className="font-medium text-foreground mb-1">Cancer Breakthrough</div>
                    <p className="text-muted-foreground">New immunotherapy shows 90% success rate</p>
                    <span className="text-xs text-muted-foreground">6 hours ago</span>
                  </div>
                  <div className="p-3 bg-background/50 rounded border-l-4 border-green-500">
                    <div className="font-medium text-foreground mb-1">Quantum Advance</div>
                    <p className="text-muted-foreground">Room temperature superconductor achieved</p>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                </div>
              </div>

              {/* Science Newsletter */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg p-6 border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="text-center">
                  <div className="text-3xl mb-3">🧠</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Science Weekly</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Get the latest scientific discoveries and research breakthroughs.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
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

export default ScienceCategoryPage;
