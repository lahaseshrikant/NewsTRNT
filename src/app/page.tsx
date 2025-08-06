"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Mock data - In real app, this would come from your API
const mockTrendingNews = [
  {
    id: 1,
    title: "AI Revolution Continues: New Breakthrough in Machine Learning",
    summary: "Researchers announce a major breakthrough in machine learning algorithms that could dramatically improve AI efficiency and real-world applications.",
    imageUrl: "/api/placeholder/800/400",
    category: "Technology",
    publishedAt: "2 hours ago",
    readingTime: 3,
    isBreaking: true,
    slug: "ai-revolution-continues-new-breakthrough-machine-learning"
  },
  {
    id: 2,
    title: "Global Climate Summit Reaches Historic Agreement",
    summary: "World leaders sign historic climate agreement with ambitious carbon reduction targets at Global Climate Summit.",
    imageUrl: "/api/placeholder/800/400",
    category: "World",
    publishedAt: "4 hours ago",
    readingTime: 4,
    isBreaking: false,
    slug: "global-climate-summit-reaches-historic-agreement"
  },
  {
    id: 3,
    title: "Market Rally Continues as Tech Stocks Surge",
    summary: "Technology stocks lead market gains as investors show confidence in AI and renewable energy sectors.",
    imageUrl: "/api/placeholder/800/400",
    category: "Business",
    publishedAt: "6 hours ago",
    readingTime: 2,
    isBreaking: false,
    slug: "market-rally-continues-tech-stocks-surge"
  }
];

