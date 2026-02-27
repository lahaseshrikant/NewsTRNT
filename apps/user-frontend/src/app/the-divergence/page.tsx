"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DivergenceMark } from '@/components/ui/DivergenceMark';
import dbApi, { Article } from '@/lib/api-client';
import { getContentUrl } from '@/lib/contentUtils';

// =============================================================================
// THE DIVERGENCE — NewsTRNT's Flagship Motive Page
// "Where the untold becomes undeniable"
// =============================================================================

// Custom hook: scroll-triggered reveal for sections
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Custom hook: animated counter
function useAnimatedCounter(target: number, duration: number = 2000, active: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, active]);

  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — CINEMATIC HERO
// ─────────────────────────────────────────────────────────────────────────────
const HeroSection: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const opacity = Math.max(0, 1 - scrollY / 600);
  const translateY = scrollY * 0.3;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background dark:bg-ink overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(198,40,40,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(184,134,11,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,40,40,0.05),transparent_40%)]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content with parallax */}
      <div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{ opacity, transform: `translateY(${translateY}px)` }}
      >
        {/* Animated DivergenceMark */}
        <div className="mb-12">
          <DivergenceMark
            size={80}
            animated
            className="mx-auto drop-shadow-[0_0_30px_rgba(198,40,40,0.3)]"
            color="var(--color-vermillion, #C62828)"
          />
        </div>

        {/* Kicker */}
        <p className="font-mono text-xs tracking-[0.35em] uppercase text-vermillion mb-8 opacity-80">
          NewsTRNT Presents
        </p>

        {/* Title */}
        <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-foreground dark:text-white mb-8 leading-[0.95] tracking-tight">
          The
          <br />
          <span className="text-foreground dark:text-white opacity-80">
            Divergence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-serif text-xl md:text-2xl text-foreground/50 dark:text-white/50 max-w-2xl mx-auto leading-relaxed mb-12 italic">
          Where the untold becomes undeniable.
        </p>

        {/* Decorative line */}
        <div className="w-16 h-[2px] bg-vermillion mx-auto mb-12" />

        {/* Frost excerpt — minimal */}
        <p className="font-serif text-sm text-foreground/40 dark:text-white/25 italic max-w-md mx-auto leading-relaxed">
          &ldquo;Two roads diverged in a wood, and I — I took the one less traveled by,
          and that has made all the difference.&rdquo;
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3" style={{ opacity }}>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-foreground/20 dark:text-white/20">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-foreground/30 dark:from-white/30 to-transparent relative">
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-vermillion to-transparent animate-pulse" />
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-vermillion to-transparent" />
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — THE SILENCE (What mainstream misses)
// ─────────────────────────────────────────────────────────────────────────────
const SilenceSection: React.FC = () => {
  const intro = useScrollReveal(0.2);
  const comparison = useScrollReveal(0.15);

  const mainstream = [
    { headline: 'Celebrity breakup trends on social media', label: 'Entertainment' },
    { headline: 'Stock market hits new record high', label: 'Business' },
    { headline: 'Political scandal dominates 24-hour news cycle', label: 'Politics' },
    { headline: 'Viral video gets 50 million views overnight', label: 'Trending' },
  ];

  const divergent = [
    { headline: 'How quiet policy changes are reshaping rural healthcare', label: 'Investigation' },
    { headline: 'The communities rebuilding after the cameras left', label: 'Human Stories' },
    { headline: 'Data reveals environmental shifts no one is tracking', label: 'Analysis' },
    { headline: 'Local journalists face threats for uncovering corruption', label: 'Press Freedom' },
  ];

  return (
    <section className="py-24 md:py-36 bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-vermillion/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto px-6">
        {/* Section intro */}
        <div
          ref={intro.ref}
          className={`max-w-3xl mx-auto text-center mb-20 transition-all duration-1000 ${
            intro.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-6 block">
            The Silence
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-[1.1]">
            Every day, a thousand stories <br className="hidden md:block" />
            <span className="text-vermillion">go untold.</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            While mainstream media chases the same headlines, entire worlds of truth
            remain in shadow. Not because they don&apos;t matter — but because they don&apos;t trend.
          </p>
        </div>

        {/* Side-by-side comparison */}
        <div
          ref={comparison.ref}
          className={`max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 transition-all duration-1000 delay-300 ${
            comparison.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Mainstream column */}
          <div className="relative">
            <div className="border border-border/50 bg-muted/30 p-8 md:p-10">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <span className="font-mono text-xs tracking-[0.15em] uppercase text-muted-foreground/50">
                  What they show you
                </span>
              </div>
              <div className="space-y-6">
                {mainstream.map((item, i) => (
                  <div
                    key={i}
                    className="group opacity-50 hover:opacity-30 transition-opacity"
                  >
                    <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground/40 mb-1 block">
                      {item.label}
                    </span>
                    <p className="font-serif text-lg text-muted-foreground line-through decoration-muted-foreground/20 leading-snug">
                      {item.headline}
                    </p>
                  </div>
                ))}
              </div>
              {/* Fade overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 pointer-events-none" />
            </div>
          </div>

          {/* NewsTRNT column */}
          <div className="relative">
            <div className="border border-vermillion/20 bg-background p-8 md:p-10 shadow-[0_0_40px_rgba(198,40,40,0.04)]">
              <div className="flex items-center gap-2 mb-8">
                <DivergenceMark size={14} color="var(--color-vermillion, #C62828)" />
                <span className="font-mono text-xs tracking-[0.15em] uppercase text-vermillion">
                  What we uncover
                </span>
              </div>
              <div className="space-y-6">
                {divergent.map((item, i) => (
                  <div
                    key={i}
                    className="group"
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <span className="font-mono text-[10px] tracking-wider uppercase text-vermillion/60 mb-1 block">
                      {item.label}
                    </span>
                    <p className="font-serif text-lg text-foreground leading-snug group-hover:text-vermillion transition-colors">
                      {item.headline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pull quote */}
        <div className="max-w-2xl mx-auto mt-20 text-center">
          <p className="font-serif text-xl md:text-2xl text-foreground/80 italic leading-relaxed">
            &ldquo;The stories that shape the world aren&apos;t always the ones that make the front page.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — BY THE NUMBERS
// ─────────────────────────────────────────────────────────────────────────────
const NumbersSection: React.FC = () => {
  const section = useScrollReveal(0.3);

  const stats = [
    { value: 2400, suffix: '+', label: 'Stories Published', description: 'And counting — every one verified, every one that matters' },
    { value: 180, suffix: '+', label: 'Unique Perspectives', description: 'Voices from communities the mainstream rarely reaches' },
    { value: 45, suffix: '', label: 'Countries Covered', description: 'Because truth doesn\'t respect borders' },
    { value: 98, suffix: '%', label: 'Editorial Independence', description: 'No corporate owners. No political sponsors. Just journalism.' },
  ];

  return (
    <section className="py-24 md:py-36 bg-background dark:bg-ink text-foreground dark:text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,40,40,0.06),transparent_60%)]" />

      <div ref={section.ref} className="container mx-auto px-6 relative z-10">
        <div className={`text-center mb-20 transition-all duration-1000 ${
          section.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-6 block">
            The Impact
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-6">
            The numbers behind the mission
          </h2>
          <div className="w-16 h-[2px] bg-vermillion/50 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} active={section.isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCard: React.FC<{
  stat: { value: number; suffix: string; label: string; description: string };
  index: number;
  active: boolean;
}> = ({ stat, index, active }) => {
  const count = useAnimatedCounter(stat.value, 2500, active);

  return (
    <div
      className="text-center p-8 border border-foreground/10 dark:border-white/[0.06] bg-foreground/[0.02] dark:bg-white/[0.02] hover:border-vermillion/20 transition-all duration-500"
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <div className="font-mono text-5xl md:text-6xl font-bold text-foreground dark:text-white mb-2 tabular-nums">
        {count.toLocaleString()}<span className="text-vermillion">{stat.suffix}</span>
      </div>
      <p className="font-mono text-xs tracking-[0.15em] uppercase text-foreground/60 dark:text-white/60 mb-4">
        {stat.label}
      </p>
      <p className="text-foreground/50 dark:text-white/30 text-sm leading-relaxed">
        {stat.description}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — THE DIVERGENT CODE (Manifesto)
// ─────────────────────────────────────────────────────────────────────────────
const ManifestoSection: React.FC = () => {
  const title = useScrollReveal(0.2);
  const p1 = useScrollReveal(0.3);
  const p2 = useScrollReveal(0.3);
  const p3 = useScrollReveal(0.3);
  const p4 = useScrollReveal(0.3);
  const pledge = useScrollReveal(0.3);

  return (
    <section className="py-24 md:py-36 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div
            ref={title.ref}
            className={`text-center mb-20 transition-all duration-1000 ${
              title.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-6 block">
              The Divergent Code
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
              What we believe.<br />
              <span className="text-muted-foreground">What we fight for.</span>
            </h2>
          </div>

          {/* Manifesto paragraphs — reveal on scroll */}
          <div className="space-y-12 md:space-y-16">
            <div
              ref={p1.ref}
              className={`transition-all duration-1000 ${
                p1.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <span className="font-mono text-xs text-vermillion/60 tracking-wider uppercase mb-3 block">I.</span>
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
                We believe that <strong>every story deserves to be told</strong> — not just the ones 
                that generate clicks, not just the ones that confirm what you already think.
              </p>
            </div>

            <div
              ref={p2.ref}
              className={`transition-all duration-1000 delay-100 ${
                p2.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <span className="font-mono text-xs text-vermillion/60 tracking-wider uppercase mb-3 block">II.</span>
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
                We refuse to participate in the <strong>attention economy</strong> that rewards outrage 
                over insight, speed over accuracy, noise over truth.
              </p>
            </div>

            <div
              ref={p3.ref}
              className={`transition-all duration-1000 delay-200 ${
                p3.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <span className="font-mono text-xs text-vermillion/60 tracking-wider uppercase mb-3 block">III.</span>
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
                We seek out the <strong>silenced voices</strong>, the buried data, the underreported 
                realities that shape the world while the mainstream looks away.
              </p>
            </div>

            <div
              ref={p4.ref}
              className={`transition-all duration-1000 delay-300 ${
                p4.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <span className="font-mono text-xs text-vermillion/60 tracking-wider uppercase mb-3 block">IV.</span>
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
                We build with <strong>technology and heart</strong> — intelligent systems that surface 
                what matters, guided by human judgment that knows why it matters.
              </p>
            </div>
          </div>

          {/* The pledge — highlighted */}
          <div
            ref={pledge.ref}
            className={`mt-20 md:mt-28 p-10 md:p-14 border-l-4 border-vermillion bg-vermillion/[0.03] transition-all duration-1000 ${
              pledge.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <DivergenceMark size={32} className="mb-6" color="var(--color-vermillion, #C62828)" />
            <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed italic">
              &ldquo;We pledge to always take the road less traveled — to report what others ignore, 
              to amplify what others silence, and to serve truth above all else. Because journalism 
              isn&apos;t about following the crowd. It&apos;s about leading to the light.&rdquo;
            </p>
            <p className="mt-6 font-mono text-xs tracking-[0.15em] uppercase text-vermillion">
              — The NewsTRNT Editorial Charter
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — STORIES THEY WON'T TELL (Live from API)
// ─────────────────────────────────────────────────────────────────────────────
const StoriesSection: React.FC<{ articles: Article[] }> = ({ articles }) => {
  const section = useScrollReveal(0.1);

  if (articles.length === 0) return null;

  const featured = articles[0];
  const rest = articles.slice(1, 7);

  return (
    <section className="py-24 md:py-36 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div
          ref={section.ref}
          className={`transition-all duration-1000 ${
            section.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-6 block">
              The Untold Archive
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Stories that mattered
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Real reporting. Real impact. These are the stories we chose to tell — 
              the ones the mainstream wouldn&apos;t touch.
            </p>
          </div>

          {/* Featured story */}
          <div className="max-w-6xl mx-auto mb-12">
            <Link href={getContentUrl(featured)} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-background border border-border hover:border-vermillion/30 transition-all overflow-hidden">
                {featured.imageUrl && (
                  <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                    <Image
                      src={featured.imageUrl}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    {featured.category && (
                      <span className="font-mono text-[10px] tracking-wider uppercase text-vermillion">
                        {featured.category.name}
                      </span>
                    )}
                    <span className="text-muted-foreground/30">•</span>
                    <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                      {featured.readingTime || 5} min read
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground group-hover:text-vermillion transition-colors leading-snug mb-4">
                    {featured.title}
                  </h3>
                  {featured.summary && (
                    <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                      {featured.summary}
                    </p>
                  )}
                  <span className="font-mono text-xs tracking-wider uppercase text-vermillion group-hover:tracking-[0.2em] transition-all">
                    Read the full story →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Story grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article, i) => (
              <Link
                key={article.id}
                href={getContentUrl(article)}
                className="group bg-background border border-border hover:border-vermillion/20 transition-all overflow-hidden"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {article.imageUrl && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {article.category && (
                      <span className="font-mono text-[10px] tracking-wider uppercase text-vermillion/80">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-vermillion transition-colors leading-snug mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* View all */}
          <div className="text-center mt-12">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.15em] uppercase text-vermillion hover:text-vermillion-dark transition-colors border-b border-vermillion/30 hover:border-vermillion pb-1"
            >
              Explore all stories
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — THE FORK IN THE ROAD (Timeline / Philosophy)
// ─────────────────────────────────────────────────────────────────────────────
const TimelineSection: React.FC = () => {
  const section = useScrollReveal(0.15);

  const milestones = [
    {
      marker: '01',
      title: 'The Realization',
      text: 'We saw a world where news had become entertainment, where algorithms decided truth, and where entire communities were invisible to the media machine.',
    },
    {
      marker: '02',
      title: 'The Decision',
      text: 'We chose to build something different — a platform where editorial courage meets technological innovation, where every voice has a chance to be heard.',
    },
    {
      marker: '03',
      title: 'The Build',
      text: 'Smart content engines that surface what matters. AI that assists but never replaces human judgment. Technology in service of truth, not the other way around.',
    },
    {
      marker: '04',
      title: 'The Divergence',
      text: 'Today, every story we publish is an act of divergence — a choice to take the road not taken, to illuminate what others leave in darkness. This is just the beginning.',
    },
  ];

  return (
    <section className="py-24 md:py-36 bg-background relative">
      <div className="container mx-auto px-6">
        <div
          ref={section.ref}
          className={`transition-all duration-1000 ${
            section.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-6 block">
              The Journey
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              The fork in the road
            </h2>
            <p className="text-muted-foreground text-lg">
              How NewsTRNT came to take the path less traveled
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto relative">
            {/* Central line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[1px] bg-border md:-translate-x-[0.5px]" />

            <div className="space-y-16 md:space-y-24">
              {milestones.map((milestone, i) => (
                <TimelineItem key={i} milestone={milestone} index={i} />
              ))}
            </div>

            {/* Terminus point */}
            <div className="flex justify-start md:justify-center mt-16">
              <div className="ml-[22px] md:ml-0">
                <DivergenceMark size={36} color="var(--color-vermillion, #C62828)" className="drop-shadow-[0_0_12px_rgba(198,40,40,0.2)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TimelineItem: React.FC<{
  milestone: { marker: string; title: string; text: string };
  index: number;
}> = ({ milestone, index }) => {
  const item = useScrollReveal(0.3);
  const isLeft = index % 2 === 0;

  return (
    <div
      ref={item.ref}
      className={`relative flex items-start transition-all duration-1000 ${
        item.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Mobile layout: icon on left, content right */}
      {/* Desktop layout: alternating left/right */}
      <div className={`w-full md:grid md:grid-cols-2 md:gap-12 flex`}>
        {/* Left content (desktop only) */}
        <div className={`hidden md:block ${isLeft ? 'text-right pr-12' : ''}`}>
          {isLeft && (
            <div>
              <span className="font-mono text-5xl font-bold text-muted-foreground/10 block mb-2">
                {milestone.marker}
              </span>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                {milestone.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {milestone.text}
              </p>
            </div>
          )}
        </div>

        {/* Right content (desktop only) */}
        <div className={`hidden md:block ${!isLeft ? 'pl-12' : ''}`}>
          {!isLeft && (
            <div>
              <span className="font-mono text-5xl font-bold text-muted-foreground/10 block mb-2">
                {milestone.marker}
              </span>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                {milestone.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {milestone.text}
              </p>
            </div>
          )}
        </div>

        {/* Mobile layout */}
        <div className="md:hidden pl-16">
          <span className="font-mono text-4xl font-bold text-muted-foreground/10 block mb-2">
            {milestone.marker}
          </span>
          <h3 className="font-serif text-xl font-bold text-foreground mb-3">
            {milestone.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {milestone.text}
          </p>
        </div>
      </div>

      {/* Center dot */}
      <div className="absolute left-[22px] md:left-1/2 md:-translate-x-1/2 top-2 z-10">
        <div className={`w-5 h-5 rounded-full border-2 transition-colors duration-500 ${
          item.isVisible
            ? 'border-vermillion bg-vermillion/20'
            : 'border-border bg-background'
        }`}>
          <div className={`w-2 h-2 rounded-full bg-vermillion mx-auto mt-[4px] transition-all duration-700 ${
            item.isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — VOICES FROM THE DIVERGENT PATH
// ─────────────────────────────────────────────────────────────────────────────
const VoicesSection: React.FC = () => {
  const section = useScrollReveal(0.2);

  const voices = [
    {
      quote: 'Finally, a platform that doesn\'t treat readers like engagement metrics. NewsTRNT shows me what I need to see, not just what I want to see.',
      name: 'Reader, Mumbai',
    },
    {
      quote: 'The stories here are the ones I end up discussing with friends for days. They stay with you because they matter.',
      name: 'Reader, Delhi',
    },
    {
      quote: 'In a world of clickbait, NewsTRNT is a breath of fresh air. Real journalism, real stories, real impact.',
      name: 'Reader, Bangalore',
    },
  ];

  return (
    <section className="py-24 md:py-36 bg-ink text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(198,40,40,0.08),transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div
          ref={section.ref}
          className={`transition-all duration-1000 ${
            section.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-16">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-6 block">
              Voices
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              From the divergent path
            </h2>
            <div className="w-16 h-[2px] bg-vermillion/50 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {voices.map((voice, i) => (
              <div
                key={i}
                className="border border-white/[0.06] bg-white/[0.02] p-8 hover:border-vermillion/20 transition-all"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Quote mark */}
                <svg className="w-8 h-8 text-vermillion/30 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                </svg>
                <p className="text-white/70 leading-relaxed mb-6 italic">
                  &ldquo;{voice.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-vermillion/40" />
                  <span className="font-mono text-xs text-white/40 tracking-wider uppercase">
                    {voice.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — JOIN THE MOVEMENT (CTA)
// ─────────────────────────────────────────────────────────────────────────────
const CTASection: React.FC = () => {
  const section = useScrollReveal(0.2);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  }, [email]);

  return (
    <section className="py-24 md:py-36 bg-background relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(198,40,40,0.04),transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div
          ref={section.ref}
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            section.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <DivergenceMark size={48} animated className="mx-auto mb-10" color="var(--color-vermillion, #C62828)" />

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-[1.1]">
            Walk the divergent path<br />
            <span className="text-vermillion">with us.</span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
            Join a community that demands more from journalism. Subscribe to stories that 
            the mainstream won&apos;t tell. Because the truth is worth the road less traveled.
          </p>

          {/* Newsletter signup */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-10">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3.5 border border-border bg-background text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-vermillion/50 focus:ring-2 focus:ring-vermillion/10 transition-all font-mono text-sm"
              required
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-vermillion hover:bg-vermillion-dark text-white font-mono text-xs tracking-wider uppercase transition-all hover:shadow-lg hover:shadow-vermillion/20"
            >
              {subscribed ? '✓ Joined' : 'Join Us'}
            </button>
          </form>

          {/* Action links */}
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link
              href="/"
              className="font-mono text-xs tracking-[0.15em] uppercase text-foreground hover:text-vermillion transition-colors border-b border-border hover:border-vermillion pb-1"
            >
              Start reading
            </Link>
            <span className="text-muted-foreground/30">•</span>
            <Link
              href="/about"
              className="font-mono text-xs tracking-[0.15em] uppercase text-foreground hover:text-vermillion transition-colors border-b border-border hover:border-vermillion pb-1"
            >
              About us
            </Link>
            <span className="text-muted-foreground/30">•</span>
            <Link
              href="/trending"
              className="font-mono text-xs tracking-[0.15em] uppercase text-foreground hover:text-vermillion transition-colors border-b border-border hover:border-vermillion pb-1"
            >
              Trending now
            </Link>
            <span className="text-muted-foreground/30">•</span>
            <Link
              href="/contact"
              className="font-mono text-xs tracking-[0.15em] uppercase text-foreground hover:text-vermillion transition-colors border-b border-border hover:border-vermillion pb-1"
            >
              Contact
            </Link>
          </div>

          {/* Final statement */}
          <div className="border-t border-border pt-10">
            <p className="font-serif text-lg text-muted-foreground italic mb-6">
              &ldquo;In a world of echoes, be the divergence.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-6 font-mono text-[10px] tracking-wider uppercase text-muted-foreground/40">
              <span>Est. 2024</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>Independent</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>Built in India</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>For the World</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TheDivergencePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch a mix of featured and trending articles for the stories section
        const [featured, trending] = await Promise.all([
          dbApi.getFeaturedArticles(4),
          dbApi.getTrendingArticles(6),
        ]);

        // Merge and deduplicate
        const seen = new Set<string>();
        const merged: Article[] = [];
        for (const article of [...featured, ...trending]) {
          if (!seen.has(article.id)) {
            seen.add(article.id);
            merged.push(article);
          }
        }

        setArticles(merged.slice(0, 7));
      } catch (error) {
        console.error('Failed to fetch articles for The Divergence:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <SilenceSection />
      <NumbersSection />
      <ManifestoSection />
      {!loading && articles.length > 0 && <StoriesSection articles={articles} />}
      <TimelineSection />
      <VoicesSection />
      <CTASection />
    </div>
  );
};

export default TheDivergencePage;
