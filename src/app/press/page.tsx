"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';

const PressPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Use dynamic categories for navigation links if needed
  const { categories: dynamicCategories } = useCategories();

  const pressReleases = [
    {
      id: 1,
      title: 'NewsTRNT Raises $50M Series B to Revolutionize AI-Powered News Curation',
      date: '2024-01-15',
      category: 'funding',
      excerpt: 'Leading news platform secures funding to expand AI capabilities and global reach, serving millions of users worldwide.',
      downloadUrl: '/press/NewsTRNT-series-b-announcement.pdf'
    },
    {
      id: 2,
      title: 'NewsTRNT Launches Advanced AI Fact-Checking Feature',
      date: '2024-01-10',
      category: 'product',
      excerpt: 'New AI-powered fact-checking system helps users identify misinformation and verify news sources in real-time.',
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
      excerpt: 'Recognition for outstanding innovation in AI-powered news curation and personalization technology.',
      downloadUrl: '/press/NewsTRNT-tech-innovation-award.pdf'
    },
    {
      id: 5,
      title: 'NewsTRNT Surpasses 10 Million Active Users Milestone',
      date: '2023-12-15',
      category: 'milestones',
      excerpt: 'Platform growth accelerates as more users adopt AI-curated news consumption for personalized information.',
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
      items: ['Desktop App', 'Mobile App', 'Admin Dashboard', 'API Interface'],
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
    {
      year: '2024',
      award: 'Best News App',
      organization: 'Tech Innovation Awards',
      description: 'Recognized for outstanding AI innovation in news curation'
    },
    {
      year: '2023',
      award: 'AI Excellence Award',
      organization: 'Digital Media Summit',
      description: 'Excellence in artificial intelligence application for media'
    },
    {
      year: '2023',
      award: 'Startup of the Year',
      organization: 'Media Tech Conference',
      description: 'Outstanding achievement in media technology innovation'
    },
    {
      year: '2023',
      award: 'Users Choice Award',
      organization: 'App Store Awards',
      description: 'Most loved news application by users worldwide'
    }
  ];

  const executives = [
    {
      name: 'Sarah Chen',
      title: 'CEO & Co-founder',
      bio: 'Former VP of Product at major tech company with 15+ years in media and technology. Expert in product strategy and AI implementation.',
      photo: '/api/placeholder/200/200',
      contact: 'sarah.chen@NewsTRNT.com'
    },
    {
      name: 'Marcus Johnson',
      title: 'CTO & Co-founder',
      bio: 'AI researcher with 10+ years experience at Google and OpenAI. Leading expert in natural language processing and machine learning.',
      photo: '/api/placeholder/200/200',
      contact: 'marcus.johnson@NewsTRNT.com'
    },
    {
      name: 'Elena Rodriguez',
      title: 'VP of Engineering',
      bio: 'Full-stack engineer and tech lead with expertise in scalable systems. Previously built infrastructure at Netflix and Spotify.',
      photo: '/api/placeholder/200/200',
      contact: 'elena.rodriguez@NewsTRNT.com'
    }
  ];

  const companyStats = [
    { label: 'Active Users', value: '10M+', description: 'Monthly active users worldwide' },
    { label: 'News Sources', value: '2,000+', description: 'Trusted news outlets and publishers' },
    { label: 'Articles Processed', value: '1M+', description: 'Articles analyzed daily by AI' },
    { label: 'Countries', value: '50+', description: 'Countries with active users' },
    { label: 'Languages', value: '25+', description: 'Supported languages for news content' },
    { label: 'Accuracy Rate', value: '95%+', description: 'AI curation accuracy rating' }
  ];

  const categories = [
    { id: 'all', name: 'All Press Releases', count: pressReleases.length },
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
  <div className="container mx-auto py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Press & Media
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Latest news, press releases, and media resources from NewsTRNT
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:press@NewsTRNT.com"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Media Inquiries
              </a>
              <a
                href="#media-kit"
                className="bg-background border border-border text-foreground px-8 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium"
              >
                Download Media Kit
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Company Stats */}
  <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">NewsTRNT by the Numbers</h2>
            <p className="text-muted-foreground">Our impact on the news industry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyStats.map((stat, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{stat.label}</h3>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Press Releases */}
      <div className="bg-card border-y border-border py-16">
  <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Press Releases</h2>
              <p className="text-muted-foreground">Latest company announcements and news</p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border text-foreground hover:bg-muted/50'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Press Release List */}
            <div className="space-y-6">
              {filteredReleases.map((release) => (
                <div key={release.id} className="bg-background rounded-lg border border-border p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize">
                          {release.category}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(release.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-3">{release.title}</h3>
                      <p className="text-muted-foreground mb-4">{release.excerpt}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:ml-6">
                      <a
                        href={release.downloadUrl}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium text-center text-sm"
                        download
                      >
                        Download PDF
                      </a>
                      <button className="border border-border text-foreground px-6 py-2 rounded-lg hover:bg-muted/50 transition-colors font-medium text-sm">
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Media Kit</h2>
            <p className="text-muted-foreground">Everything you need to cover NewsTRNT</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mediaKit.map((kit, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">{kit.title}</h3>
                <p className="text-muted-foreground mb-4">{kit.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {kit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-foreground">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <a
                  href={kit.downloadUrl}
                  className="block w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-center"
                  download
                >
                  Download Package
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards & Recognition */}
      <div className="bg-card border-y border-border py-16">
  <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Awards & Recognition</h2>
              <p className="text-muted-foreground">Industry recognition for our innovation and impact</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {awards.map((award, index) => (
                <div key={index} className="bg-background rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-2xl">🏆</div>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {award.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{award.award}</h3>
                  <p className="text-primary font-medium mb-2">{award.organization}</p>
                  <p className="text-sm text-muted-foreground">{award.description}</p>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Executive Team</h2>
            <p className="text-muted-foreground">Meet the leaders driving our mission</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {executives.map((exec, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-6 text-center">
                <Image
                  src={exec.photo}
                  alt={exec.name}
                  width={150}
                  height={150}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-foreground mb-1">{exec.name}</h3>
                <p className="text-primary font-medium mb-3">{exec.title}</p>
                <p className="text-sm text-muted-foreground mb-4 text-left">{exec.bio}</p>
                <a
                  href={`mailto:${exec.contact}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
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

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
  <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Media Inquiries</h2>
                <p className="text-xl mb-6 text-primary-foreground/80">
                  Get in touch with our press team for interviews, quotes, or additional information.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">Press Contact</h3>
                    <a href="mailto:press@NewsTRNT.com" className="text-primary-foreground/80 hover:text-primary-foreground">
                      press@NewsTRNT.com
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">General Inquiries</h3>
                    <a href="mailto:media@NewsTRNT.com" className="text-primary-foreground/80 hover:text-primary-foreground">
                      media@NewsTRNT.com
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:+1-555-0123" className="text-primary-foreground/80 hover:text-primary-foreground">
                      +1 (555) 012-3456
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Founded:</span> 2022
                  </div>
                  <div>
                    <span className="font-medium">Headquarters:</span> San Francisco, CA
                  </div>
                  <div>
                    <span className="font-medium">Employees:</span> 150+
                  </div>
                  <div>
                    <span className="font-medium">Funding:</span> Series B, $50M
                  </div>
                  <div>
                    <span className="font-medium">Users:</span> 10M+ monthly active
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link
                    href="/about"
                    className="bg-primary-foreground text-primary px-6 py-3 rounded-lg hover:bg-primary-foreground/90 transition-colors font-medium inline-block"
                  >
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
