"use client";

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const SitemapPage: React.FC = () => {
  const siteStructure = [
    {
      title: 'Main Pages',
      icon: '🏠',
      links: [
        { name: 'Home', href: '/', description: 'Latest news and personalized feed' },
        { name: 'About Us', href: '/about', description: 'Learn about NewsTRNT mission and team' },
        { name: 'Contact', href: '/contact', description: 'Get in touch with our team' },
        { name: 'Search', href: '/search', description: 'Search news articles and content' },
      ]
    },
    {
      title: 'News Categories',
      icon: '📰',
      links: [
        { name: 'World News', href: '/category/world', description: 'International news and global events' },
        { name: 'Politics', href: '/category/politics', description: 'Political news and analysis' },
        { name: 'Technology', href: '/category/technology', description: 'Tech news and innovations' },
        { name: 'Business', href: '/category/business', description: 'Business news and market updates' },
        { name: 'Sports', href: '/category/sports', description: 'Sports news and live updates' },
        { name: 'Health', href: '/category/health', description: 'Health news and medical breakthroughs' },
        { name: 'Entertainment', href: '/category/entertainment', description: 'Entertainment and celebrity news' },
        { name: 'Science', href: '/category/science', description: 'Scientific discoveries and research' },
      ]
    },
    {
      title: 'Services & Products',
      icon: '🛠️',
      links: [
        { name: 'All Services', href: '/services', description: 'Complete suite of AI-powered news services' },
        { name: 'API & Developers', href: '/developers', description: 'API documentation and developer resources' },
        { name: 'AI News Curation', href: '/services#ai-curation', description: 'Personalized news recommendation engine' },
        { name: 'Breaking News Alerts', href: '/services#breaking-alerts', description: 'Real-time news notifications' },
        { name: 'News Analytics', href: '/services#analytics', description: 'Comprehensive news trend analysis' },
        { name: 'White-Label Solutions', href: '/services#white-label', description: 'Custom news platform solutions' },
      ]
    },
    {
      title: 'Company',
      icon: '🏢',
      links: [
        { name: 'Careers', href: '/careers', description: 'Join our team and build the future of news' },
        { name: 'Press & Media', href: '/press', description: 'Press releases and media resources' },
        { name: 'Media Kit', href: '/press#media-kit', description: 'Brand assets and press materials' },
        { name: 'Awards & Recognition', href: '/press#awards', description: 'Industry awards and achievements' },
      ]
    },
    {
      title: 'User Account',
      icon: '👤',
      links: [
        { name: 'Sign In', href: '/auth/signin', description: 'Access your personalized news feed' },
        { name: 'Sign Up', href: '/auth/signup', description: 'Create a new NewsTRNT account' },
        { name: 'Profile Settings', href: '/profile', description: 'Manage your account preferences' },
        { name: 'Subscription', href: '/subscription', description: 'Manage your subscription plan' },
        { name: 'Admin Dashboard', href: '/admin', description: 'Administrative tools and analytics' },
      ]
    },
    {
      title: 'Support & Legal',
      icon: '⚖️',
      links: [
        { name: 'Help Center', href: '/help', description: 'Get help and support' },
        { name: 'Privacy Policy', href: '/privacy', description: 'How we protect your privacy' },
        { name: 'Terms of Service', href: '/terms', description: 'Terms and conditions of use' },
        { name: 'Cookie Policy', href: '/cookies', description: 'Information about our cookie usage' },
        { name: 'Advertising', href: '/advertise', description: 'Advertise with NewsTRNT' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Sitemap' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Site Map
            </h1>
            <p className="text-xl text-muted-foreground">
              Navigate all pages and sections of NewsTRNT
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
  <div className="container mx-auto py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {siteStructure.map((section) => (
              <div key={section.title} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">{section.icon}</span>
                  <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {section.links.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/20 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {link.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {link.description}
                          </p>
                        </div>
                        <svg 
                          className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-2 mt-0.5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Search Suggestion */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for?
            </p>
            <Link
              href="/search"
              className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Our Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
