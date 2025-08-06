"use client";

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: Array<{
    id: string;
    title: string;
    description: string;
    readTime: string;
  }>;
}

const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create a new article?',
      answer: 'To create a new article, navigate to Content Management → New Article or click the "New Article" button in the top navigation. Fill in the required fields including title, content, category, and tags, then save as draft or publish immediately.',
      category: 'content',
      helpful: 25,
      notHelpful: 2
    },
    {
      id: '2',
      question: 'How can I manage user permissions?',
      answer: 'User permissions can be managed under Users → Permissions. You can assign roles (Admin, Editor, Author, Subscriber) or customize individual permissions for each user. Changes take effect immediately.',
      category: 'users',
      helpful: 18,
      notHelpful: 1
    },
    {
      id: '3',
      question: 'How do I backup my content?',
      answer: 'Content backup can be performed from System Settings → Backup. You can create manual backups or configure automatic daily/weekly backups. All content, user data, and settings are included in the backup.',
      category: 'system',
      helpful: 22,
      notHelpful: 0
    },
    {
      id: '4',
      question: 'How can I view analytics and reports?',
      answer: 'Analytics are available under Analytics & Reports section. You can view traffic statistics, content performance, user engagement metrics, and export detailed reports in various formats.',
      category: 'analytics',
      helpful: 31,
      notHelpful: 3
    },
    {
      id: '5',
      question: 'How do I configure email newsletters?',
      answer: 'Newsletter configuration is available under Newsletter → Settings. You can create templates, manage subscriber lists, schedule campaigns, and track email performance metrics.',
      category: 'newsletter',
      helpful: 19,
      notHelpful: 1
    },
    {
      id: '6',
      question: 'How can I moderate comments and content?',
      answer: 'Content moderation tools are under Moderation section. You can review comments, handle reports, configure spam filters, and set up automated moderation rules.',
      category: 'moderation',
      helpful: 14,
      notHelpful: 2
    }
  ];

  const guidesSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Essential guides to help you set up and start using NewsNerve',
      icon: '🚀',
      articles: [
        {
          id: '1',
          title: 'Setting Up Your NewsNerve Admin Panel',
          description: 'Complete walkthrough of initial setup and configuration',
          readTime: '5 min'
        },
        {
          id: '2',
          title: 'Creating Your First Article',
          description: 'Step-by-step guide to writing and publishing content',
          readTime: '8 min'
        },
        {
          id: '3',
          title: 'Managing User Accounts',
          description: 'How to add, edit, and manage user access',
          readTime: '6 min'
        }
      ]
    },
    {
      id: 'content-management',
      title: 'Content Management',
      description: 'Master the art of creating and organizing content',
      icon: '📝',
      articles: [
        {
          id: '4',
          title: 'Advanced Content Editor Features',
          description: 'Utilize rich text editing, media embedding, and formatting',
          readTime: '10 min'
        },
        {
          id: '5',
          title: 'Organizing with Categories and Tags',
          description: 'Best practices for content categorization and tagging',
          readTime: '7 min'
        },
        {
          id: '6',
          title: 'Scheduling and Publishing Workflows',
          description: 'Automate your content publishing process',
          readTime: '9 min'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Understand your audience and content performance',
      icon: '📊',
      articles: [
        {
          id: '7',
          title: 'Understanding Analytics Dashboard',
          description: 'Navigate and interpret your analytics data',
          readTime: '12 min'
        },
        {
          id: '8',
          title: 'Creating Custom Reports',
          description: 'Generate detailed reports for stakeholders',
          readTime: '8 min'
        },
        {
          id: '9',
          title: 'Setting Up Performance Alerts',
          description: 'Get notified about important metrics changes',
          readTime: '5 min'
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      description: 'Unlock the full potential of NewsNerve platform',
      icon: '⚡',
      articles: [
        {
          id: '10',
          title: 'API Integration Guide',
          description: 'Connect external services and automate workflows',
          readTime: '15 min'
        },
        {
          id: '11',
          title: 'Custom Theme Development',
          description: 'Create and customize your site appearance',
          readTime: '20 min'
        },
        {
          id: '12',
          title: 'Performance Optimization',
          description: 'Speed up your site and improve user experience',
          readTime: '12 min'
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: faqItems.length },
    { id: 'content', name: 'Content Management', count: faqItems.filter(f => f.category === 'content').length },
    { id: 'users', name: 'User Management', count: faqItems.filter(f => f.category === 'users').length },
    { id: 'system', name: 'System Settings', count: faqItems.filter(f => f.category === 'system').length },
    { id: 'analytics', name: 'Analytics', count: faqItems.filter(f => f.category === 'analytics').length },
    { id: 'newsletter', name: 'Newsletter', count: faqItems.filter(f => f.category === 'newsletter').length },
    { id: 'moderation', name: 'Moderation', count: faqItems.filter(f => f.category === 'moderation').length }
  ];

  const filteredFAQs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const markHelpful = (faqId: string, helpful: boolean) => {
    // In a real app, this would update the backend
    console.log(`Marked FAQ ${faqId} as ${helpful ? 'helpful' : 'not helpful'}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Help Center', href: '/admin/help' }
        ]}
      />

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Help Center
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
          Find answers, guides, and support for your NewsNerve admin panel
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search for help articles, guides, and FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 text-lg border border-border/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-foreground shadow-lg"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
            🔍
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Browse by Category</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-8">
              <h4 className="text-md font-semibold text-foreground mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
                  📧 Contact Support
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
                  🎯 Feature Requests
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
                  🐛 Report a Bug
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
                  📚 API Documentation
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Quick Start Guides */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
            <div className="p-8 border-b border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-2">📚 User Guides</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Comprehensive guides to help you make the most of NewsNerve
              </p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guidesSections.map(section => (
                  <div key={section.id} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{section.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                        <p className="text-sm text-slate-500">{section.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2 ml-11">
                      {section.articles.map(article => (
                        <a
                          key={article.id}
                          href="#"
                          className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-foreground text-sm">{article.title}</div>
                              <div className="text-xs text-slate-500">{article.description}</div>
                            </div>
                            <div className="text-xs text-slate-400">{article.readTime}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border/50">
            <div className="p-8 border-b border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-2">❓ Frequently Asked Questions</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Common questions and answers about using the admin panel
              </p>
            </div>
            <div className="p-8">
              {filteredFAQs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFAQs.map(faq => (
                    <div
                      key={faq.id}
                      className="border border-border/30 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full text-left p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-foreground pr-4">
                            {faq.question}
                          </h3>
                          <span className={`text-slate-400 transform transition-transform duration-300 ${
                            expandedFAQ === faq.id ? 'rotate-180' : ''
                          }`}>
                            ▼
                          </span>
                        </div>
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6 border-t border-border/30">
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            {faq.answer}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Was this helpful?</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => markHelpful(faq.id, true)}
                                  className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                                >
                                  <span>👍</span>
                                  <span>{faq.helpful}</span>
                                </button>
                                <button
                                  onClick={() => markHelpful(faq.id, false)}
                                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                                >
                                  <span>👎</span>
                                  <span>{faq.notHelpful}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    No results found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500">
                    Try adjusting your search terms or browse by category
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Support Contact */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-border/50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Still need help?</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Can't find what you're looking for? Our support team is here to help you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 font-semibold">
                  📧 Contact Support
                </button>
                <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-300 font-semibold">
                  💬 Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
