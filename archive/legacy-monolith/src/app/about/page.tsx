"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DivergenceMark } from '@/components/DivergenceMark';

const AboutPage: React.FC = () => {

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Editor-in-Chief',
      bio: 'Award-winning journalist with 15+ years experience in digital media.',
      initials: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Technology Director',
      bio: 'Former Google engineer specializing in AI and machine learning.',
      initials: 'MC'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Data Science Lead',
      bio: 'PhD in Computer Science, expert in natural language processing.',
      initials: 'ER'
    },
    {
      name: 'James Wilson',
      role: 'Product Manager',
      bio: 'Product strategist with experience at leading news organizations.',
      initials: 'JW'
    }
  ];

  const values = [
    {
      title: 'Accuracy',
      description: 'We prioritize factual reporting and verify all information through multiple sources.',
    },
    {
      title: 'Transparency',
      description: 'Our AI algorithms and editorial processes are open and explainable.',
    },
    {
      title: 'Courage',
      description: 'We publish what matters, not what is popular. We take the road not taken.',
    },
    {
      title: 'Clarity',
      description: 'Complex stories made clear through thoughtful design and intelligent curation.',
    }
  ];

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Hero Section */}
      <section className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <DivergenceMark size={56} animated className="mx-auto mb-8" color="var(--color-vermillion, #C62828)" />
            <h1 className="font-serif text-4xl md:text-5xl lg:text-display font-bold text-ivory mb-6">
              The Road Not Taken
            </h1>
            <p className="text-xl text-ivory/60 mb-8 max-w-2xl mx-auto leading-relaxed">
              While mainstream media follows the same road, NewsTRNT takes the divergent path &mdash; finding the stories others miss.
            </p>
            <div className="flex items-center justify-center gap-6 font-mono text-xs tracking-wider uppercase text-ivory/40">
              <span>Est. 2024</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>Independent</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>Built in India</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-4 block">Our Mission</span>
            <div className="editorial-rule mb-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory mb-6">
                  Divergent Intelligence
                </h2>
                <p className="text-stone leading-relaxed mb-6">
                  NewsTRNT uses advanced AI algorithms to analyze thousands of news sources, 
                  identify the most important stories, and personalize them based on your interests. 
                  Our platform ensures you never miss what matters while discovering new 
                  perspectives and topics.
                </p>
                <p className="text-stone leading-relaxed">
                  We believe that everyone deserves access to accurate, timely, and relevant news. 
                  Our AI doesn&apos;t replace human judgment &mdash; it enhances it, helping our editorial team 
                  deliver better journalism faster.
                </p>
              </div>
              <div className="bg-ivory dark:bg-ash/10 p-8 border border-ash dark:border-ash/20">
                <DivergenceMark size={32} className="mb-4" color="var(--color-vermillion, #C62828)" />
                <h4 className="font-serif text-lg font-bold text-ink dark:text-ivory mb-2">Designed Clarity</h4>
                <p className="text-stone text-sm leading-relaxed">
                  Advanced technology analyzes global news patterns to surface 
                  the most relevant stories for you &mdash; stories on the road not taken.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-ivory dark:bg-ash/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-4 block">Our Pillars</span>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">
                The principles that guide our journalism
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="border border-ash dark:border-ash/20 p-6 bg-paper dark:bg-ink">
                  <span className="font-mono text-4xl font-bold text-ash dark:text-ash/30 block mb-4">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ink dark:text-ivory mb-2">{value.title}</h3>
                  <p className="text-stone text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-4 block">The Newsroom</span>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">
                Journalists &amp; Technologists
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-ink dark:bg-ivory flex items-center justify-center">
                    <span className="font-serif text-2xl font-bold text-ivory dark:text-ink">{member.initials}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink dark:text-ivory mb-1">{member.name}</h3>
                  <p className="font-mono text-xs tracking-wider uppercase text-vermillion mb-2">{member.role}</p>
                  <p className="text-stone text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-ivory dark:bg-ash/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-vermillion mb-4 block">Our Technology</span>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">
                Intelligence powering the future of news
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Natural Language Processing', desc: 'Advanced NLP algorithms understand context, sentiment, and relevance in news articles.' },
                { title: 'Real-time Analytics', desc: 'Monitor global news trends and breaking stories as they happen worldwide.' },
                { title: 'Personalization Engine', desc: 'Machine learning models that adapt to your reading habits and preferences.' }
              ].map((tech, i) => (
                <div key={i} className="border border-ash dark:border-ash/20 p-6 bg-paper dark:bg-ink">
                  <span className="font-mono text-4xl font-bold text-ash dark:text-ash/30 block mb-4">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ink dark:text-ivory mb-2">{tech.title}</h3>
                  <p className="text-stone text-sm leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ink dark:bg-ivory/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <DivergenceMark size={40} className="mx-auto mb-6" color="var(--color-vermillion, #C62828)" />
            <h2 className="font-serif text-3xl font-bold text-ivory mb-4">
              Take the road not taken
            </h2>
            <p className="text-ivory/60 mb-8 max-w-xl mx-auto">
              Experience journalism designed for clarity, built with intelligence, and delivered with courage.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/" className="bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors">
                Start Reading
              </Link>
              <Link href="/contact" className="border border-ivory/20 text-ivory px-8 py-3 font-mono text-xs tracking-wider uppercase hover:border-ivory/40 transition-colors">
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
