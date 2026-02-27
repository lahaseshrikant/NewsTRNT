"use client";

import React from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

const AboutPage: React.FC = () => {
  const values = [
    {
      title: 'Accuracy',
      description: 'Every story is verified, every claim is sourced. We report what we can prove — nothing more, nothing less.',
    },
    {
      title: 'Transparency',
      description: 'Our editorial process is open. When we correct a mistake, we say so. When we don\'t know, we admit it.',
    },
    {
      title: 'Courage',
      description: 'We publish what matters, not what is popular. We take the road not taken — even when it\'s harder.',
    },
    {
      title: 'Clarity',
      description: 'Complex stories made clear. No jargon walls, no clickbait. Just honest journalism, well told.',
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — Cinematic */}
      <section className="relative bg-ink overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,40,40,0.15),transparent_70%)]" />
        <div className="container mx-auto py-24 md:py-32 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <DivergenceMark size={64} animated className="mx-auto mb-10" color="var(--color-vermillion, #C62828)" />
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1]">
              The Road Not Taken
            </h1>
            <div className="max-w-2xl mx-auto mb-10">
              <blockquote className="font-serif text-xl md:text-2xl text-white/70 italic leading-relaxed">
                <p className="mb-4">&ldquo;Two roads diverged in a wood, and I&mdash;</p>
                <p className="mb-4">I took the one less traveled by,</p>
                <p>And that has made all the difference.&rdquo;</p>
                <footer className="mt-6 text-sm text-white/40 not-italic font-mono uppercase tracking-widest">
                  &mdash; Robert Frost
                </footer>
              </blockquote>
            </div>
            <div className="flex items-center justify-center gap-6 font-mono text-xs tracking-wider uppercase text-white/30">
              <span>Est. 2024</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>Independent</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>Built in India</span>
            </div>
          </div>
        </div>
        <div className="border-b-2 border-vermillion" />
      </section>

      {/* The Manifesto */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-4 block text-center">Our Manifesto</span>
            <div className="editorial-rule mb-10" />

            <div className="mx-auto">
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed mb-8 text-center">
                The world doesn&apos;t need another news platform that echoes the same headlines.
              </p>

              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Every day, millions of stories go untold. Perspectives get buried under algorithms 
                designed to feed you what you already believe. The mainstream road is crowded — 
                and it all looks the same.
              </p>

              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                <strong className="text-foreground">NewsTRNT exists to take the other road.</strong> We 
                seek out the stories that challenge assumptions, the perspectives that broaden understanding, 
                and the truths that others won&apos;t publish because they&apos;re inconvenient.
              </p>

              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We are not anti-mainstream. We are <em>beyond</em> mainstream. We believe that informed citizens 
                need the complete picture — not just the version that gets the most clicks.
              </p>

              <p className="font-serif text-xl text-foreground leading-relaxed mt-12 border-l-4 border-vermillion pl-6">
                We took the road less traveled. And we believe that will make all the difference — 
                for you, for journalism, and for the truth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-4 block">Our Pillars</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                The principles that guide our journalism
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="group border border-border p-8 bg-background hover:border-vermillion/30 transition-colors">
                  <span className="font-mono text-5xl font-bold text-ash/50 dark:text-ash/20 block mb-6 group-hover:text-vermillion/30 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-4 block">The Difference</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Why NewsTRNT?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">Beyond the Echo Chamber</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Most platforms show you stories similar to what you&apos;ve already read. We do the opposite — 
                  we surface perspectives you might have missed and reporting that goes deeper than the headline.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">Technology Meets Editorial Judgment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform combines smart content curation with human editorial oversight. 
                  Technology helps us find the stories; journalists ensure they&apos;re told right.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">No Clickbait. No Agenda.</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We don&apos;t write headlines designed to make you angry. We write them to make you informed. 
                  Our editorial independence means we answer to our readers — not advertisers, not algorithms.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">Built for India, Built for the World</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Born in India with a global perspective. We understand the nuances of a diverse, 
                  complex world — and we believe every story deserves to be heard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Frost Connection */}
      <section className="py-20 bg-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(184,134,11,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <DivergenceMark size={40} className="mx-auto mb-8" color="var(--color-vermillion, #C62828)" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8">
              Why &ldquo;The Road Not Taken&rdquo;?
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Robert Frost wrote about a traveler who chose the path less traveled — not because it was easier, 
              but because it was different. That choice, he said, &ldquo;made all the difference.&rdquo;
            </p>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              In a world where every news outlet follows the same story, cites the same sources, 
              and reaches the same conclusions — we chose to diverge. The name <strong className="text-white">NewsTRNT</strong> itself 
              carries the word <em>TRNT</em> — a quiet nod to <em>The Road Not Taken</em>.
            </p>
            <p className="text-white/50 text-lg leading-relaxed">
              Every article we publish, every perspective we amplify, every story we uncover is an act 
              of walking that divergent path. We invite you to walk it with us.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to take the road less traveled?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Join a community of readers who demand more from their news. 
              Subscribe, engage, and see the world through a different lens.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/" className="bg-vermillion text-white px-8 py-3.5 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors">
                Start Reading
              </Link>
              <Link href="/subscription" className="border border-border text-foreground px-8 py-3.5 font-mono text-xs tracking-wider uppercase hover:bg-ink/5 dark:hover:bg-white/5 transition-colors">
                Subscribe
              </Link>
              <Link href="/contact" className="border border-border text-muted-foreground px-8 py-3.5 font-mono text-xs tracking-wider uppercase hover:border-foreground/40 hover:text-foreground transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
