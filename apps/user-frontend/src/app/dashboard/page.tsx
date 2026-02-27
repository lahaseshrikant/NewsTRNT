"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  NewspaperIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import ArticleCard from '@/components/articles/ArticleCard';
import Loading from '@/components/ui/Loading';
import { dbApi, userPreferencesApi } from '@/lib/api-client';
import type { Article } from '@/lib/api-client';

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
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [recentReads, setRecentReads] = useState<DashboardArticle[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [followedTopicsCount, setFollowedTopicsCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/signin?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);
  
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

  // Load articles from database + user preferences
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
          imageUrl: article.imageUrl || '/images/placeholder-news.svg',
          slug: article.slug,
          isBreaking: article.isBreaking || false,
          likes: article.likes || 0,
          views: article.views || 0,
          comments: 0
        }));
        setRecentReads(formattedArticles);

        // Load user-specific data if authenticated
        if (user?.id) {
          const [savedRes, topicsRes] = await Promise.all([
            userPreferencesApi.getSavedArticles(user.id, 1, 1),
            userPreferencesApi.getFollowedTopics(user.id),
          ]);
          setSavedCount(savedRes.pagination.total);
          setFollowedTopicsCount(topicsRes.length);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const userData = {
    name: user?.fullName || 'User',
    email: user?.email || '',
    initials: user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U',
    totalReads: recentReads.length,
    savedArticles: savedCount,
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
      <div className="bg-ink rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {userData.name}!</h2>
            <p className="text-white">Ready to catch up on today's news?</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-paper/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">{userData.initials}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{userData.totalReads}</div>
            <div className="text-sm text-white">Articles Read</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userData.savedArticles}</div>
            <div className="text-sm text-white">Saved Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userData.readingStreak}</div>
            <div className="text-sm text-white">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(userData.totalReadingTime / 60)}h</div>
            <div className="text-sm text-white">Reading Time</div>
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
            <Link 
              key={article.id} 
              href={`/article/${article.slug}`}
              className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <h4 className="font-medium text-foreground line-clamp-2">{article.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{article.category} • {article.publishedAt}</p>
            </Link>
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

        {/* Reading History */}
        {activeTab === 'reading' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Recent Reading History
              </h3>
              {recentReads.length > 0 ? (
                <div className="space-y-4">
                  {recentReads.map((article) => (
                    <Link 
                      key={article.id} 
                      href={`/article/${article.slug}`}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground line-clamp-1">{article.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {article.category} &bull; {article.readingTime} min read &bull; {article.publishedAt}
                        </p>
                      </div>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-4" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Start reading articles to build your history.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Saved Articles */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <BookmarkIcon className="w-5 h-5 mr-2" />
                  Saved Articles ({savedCount})
                </h3>
                <Link 
                  href="/saved"
                  className="text-vermillion hover:text-vermillion/80 font-mono text-xs tracking-wider uppercase flex items-center"
                >
                  View All <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                </Link>
              </div>
              {savedCount > 0 ? (
                <p className="text-muted-foreground">
                  You have {savedCount} article{savedCount !== 1 ? 's' : ''} saved for later reading.
                </p>
              ) : (
                <div className="text-center py-8">
                  <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No saved articles yet.</p>
                  <Link href="/" className="text-vermillion hover:text-vermillion/80 font-mono text-xs tracking-wider uppercase">
                    Browse Articles
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border text-center">
                <EyeIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{recentReads.length}</div>
                <div className="text-sm text-muted-foreground">Articles Read</div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border text-center">
                <BookmarkIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{savedCount}</div>
                <div className="text-sm text-muted-foreground">Saved Articles</div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border text-center">
                <FireIcon className="w-8 h-8 text-vermillion mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{followedTopicsCount}</div>
                <div className="text-sm text-muted-foreground">Topics Followed</div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                Top Categories Read
              </h3>
              {recentReads.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(
                    recentReads.reduce<Record<string, number>>((acc, a) => {
                      acc[a.category] = (acc[a.category] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort(([,a], [,b]) => b - a).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-foreground">{category}</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-muted rounded-full mr-3">
                          <div 
                            className="h-2 bg-vermillion rounded-full"
                            style={{ width: `${Math.round((count / recentReads.length) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Read more articles to see analytics.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <CogIcon className="w-5 h-5 mr-2" />
                Account Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Profile</h4>
                    <p className="text-sm text-muted-foreground">Manage your name, email, and avatar</p>
                  </div>
                  <Link href="/profile" className="text-vermillion hover:text-vermillion/80 font-mono text-xs tracking-wider uppercase">
                    Edit
                  </Link>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Interests</h4>
                    <p className="text-sm text-muted-foreground">
                      {followedTopicsCount > 0 ? `${followedTopicsCount} topics followed` : 'Personalize your news feed'}
                    </p>
                  </div>
                  <Link href="/interests" className="text-vermillion hover:text-vermillion/80 font-mono text-xs tracking-wider uppercase">
                    Manage
                  </Link>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Notifications</h4>
                    <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
                  </div>
                  <Link href="/notifications" className="text-vermillion hover:text-vermillion/80 font-mono text-xs tracking-wider uppercase">
                    View
                  </Link>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Saved Articles</h4>
                    <p className="text-sm text-muted-foreground">{savedCount} article{savedCount !== 1 ? 's' : ''} in your reading list</p>
                  </div>
                  <Link href="/saved" className="text-vermillion hover:text-vermillion/80 font-mono text-xs tracking-wider uppercase">
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