const mockCategories = [
  { name: "Politics", icon: "🏛️", count: 45, color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  { name: "Technology", icon: "💻", count: 67, color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
  { name: "Business", icon: "💼", count: 34, color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  { name: "Sports", icon: "⚽", count: 28, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300" },
  { name: "Health", icon: "🏥", count: 23, color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" },
  { name: "Science", icon: "🔬", count: 19, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" }
];

const HomePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
  // Initialize time only on client side to prevent hydration mismatch
  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date());
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock user interests - in real app, this would come from user profile/preferences
  const userInterests = ['Technology', 'Environment', 'Health', 'Business'];
  
  // Generate personalized quick reads based on user interests
  const personalizedQuickReads = [
    {
      id: 1,
      title: "AI Breakthrough: New Chip Design Reduces Energy Consumption by 40%",
      summary: "Revolutionary semiconductor architecture promises to make artificial intelligence more sustainable and accessible for everyday applications.",
      time: "3 min ago",
      words: "62 words",
      category: "Technology",
      userInterest: true
    },
    {
      id: 2,
      title: "Green Energy Investment Reaches Record $2.8 Trillion Globally",
      summary: "Renewable energy sector sees unprecedented funding as countries accelerate transition to sustainable power sources.",
      time: "12 min ago", 
      words: "58 words",
      category: "Environment",
      userInterest: true
    },
    {
      id: 3,
      title: "New Study Links Mediterranean Diet to 25% Lower Heart Disease Risk",
      summary: "Long-term research confirms significant cardiovascular benefits from traditional Mediterranean eating patterns and lifestyle choices.",
      time: "25 min ago",
      words: "55 words", 
      category: "Health",
      userInterest: true
    },
    {
      id: 4,
      title: "Startup Unicorns Hit All-Time High with 47 New Companies This Quarter",
      summary: "Tech entrepreneurship thrives as venture capital funding creates record number of billion-dollar startup valuations.",
      time: "45 min ago",
      words: "59 words", 
      category: "Business",
      userInterest: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Your world. Your interests. Your news.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Stay informed with AI-curated news, personalized feeds, and breaking updates from trusted sources worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-white hover:-translate-y-1 transition-all duration-300 ease-out border border-blue-200 relative overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
              </button>
              <button className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg bg-transparent hover:bg-white hover:text-blue-700 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden group">
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                  </svg>
                  Watch Demo
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Updates Bar */}
      <section className="bg-red-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="bg-white text-red-600 px-2 py-1 rounded text-xs font-semibold">LIVE</span>
              <span className="text-sm">
                {currentTime?.toLocaleTimeString() || 'Loading...'} • Breaking news updates every minute
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <span>📈 Markets: +2.3%</span>
              <span>🌡️ Weather: 72°F</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Story */}
            <section className="mb-8">
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 ease-in-out cursor-pointer group">
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <Image
                    src={mockTrendingNews[0].imageUrl}
                    alt={mockTrendingNews[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {mockTrendingNews[0].isBreaking && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                      BREAKING
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 group-hover:from-black/80 transition-all duration-300 ease-in-out">
                    <div className="text-white">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                        {mockTrendingNews[0].category}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-2 group-hover:text-blue-200 transition-colors duration-300 ease-in-out">
                        {mockTrendingNews[0].title}
                      </h2>
                      <p className="text-gray-200 mb-2">
                        {mockTrendingNews[0].summary}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{mockTrendingNews[0].publishedAt}</span>
                        <span>•</span>
                        <span>{mockTrendingNews[0].readingTime} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Trending Stories */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
                <Link href="/trending" className="text-primary hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockTrendingNews.slice(1).map((article) => (
                  <div key={article.id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:border-primary/60 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                    </div>
                    <div className="p-4 group-hover:bg-muted/50 transition-colors duration-300 ease-out">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-sm ${
                        article.category === 'Technology' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-800' :
                        article.category === 'World' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 group-hover:bg-green-200 dark:group-hover:bg-green-800' :
                        'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                      }`}>
                        {article.category}
                      </span>
                      <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-300 ease-out">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 group-hover:text-foreground transition-colors duration-300 ease-out">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 ease-out">
                        <span>{article.publishedAt}</span>
                        <span>{article.readingTime} min read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Web Stories Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">📱 Web Stories</h2>
                  <p className="text-sm text-muted-foreground mt-1">Immersive visual storytelling • Tap through the latest news</p>
                </div>
                <Link href="/web-stories" className="text-primary hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {[
                  {
                    id: 'story-1',
                    title: 'Climate Summit 2024',
                    category: 'Environment',
                    coverImage: '/api/placeholder/200/300',
                    isNew: true,
                    isTrending: true,
                    duration: 45,
                    views: 12500
                  },
                  {
                    id: 'story-2', 
                    title: 'AI in Healthcare',
                    category: 'Technology',
                    coverImage: '/api/placeholder/200/300',
                    isNew: false,
                    isTrending: true,
                    duration: 60,
                    views: 8900
                  },
                  {
                    id: 'story-3',
                    title: 'Space Mission',
                    category: 'Science', 
                    coverImage: '/api/placeholder/200/300',
                    isNew: false,
                    isTrending: false,
                    duration: 50,
                    views: 15600
                  },
                  {
                    id: 'story-4',
                    title: 'Market Update',
                    category: 'Business',
                    coverImage: '/api/placeholder/200/300',
                    isNew: true,
                    isTrending: false,
                    duration: 40,
                    views: 7400
                  },
                  {
                    id: 'story-5',
                    title: 'Sports Finals',
                    category: 'Sports',
                    coverImage: '/api/placeholder/200/300',
                    isNew: false,
                    isTrending: true,
                    duration: 35,
                    views: 22100
                  }
                ].map((story) => (
                  <Link 
                    key={story.id}
                    href={`/web-stories/${story.id}`}
                    className="flex-shrink-0 w-32 group"
                  >
                    <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                      <Image
                        src={story.coverImage}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {story.isNew && (
                          <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                            NEW
                          </span>
                        )}
                        {story.isTrending && (
                          <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                            🔥
                          </span>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/70 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                          {Math.floor(story.duration / 60)}:{(story.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="mb-1">
                          <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-medium">
                            {story.category}
                          </span>
                        </div>
                        
                        <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                          {story.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <div className="flex items-center space-x-1">
                            <span>👁️</span>
                            <span>{story.views >= 1000 ? `${(story.views / 1000).toFixed(1)}K` : story.views}</span>
                          </div>
                        </div>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 5v10l8-5-8-5z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Quick Reads Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Quick Reads</h2>
                  <p className="text-sm text-muted-foreground mt-1">Personalized for your interests: {userInterests.join(', ')}</p>
                </div>
                <Link href="/shorts" className="text-primary hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300 ease-out">
                <div className="space-y-4">
                  {personalizedQuickReads.map((item) => (
                    <Link 
                      key={item.id} 
                      href="#" 
                      className="flex items-center space-x-4 p-4 hover:bg-muted/50 hover:shadow-sm hover:border-l-4 hover:border-l-primary rounded-lg transition-all duration-250 ease-out block group relative shadow-[-3px_3px_8px_rgba(75,85,99,0.4)] dark:shadow-[-2px_2px_6px_rgba(255,255,255,0.15)]"
                    >
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold group-hover:scale-105 group-hover:shadow-sm transition-all duration-250 ease-out">
                        {item.id}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.category === 'Technology' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            item.category === 'Environment' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            item.category === 'Health' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                          }`}>
                            {item.category}
                          </span>
                          {item.userInterest && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                              ✨ For You
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-250 ease-out">
                          {item.title}
                        </h4>
                        <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-250 ease-out">
                          {item.summary}
                        </p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-250 ease-out">
                          <span>{item.time}</span>
                          <span>•</span>
                          <span>{item.words}</span>
                          <span className="text-primary hover:text-blue-800 cursor-pointer transition-all duration-200 ease-out hover:scale-105 hover:font-medium">🔊 Listen</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-4">Categories</h3>
              <div className="bg-card border border-border rounded-lg shadow-sm p-4">
                <div className="space-y-3">
                  {mockCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={`/category/${category.name.toLowerCase()}`}
                      className="flex items-center justify-between p-3 hover:bg-muted hover:shadow-sm hover:border-l-2 hover:border-l-primary rounded-lg transition-all duration-200 ease-in-out group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl transition-transform duration-200 ease-in-out group-hover:scale-110">{category.icon}</span>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 ease-in-out">{category.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${category.color}`}>
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* Newsletter Signup */}
            <section className="mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Daily Brief</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Get personalized news delivered to your inbox every morning.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-lg text-foreground placeholder-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-blue-700 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      Subscribe
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </button>
                </form>
              </div>
            </section>

            {/* AI Assistant */}
            <section className="mb-8">
              <div className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200 ease-in-out group">
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 ease-in-out">AI Assistant</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Ask me anything about today's news!
                </p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-900 hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                    </svg>
                    Start Chat
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                </button>
              </div>
            </section>

            {/* Trending Topics */}
            <section>
              <h3 className="text-xl font-bold text-foreground mb-4">Trending Topics</h3>
              <div className="bg-card border border-border rounded-lg shadow-sm p-4">
                <div className="flex flex-wrap gap-2">
                  {['AI', 'Climate Change', 'Cryptocurrency', 'Elections', 'Space', 'Health'].map((topic) => (
                    <button
                      key={topic}
                      className="bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-300 ease-out relative overflow-hidden group border border-border hover:border-primary"
                    >
                      <span className="relative z-10 flex items-center gap-1">
                        <span className="group-hover:scale-110 transition-transform duration-300 ease-out">#</span>
                        {topic}
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-900 hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2C10.5523 2 11 2.44772 11 3V10H18C18.5523 10 19 10.4477 19 11C19 11.5523 18.5523 12 18 12H11V19C11 19.5523 10.5523 20 10 20C9.44772 20 9 19.5523 9 19V12H2C1.44772 12 1 11.5523 1 11C1 10.4477 1.44772 10 2 10H9V3C9 2.44772 9.44772 2 10 2Z" clipRule="evenodd"/>
                      </svg>
                      Follow All Topics
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
