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
import { dbApi, Article } from '@/lib/database-real';

interface DashboardArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  imageUrl: string;
  slug: string;
  isBreaking: boolean;
  likes: number;
  views: number;
  comments: number;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [recentReads, setRecentReads] = useState<DashboardArticle[]>([]);
  
  // Format relative time
  const formatRelativeTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Load articles from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const articles = await dbApi.getArticles({ limit: 5 });
        const formattedArticles: DashboardArticle[] = articles.map((article: Article) => ({
          id: article.id,
          title: article.title,
          summary: article.summary || article.excerpt || '',
          category: article.category?.name || 'Uncategorized',
          publishedAt: formatRelativeTime(article.published_at),
          readingTime: article.readingTime || 3,
          imageUrl: article.imageUrl || '/api/placeholder/400/200',
          slug: article.slug,
          isBreaking: article.isBreaking || false,
          likes: article.likes || 0,
          views: article.views || 0,
          comments: 0
        }));
        setRecentReads(formattedArticles);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // User data - would come from auth context in a real app
  const userData = {
    name: 'User',
    email: 'user@example.com',
    avatar: '/api/placeholder/150/150',
    totalReads: recentReads.length,
    savedArticles: 0,
    readingStreak: 1,
    totalReadingTime: 0
  };

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
