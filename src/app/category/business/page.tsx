"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';

const BusinessPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Business', count: 189 },
    { id: 'markets', label: 'Markets', count: 78 },
    { id: 'economy', label: 'Economy', count: 56 },
    { id: 'companies', label: 'Companies', count: 34 },
    { id: 'finance', label: 'Finance', count: 21 }
  ];

  const featuredArticles = [
    {
      id: 1,
      title: "Federal Reserve Signals Potential Interest Rate Cuts Amid Economic Uncertainty",
      summary: "Fed Chair indicates possible monetary policy adjustments as inflation shows signs of cooling and employment data remains mixed.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "30 minutes ago",
      readTime: "6 min read",
      author: "Michael Zhang",
      tags: ["Federal Reserve", "Interest Rates", "Economy"],
      isFeatured: true
    },
    {
      id: 2,
      title: "Tech Giants Report Record Q3 Earnings Despite Market Volatility",
      summary: "Apple, Microsoft, and Google exceed analyst expectations with strong cloud and AI revenue growth driving performance.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "2 hours ago",
      readTime: "8 min read",
      author: "Sarah Williams",
      tags: ["Earnings", "Tech", "Markets"],
      isFeatured: true
    }
  ];

  const recentArticles = [
    {
      id: 3,
      title: "Global Supply Chain Disruptions Ease as Shipping Costs Normalize",
      summary: "Container shipping rates fall 60% from peak levels as port congestion clears and demand stabilizes.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "4 hours ago",
      readTime: "5 min read",
      author: "David Park",
      tags: ["Supply Chain", "Logistics", "Trade"]
    },
    {
      id: 4,
      title: "Renewable Energy Investments Reach All-Time High in 2024",
      summary: "Global clean energy funding surpasses $2.8 trillion as governments accelerate green transition policies.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "6 hours ago",
      readTime: "7 min read",
      author: "Emma Rodriguez",
      tags: ["Energy", "Investment", "ESG"]
    },
    {
      id: 5,
      title: "Cryptocurrency Market Shows Signs of Recovery After Regulatory Clarity",
      summary: "Bitcoin and Ethereum gain momentum following new SEC guidelines on digital asset classification.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "8 hours ago",
      readTime: "4 min read",
      author: "James Chen",
      tags: ["Cryptocurrency", "Regulation", "Markets"]
    },
    {
      id: 6,
      title: "Manufacturing Sector Rebounds with AI-Driven Automation Investments",
      summary: "Industrial companies report increased productivity and cost savings from smart manufacturing technologies.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "12 hours ago",
      readTime: "6 min read",
      author: "Lisa Kim",
      tags: ["Manufacturing", "AI", "Automation"]
    }
  ];

  const marketData = [
    { index: "S&P 500", value: "4,785.32", change: "+1.2%", color: "green" },
    { index: "NASDAQ", value: "15,421.18", change: "+2.1%", color: "green" },
    { index: "DOW", value: "37,863.80", change: "+0.8%", color: "green" },
    { index: "Russell 2000", value: "2,045.12", change: "-0.3%", color: "red" }
  ];

  const commodities = [
    { name: "Gold", price: "$2,045.20", change: "+0.5%" },
    { name: "Oil (WTI)", price: "$78.45", change: "-1.2%" },
    { name: "Silver", price: "$24.32", change: "+1.8%" },
    { name: "Copper", price: "$8.87", change: "+0.3%" }
  ];

  const trendingTopics = [
    { name: "Interest Rates", count: 89 },
    { name: "Inflation", count: 67 },
    { name: "Corporate Earnings", count: 54 },
    { name: "ESG Investing", count: 43 },
    { name: "Supply Chain", count: 31 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Business' }
          ]} className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Business
              </h1>
              <p className="text-lg text-muted-foreground">
                Markets, economy, and corporate news that drives global business
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">189</div>
                <div className="text-sm text-muted-foreground">Articles today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Featured Articles */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Market Moving News</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map(article => (
                  <Link key={article.id} href={`/article/${article.id}`} 
                        className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                          MARKETS
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>{article.author}</span>
                          <span>{article.publishedAt}</span>
                        </div>
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.map(tag => (
                          <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent Articles */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Latest Business News</h2>
              <div className="space-y-6">
                {recentArticles.map(article => (
                  <Link key={article.id} href={`/article/${article.id}`}
                        className="group flex flex-col md:flex-row gap-4 bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
                    <div className="md:w-1/3">
                      <div className="relative h-48 md:h-32 rounded-lg overflow-hidden">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>{article.author}</span>
                          <span>{article.publishedAt}</span>
                        </div>
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {article.tags.map(tag => (
                          <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Load More Articles
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Market Indices */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Market Indices</h3>
              <div className="space-y-3">
                {marketData.map((market, index) => (
                  <div key={market.index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-foreground">{market.index}</span>
                    <div className="text-right">
                      <div className="text-foreground">{market.value}</div>
                      <div className={`text-sm ${market.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                        {market.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commodities */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Commodities</h3>
              <div className="space-y-3">
                {commodities.map((commodity, index) => (
                  <div key={commodity.name} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-foreground">{commodity.name}</span>
                    <div className="text-right">
                      <div className="text-foreground">{commodity.price}</div>
                      <div className={`text-sm ${commodity.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {commodity.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Trending in Business</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-foreground">{topic.name}</span>
                    <span className="text-muted-foreground text-sm">{topic.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Business Daily</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get daily business news and market updates delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Business Tools</h3>
              <div className="space-y-2">
                {[
                  { name: 'Stock Screener', href: '/tools/stocks' },
                  { name: 'Economic Calendar', href: '/tools/calendar' },
                  { name: 'Company Profiles', href: '/companies' },
                  { name: 'Market Analysis', href: '/analysis' }
                ].map(link => (
                  <Link key={link.name} href={link.href}
                        className="block text-primary hover:text-primary/80 text-sm">
                    {link.name} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;
