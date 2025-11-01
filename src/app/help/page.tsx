"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      faqs: [
        {
          id: 'what-is-NewsTRNT',
          question: 'What is NewsTRNT?',
          answer: 'NewsTRNT is an AI-powered news platform that delivers personalized news content tailored to your interests. We aggregate news from multiple sources and use artificial intelligence to provide you with the most relevant and timely information.'
        },
        {
          id: 'how-to-create-account',
          question: 'How do I create an account?',
          answer: 'Click on the "Register" button in the top navigation, fill out the registration form with your details, and verify your email address. You can also sign up using your Google or social media accounts for quick access.'
        },
        {
          id: 'free-vs-premium',
          question: 'What\'s the difference between free and premium accounts?',
          answer: 'Free accounts get access to basic news articles and limited personalization. Premium accounts include advanced AI curation, breaking news alerts, ad-free reading, offline access, and exclusive in-depth analysis articles.'
        }
      ]
    },
    {
      id: 'personalization',
      title: 'Personalization & AI',
      icon: '🤖',
      faqs: [
        {
          id: 'how-ai-works',
          question: 'How does the AI personalization work?',
          answer: 'Our AI analyzes your reading patterns, interests, and interaction history to curate news specifically for you. The more you use NewsTRNT, the better it gets at understanding your preferences and delivering relevant content.'
        },
        {
          id: 'customize-interests',
          question: 'How can I customize my news interests?',
          answer: 'Go to your Settings > Interests to select categories, topics, and sources you\'re interested in. You can also save articles, like content, and follow specific topics to improve personalization.'
        },
        {
          id: 'reset-recommendations',
          question: 'Can I reset my news recommendations?',
          answer: 'Yes, you can reset your AI preferences in Settings > Privacy & Data. This will clear your reading history and start fresh with personalization based on your selected interests.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features & Navigation',
      icon: '⚡',
      faqs: [
        {
          id: 'save-articles',
          question: 'How do I save articles for later?',
          answer: 'Click the bookmark icon on any article to save it to your "Saved Articles" collection. You can access saved articles from the main navigation or your dashboard.'
        },
        {
          id: 'breaking-news-alerts',
          question: 'How do breaking news alerts work?',
          answer: 'Enable push notifications in your browser or app settings. You can customize which types of breaking news you want to receive in Settings > Notifications. Alerts are sent for major developing stories.'
        },
        {
          id: 'offline-reading',
          question: 'Can I read articles offline?',
          answer: 'Premium subscribers can download articles for offline reading. Look for the download icon on articles you want to save offline. Downloaded articles are available for 30 days.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: '⚙️',
      faqs: [
        {
          id: 'change-password',
          question: 'How do I change my password?',
          answer: 'Go to Settings > Account Security and click "Change Password". You\'ll need to enter your current password and choose a new one. We recommend using a strong, unique password.'
        },
        {
          id: 'delete-account',
          question: 'How do I delete my account?',
          answer: 'In Settings > Account, scroll down to find the "Delete Account" option. This action is permanent and will remove all your data, saved articles, and preferences. Consider downloading your data first.'
        },
        {
          id: 'privacy-settings',
          question: 'What privacy controls do I have?',
          answer: 'You can control data collection, personalization, email communications, and sharing preferences in Settings > Privacy. You can also download or delete your personal data at any time.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: '🔧',
      faqs: [
        {
          id: 'browser-support',
          question: 'Which browsers are supported?',
          answer: 'NewsTRNT works best on Chrome, Firefox, Safari, and Edge (latest versions). We also support mobile browsers. For the best experience, please ensure JavaScript is enabled.'
        },
        {
          id: 'app-not-loading',
          question: 'The app is not loading properly. What should I do?',
          answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If problems persist, try using an incognito/private browsing window or contact our support team.'
        },
        {
          id: 'mobile-app',
          question: 'Is there a mobile app?',
          answer: 'NewsTRNT is currently a progressive web app (PWA) that works excellently on mobile devices. You can "Add to Home Screen" on your phone for an app-like experience. Native iOS and Android apps are coming soon.'
        }
      ]
    }
  ];

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  const filteredFaqs = searchQuery
    ? faqCategories.flatMap(category =>
        category.faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(faq => ({ ...faq, category: category.title }))
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
  <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="text-primary hover:text-primary/80 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Help Center</h1>
            <p className="text-muted-foreground mt-2">Find answers to common questions and get help</p>
          </div>
        </div>
      </div>

      {/* Search */}
  <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border mb-8">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-foreground placeholder-muted-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Search Results ({filteredFaqs.length})
              </h2>
              {filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="bg-card rounded-lg shadow-sm border border-border">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-6 text-left hover:bg-muted/50 transition-colors rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{faq.question}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Category: {faq.category}
                            </p>
                          </div>
                          <svg
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              openFaq === faq.id ? 'rotate-180' : ''
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </button>
                      {openFaq === faq.id && (
                        <div className="px-6 pb-6">
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try different keywords or browse categories below</p>
                </div>
              )}
            </div>
          )}

          {/* FAQ Categories */}
          {!searchQuery && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
              
              {faqCategories.map((category) => (
                <div key={category.id} className="bg-card rounded-lg shadow-sm border border-border">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-border">
                    {category.faqs.map((faq) => (
                      <div key={faq.id}>
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{faq.question}</h4>
                            <svg
                              className={`w-5 h-5 text-muted-foreground transition-transform ${
                                openFaq === faq.id ? 'rotate-180' : ''
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        </button>
                        {openFaq === faq.id && (
                          <div className="px-6 pb-6">
                            <p className="text-muted-foreground leading-relaxed text-justify">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 border border-primary/20">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Contact Support
                </Link>
                <a
                  href="mailto:support@NewsTRNT.com"
                  className="bg-background text-foreground border border-border px-6 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
