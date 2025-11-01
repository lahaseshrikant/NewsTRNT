"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface Campaign {
  id: string;
  title: string;
  advertiser: string;
  type: 'banner' | 'sponsored' | 'video' | 'native';
  status: 'active' | 'paused' | 'completed' | 'pending';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  startDate: string;
  endDate: string;
}

interface AdProposal {
  id: string;
  company: string;
  email: string;
  campaign: string;
  budget: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

const AdvertisingManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'proposals' | 'performance'>('campaigns');
  
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'TechCorp Banner Campaign',
      advertiser: 'TechCorp Inc.',
      type: 'banner',
      status: 'active',
      budget: 5000,
      spent: 3200,
      impressions: 125000,
      clicks: 2500,
      ctr: 2.0,
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    {
      id: '2',
      title: 'AutoDealer Sponsored Posts',
      advertiser: 'AutoDealer Pro',
      type: 'sponsored',
      status: 'active',
      budget: 8000,
      spent: 4500,
      impressions: 89000,
      clicks: 1780,
      ctr: 2.0,
      startDate: '2024-01-05',
      endDate: '2024-02-05'
    },
    {
      id: '3',
      title: 'FinanceApp Video Ads',
      advertiser: 'FinanceApp',
      type: 'video',
      status: 'paused',
      budget: 12000,
      spent: 8900,
      impressions: 156000,
      clicks: 4680,
      ctr: 3.0,
      startDate: '2023-12-15',
      endDate: '2024-01-15'
    }
  ]);

  const [proposals] = useState<AdProposal[]>([
    {
      id: '1',
      company: 'Green Energy Solutions',
      email: 'marketing@greenenergy.com',
      campaign: 'Sustainable Future Campaign',
      budget: '$15,000',
      duration: '3 months',
      status: 'pending',
      submittedDate: '2024-01-14'
    },
    {
      id: '2',
      company: 'FoodieApp',
      email: 'ads@foodieapp.com',
      campaign: 'Restaurant Discovery',
      budget: '$8,500',
      duration: '2 months',
      status: 'pending',
      submittedDate: '2024-01-13'
    },
    {
      id: '3',
      company: 'TravelBooking',
      email: 'partnerships@travelbooking.com',
      campaign: 'Summer Destinations',
      budget: '$25,000',
      duration: '4 months',
      status: 'approved',
      submittedDate: '2024-01-10'
    }
  ]);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      banner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      sponsored: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      video: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      native: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    return styles[type as keyof typeof styles] || styles.banner;
  };

  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const avgCTR = totalClicks > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Advertisement Manager' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Advertisement Manager</h1>
            <p className="text-muted-foreground">Manage advertising campaigns, review proposals, and track performance</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              📝 Create Campaign
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              📊 Analytics Report
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-xs text-green-600 mt-1">+18% vs last month</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{campaigns.filter(c => c.status === 'active').length}</div>
            <div className="text-sm text-muted-foreground">Active Campaigns</div>
            <div className="text-xs text-blue-600 mt-1">{campaigns.length} total</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{totalImpressions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Impressions</div>
            <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{avgCTR.toFixed(2)}%</div>
            <div className="text-sm text-muted-foreground">Average CTR</div>
            <div className="text-xs text-green-600 mt-1">+0.3% vs last month</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'campaigns', label: 'Active Campaigns', icon: '🎯' },
                { id: 'proposals', label: 'Proposals', icon: '📋' },
                { id: 'performance', label: 'Performance', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'campaigns' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Active Campaigns</h3>
                  <div className="flex space-x-2">
                    <button className="bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90 transition-colors">
                      🔄 Refresh
                    </button>
                    <button className="bg-secondary text-secondary-foreground px-3 py-2 rounded hover:bg-secondary/90 transition-colors">
                      📊 Export
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground">Campaign</th>
                        <th className="text-left p-4 font-medium text-foreground">Type</th>
                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-foreground">Budget</th>
                        <th className="text-left p-4 font-medium text-foreground">Spent</th>
                        <th className="text-left p-4 font-medium text-foreground">Performance</th>
                        <th className="text-left p-4 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign, index) => (
                        <tr key={campaign.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-foreground">{campaign.title}</div>
                              <div className="text-sm text-muted-foreground">{campaign.advertiser}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadge(campaign.type)}`}>
                              {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-foreground">${campaign.budget.toLocaleString()}</td>
                          <td className="p-4 text-foreground">${campaign.spent.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="text-foreground">{campaign.impressions.toLocaleString()} impressions</div>
                              <div className="text-muted-foreground">{campaign.clicks.toLocaleString()} clicks ({campaign.ctr}% CTR)</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400" title="Edit">
                                ✏️
                              </button>
                              <button className="text-green-600 hover:text-green-800 dark:text-green-400" title="View Details">
                                👁️
                              </button>
                              <button className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400" title="Pause/Resume">
                                ⏸️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'proposals' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Advertisement Proposals</h3>
                  <div className="text-sm text-muted-foreground">
                    {proposals.filter(p => p.status === 'pending').length} pending review
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="bg-muted/20 border border-border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-semibold text-foreground">{proposal.company}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(proposal.status)}`}>
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Campaign</div>
                              <div className="font-medium text-foreground">{proposal.campaign}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Budget</div>
                              <div className="font-medium text-foreground">{proposal.budget}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Duration</div>
                              <div className="font-medium text-foreground">{proposal.duration}</div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Contact: {proposal.email} • Submitted: {proposal.submittedDate}
                          </div>
                        </div>
                        {proposal.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                              ✅ Approve
                            </button>
                            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                              ❌ Reject
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                              📧 Contact
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">Campaign Performance Overview</h3>
                
                {/* Performance Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-muted/20 border border-border rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-4">Revenue Trend</h4>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      📈 Revenue chart will be displayed here
                    </div>
                  </div>
                  <div className="bg-muted/20 border border-border rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-4">Click-through Rates</h4>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      📊 CTR chart will be displayed here
                    </div>
                  </div>
                </div>

                {/* Top Performing Campaigns */}
                <div className="bg-muted/20 border border-border rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-4">Top Performing Campaigns</h4>
                  <div className="space-y-3">
                    {campaigns
                      .sort((a, b) => b.ctr - a.ctr)
                      .slice(0, 3)
                      .map((campaign, index) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 bg-background rounded">
                          <div>
                            <div className="font-medium text-foreground">{campaign.title}</div>
                            <div className="text-sm text-muted-foreground">{campaign.advertiser}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground">{campaign.ctr}% CTR</div>
                            <div className="text-sm text-muted-foreground">${campaign.spent.toLocaleString()} spent</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisingManager;

