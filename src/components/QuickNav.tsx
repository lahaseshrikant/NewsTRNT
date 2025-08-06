"use client";

import React from 'react';
import Link from 'next/link';

const QuickNav: React.FC = () => {
  const quickLinks = [
    {
      name: 'Services',
      href: '/services',
      icon: '🛠️',
      description: 'AI-powered news solutions'
    },
    {
      name: 'API',
      href: '/developers',
      icon: '💻',
      description: 'Developer resources'
    },
    {
      name: 'Careers',
      href: '/careers',
      icon: '💼',
      description: 'Join our team'
    },
    {
      name: 'Press',
      href: '/press',
      icon: '📰',
      description: 'Media resources'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
          >
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">
              {link.icon}
            </span>
            <div>
              <div className="font-medium text-foreground text-sm">{link.name}</div>
              <div className="text-xs text-muted-foreground">{link.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickNav;
