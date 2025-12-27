"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
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
    
    // Simulate form submission
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
      period: 'per month',
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
      period: 'per month',
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
      icon: '🖼️'
    },
    {
      name: 'Native Ads',
      description: 'Seamlessly integrated content that matches our editorial style',
      sizes: ['In-feed', 'Content recommendation', 'Sponsored articles'],
      icon: '📰'
    },
    {
      name: 'Video Ads',
      description: 'Engaging video content for maximum impact',
      sizes: ['Pre-roll', 'Mid-roll', 'Out-stream'],
      icon: '🎥'
    },
    {
      name: 'Newsletter Sponsorship',
      description: 'Featured placement in our daily and weekly newsletters',
      sizes: ['Header banner', 'Inline content', 'Footer placement'],
      icon: '📧'
    }
  ];

  // Professional value propositions instead of showing raw numbers
  const audienceData = [
    { metric: 'Targeted Reach', value: 'Engaged Readers', icon: '👥' },
    { metric: 'Quality Content', value: 'AI-Curated', icon: '📊' },
    { metric: 'Multi-Platform', value: 'Web & Mobile', icon: '📧' },
    { metric: 'Growing Audience', value: 'Expanding Daily', icon: '📱' }
  ];

  const demographics = [
    { category: 'Age', data: [
      { label: '18-24', percentage: 15 },
      { label: '25-34', percentage: 35 },
      { label: '35-44', percentage: 28 },
      { label: '45-54', percentage: 15 },
      { label: '55+', percentage: 7 }
    ]},
    { category: 'Interests', data: [
      { label: 'Technology', percentage: 45 },
      { label: 'Business', percentage: 38 },
      { label: 'Politics', percentage: 32 },
      { label: 'Science', percentage: 28 },
      { label: 'Health', percentage: 25 }
    ]}
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
  <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: 'Advertise with Us' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Advertise with NewsTRNT
            </h1>
            <p className="text-xl text-muted-foreground">
              Reach millions of engaged readers with our premium advertising solutions
            </p>
          </div>
        </div>
      </div>

      {/* Audience Overview */}
  <div className="container mx-auto py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Reach</h2>
            <p className="text-lg text-muted-foreground">
              Connect with our highly engaged, educated audience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {audienceData.map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-3xl font-bold text-primary mb-2">{item.value}</div>
                <div className="text-muted-foreground">{item.metric}</div>
              </div>
            ))}
          </div>

          {/* Demographics */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {demographics.map((demo, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">{demo.category}</h3>
                <div className="space-y-3">
                  {demo.data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-foreground">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-muted-foreground text-sm">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Ad Formats */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Advertising Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adFormats.map((format, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{format.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{format.name}</h3>
                      <p className="text-muted-foreground mb-3">{format.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {format.sizes.map((size, idx) => (
                          <span key={idx} className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm">
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

          {/* Packages */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Advertising Packages</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {advertisingPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-card rounded-lg border-2 p-6 ${
                    pkg.popular
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-border'
                  } transition-all`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{pkg.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-foreground">{pkg.price}</span>
                      <span className="text-muted-foreground text-sm"> {pkg.period}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{pkg.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-1">Best for:</div>
                    <div className="text-sm font-medium text-foreground">{pkg.bestFor}</div>
                  </div>

                  <button
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      pkg.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-background border border-border text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {pkg.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Why Advertise */}
          <div className="bg-card border border-border rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Why Advertise with NewsTRNT?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: '🎯',
                  title: 'Precise Targeting',
                  description: 'Reach your exact audience with advanced demographic and interest-based targeting'
                },
                {
                  icon: '📈',
                  title: 'High Engagement',
                  description: 'Our readers are highly engaged with quality content curated by AI technology'
                },
                {
                  icon: '💡',
                  title: 'Premium Content',
                  description: 'Your ads appear alongside high-quality, trusted news content'
                },
                {
                  icon: '📊',
                  title: 'Detailed Analytics',
                  description: 'Comprehensive reporting and real-time performance tracking'
                }
              ].map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Get Started Today</h2>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white dark:border-gray-600">
                    <option value="" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Select industry</option>
                    <option value="technology" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Technology</option>
                    <option value="finance" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Finance</option>
                    <option value="healthcare" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Healthcare</option>
                    <option value="education" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Education</option>
                    <option value="retail" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Retail</option>
                    <option value="other" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Monthly Budget</label>
                <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white dark:border-gray-600">
                  <option value="" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Select budget range</option>
                  <option value="500-1000" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">$500 - $1,000</option>
                  <option value="1000-5000" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">$1,000 - $5,000</option>
                  <option value="5000-10000" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">$5,000 - $10,000</option>
                  <option value="10000+" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">$10,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Campaign Goals</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us about your advertising goals and target audience..."
                ></textarea>
              </div>

              {/* Campaign Duration */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Campaign Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Campaign Duration</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white dark:border-gray-600">
                    <option value="" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Select duration</option>
                    <option value="1-week" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">1 Week</option>
                    <option value="2-weeks" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">2 Weeks</option>
                    <option value="1-month" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">1 Month</option>
                    <option value="3-months" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">3 Months</option>
                    <option value="6-months" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">6 Months</option>
                    <option value="ongoing" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Ongoing</option>
                  </select>
                </div>
              </div>

              {/* Ad Format Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preferred Ad Formats</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Banner Ads', 'Native Ads', 'Sponsored Articles', 'Newsletter Ads', 'Video Ads', 'Social Media'].map((format) => (
                    <label key={format} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground">Advertisement Materials</h4>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload Ad Creative Files
                    <span className="text-muted-foreground ml-1">(Images, Videos, Banners)</span>
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
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
                        <div className="text-4xl">📎</div>
                        <div className="text-foreground font-medium">Upload Files</div>
                        <div className="text-sm text-muted-foreground">
                          Drop files here or click to browse
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Supports: {[...siteConfig.technical.supportedFormats.images, ...siteConfig.technical.supportedFormats.videos, 'PDF'].join(', ')} (Max {siteConfig.technical.maxFileSize} each)
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {/* Display uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-foreground">Uploaded Files:</p>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm text-foreground truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'ad')}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Brand Guidelines / Media Kit
                    <span className="text-muted-foreground ml-1">(Optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="brand-files"
                      onChange={(e) => handleFileUpload(e, 'brand')}
                    />
                    <label htmlFor="brand-files" className="cursor-pointer">
                      <div className="space-y-1">
                        <div className="text-2xl">📋</div>
                        <div className="text-sm text-foreground">Upload Brand Guidelines</div>
                        <div className="text-xs text-muted-foreground">{siteConfig.technical.supportedFormats.documents.join(', ')}</div>
                      </div>
                    </label>
                  </div>
                  
                  {/* Display uploaded brand file */}
                  {brandFiles.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm text-foreground truncate">{brandFiles[0].name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(0, 'brand')}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Target Audience Demographics</label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Age Range</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white dark:border-gray-600">
                      <option value="" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">Select age range</option>
                      <option value="18-24" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">18-24</option>
                      <option value="25-34" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">25-34</option>
                      <option value="35-44" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">35-44</option>
                      <option value="45-54" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">45-54</option>
                      <option value="55+" className="bg-background text-foreground dark:bg-gray-800 dark:text-white">55+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Geographic Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., United States, Europe, Global"
                    />
                  </div>
                </div>
              </div>

              {/* Website/Landing Page */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Website/Landing Page URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://your-website.com"
                />
              </div>

              {/* Special Requirements */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Special Requirements or Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any specific requirements, restrictions, or additional information..."
                ></textarea>
              </div>

              {/* Terms and Conditions */}
              <div className="border-t border-border pt-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link href={siteConfig.legal.termsUrl} className="text-primary hover:text-primary/80 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href={siteConfig.legal.privacyUrl} className="text-primary hover:text-primary/80 underline">
                      Privacy Policy
                    </Link>
                    . I understand that {siteConfig.name} will review my application and contact me within {siteConfig.business.responseTime.advertising}.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Submit Advertising Proposal</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="w-full bg-muted text-muted-foreground py-3 px-6 rounded-md hover:bg-muted/80 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <span>💾</span>
                  <span>Save as Draft</span>
                </button>
              </div>

              {/* Additional Help */}
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Need help with your campaign? Our team is here to assist!
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  {siteConfig.features.liveChat && (
                    <Link href="/contact" className="text-primary hover:text-primary/80 flex items-center space-x-1">
                      <span>💬</span>
                      <span>Live Chat</span>
                    </Link>
                  )}
                  <Link href={`tel:${getContactByDepartment('support').phone}`} className="text-primary hover:text-primary/80 flex items-center space-x-1">
                    <span>📞</span>
                    <span>Call Us</span>
                  </Link>
                  <Link href="/advertise/faq" className="text-primary hover:text-primary/80 flex items-center space-x-1">
                    <span>❓</span>
                    <span>FAQ</span>
                  </Link>
                </div>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm mb-3">
                Or contact our advertising team directly:
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
  );
};

export default AdvertisePage;
