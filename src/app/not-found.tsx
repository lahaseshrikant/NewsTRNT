"use client";

import React from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/DivergenceMark';
import { SearchIcon, ArrowRightIcon } from '@/components/icons/EditorialIcons';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        {/* Divergence Mark */}
        <div className="mb-8 flex justify-center">
          <DivergenceMark size={64} animated className="text-primary" />
        </div>

        {/* Breaking news style header */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-primary/10 rounded-editorial">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-overline text-primary uppercase tracking-widest">
            Story Not Found
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-serif text-display text-foreground mb-6 leading-none tracking-tight">
          404
        </h1>

        <h2 className="font-serif text-headline-3 text-foreground mb-4">
          This Story Took the Road Less Traveled
        </h2>

        <p className="text-body-lg text-muted-foreground mb-3 max-w-lg mx-auto">
          The page you&apos;re looking for has either been moved, removed, or perhaps it never existed in the first place.
        </p>

        <p className="text-caption text-muted-foreground mb-10 font-mono">
          &ldquo;Two roads diverged in a wood, and I took the one that led to a 404.&rdquo;
        </p>

        {/* Editorial divider */}
        <hr className="editorial-rule mb-10" />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3 text-body-sm font-semibold tracking-wide hover:bg-foreground/90 transition-all rounded-editorial"
          >
            Back to Headlines
            <ArrowRightIcon size={16} />
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-3 text-body-sm font-semibold tracking-wide hover:bg-muted transition-all rounded-editorial"
          >
            <SearchIcon size={16} />
            Search Stories
          </Link>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          {[
            { label: 'Trending', href: '/trending' },
            { label: 'Latest', href: '/news' },
            { label: 'Categories', href: '/categories' },
            { label: 'About Us', href: '/about' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-4 border border-border rounded-editorial hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <span className="text-overline text-muted-foreground group-hover:text-primary uppercase tracking-widest block mb-1">
                Explore
              </span>
              <span className="text-body-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Back button */}
        <div className="mt-12">
          <button
            onClick={() => window.history.back()}
            className="text-caption text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
