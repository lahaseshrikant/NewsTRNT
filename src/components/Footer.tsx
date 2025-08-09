"use client";

import React from 'react';
import Link from 'next/link';
import Newsletter from './Newsletter';
import { useLogo } from '@/contexts/LogoContext';

const Footer: React.FC = () => {
  const { currentLogo } = useLogo();

  const renderLogo = () => {
    // For footer, we'll use a slightly larger size but still compact
    const logoSize = 'w-10 h-10';
    const textSize = 'text-lg';
    
    if (currentLogo.type === 'image' && currentLogo.imageUrl) {
      return (
        <div className={`${logoSize} rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 p-2`}>
          <img 
            src={currentLogo.imageUrl} 
            alt="Logo" 
            className="w-full h-full object-cover rounded"
          />
        </div>
      );
    }

    if (currentLogo.type === 'code' && currentLogo.customCode) {
      return (
        <div 
          className={`${logoSize} rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 p-2`}
          dangerouslySetInnerHTML={{ 
            __html: currentLogo.codeLanguage === 'svg' ? currentLogo.customCode : 
                   `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${currentLogo.text?.substring(0, 2) || 'NN'}</div>`
          }}
        />
      );
    }

    // Default text logo
    return (
      <div className={`${logoSize} bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center`}>
        <span className={`font-bold ${textSize}`}>
          {currentLogo.text?.substring(0, 2) || 'NN'}
        </span>
      </div>
    );
  };
  const footerSections = [
    {
      title: 'NewsNerve',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Our Mission', href: '/about#mission' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press & Media', href: '/press' },
        { name: 'Contact', href: '/contact' },
      ]
    },
    {
      title: 'Categories',
      links: [
        { name: 'World News', href: '/category/world' },
        { name: 'Politics', href: '/category/politics' },
        { name: 'Technology', href: '/category/technology' },
        { name: 'Business', href: '/category/business' },
        { name: 'Sports', href: '/category/sports' },
        { name: 'Entertainment', href: '/category/entertainment' },
        { name: 'Health', href: '/category/health' },
        { name: 'Science', href: '/category/science' },
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'All Services', href: '/services' },
        { name: 'API & Developers', href: '/developers' },
        { name: 'AI News Curation', href: '/services#ai-curation' },
        { name: 'Breaking News Alerts', href: '/services#breaking-alerts' },
        { name: 'News Analytics', href: '/services#analytics' },
        { name: 'White-Label Solutions', href: '/services#white-label' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Sitemap', href: '/sitemap' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Advertise', href: '/advertise' },
        { name: 'Media Kit', href: '/press#media-kit' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
    { name: 'Instagram', href: '#', icon: '📸' },
    { name: 'YouTube', href: '#', icon: '📺' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      {/* Newsletter Section */}
      <div className="bg-gray-800 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Newsletter variant="footer" />
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                {renderLogo()}
                <div>
                  <h3 className="text-xl font-bold">NewsNerve</h3>
                  <p className="text-xs text-gray-400">Your world. Your interests. Your news.</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                AI-powered news platform delivering personalized, accurate, and timely news from around the world.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white 
                             transform hover:scale-110 transition-all duration-200"
                    title={social.name}
                  >
                    <span className="text-xl">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-lg font-semibold mb-4 text-white">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white 
                                 transition-colors duration-200 text-sm hover:underline"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} NewsNerve. All rights reserved.</p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link 
                href="/sitemap" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sitemap
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Powered by AI</span>
                <span className="text-blue-400 animate-pulse">🤖</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
