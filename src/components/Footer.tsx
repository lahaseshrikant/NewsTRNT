"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLogo } from '@/contexts/LogoContext';
import { useCategories } from '@/hooks/useCategories';

const Footer: React.FC = () => {
  const { currentLogo } = useLogo();
  const { categories } = useCategories();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    // Simulate visitor counter animation
    const target = 2847563;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setVisitorCount(target);
        clearInterval(timer);
      } else {
        setVisitorCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  const renderLogo = () => {
    if (currentLogo.type === 'image' && currentLogo.imageUrl) {
      return (
        <div className="w-12 h-12 rounded-xl overflow-hidden">
          <img src={currentLogo.imageUrl} alt="Logo" className="w-full h-full object-cover" />
        </div>
      );
    }

    if (currentLogo.type === 'code' && currentLogo.customCode) {
      return (
        <div 
          className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-red-700"
          dangerouslySetInnerHTML={{ __html: currentLogo.customCode }}
        />
      );
    }

    return (
      <div className="w-12 h-12 bg-gradient-to-br from-primary to-red-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
        <span className="font-black text-lg">{currentLogo.text?.substring(0, 2) || 'NT'}</span>
      </div>
    );
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Trending', href: '/trending' },
    { name: 'Latest News', href: '/news' },
    { name: 'Web Stories', href: '/web-stories' },
    { name: 'Opinion', href: '/opinion' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press & Media', href: '/press' },
    { name: 'Advertise', href: '/advertise' },
    { name: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Sitemap', href: '/sitemap' },
    { name: 'Help Center', href: '/help' },
  ];

  const stats = [
    { label: 'Daily Readers', value: '2.8M+', icon: '👥' },
    { label: 'Articles Published', value: '50K+', icon: '📰' },
    { label: 'Countries Reached', value: '180+', icon: '🌍' },
    { label: 'AI Accuracy', value: '99.2%', icon: '🤖' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden border-t border-gray-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full"></div>
      </div>

      {/* Stats Bar */}
      <div className="relative border-b border-white/10">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center group cursor-default"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-white group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section - Premium Design */}
      <div className="relative border-b border-white/10">
        <div className="container mx-auto py-16">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/10 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-300">Join 500K+ subscribers</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3 text-white">
                    Stay Ahead of the <span className="text-primary">News</span>
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base">
                    Get breaking news, diverse perspectives, and in-depth stories delivered to your inbox daily.
                  </p>
                </div>
                
                <form onSubmit={handleSubscribe} className="flex-1 w-full max-w-md">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-6 py-4 pr-36 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-primary hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
                    >
                      {isSubscribed ? '✓ Subscribed!' : 'Subscribe'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center lg:text-left">
                    🔒 No spam. Unsubscribe anytime. Read our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4 mb-6">
                {renderLogo()}
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">NewsTRNT</h2>
                  <p className="text-sm text-gray-400 italic">The Road Not Taken</p>
                </div>
              </div>
              
              <p className="text-gray-400 leading-relaxed mb-6">
                Independent journalism that takes the road not taken. We bring you diverse perspectives, underreported stories, and the complete picture you deserve.
              </p>

              {/* App Download Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <a href="#" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 py-2.5 transition-all group">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">Download on</div>
                    <div className="text-sm font-semibold -mt-0.5 text-white">App Store</div>
                  </div>
                </a>
                <a href="#" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 py-2.5 transition-all group">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">Get it on</div>
                    <div className="text-sm font-semibold -mt-0.5 text-white">Google Play</div>
                  </div>
                </a>
              </div>

              {/* Social Links - Premium */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  {[
                    { name: 'Twitter', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, color: 'hover:bg-gray-700' },
                    { name: 'Facebook', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 36.6 36.6 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>, color: 'hover:bg-blue-600' },
                    { name: 'Instagram', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500' },
                    { name: 'LinkedIn', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, color: 'hover:bg-blue-700' },
                    { name: 'YouTube', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, color: 'hover:bg-red-600' },
                    { name: 'RSS', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/></svg>, color: 'hover:bg-orange-500' },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary rounded-full"></span>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                      <span className="w-0 group-hover:w-4 h-0.5 bg-primary rounded-full mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary rounded-full"></span>
                Company
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                      <span className="w-0 group-hover:w-4 h-0.5 bg-primary rounded-full mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary rounded-full"></span>
                Legal & Help
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                      <span className="w-0 group-hover:w-4 h-0.5 bg-primary rounded-full mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary rounded-full"></span>
                Categories
              </h4>
              <ul className="space-y-3">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="group flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                      <span className="w-0 group-hover:w-4 h-0.5 bg-primary rounded-full mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      <span className="mr-2">{cat.icon || '📰'}</span>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Awards & Recognition Bar */}
      <div className="relative border-t border-white/10 py-8">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-2xl">🏆</span>
              <span>Best News App 2024</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-2xl">⭐</span>
              <span>4.9 App Store Rating</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-2xl">🛡️</span>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-2xl">✅</span>
              <span>Fact-Check Certified</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-2xl">🔒</span>
              <span>256-bit SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Premium */}
      <div className="relative border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-400">
                © {currentYear} <span className="font-semibold text-white">NewsTRNT</span>. All rights reserved.
              </p>
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                Made with <span className="text-red-500">❤</span> in India
              </div>
            </div>

            {/* Live Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-400">{visitorCount.toLocaleString()} readers online</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Powered by</span>
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-bold">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  AI
                </span>
              </div>
            </div>

            {/* Language & Region */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <span>🌐</span>
                <span>English (US)</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary hover:bg-red-600 text-white rounded-full shadow-lg shadow-primary/25 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl z-50 group"
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
