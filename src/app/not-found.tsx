"use client";

import React from 'react';
import Link from 'next/link';

const NotFoundPage: React.FC = () => {
  const popularPages = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Latest News', href: '/category/world', icon: '🌍' },
    { name: 'Technology', href: '/category/technology', icon: '💻' },
    { name: 'Services', href: '/services', icon: '🛠️' },
    { name: 'About Us', href: '/about', icon: 'ℹ️' },
    { name: 'Contact', href: '/contact', icon: '📧' }
  ];

  const allCategories = [
    { name: 'World News', href: '/category/world' },
    { name: 'Politics', href: '/category/politics' },
    { name: 'Technology', href: '/category/technology' },
    { name: 'Business', href: '/category/business' },
    { name: 'Sports', href: '/category/sports' },
    { name: 'Health', href: '/category/health' },
    { name: 'Entertainment', href: '/category/entertainment' },
    { name: 'Science', href: '/category/science' }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* 404 Hero */}
        <div className="mb-12">
          <div className="text-9xl font-bold text-primary mb-4">404</div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {popularPages.map((page) => (
            <Link
              key={page.name}
              href={page.href}
              className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 hover:border-primary/20 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {page.icon}
              </div>
              <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                {page.name}
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Help */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* News Categories */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
              📰 Browse News Categories
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {allCategories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-left text-muted-foreground hover:text-primary transition-colors py-1"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
              🛠️ Our Services
            </h2>
            <div className="space-y-3">
              <Link
                href="/services"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                AI News Curation
              </Link>
              <Link
                href="/developers"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                API & Developer Tools
              </Link>
              <Link
                href="/services#analytics"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                News Analytics
              </Link>
              <Link
                href="/services#breaking-alerts"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Breaking News Alerts
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            🔍 Can't find what you're looking for?
          </h2>
          <p className="text-muted-foreground mb-6">
            Try searching our site or browse our sitemap
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Search NewsNerve
            </Link>
            <Link
              href="/sitemap"
              className="border border-border text-foreground px-6 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium"
            >
              View Sitemap
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
