"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';

const PoliticsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Politics', count: 156 },
    { id: 'national', label: 'National', count: 89 },
    { id: 'international', label: 'International', count: 45 },
    { id: 'elections', label: 'Elections', count: 22 }
  ];

  const featuredArticles = [
    {
      id: 1,
      title: "Congressional Leaders Reach Bipartisan Agreement on Infrastructure Bill",
      summary: "After months of negotiations, both parties find common ground on a comprehensive infrastructure package worth $1.2 trillion.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "2 hours ago",
      readTime: "4 min read",
      author: "Sarah Mitchell",
      tags: ["Congress", "Infrastructure", "Bipartisan"],
      isFeatured: true
    },
    {
      id: 2,
      title: "Supreme Court to Hear Major Cases on Digital Privacy Rights",
      summary: "The high court will examine constitutional questions surrounding government surveillance and digital privacy in the modern era.",
      imageUrl: "/api/placeholder/600/400",
      publishedAt: "4 hours ago",
      readTime: "6 min read",
      author: "David Chen",
      tags: ["Supreme Court", "Privacy", "Technology"],
      isFeatured: true
    }
  ];

  const recentArticles = [
    {
      id: 3,
      title: "Midterm Elections: Key Races to Watch Across the Nation",
      summary: "Comprehensive analysis of the most competitive congressional and gubernatorial races.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "6 hours ago",
      readTime: "8 min read",
      author: "Maria Rodriguez",
      tags: ["Elections", "Congress"]
    },
    {
      id: 4,
      title: "Climate Policy Debate Intensifies as New Legislation Proposed",
      summary: "Environmental groups and industry leaders clash over proposed carbon emission standards.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "8 hours ago",
      readTime: "5 min read",
      author: "James Wilson",
      tags: ["Climate", "Policy"]
    },
    {
      id: 5,
      title: "Federal Reserve Chair Discusses Economic Policy in Senate Hearing",
      summary: "Key insights from congressional testimony on interest rates and inflation concerns.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "12 hours ago",
      readTime: "6 min read",
      author: "Robert Kim",
      tags: ["Economy", "Federal Reserve"]
    },
    {
      id: 6,
      title: "State Governors Meet to Discuss Interstate Commerce Policies",
      summary: "Regional leaders collaborate on trade agreements and regulatory harmonization.",
      imageUrl: "/api/placeholder/400/300",
      publishedAt: "1 day ago",
      readTime: "4 min read",
      author: "Lisa Thompson",
      tags: ["States", "Commerce"]
    }
  ];

  const trendingTopics = [
    { name: "Congressional Hearings", count: 23 },
    { name: "Election Coverage", count: 18 },
    { name: "Supreme Court", count: 15 },
    { name: "Foreign Policy", count: 12 },
    { name: "Climate Policy", count: 9 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600/10 to-blue-600/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: 'Categories', href: '/category' },
            { label: 'Politics' }
          ]} className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Politics
              </h1>
              <p className="text-lg text-muted-foreground">
                Stay informed with comprehensive political coverage and analysis
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">156</div>
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
              <h2 className="text-2xl font-bold text-foreground mb-6">Breaking Political News</h2>
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
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                          BREAKING
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
              <h2 className="text-2xl font-bold text-foreground mb-6">Latest Political News</h2>
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
            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Trending in Politics</h3>
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
              <h3 className="text-lg font-bold text-foreground mb-2">Political Briefing</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get daily political news and analysis delivered to your inbox.
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
              <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { name: 'Election Results', href: '/elections' },
                  { name: 'Congressional Directory', href: '/congress' },
                  { name: 'Policy Tracker', href: '/policy' },
                  { name: 'Political Calendar', href: '/calendar' }
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

export default PoliticsPage;
