"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SavedArticlesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('saved_date');

  // Mock saved articles data
  const savedArticles = [
    {
      id: 1,
      title: 'AI Revolution Continues: New Breakthrough in Machine Learning',
      summary: 'Researchers announce a major breakthrough in machine learning algorithms.',
      imageUrl: '/api/placeholder/400/200',
      category: 'Technology',
      publishedAt: '2 hours ago',
      savedAt: '1 hour ago',
      readingTime: 3,
      source: 'TechNews',
      isRead: false,
      slug: 'ai-revolution-continues'
    },
    {
      id: 2,
      title: 'Global Climate Summit Reaches Historic Agreement',
      summary: 'World leaders sign historic climate agreement with ambitious targets.',
      imageUrl: '/api/placeholder/400/200',
      category: 'World',
      publishedAt: '4 hours ago',
      savedAt: '3 hours ago',
      readingTime: 4,
      source: 'GlobalNews',
      isRead: true,
      slug: 'climate-summit-agreement'
    },
    {
      id: 3,
      title: 'Market Rally Continues as Tech Stocks Surge',
      summary: 'Technology stocks lead market gains as investors show confidence.',
      imageUrl: '/api/placeholder/400/200',
      category: 'Business',
      publishedAt: '6 hours ago',
      savedAt: '5 hours ago',
      readingTime: 2,
      source: 'Business Weekly',
      isRead: false,
      slug: 'market-rally-tech-stocks'
    },
    {
      id: 4,
      title: 'Breakthrough in Quantum Computing Research',
      summary: 'Scientists achieve new milestone in quantum computing capabilities.',
      imageUrl: '/api/placeholder/400/200',
      category: 'Science',
      publishedAt: '1 day ago',
      savedAt: '1 day ago',
      readingTime: 5,
      source: 'Science Today',
      isRead: true,
      slug: 'quantum-computing-breakthrough'
    }
  ];

  const categories = ['all', 'Technology', 'World', 'Business', 'Science', 'Sports', 'Health'];
  const sortOptions = [
    { value: 'saved_date', label: 'Recently Saved' },
    { value: 'published_date', label: 'Recently Published' },
    { value: 'reading_time', label: 'Reading Time' },
    { value: 'category', label: 'Category' }
  ];

  const filteredArticles = savedArticles.filter(article => 
    selectedCategory === 'all' || article.category === selectedCategory
  );

  const handleRemoveArticle = (articleId: number) => {
    // TODO: Implement remove from saved articles
    console.log('Removing article:', articleId);
  };

  const handleMarkAsRead = (articleId: number) => {
    // TODO: Implement mark as read
    console.log('Marking as read:', articleId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Articles</h1>
              <p className="text-gray-600 mt-2">
                {filteredArticles.length} articles saved for later reading
              </p>
            </div>
            <Link 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {filteredArticles.length > 0 ? (
          <div className="space-y-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Article Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        width={200}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    </div>

                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            article.category === 'Technology' ? 'bg-blue-100 text-blue-800' :
                            article.category === 'World' ? 'bg-green-100 text-green-800' :
                            article.category === 'Business' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {article.category}
                          </span>
                          {!article.isRead && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              Unread
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMarkAsRead(article.id)}
                            className="text-sm text-gray-500 hover:text-blue-600"
                          >
                            {article.isRead ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={() => handleRemoveArticle(article.id)}
                            className="text-sm text-gray-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <Link href={`/article/${article.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{article.readingTime} min read</span>
                          <span>•</span>
                          <span>Published {article.publishedAt}</span>
                        </div>
                        <div className="text-xs">
                          Saved {article.savedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <span className="text-6xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No saved articles yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start saving articles you want to read later by clicking the bookmark icon on any article.
              </p>
              <Link
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
              >
                Browse Articles
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedArticlesPage;
