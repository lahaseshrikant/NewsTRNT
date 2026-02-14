"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/DivergenceMark';
import ContactInfo from '@/components/ContactInfo';
import { siteConfig, getContactByDepartment } from '@/config/site';

const AdvertisePage: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState('premium');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [brandFiles, setBrandFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'ad' | 'brand') => {
    const files = Array.from(event.target.files || []);
    if (type === 'ad') {
      setUploadedFiles(prev => [...prev, ...files]);
    } else {
      setBrandFiles(files);
    }
  };

  const removeFile = (index: number, type: 'ad' | 'brand') => {
    if (type === 'ad') {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setBrandFiles([]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you! Your advertising proposal has been submitted. We\'ll contact you within 2-3 business days.');
    }, 2000);
  };

  const advertisingPackages = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$500',
      period: '/mo',
      description: 'Perfect for small businesses getting started',
      features: [
        '50,000 monthly impressions',
        'Display ads only',
        'Basic targeting options',
        'Standard support',
        'Monthly reporting'
      ],
      bestFor: 'Small businesses, local services'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$2,500',
      period: '/mo',
      description: 'Comprehensive advertising solution',
      popular: true,
      features: [
        '250,000 monthly impressions',
        'Display and native ads',
        'Advanced targeting',
        'A/B testing capabilities',
        'Priority support',
        'Weekly reporting',
        'Custom ad formats'
      ],
      bestFor: 'Growing companies, B2B services'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Tailored solutions for large organizations',
      features: [
        'Unlimited impressions',
        'All ad formats',
        'Custom targeting',
        'Dedicated account manager',
        '24/7 support',
        'Real-time reporting',
        'White-label options',
        'API integration'
      ],
      bestFor: 'Large enterprises, agencies'
    }
  ];

  const adFormats = [
    {
      name: 'Banner Ads',
      description: 'Traditional display advertising in various sizes',
      sizes: ['728x90', '300x250', '320x50', '970x250'],
    },
    {
      name: 'Native Ads',
      description: 'Seamlessly integrated content matching our editorial style',
      sizes: ['In-feed', 'Content recommendation', 'Sponsored articles'],
    },
    {
      name: 'Video Ads',
      description: 'Engaging video content for maximum impact',
      sizes: ['Pre-roll', 'Mid-roll', 'Out-stream'],
    },
    {
      name: 'Newsletter Sponsorship',
      description: 'Featured placement in our daily and weekly newsletters',
      sizes: ['Header banner', 'Inline content', 'Footer placement'],
    }
  ];

  const audienceData = [
    { metric: 'Daily Active Readers', value: '2.5M+' },
    { metric: 'Avg. Time on Site', value: '8 min' },
    { metric: 'Newsletter Subscribers', value: '850K' },
    { metric: 'Countries Reached', value: '140+' }
  ];

  const demographics = [
    { category: 'Reader Age Distribution', data: [
      { label: '18–24', percentage: 15 },
      { label: '25–34', percentage: 35 },
      { label: '35–44', percentage: 28 },
      { label: '45–54', percentage: 15 },
      { label: '55+', percentage: 7 }
    ]},
    { category: 'Top Interest Categories', data: [
      { label: 'Technology', percentage: 45 },
      { label: 'Business & Finance', percentage: 38 },
      { label: 'Politics & Policy', percentage: 32 },
      { label: 'Science & Innovation', percentage: 28 },
      { label: 'Health & Wellness', percentage: 25 }
    ]}
  ];

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* ── Hero ── */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion relative overflow-hidden">
        {/* Subtle gradient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-vermillion/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gold/5 rounded-full filter blur-[100px]" />

        <div className="container mx-auto py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-4">Partner With Us</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-ivory mb-6">
              Advertise with NewsTRNT
            </h1>
            <p className="text-xl text-ivory/60 max-w-2xl mx-auto mb-10">
              Place your brand alongside trusted, AI-curated journalism — and reach millions of engaged, high-intent readers every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <a href="#proposal-form" className="hover-magnetic bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase">
                Start a Campaign
              </a>
              <a href="#packages" className="border border-ivory/20 text-ivory px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory/10 transition-colors">
                View Packages
              </a>
            </div>
            <div className="flex items-center justify-center space-x-8 text-ivory/40 font-mono text-[10px] uppercase tracking-wider">
              <span>140+ Countries</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>2.5M+ Daily Readers</span>
              <span className="w-1 h-1 bg-vermillion rounded-full" />
              <span>Brand-Safe Environment</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Audience Overview ── */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">By the Numbers</p>
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Our Audience</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {audienceData.map((item, index) => (
              <div key={index} className="hover-lift border border-ash dark:border-ash/20 p-6 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">0{index + 1}</span>
                <div className="font-serif text-3xl font-bold text-ink dark:text-ivory mt-2 mb-1">{item.value}</div>
                <div className="font-mono text-xs text-stone tracking-wider">{item.metric}</div>
              </div>
            ))}
          </div>

          {/* Demographics */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {demographics.map((demo, index) => (
              <div key={index} className="border border-ash dark:border-ash/20 p-8">
                <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-6">{demo.category}</h3>
                <div className="space-y-4">
                  {demo.data.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-ink dark:text-ivory/80">{item.label}</span>
                        <span className="font-mono text-[10px] text-stone">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-ash/30 dark:bg-ash/10 h-1.5">
                        <div
                          className="bg-vermillion h-1.5 transition-all duration-700"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Ad Formats ── */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Formats</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Advertising Formats</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adFormats.map((format, index) => (
                <div key={index} className="hover-lift border border-ash dark:border-ash/20 p-6 group">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone mt-1">0{index + 1}</span>
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-2 group-hover:text-vermillion transition-colors">{format.name}</h3>
                      <p className="text-stone text-sm mb-4">{format.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {format.sizes.map((size, idx) => (
                          <span key={idx} className="font-mono text-[10px] uppercase tracking-wider text-stone border border-ash dark:border-ash/20 px-2 py-1">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Packages ── */}
          <div id="packages" className="mb-16 scroll-mt-8">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Investment</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Advertising Packages</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {advertisingPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative hover-lift border-2 p-8 cursor-pointer transition-all ${
                    pkg.popular
                      ? 'border-vermillion bg-vermillion/5'
                      : selectedPackage === pkg.id
                        ? 'border-ink dark:border-ivory'
                        : 'border-ash dark:border-ash/20 hover:border-ink dark:hover:border-ivory/40'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-vermillion text-white px-3 py-1 font-mono text-[9px] uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-2">{pkg.name}</h3>
                    <div className="mb-2">
                      <span className="font-serif text-3xl font-bold text-ink dark:text-ivory">{pkg.price}</span>
                      <span className="font-mono text-xs text-stone ml-1">{pkg.period}</span>
                    </div>
                    <p className="text-stone text-sm">{pkg.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-ink dark:text-ivory/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-ash dark:border-ash/20 pt-4 mb-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-stone mb-1">Best for</div>
                    <div className="text-sm font-medium text-ink dark:text-ivory">{pkg.bestFor}</div>
                  </div>

                  <button
                    className={`w-full py-3 font-mono text-xs tracking-wider uppercase transition-colors ${
                      pkg.popular
                        ? 'bg-vermillion text-white hover:bg-vermillion/90'
                        : 'border border-ash dark:border-ash/20 text-ink dark:text-ivory hover:bg-ash/10'
                    }`}
                  >
                    {pkg.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Why Advertise ── */}
          <div className="bg-ivory dark:bg-ash/5 border-y border-ash dark:border-ash/20 -mx-4 px-4 py-16 mb-16">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">The Advantage</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Why Advertise with NewsTRNT?</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { num: '01', title: 'Precise Targeting', description: 'Reach your exact audience with advanced demographic and interest-based targeting powered by AI' },
                { num: '02', title: 'High Engagement', description: 'Our readers spend an average of 8 minutes per session — well above industry benchmarks' },
                { num: '03', title: 'Brand Safety', description: 'Your ads appear alongside high-quality, fact-checked, editorially trusted news content' },
                { num: '04', title: 'Real-Time Analytics', description: 'Comprehensive dashboards with live performance tracking and actionable insights' }
              ].map((benefit) => (
                <div key={benefit.num} className="text-center">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">{benefit.num}</span>
                  <h3 className="font-serif text-lg font-bold text-ink dark:text-ivory mt-2 mb-2">{benefit.title}</h3>
                  <p className="text-stone text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Trusted By Banner ── */}
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone mb-6">Trusted By Leading Brands</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-stone/40 font-serif text-xl italic">
              <span>TechCorp</span>
              <span className="w-1 h-1 bg-ash rounded-full" />
              <span>FinanceDaily</span>
              <span className="w-1 h-1 bg-ash rounded-full" />
              <span>HealthPlus</span>
              <span className="w-1 h-1 bg-ash rounded-full" />
              <span>EduGlobal</span>
              <span className="w-1 h-1 bg-ash rounded-full" />
              <span>MediaVerse</span>
            </div>
          </div>

          {/* ── Proposal Form ── */}
          <div id="proposal-form" className="scroll-mt-8">
            <div className="bg-ink dark:bg-ivory/5 border-2 border-vermillion p-10 md:p-14">
              <div className="text-center mb-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">Get Started</p>
                <h2 className="font-serif text-3xl font-bold text-ivory mb-2">Submit Your Proposal</h2>
                <p className="text-ivory/50 text-sm max-w-lg mx-auto">
                  Tell us about your brand and campaign goals. Our advertising team will craft a strategy tailored to your needs.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
                {/* Company & Industry */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-4">Company Details</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Company Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory placeholder-ivory/30 focus:outline-none focus:border-vermillion transition-colors"
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Industry</label>
                      <select className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory focus:outline-none focus:border-vermillion transition-colors [&>option]:bg-ink [&>option]:text-ivory">
                        <option value="">Select industry</option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-4">Contact Information</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Contact Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory placeholder-ivory/30 focus:outline-none focus:border-vermillion transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory placeholder-ivory/30 focus:outline-none focus:border-vermillion transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget & Goals */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-4">Campaign Brief</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Monthly Budget</label>
                      <select className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory focus:outline-none focus:border-vermillion transition-colors [&>option]:bg-ink [&>option]:text-ivory">
                        <option value="">Select budget range</option>
                        <option value="500-1000">$500 – $1,000</option>
                        <option value="1000-5000">$1,000 – $5,000</option>
                        <option value="5000-10000">$5,000 – $10,000</option>
                        <option value="10000+">$10,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Campaign Goals</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory placeholder-ivory/30 focus:outline-none focus:border-vermillion transition-colors resize-none"
                        placeholder="Tell us about your advertising goals and target audience..."
                      />
                    </div>
                  </div>
                </div>

                {/* Campaign Duration */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-4">Timeline</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory focus:outline-none focus:border-vermillion transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Duration</label>
                      <select className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory focus:outline-none focus:border-vermillion transition-colors [&>option]:bg-ink [&>option]:text-ivory">
                        <option value="">Select duration</option>
                        <option value="1-week">1 Week</option>
                        <option value="2-weeks">2 Weeks</option>
                        <option value="1-month">1 Month</option>
                        <option value="3-months">3 Months</option>
                        <option value="6-months">6 Months</option>
                        <option value="ongoing">Ongoing</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ad Format Selection */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-4">Preferred Formats</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Banner Ads', 'Native Ads', 'Sponsored Articles', 'Newsletter Ads', 'Video Ads', 'Social Media'].map((format) => (
                      <label key={format} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="accent-vermillion w-4 h-4"
                        />
                        <span className="text-sm text-ivory/70 group-hover:text-ivory transition-colors">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Uploads */}
                <div className="space-y-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Materials</p>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">
                      Ad Creative Files
                      <span className="text-ivory/30 ml-2 normal-case tracking-normal">Images, Videos, Banners</span>
                    </label>
                    <div className="border-2 border-dashed border-ivory/20 p-8 text-center hover:border-vermillion/50 transition-colors group">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf"
                        className="hidden"
                        id="ad-files"
                        onChange={(e) => handleFileUpload(e, 'ad')}
                      />
                      <label htmlFor="ad-files" className="cursor-pointer">
                        <div className="space-y-2">
                          <svg className="w-8 h-8 mx-auto text-ivory/30 group-hover:text-vermillion transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
                          </svg>
                          <div className="text-ivory/50 text-sm">Drop files here or click to browse</div>
                          <div className="font-mono text-[10px] text-ivory/30">
                            {[...siteConfig.technical.supportedFormats.images, ...siteConfig.technical.supportedFormats.videos, 'PDF'].join(', ')} (Max {siteConfig.technical.maxFileSize})
                          </div>
                        </div>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ivory/60">Uploaded Files:</p>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between border border-ivory/10 px-3 py-2">
                            <span className="text-sm text-ivory/70 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index, 'ad')}
                              className="text-vermillion hover:text-vermillion/70 ml-2 font-mono text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">
                      Brand Guidelines
                      <span className="text-ivory/30 ml-2 normal-case tracking-normal">Optional — PDF, DOC</span>
                    </label>
                    <div className="border-2 border-dashed border-ivory/20 p-6 text-center hover:border-gold/50 transition-colors group">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        id="brand-files"
                        onChange={(e) => handleFileUpload(e, 'brand')}
                      />
                      <label htmlFor="brand-files" className="cursor-pointer">
                        <div className="space-y-1">
                          <svg className="w-6 h-6 mx-auto text-ivory/30 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="text-sm text-ivory/50">Upload brand guidelines or media kit</div>
                        </div>
                      </label>
                    </div>

                    {brandFiles.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between border border-ivory/10 px-3 py-2">
                          <span className="text-sm text-ivory/70 truncate">{brandFiles[0].name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(0, 'brand')}
                            className="text-vermillion hover:text-vermillion/70 ml-2 font-mono text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-4">Target Audience</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Age Range</label>
                      <select className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory focus:outline-none focus:border-vermillion transition-colors [&>option]:bg-ink [&>option]:text-ivory">
                        <option value="">Select age range</option>
                        <option value="18-24">18–24</option>
                        <option value="25-34">25–34</option>
                        <option value="35-44">35–44</option>
                        <option value="45-54">45–54</option>
                        <option value="55+">55+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Geographic Location</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory placeholder-ivory/30 focus:outline-none focus:border-vermillion transition-colors"
                        placeholder="e.g., United States, Europe, Global"
                      />
                    </div>
                  </div>
                </div>

                {/* Website URL */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Website / Landing Page URL</label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory placeholder-ivory/30 focus:outline-none focus:border-vermillion transition-colors"
                    placeholder="https://your-website.com"
                  />
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-ivory/60 mb-2">Additional Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-transparent border border-ivory/20 text-ivory placeholder-ivory/30 focus:outline-none focus:border-vermillion transition-colors resize-none"
                    placeholder="Any specific requirements, restrictions, or additional information..."
                  />
                </div>

                {/* Terms */}
                <div className="border-t border-ivory/10 pt-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 accent-vermillion w-4 h-4"
                    />
                    <span className="text-sm text-ivory/50 group-hover:text-ivory/70 transition-colors">
                      I agree to the{' '}
                      <Link href={siteConfig.legal.termsUrl} className="text-vermillion hover:text-vermillion/80 underline underline-offset-2">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href={siteConfig.legal.privacyUrl} className="text-vermillion hover:text-vermillion/80 underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      . I understand that {siteConfig.name} will review my application and contact me within {siteConfig.business.responseTime.advertising}.
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="hover-magnetic w-full bg-vermillion text-white py-4 font-mono text-xs tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                        <span>Submitting&hellip;</span>
                      </>
                    ) : (
                      <span>Submit Advertising Proposal</span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="w-full border border-ivory/20 text-ivory/60 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory/5 disabled:opacity-50 transition-colors"
                  >
                    Save as Draft
                  </button>
                </div>

                {/* Help links */}
                <div className="border-t border-ivory/10 pt-6 text-center">
                  <p className="text-sm text-ivory/40 mb-4">
                    Need help planning your campaign? Our team is here to assist.
                  </p>
                  <div className="flex justify-center gap-6 font-mono text-xs uppercase tracking-wider">
                    {siteConfig.features.liveChat && (
                      <Link href="/contact" className="text-ivory/40 hover:text-vermillion transition-colors">
                        Live Chat
                      </Link>
                    )}
                    <Link href={`tel:${getContactByDepartment('support').phone}`} className="text-ivory/40 hover:text-vermillion transition-colors">
                      Call Us
                    </Link>
                    <Link href="/advertise/faq" className="text-ivory/40 hover:text-vermillion transition-colors">
                      FAQ
                    </Link>
                  </div>
                </div>
              </form>

              <div className="mt-10 border-t border-ivory/10 pt-8 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/40 mb-4">
                  Or contact our advertising team directly
                </p>
                <ContactInfo
                  department="advertising"
                  showBusinessHours={true}
                  showResponseTime={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisePage;
