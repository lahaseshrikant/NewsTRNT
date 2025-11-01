"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  BookmarkIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon,
  UserIcon,
  CogIcon,
  EyeIcon,
  HeartIcon,
  FireIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import ArticleCard from '@/components/ArticleCard';
import Loading from '@/components/Loading';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/api/placeholder/150/150',
    totalReads: 247,
    savedArticles: 23,
    readingStreak: 7,
    totalReadingTime: 1420 // minutes
  };

  const recentReads = [
    {
      id: 1,
      title: 'AI Revolution in Healthcare',
      summary: 'Latest breakthroughs in AI-powered medical diagnosis.',
      category: 'Technology',
      publishedAt: '2 hours ago',
      readingTime: 5,
      imageUrl: '/api/placeholder/400/200',
      slug: 'ai-revolution-healthcare',
      isBreaking: false,
      likes: 124,
      views: 2341,
      comments: 32
    },
    {
      id: 2,
      title: 'Global Climate Summit Agreement',
      summary: 'World leaders unite to establish carbon reduction targets.',
      category: 'Environment',
      publishedAt: '1 day ago',
      readingTime: 3,
      imageUrl: '/api/placeholder/400/200',
      slug: 'climate-summit-agreement',
      isBreaking: false,
      likes: 89,
      views: 1567,
      comments: 18
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'reading', name: 'Reading History', icon: BookmarkIcon },
    { id: 'saved', name: 'Saved Articles', icon: BookmarkIcon },
    { id: 'analytics', name: 'Analytics', icon: ArrowTrendingUpIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto">
          <Loading variant="spinner" size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {userData.name}!</h2>
            <p className="text-blue-100">Ready to catch up on today's news?</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">JD</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{userData.totalReads}</div>
            <div className="text-sm text-blue-100">Articles Read</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userData.savedArticles}</div>
            <div className="text-sm text-blue-100">Saved Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userData.readingStreak}</div>
            <div className="text-sm text-blue-100">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(userData.totalReadingTime / 60)}h</div>
            <div className="text-sm text-blue-100">Reading Time</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <EyeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-foreground">Today's Reads</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-foreground">Reading Time</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">1h 23m</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FireIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-foreground">Streak</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userData.readingStreak} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <NewspaperIcon className="w-5 h-5 mr-2" />
          Recent Articles
        </h3>
        <div className="space-y-4">
          {recentReads.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              variant="compact" 
              showActions={false}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Your personalized news hub</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab !== 'overview' && (
          <div className="bg-card rounded-lg p-8 shadow-sm text-center border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            <p className="text-muted-foreground">This section is coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
