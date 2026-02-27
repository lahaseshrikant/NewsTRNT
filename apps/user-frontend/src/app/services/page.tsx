"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

const ServicesPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState('ai-curation');

  const services = [
    {
      id: 'ai-curation',
      title: 'Smart News Curation',
      description: 'Intelligent algorithms that personalize your news feed based on your interests, reading patterns, and preferences.',
      features: [
        'Personalized content recommendations',
        'Smart article filtering and ranking',
        'Real-time preference learning',
        'Multi-source content aggregation',
        'Bias detection and mitigation'
      ],
      pricing: 'Starting at $9.99/month',
      popular: true
    },
    {
      id: 'breaking-alerts',
      title: 'Breaking News Alerts',
      description: 'Stay ahead of the curve with instant notifications for breaking news, tailored to your interests and location.',
      features: [
        'Real-time push notifications',
        'Location-based alerts',
        'Category-specific filters',
        'Priority news ranking',
        'Cross-platform delivery'
      ],
      pricing: 'Free with Premium',
      popular: false
    },
    {
      id: 'api-access',
      title: 'Developer API',
      description: 'Integrate NewsTRNT\'s powerful news data and AI capabilities into your own applications and platforms.',
      features: [
        'RESTful API endpoints',
        'Real-time news feeds',
        'Article search and filtering',
        'Sentiment analysis',
        'Rate limiting and authentication'
      ],
      pricing: 'Starting at $99/month',
      popular: false
    },
    {
      id: 'analytics',
      title: 'News Analytics',
      description: 'Comprehensive insights into news trends, public sentiment, and content performance for businesses and researchers.',
      features: [
        'Trend analysis and forecasting',
        'Sentiment tracking',
        'Audience engagement metrics',
        'Custom reporting dashboards',
        'Data export capabilities'
      ],
      pricing: 'Custom pricing',
      popular: false
    },
    {
      id: 'white-label',
      title: 'White-Label Solutions',
      description: 'Complete news platform solutions for media companies, corporations, and organizations.',
      features: [
        'Customizable news platform',
        'Brand integration',
        'Content management system',
        'User authentication',
        'Mobile applications'
      ],
      pricing: 'Enterprise pricing',
      popular: false
    },
    {
      id: 'content-creation',
      title: 'Smart Content Tools',
      description: 'Automated content summarization, translation services, and editorial tools powered by advanced technology.',
      features: [
        'Article summarization',
        'Multi-language translation',
        'Content generation',
        'Fact-checking assistance',
        'Editorial workflow integration'
      ],
      pricing: 'Pay per use',
      popular: false
    }
  ];

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="hero-services border-b-2 border-vermillion">
        <div className="relative z-10 container mx-auto py-16">
          <div className="max-w-4xl mx-auto text-center">
            <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-70 mb-3 block">What We Offer</span>
            <h1 className="font-serif text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl opacity-60 mb-8">
              Powerful smart news solutions for individuals, businesses, and developers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="hover-magnetic bg-primary text-primary-foreground px-8 py-3 font-mono text-xs tracking-wider uppercase">
                Get Started
              </Link>
              <Link href="/developers" className="border border-current/20 px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-current/10 transition-colors">
                View API Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Solutions</p>
            <h2 className="font-serif text-3xl font-bold text-foreground">Choose Your Service</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`hover-lift border p-6 cursor-pointer transition-all ${
                  selectedService === service.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-foreground/40'
                } ${service.popular ? 'relative' : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-4">
                    <span className="bg-vermillion text-white px-3 py-1 font-mono text-[9px] uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">0{index + 1}</span>
                  <h3 className="font-serif text-xl font-bold text-foreground mt-2 mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg font-bold text-foreground">{service.pricing}</span>
                      <span className="font-mono text-xs text-vermillion hover:text-vermillion/80 cursor-pointer">Learn More &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Service Detail */}
      {selectedServiceData && (
        <div className="bg-muted/50 border-y border-border py-16">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">Featured</p>
                  <h2 className="font-serif text-3xl font-bold text-foreground mb-4">{selectedServiceData.title}</h2>
                  <p className="text-muted-foreground text-lg mb-6">{selectedServiceData.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-foreground">Key Features</h3>
                    <ul className="space-y-3">
                      {selectedServiceData.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link href="/contact" className="hover-magnetic bg-primary text-primary-foreground px-6 py-3 font-mono text-xs tracking-wider uppercase">
                      Get Quote
                    </Link>
                    <button className="border border-border text-foreground px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-muted/50 transition-colors">
                      Schedule Demo
                    </button>
                  </div>
                </div>
                
                <div className="bg-card border border-border p-8">
                  <div className="text-center">
                    <DivergenceMark size={48} className="mx-auto mb-4" color="var(--color-vermillion, #C62828)" />
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2">Ready to Get Started?</h3>
                    <p className="text-muted-foreground mb-6">
                      Contact our team to learn more about how {selectedServiceData.title.toLowerCase()} can benefit your organization.
                    </p>
                    <div className="space-y-3">
                      <Link href="/contact" className="block w-full bg-primary text-primary-foreground py-3 font-mono text-xs tracking-wider uppercase hover:bg-primary/90 transition-colors">
                        Contact Sales
                      </Link>
                      <a href="mailto:sales@NewsTRNT.com" className="block w-full text-muted-foreground hover:text-foreground font-mono text-xs transition-colors">
                        sales@NewsTRNT.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Early Access Note */}
      <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <div className="border border-border p-8 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3 block">Early Access</span>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">We&apos;re Still Building</h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
              Some of these services are in active development. We&apos;re working hard to bring you 
              the best tools and solutions. Interested in early access or partnership?
            </p>
            <Link href="/contact" className="inline-block bg-primary text-primary-foreground px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-primary/90 transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="hero-services border-t-2 border-vermillion py-16">
        <div className="relative z-10 container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <DivergenceMark size={32} className="mx-auto mb-6" color="var(--color-vermillion, #C62828)" />
            <h2 className="font-serif text-3xl font-bold mb-4">
              Ready to Transform Your News Experience?
            </h2>
            <p className="text-xl mb-8 opacity-60">
              Explore our growing suite of tools for readers, businesses, and developers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscription" className="hover-magnetic bg-primary text-primary-foreground px-8 py-3 font-mono text-xs tracking-wider uppercase">
                Start Free Trial
              </Link>
              <Link href="/contact" className="border border-current/20 px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-current/10 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
