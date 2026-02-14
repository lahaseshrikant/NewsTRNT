"use client";

import React from 'react';
import Link from 'next/link';

const AdminFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const adminLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Content', href: '/content' },
    { name: 'Users', href: '/users' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'System', href: '/system' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'API Docs', href: '/api-test' },
    { name: 'Debug Tools', href: '/debug' },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NewsTRNT
                </h3>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Powerful content management system for independent journalism.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Navigation</h4>
            <ul className="space-y-2">
              {adminLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} NewsTRNT. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                System Online
              </span>
              <p className="text-xs text-muted-foreground">
                v2.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;