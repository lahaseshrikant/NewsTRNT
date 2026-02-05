// src/app/admin/advertising/performance/page.tsx - Ad Performance Analytics
'use client';

import React, { useState } from 'react';
import { AdminRoute } from '@/components/admin/RouteGuard';

interface AdCampaign {
  id: string;
  name: string;
  advertiser: string;
  type: 'banner' | 'sidebar' | 'sponsored' | 'native' | 'video';
  status: 'active' | 'paused' | 'ended';
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  revenue: number;
  startDate: string;
  endDate: string;
}

function AdPerformanceContent() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [campaigns] = useState<AdCampaign[]>([
    { id: '1', name: 'Tech Product Launch', advertiser: 'TechCorp', type: 'banner', status: 'active', impressions: 125000, clicks: 3750, ctr: 3.0, spend: 0, revenue: 7500, startDate: '2026-01-15', endDate: '2026-04-15' },
    { id: '2', name: 'Green Energy Awareness', advertiser: 'EcoGreen', type: 'sponsored', status: 'active', impressions: 85000, clicks: 4250, ctr: 5.0, spend: 0, revenue: 12000, startDate: '2026-01-01', endDate: '2026-06-30' },
    { id: '3', name: 'Fashion Spring Sale', advertiser: 'StyleHub', type: 'native', status: 'active', impressions: 45000, clicks: 2025, ctr: 4.5, spend: 0, revenue: 4500, startDate: '2026-02-01', endDate: '2026-03-31' },
    { id: '4', name: 'Finance App Promo', advertiser: 'FinTech Co', type: 'video', status: 'paused', impressions: 32000, clicks: 1280, ctr: 4.0, spend: 0, revenue: 3200, startDate: '2026-01-20', endDate: '2026-02-20' },
    { id: '5', name: 'Holiday Campaign', advertiser: 'RetailMax', type: 'banner', status: 'ended', impressions: 250000, clicks: 5000, ctr: 2.0, spend: 0, revenue: 10000, startDate: '2025-12-01', endDate: '2025-12-31' },
  ]);

  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const getStatusColor = (status: AdCampaign['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      ended: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[status];
  };

  const getTypeIcon = (type: AdCampaign['type']) => {
    const icons = { banner: '🖼️', sidebar: '📐', sponsored: '📰', native: '📝', video: '🎬' };
    return icons[type];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Performance</h1>
          <p className="text-muted-foreground">Monitor advertising campaign metrics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Impressions</p>
          <p className="text-2xl font-bold text-foreground">{totalImpressions.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">↑ 12.5% vs last period</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Clicks</p>
          <p className="text-2xl font-bold text-blue-600">{totalClicks.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">↑ 8.3% vs last period</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Average CTR</p>
          <p className="text-2xl font-bold text-purple-600">{avgCTR.toFixed(2)}%</p>
          <p className="text-xs text-green-600 mt-1">↑ 0.5% vs last period</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">↑ 15.2% vs last period</p>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Revenue Over Time</h3>
        <div className="h-64 flex items-end justify-between gap-2 px-4">
          {[65, 45, 78, 52, 88, 72, 95, 68, 85, 55, 90, 75].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
              style={{ height: `${height}%` }}
              title={`Week ${i + 1}: $${Math.round(height * 100)}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-4">
          <span>Week 1</span>
          <span>Week 6</span>
          <span>Week 12</span>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Campaign Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Campaign</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Impressions</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Clicks</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">CTR</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map(campaign => (
                <tr key={campaign.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.advertiser}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {getTypeIcon(campaign.type)} {campaign.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{campaign.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium">{campaign.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${campaign.ctr >= 3 ? 'text-green-600' : campaign.ctr >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {campaign.ctr.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    ${campaign.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance by Ad Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Revenue by Ad Type</h3>
          <div className="space-y-4">
            {(['banner', 'sponsored', 'native', 'video'] as const).map(type => {
              const typeRevenue = campaigns.filter(c => c.type === type).reduce((acc, c) => acc + c.revenue, 0);
              const percentage = totalRevenue > 0 ? (typeRevenue / totalRevenue) * 100 : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{getTypeIcon(type)} {type}</span>
                    <span className="font-medium">${typeRevenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Top Performing Campaigns</h3>
          <div className="space-y-3">
            {campaigns
              .sort((a, b) => b.ctr - a.ctr)
              .slice(0, 5)
              .map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground text-sm">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">{campaign.advertiser}</p>
                    </div>
                  </div>
                  <span className="font-medium text-green-600">{campaign.ctr.toFixed(1)}% CTR</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdPerformancePage() {
  return (
    <AdminRoute>
      <AdPerformanceContent />
    </AdminRoute>
  );
}
