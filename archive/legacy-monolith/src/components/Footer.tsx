"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { DivergenceMark } from '@/components/DivergenceMark';

const Footer: React.FC = () => {
  const { categories } = useCategories();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  const sectionLinks = [
    { name: 'Headlines', href: '/' },
    { name: 'Trending', href: '/trending' },
    { name: 'Latest', href: '/news' },
    { name: 'Web Stories', href: '/web-stories' },
    { name: 'Opinion', href: '/opinion' },
  ];

  const companyLinks = [
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Advertise', href: '/advertise' },
    { name: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Sitemap', href: '/sitemap' },
  ];

  return (
    <footer className="bg-ink text-ivory/80">
      {/* Editorial Rule */}
      <div className="border-t-2 border-vermillion" />

      {/* Newsletter Band */}
      <div className="border-b border-ivory/10">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="kicker text-vermillion mb-3">The Evening Edition</p>
            <h3 className="font-serif text-2xl md:text-3xl text-ivory mb-3">
              Stories that didn&apos;t make the front page
            </h3>
            <p className="text-ivory/50 text-sm mb-8 max-w-md mx-auto">
              A curated selection of underreported stories, delivered every evening.
              The road less traveled, in your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-ivory/5 border border-ivory/15 rounded-lg text-ivory placeholder-ivory/30 focus:outline-none focus:border-vermillion/50 focus:ring-2 focus:ring-vermillion/10 transition-all font-mono text-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-vermillion hover:bg-vermillion-dark rounded-lg text-ivory font-sans text-sm font-semibold tracking-wide uppercase transition-all hover:shadow-lg hover:shadow-vermillion/20"
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>
            <p className="text-ivory/30 text-xs mt-4 font-mono">
              No spam. Unsubscribe anytime.{' '}
              <Link href="/privacy" className="text-ivory/40 hover:text-ivory/60 underline underline-offset-2 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <DivergenceMark size={28} color="currentColor" className="text-vermillion" />
              <div>
                <h2 className="font-serif text-xl text-ivory tracking-tight">NewsTRNT</h2>
                <p className="text-xs text-ivory/40 font-mono italic">The Road Not Taken</p>
              </div>
            </div>

            <p className="text-ivory/50 text-sm leading-relaxed mb-6 max-w-xs">
              Independent journalism that takes the road not taken.
              Diverse perspectives, underreported stories, and the complete picture.
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {[
                { name: 'X', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { name: 'LinkedIn', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { name: 'YouTube', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                { name: 'Instagram', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                { name: 'RSS', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/></svg> },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="w-9 h-9 border border-ivory/10 rounded-lg flex items-center justify-center text-ivory/40 hover:text-ivory hover:border-ivory/30 hover:bg-ivory/5 transition-all"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* App Download CTA */}
            <div className="mt-6 pt-6 border-t border-ivory/8">
              <p className="text-xs text-ivory/30 font-mono uppercase tracking-widest mb-3">Get the App</p>
              <div className="flex gap-2">
                <a href="#" className="flex items-center gap-2 px-3 py-2 bg-ivory/5 border border-ivory/10 rounded-lg hover:bg-ivory/10 transition-all group">
                  <svg className="w-5 h-5 text-ivory/50 group-hover:text-ivory/80 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <div className="text-left">
                    <p className="text-[9px] text-ivory/40 leading-tight">Download on the</p>
                    <p className="text-xs text-ivory/70 font-semibold leading-tight">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 px-3 py-2 bg-ivory/5 border border-ivory/10 rounded-lg hover:bg-ivory/10 transition-all group">
                  <svg className="w-5 h-5 text-ivory/50 group-hover:text-ivory/80 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-14.54 8.413 12.238-10.715zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/></svg>
                  <div className="text-left">
                    <p className="text-[9px] text-ivory/40 leading-tight">Get it on</p>
                    <p className="text-xs text-ivory/70 font-semibold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-ivory/30 mb-5">
              Sections
            </h4>
            <ul className="space-y-2.5">
              {sectionLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-ivory/30 mb-5">
              Desks
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-ivory/30 mb-5">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-ivory/30 mb-5">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Colophon */}
      <div className="border-t border-ivory/8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-ivory/30 font-mono">
              &copy; {currentYear} NewsTRNT Media. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <p className="text-xs text-ivory/20 font-mono italic hidden md:block">
                &ldquo;Two roads diverged &mdash; we took the one less traveled.&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-ivory/30 font-mono">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
              <p className="text-xs text-ivory/30 font-mono">
                Built in India
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
