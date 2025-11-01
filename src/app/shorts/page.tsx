"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { useCategories, Category } from '@/hooks/useCategories';
import { getCategoryBadgeStyle, findCategoryByName } from '@/lib/categoryUtils';

const ShortsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Create categories list with special items and dynamic categories
  const categories = [
    { id: 'all', label: 'All Shorts', count: 234 },
    { id: 'breaking', label: 'Breaking', count: 45 },
    ...dynamicCategories.slice(0, 4).map(cat => ({
      id: cat.slug,
      label: cat.name,
      count: Math.floor(Math.random() * 50) + 20 // Mock count for now
    }))
  ];

  const newsShorts = [
    {
      id: 1,
      title: "AI Chip Breakthrough Boosts Computing Speed by 300%",
      summary: "New semiconductor design revolutionizes artificial intelligence processing capabilities.",
      content: "Researchers at leading tech companies have unveiled a groundbreaking AI chip architecture that delivers 300% faster processing speeds while reducing energy consumption by 40%. The innovation could accelerate AI adoption across industries.",
      category: "Technology",
      publishedAt: "5 minutes ago",
      readTime: "1 min",
      author: "Tech Desk",
      imageUrl: "/api/placeholder/400/300",
      tags: ["AI", "Technology", "Innovation"],
      wordCount: 85,
      isBreaking: true
    },
    {
      id: 2,
      title: "Global Climate Fund Reaches $100 Billion Milestone",
      summary: "International climate finance initiative achieves historic funding target ahead of schedule.",
      content: "The Green Climate Fund has successfully raised $100 billion in commitments from developed nations, marking a significant milestone in global climate action. The funding will support renewable energy projects and climate adaptation measures in developing countries over the next five years.",
      category: "Environment",
      publishedAt: "15 minutes ago",
      readTime: "1 min",
      author: "Climate Desk",
      imageUrl: "/api/placeholder/400/300",
      tags: ["Climate", "Environment", "Global"],
      wordCount: 92,
      isBreaking: false
    },
    {
      id: 3,
      title: "Space Station Crew Completes Record-Breaking Spacewalk",
      summary: "Astronauts spend 8 hours outside ISS installing new solar panels and equipment.",
      content: "Two astronauts aboard the International Space Station completed the longest spacewalk in ISS history, spending 8 hours and 24 minutes outside the station. They successfully installed new solar panel arrays and upgraded critical life support systems.",
      category: "Science",
      publishedAt: "25 minutes ago",
      readTime: "1 min",
      author: "Space Desk",
      imageUrl: "/api/placeholder/400/300",
      tags: ["Space", "NASA", "ISS"],
      wordCount: 78,
      isBreaking: false
    },
    {
      id: 4,
      title: "Major Tech IPO Values Company at $50 Billion",
      summary: "Cloud computing startup achieves massive valuation in market debut.",
      content: "A leading cloud infrastructure company went public today with shares opening at $85, giving the company a market capitalization of $50 billion. The IPO represents one of the largest tech offerings this year.",
      category: "Business",
      publishedAt: "35 minutes ago",
      readTime: "1 min",
      author: "Business Desk",
      imageUrl: "/api/placeholder/400/300",
      tags: ["IPO", "Tech", "Markets"],
      wordCount: 67,
      isBreaking: false
    },
    {
      id: 5,
      title: "Championship Game Sees Dramatic Last-Second Victory",
      summary: "Underdog team wins title with field goal in final seconds.",
      content: "In a thrilling championship finale, the previously 8-point underdog team scored a 52-yard field goal with 3 seconds remaining to defeat the defending champions 24-21. The victory caps off an incredible playoff run for the surprise team.",
      category: "Sports",
      publishedAt: "45 minutes ago",
      readTime: "1 min",
      author: "Sports Desk",
      imageUrl: "/api/placeholder/400/300",
      tags: ["Championship", "Sports", "Football"],
      wordCount: 71,
      isBreaking: false
    },
    {
      id: 6,
      title: "New Medical Breakthrough Could Treat Rare Disease",
      summary: "Gene therapy shows promising results in clinical trials.",
      content: "Clinical trials for a new gene therapy treatment have shown remarkable success in treating a rare genetic disorder that affects 1 in 50,000 children. The therapy could provide hope for families affected by this previously untreatable condition.",
      category: "Health",
      publishedAt: "1 hour ago",
      readTime: "1 min",
      author: "Health Desk",
      imageUrl: "/api/placeholder/400/300",
      tags: ["Medicine", "Gene Therapy", "Health"],
      wordCount: 83,
      isBreaking: false
    }
  ];

  const quickStats = [
    { label: "Stories Today", value: "234", icon: "📰" },
    { label: "Avg Read Time", value: "1 min", icon: "⏱️" },
    { label: "Updated", value: "Live", icon: "🔴" },
    { label: "Categories", value: "8", icon: "📂" }
  ];

  const filteredShorts = selectedCategory === 'all' 
    ? newsShorts 
    : newsShorts.filter(short => {
        if (selectedCategory === 'breaking') return short.isBreaking;
        // Dynamic category matching using category slug or name
        const category = dynamicCategories.find(cat => cat.slug === selectedCategory);
        if (category) {
          return short.category === category.name;
        }
        return false;
      });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'News Shorts' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              ⚡ News Shorts
            </h1>
            <p className="text-xl text-muted-foreground">
              Quick reads • Big impact • Stay informed in minutes
            </p>
          </div>
        </div>
      </div>

  <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>

            {/* News Shorts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredShorts.map(short => (
                <Link key={short.id} href={`/article/${short.id}`}
                      className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                  
                  {/* Image */}
                  <div className="relative h-48">
                    <Image
                      src={short.imageUrl}
                      alt={short.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {short.isBreaking && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                          BREAKING
                        </span>
                      )}
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {short.readTime}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        {short.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {short.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {short.summary}
                    </p>

                    <div className="text-xs text-muted-foreground mb-3">
                      {short.content.slice(0, 120)}...
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center space-x-2">
                        <span>{short.author}</span>
                        <span>•</span>
                        <span>{short.publishedAt}</span>
                      </div>
                      <span>{short.wordCount} words</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {short.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                          #{tag}
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
                Load More Shorts
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Reading Progress */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">⚡ Quick Read Challenge</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">Today's Goal</span>
                    <span className="text-muted-foreground">8/10 shorts</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">12 min</div>
                  <div className="text-sm text-muted-foreground">Reading time saved today</div>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">📊 Popular This Hour</h3>
              <div className="space-y-3">
                {[
                  { category: "Technology", count: 45, trend: "+12%" },
                  { category: "Business", count: 38, trend: "+8%" },
                  { category: "Sports", count: 34, trend: "+15%" },
                  { category: "Science", count: 29, trend: "+6%" },
                  { category: "Health", count: 25, trend: "+10%" }
                ].map((item, index) => (
                  <Link key={item.category} href={`/category/${item.category.toLowerCase()}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-foreground">{item.category}</span>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">{item.count}</span>
                      <span className="text-green-600">{item.trend}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-2">📧 Daily Shorts Digest</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get the top 5 news shorts delivered to your inbox every morning.
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

            {/* Quick Navigation */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">⚡ Quick Access</h3>
              <div className="space-y-2">
                {[
                  { name: 'Breaking News', href: '/shorts?filter=breaking' },
                  { name: 'Tech Shorts', href: '/shorts?filter=tech' },
                  { name: 'Business Brief', href: '/shorts?filter=business' },
                  { name: 'Sports Flash', href: '/shorts?filter=sports' }
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

export default ShortsPage;
