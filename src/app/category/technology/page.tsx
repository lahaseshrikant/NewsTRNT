"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';

const TechnologyPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Tech', count: 234 },
    { id: 'ai', label: 'AI & ML', count: 89 },
    { id: 'startups', label: 'Startups', count: 67 },
    { id: 'security', label: 'Cybersecurity', count: 45 },
    { id: 'hardware', label: 'Hardware', count: 33 }
  ];

  const featuredArticles = [
    {
      id: 1,
      title: "OpenAI Announces Revolutionary GPT-5 with 10x Performance Improvement",
      summary: "The new language model promises unprecedented capabilities in reasoning, creativity, and multimodal understanding.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "1 hour ago",
      readTime: "5 min read",
      author: "Alex Thompson",
      tags: ["AI", "OpenAI", "GPT-5"],
      isFeatured: true
    },
    {
      id: 2,
      title: "Apple Unveils Game-Changing Neural Processor for Next-Gen Devices",
      summary: "The M4 chip features dedicated AI acceleration that could transform mobile computing and AR experiences.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "3 hours ago",
      readTime: "7 min read",
      author: "Sarah Kim",
      tags: ["Apple", "Hardware", "AI"],
      isFeatured: true
    }
  ];

  const recentArticles = [
    {
      id: 3,
      title: "Meta Launches Advanced VR Workspace Platform for Remote Teams",
      summary: "Horizon Workrooms 3.0 introduces haptic feedback and ultra-realistic avatars for virtual collaboration.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "4 hours ago",
      readTime: "6 min read",
      author: "David Chen",
      tags: ["Meta", "VR", "Remote Work"]
    },
    {
      id: 4,
      title: "Tesla's FSD Beta Achieves 99.9% Safety Rating in Latest Tests",
      summary: "Full Self-Driving technology shows remarkable improvement in complex urban scenarios.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "6 hours ago",
      readTime: "4 min read",
      author: "Maria Rodriguez",
      tags: ["Tesla", "Autonomous", "Safety"]
    },
    {
      id: 5,
      title: "Google Quantum Computer Breaks New Computational Barriers",
      summary: "Sycamore processor demonstrates quantum supremacy in practical optimization problems.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "8 hours ago",
      readTime: "8 min read",
      author: "Robert Wilson",
      tags: ["Google", "Quantum", "Computing"]
    },
    {
      id: 6,
      title: "Cybersecurity Firm Discovers Major Vulnerability in IoT Devices",
      summary: "Critical security flaw affects millions of smart home devices worldwide.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "10 hours ago",
      readTime: "5 min read",
      author: "Lisa Park",
      tags: ["Security", "IoT", "Vulnerability"]
    }
  ];

  const trendingTopics = [
    { name: "Artificial Intelligence", count: 156 },
    { name: "Quantum Computing", count: 89 },
    { name: "Cryptocurrency", count: 67 },
    { name: "5G Technology", count: 45 },
    { name: "Cloud Computing", count: 34 }
  ];

  const techStocks = [
    { symbol: "AAPL", price: "$192.45", change: "+2.3%" },
    { symbol: "GOOGL", price: "$142.80", change: "+1.8%" },
    { symbol: "MSFT", price: "$378.90", change: "+0.9%" },
    { symbol: "TSLA", price: "$248.50", change: "-1.2%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Technology' }
          ]} className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Technology
              </h1>
              <p className="text-lg text-muted-foreground">
                Latest innovations, breakthroughs, and tech industry insights
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">234</div>
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
              <h2 className="text-2xl font-bold text-foreground mb-6">Breaking Tech News</h2>
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
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          TECH NEWS
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
              <h2 className="text-2xl font-bold text-foreground mb-6">Latest Technology News</h2>
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
            {/* Tech Stocks */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Tech Stocks</h3>
              <div className="space-y-3">
                {techStocks.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-foreground">{stock.symbol}</span>
                    <div className="text-right">
                      <div className="text-foreground">{stock.price}</div>
                      <div className={`text-sm ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Trending in Tech</h3>
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
              <h3 className="text-lg font-bold text-foreground mb-2">Tech Weekly</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get the latest tech news and insights delivered weekly.
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
              <h3 className="text-lg font-bold text-foreground mb-4">Tech Resources</h3>
              <div className="space-y-2">
                {[
                  { name: 'Product Launches', href: '/tech/launches' },
                  { name: 'Startup Directory', href: '/tech/startups' },
                  { name: 'Tech Jobs', href: '/careers' },
                  { name: 'Developer Tools', href: '/developers' }
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

export default TechnologyPage;
