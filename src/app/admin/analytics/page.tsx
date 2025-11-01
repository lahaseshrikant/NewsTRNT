"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('pageviews');

  const analyticsData = {
    overview: {
      totalViews: 145689,
      uniqueVisitors: 89456,
      pageViews: 234567,
      bounceRate: 34.5,
      avgSessionDuration: '2:45',
      conversionRate: 3.2
    },
    topArticles: [
      { title: 'AI Breakthrough in Healthcare', views: 12500, engagement: 85 },
      { title: 'Climate Change Research', views: 8900, engagement: 78 },
      { title: 'Economic Outlook 2024', views: 7650, engagement: 72 },
      { title: 'Tech Innovation Trends', views: 6890, engagement: 80 },
      { title: 'Sports Championship', views: 5670, engagement: 65 }
    ],
    trafficSources: [
      { source: 'Direct', visitors: 35689, percentage: 40 },
      { source: 'Search Engines', visitors: 26767, percentage: 30 },
      { source: 'Social Media', visitors: 17845, percentage: 20 },
      { source: 'Referrals', visitors: 8922, percentage: 10 }
    ],
    userDemographics: {
      countries: [
        { country: 'United States', users: 25000, percentage: 28 },
        { country: 'India', users: 18000, percentage: 20 },
        { country: 'United Kingdom', users: 12000, percentage: 13 },
        { country: 'Canada', users: 9000, percentage: 10 },
        { country: 'Australia', users: 7000, percentage: 8 }
      ],
      devices: [
        { device: 'Mobile', users: 50000, percentage: 56 },
        { device: 'Desktop', users: 30000, percentage: 33 },
        { device: 'Tablet', users: 9000, percentage: 11 }
      ]
    }
  };

  const dateRanges = [
    { value: '24hours', label: 'Last 24 Hours' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Analytics & Reports' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
            <p className="text-muted-foreground">View site analytics, performance metrics, and generate reports</p>
          </div>
          <div className="flex space-x-3">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-background border border-border rounded-lg px-4 py-2 text-foreground"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              📊 Export Report
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
            <div className="text-xs text-green-600 mt-1">+12% vs last period</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.uniqueVisitors.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Unique Visitors</div>
            <div className="text-xs text-green-600 mt-1">+8% vs last period</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.pageViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Page Views</div>
            <div className="text-xs text-green-600 mt-1">+15% vs last period</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.bounceRate}%</div>
            <div className="text-sm text-muted-foreground">Bounce Rate</div>
            <div className="text-xs text-red-600 mt-1">+2% vs last period</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.avgSessionDuration}</div>
            <div className="text-sm text-muted-foreground">Avg Session</div>
            <div className="text-xs text-green-600 mt-1">+5% vs last period</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.conversionRate}%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
            <div className="text-xs text-green-600 mt-1">+18% vs last period</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Articles */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Articles</h3>
            <div className="space-y-4">
              {analyticsData.topArticles.map((article, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{article.title}</div>
                    <div className="text-xs text-muted-foreground">{article.views.toLocaleString()} views</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{article.engagement}%</div>
                    <div className="text-xs text-muted-foreground">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Traffic Sources</h3>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-foreground">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">{source.visitors.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{source.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Geographic Distribution */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Countries</h3>
            <div className="space-y-3">
              {analyticsData.userDemographics.countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-foreground">{country.country}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {country.users.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Device Types</h3>
            <div className="space-y-4">
              {analyticsData.userDemographics.devices.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-foreground">{device.device}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full" 
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Real-time Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">247</div>
              <div className="text-sm text-muted-foreground">Online Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,423</div>
              <div className="text-sm text-muted-foreground">Today's Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-sm text-muted-foreground">Pages/Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">3:42</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Export & Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              📊 Download Analytics Report
            </button>
            <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
              📈 Export User Behavior Data
            </button>
            <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              📋 Generate Custom Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

