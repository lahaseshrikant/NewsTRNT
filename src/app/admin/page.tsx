"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { siteConfig } from '@/config/site';

interface AdminCard {
  title: string;
  description: string;
  icon: string;
  href: string;
  badge?: string;
  color: string;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

interface RecentActivity {
  id: string;
  type: 'article' | 'user' | 'comment' | 'system';
  message: string;
  timestamp: string;
  user: string;
}

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Quick Statistics
  const quickStats: QuickStat[] = [
    {
      label: 'Total Articles',
      value: '1,247',
      change: '+12 this week',
      trend: 'up',
      icon: '📄'
    },
    {
      label: 'Active Users',
      value: '8,943',
      change: '+156 this month',
      trend: 'up',
      icon: '👥'
    },
    {
      label: 'Page Views',
      value: '342.7K',
      change: '+8.3% vs last week',
      trend: 'up',
      icon: '👁️'
    },
    {
      label: 'Revenue',
      value: '$12,487',
      change: '+5.2% vs last month',
      trend: 'up',
      icon: '💰'
    }
  ];

  // Recent Activities
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'article',
      message: 'New article "AI Breakthrough in Healthcare" published',
      timestamp: '2 minutes ago',
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'user',
      message: 'New user registration: jane.smith@email.com',
      timestamp: '15 minutes ago',
      user: 'System'
    },
    {
      id: '3',
      type: 'comment',
      message: '3 new comments pending moderation',
      timestamp: '1 hour ago',
      user: 'System'
    },
    {
      id: '4',
      type: 'article',
      message: 'Article "Climate Change Update" edited',
      timestamp: '2 hours ago',
      user: 'Jane Editor'
    },
    {
      id: '5',
      type: 'system',
      message: 'Daily backup completed successfully',
      timestamp: '3 hours ago',
      user: 'System'
    }
  ];

  const adminCards: AdminCard[] = [
    {
      title: 'Site Configuration',
      description: 'Manage contact info, business details, metrics, and all site settings',
      icon: '⚙️',
      href: '/admin/config',
      badge: 'Essential',
      color: 'from-blue-500/10 to-blue-600/10 border-blue-200'
    },
    {
      title: 'Content Management',
      description: 'Create, edit, and manage articles, categories, and news content',
      icon: '📝',
      href: '/admin/content',
      color: 'from-green-500/10 to-green-600/10 border-green-200'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, permissions, and subscriber information',
      icon: '👥',
      href: '/admin/users',
      color: 'from-purple-500/10 to-purple-600/10 border-purple-200'
    },
    {
      title: 'Analytics & Reports',
      description: 'View site analytics, performance metrics, and generate reports',
      icon: '📊',
      href: '/admin/analytics',
      color: 'from-orange-500/10 to-orange-600/10 border-orange-200'
    },
    {
      title: 'Advertisement Manager',
      description: 'Manage advertising campaigns, review proposals, and track performance',
      icon: '💼',
      href: '/admin/advertising',
      color: 'from-pink-500/10 to-pink-600/10 border-pink-200'
    },
    {
      title: 'Newsletter Management',
      description: 'Create newsletters, manage subscribers, and schedule campaigns',
      icon: '📧',
      href: '/admin/newsletter',
      color: 'from-teal-500/10 to-teal-600/10 border-teal-200'
    },
    {
      title: 'Media Library',
      description: 'Upload, organize, and manage images, videos, and other media files',
      icon: '🎬',
      href: '/admin/media',
      color: 'from-red-500/10 to-red-600/10 border-red-200'
    },
    {
      title: 'Comments & Moderation',
      description: 'Review comments, moderate user-generated content, and manage discussions',
      icon: '💬',
      href: '/admin/moderation',
      color: 'from-indigo-500/10 to-indigo-600/10 border-indigo-200'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences, security settings, and integrations',
      icon: '🔒',
      href: '/admin/system',
      color: 'from-gray-500/10 to-gray-600/10 border-gray-200'
    }
  ];



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: 'Admin Dashboard' }]} className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome to NewsNerve Admin
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage your news platform from this central dashboard
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Last Login</div>
                <div className="font-medium text-foreground">{new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <div className="flex space-x-2">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                {range === '24h' ? 'Last 24 Hours' : 
                 range === '7d' ? 'Last 7 Days' :
                 range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-6">Management Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminCards.map((card, index) => (
                <Link
                  key={index}
                  href={card.href}
                  className={`group bg-gradient-to-br ${card.color} border rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    {card.badge && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-lg">{activity.type === 'article' ? '📄' : activity.type === 'user' ? '👤' : activity.type === 'comment' ? '💬' : '🔧'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Link 
                  href="/admin/activity" 
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/admin/content/new"
                  className="flex items-center space-x-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>✏️</span>
                  <span>Write new article</span>
                </Link>
                <Link 
                  href="/admin/config"
                  className="flex items-center space-x-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>⚙️</span>
                  <span>Update site settings</span>
                </Link>
                <Link 
                  href="/admin/users"
                  className="flex items-center space-x-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>👥</span>
                  <span>Manage users</span>
                </Link>
                <Link 
                  href="/admin/analytics"
                  className="flex items-center space-x-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>📊</span>
                  <span>View analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-foreground">Server Status: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-foreground">Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-foreground">CDN: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
