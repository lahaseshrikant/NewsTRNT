"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

const PressPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const pressReleases = [
    {
      id: 1,
      title: 'NewsTRNT Raises $50M Series B to Expand Independent News Platform',
      date: '2024-01-15',
      category: 'funding',
      excerpt: 'Leading news platform secures funding to expand AI capabilities and global reach, serving millions of users worldwide.',
      downloadUrl: '/press/NewsTRNT-series-b-announcement.pdf'
    },
    {
      id: 2,
      title: 'NewsTRNT Launches Advanced Fact-Checking Feature',
      date: '2024-01-10',
      category: 'product',
      excerpt: 'New fact-checking system helps users identify misinformation and verify news sources in real-time.',
      downloadUrl: '/press/NewsTRNT-fact-checking-launch.pdf'
    },
    {
      id: 3,
      title: 'NewsTRNT Partners with Global News Organizations for Enhanced Coverage',
      date: '2024-01-05',
      category: 'partnerships',
      excerpt: 'Strategic partnerships with leading news outlets expand content library and improve global news coverage.',
      downloadUrl: '/press/NewsTRNT-global-partnerships.pdf'
    },
    {
      id: 4,
      title: 'NewsTRNT Named "Best News App" by Tech Innovation Awards 2024',
      date: '2023-12-20',
      category: 'awards',
      excerpt: 'Recognition for outstanding innovation in smart news curation and personalization technology.',
      downloadUrl: '/press/NewsTRNT-tech-innovation-award.pdf'
    },
    {
      id: 5,
      title: 'NewsTRNT Surpasses 10 Million Active Users Milestone',
      date: '2023-12-15',
      category: 'milestones',
      excerpt: 'Platform growth accelerates as more users adopt personalized news consumption for comprehensive information.',
      downloadUrl: '/press/NewsTRNT-10m-users-milestone.pdf'
    }
  ];

  const mediaKit = [
    {
      title: 'Company Logos',
      description: 'High-resolution PNG and SVG logos in various formats',
      items: ['Primary Logo', 'Icon Only', 'Wordmark', 'White Version'],
      downloadUrl: '/media-kit/NewsTRNT-logos.zip'
    },
    {
      title: 'Brand Guidelines',
      description: 'Complete brand identity and usage guidelines',
      items: ['Color Palette', 'Typography', 'Logo Usage', 'Brand Voice'],
      downloadUrl: '/media-kit/NewsTRNT-brand-guidelines.pdf'
    },
    {
      title: 'Product Screenshots',
      description: 'High-quality screenshots of our platform and features',
      items: ['Desktop App', 'Mobile App', 'News Feed', 'API Interface'],
      downloadUrl: '/media-kit/NewsTRNT-screenshots.zip'
    },
    {
      title: 'Executive Photos',
      description: 'Professional headshots of leadership team',
      items: ['CEO Portrait', 'CTO Portrait', 'Team Photos', 'Event Photos'],
      downloadUrl: '/media-kit/NewsTRNT-executive-photos.zip'
    }
  ];

  const awards = [
    { year: '2024', award: 'Best News App', organization: 'Tech Innovation Awards', description: 'Recognized for outstanding AI innovation in news curation' },
    { year: '2023', award: 'AI Excellence Award', organization: 'Digital Media Summit', description: 'Excellence in artificial intelligence application for media' },
    { year: '2023', award: 'Startup of the Year', organization: 'Media Tech Conference', description: 'Outstanding achievement in media technology innovation' },
    { year: '2023', award: 'Users Choice Award', organization: 'App Store Awards', description: 'Most loved news application by users worldwide' }
  ];

  const executives = [
    { name: 'Sarah Chen', title: 'CEO & Co-founder', bio: 'Former VP of Product at major tech company with 15+ years in media and technology.', contact: 'sarah.chen@NewsTRNT.com', initials: 'SC' },
    { name: 'Marcus Johnson', title: 'CTO & Co-founder', bio: 'AI researcher with 10+ years experience at Google and OpenAI. Leading NLP expert.', contact: 'marcus.johnson@NewsTRNT.com', initials: 'MJ' },
    { name: 'Elena Rodriguez', title: 'VP of Engineering', bio: 'Built infrastructure at Netflix and Spotify. Expert in scalable systems.', contact: 'elena.rodriguez@NewsTRNT.com', initials: 'ER' }
  ];

  const categories = [
    { id: 'all', name: 'All', count: pressReleases.length },
    { id: 'funding', name: 'Funding', count: pressReleases.filter(p => p.category === 'funding').length },
    { id: 'product', name: 'Product', count: pressReleases.filter(p => p.category === 'product').length },
    { id: 'partnerships', name: 'Partnerships', count: pressReleases.filter(p => p.category === 'partnerships').length },
    { id: 'awards', name: 'Awards', count: pressReleases.filter(p => p.category === 'awards').length },
    { id: 'milestones', name: 'Milestones', count: pressReleases.filter(p => p.category === 'milestones').length }
  ];

  const filteredReleases = selectedCategory === 'all' 
    ? pressReleases 
    : pressReleases.filter(release => release.category === selectedCategory);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Hero */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">Newsroom</p>
            <h1 className="font-serif text-5xl font-bold text-ivory mb-6">Press &amp; Media</h1>
            <p className="text-xl text-ivory/60 mb-8">
              Latest news, press releases, and media resources from NewsTRNT
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:press@NewsTRNT.com" className="hover-magnetic bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase">
                Media Inquiries
              </a>
              <a href="#media-kit" className="border border-ivory/20 text-ivory px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory/10 transition-colors">
                Download Media Kit
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Press Releases */}
      <div className="bg-ivory dark:bg-ash/5 border-b border-ash dark:border-ash/20 py-16">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Announcements</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Press Releases</h2>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-ink dark:bg-ivory text-ivory dark:text-ink'
                      : 'border border-ash dark:border-ash/20 text-stone hover:text-ink dark:hover:text-ivory'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Press Release List */}
            <div className="space-y-4">
              {filteredReleases.map((release) => (
                <div key={release.id} className="hover-lift bg-paper dark:bg-ink border border-ash dark:border-ash/20 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-vermillion border border-vermillion/30 px-2 py-1">
                          {release.category}
                        </span>
                        <span className="text-sm text-stone font-mono text-xs">
                          {new Date(release.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-3">{release.title}</h3>
                      <p className="text-stone">{release.excerpt}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:ml-6">
                      <a
                        href={release.downloadUrl}
                        className="hover-magnetic bg-vermillion text-white px-6 py-2 font-mono text-xs tracking-wider uppercase text-center"
                        download
                      >
                        Download PDF
                      </a>
                      <button className="border border-ash dark:border-ash/20 text-ink dark:text-ivory px-6 py-2 font-mono text-xs tracking-wider uppercase hover:bg-ivory dark:hover:bg-ash/10 transition-colors">
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Kit */}
      <div id="media-kit" className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Resources</p>
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Media Kit</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaKit.map((kit, index) => (
              <div key={index} className="border border-ash dark:border-ash/20 p-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">0{index + 1}</span>
                <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mt-2 mb-3">{kit.title}</h3>
                <p className="text-stone mb-4">{kit.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {kit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-ink dark:text-ivory/80">
                      <svg className="w-4 h-4 text-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <a
                  href={kit.downloadUrl}
                  className="block w-full bg-ink dark:bg-ivory/10 text-ivory py-3 font-mono text-xs tracking-wider uppercase text-center hover:bg-ink/90 dark:hover:bg-ivory/20 transition-colors"
                  download
                >
                  Download Package
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards */}
      <div className="bg-ivory dark:bg-ash/5 border-y border-ash dark:border-ash/20 py-16">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Recognition</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Awards &amp; Recognition</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {awards.map((award, index) => (
                <div key={index} className="bg-paper dark:bg-ink border border-ash dark:border-ash/20 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <svg className="w-8 h-8 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span className="font-mono text-xs uppercase tracking-wider text-stone">{award.year}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink dark:text-ivory mb-1">{award.award}</h3>
                  <p className="font-mono text-xs text-vermillion uppercase tracking-wider mb-2">{award.organization}</p>
                  <p className="text-sm text-stone">{award.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Team */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Leadership</p>
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Executive Team</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {executives.map((exec, index) => (
              <div key={index} className="border border-ash dark:border-ash/20 p-6 text-center">
                <div className="w-20 h-20 bg-ink dark:bg-ivory/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-xl font-bold text-ivory dark:text-ivory/80">{exec.initials}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-1">{exec.name}</h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-vermillion mb-3">{exec.title}</p>
                <p className="text-sm text-stone mb-4">{exec.bio}</p>
                <a
                  href={`mailto:${exec.contact}`}
                  className="inline-flex items-center font-mono text-xs text-gold hover:text-gold/80 transition-colors"
                >
                  Contact for Interviews
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-ink dark:bg-ivory/5 border-t-2 border-vermillion py-16">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <DivergenceMark size={32} className="mb-6" color="var(--color-vermillion, #C62828)" />
                <h2 className="font-serif text-3xl font-bold text-ivory mb-4">Media Inquiries</h2>
                <p className="text-xl mb-6 text-ivory/60">
                  Get in touch with our press team for interviews, quotes, or additional information.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-ivory/40 mb-1">Press Contact</h3>
                    <a href="mailto:press@NewsTRNT.com" className="text-ivory/60 hover:text-ivory transition-colors">press@NewsTRNT.com</a>
                  </div>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-ivory/40 mb-1">General Inquiries</h3>
                    <a href="mailto:media@NewsTRNT.com" className="text-ivory/60 hover:text-ivory transition-colors">media@NewsTRNT.com</a>
                  </div>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-ivory/40 mb-1">Phone</h3>
                    <a href="tel:+1-555-0123" className="text-ivory/60 hover:text-ivory transition-colors">+1 (555) 012-3456</a>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-serif text-xl font-bold text-ivory mb-4">Quick Facts</h3>
                <div className="space-y-3 text-sm text-ivory/60">
                  <div><span className="font-mono text-xs uppercase tracking-wider text-ivory/40">Founded:</span> <span className="ml-2">2022</span></div>
                  <div><span className="font-mono text-xs uppercase tracking-wider text-ivory/40">Headquarters:</span> <span className="ml-2">San Francisco, CA</span></div>
                </div>
                
                <div className="mt-6">
                  <Link href="/about" className="hover-magnetic bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase inline-block">
                    Learn More About Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressPage;
