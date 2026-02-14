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

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'TechCorp Media',
      role: 'Chief Digital Officer',
      quote: 'NewsTRNT\'s API has transformed how we deliver news to our customers. The smart curation is incredibly accurate.',
      initials: 'SJ'
    },
    {
      name: 'Michael Zhang',
      company: 'Global News Network',
      role: 'Head of Technology',
      quote: 'The white-label solution allowed us to launch our news platform in just 6 weeks. Exceptional service.',
      initials: 'MZ'
    },
    {
      name: 'Dr. Emily Rodriguez',
      company: 'Research Institute',
      role: 'Data Scientist',
      quote: 'The analytics platform provides insights we never had before. Essential for our media research projects.',
      initials: 'ER'
    }
  ];

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Hero */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">What We Offer</p>
            <h1 className="font-serif text-5xl font-bold text-ivory mb-6">Our Services</h1>
            <p className="text-xl text-ivory/60 mb-8">
              Powerful smart news solutions for individuals, businesses, and developers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="hover-magnetic bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase">
                Get Started
              </Link>
              <Link href="/developers" className="border border-ivory/20 text-ivory px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory/10 transition-colors">
                View API Docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Solutions</p>
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Choose Your Service</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`hover-lift border p-6 cursor-pointer transition-all ${
                  selectedService === service.id
                    ? 'border-vermillion bg-vermillion/5'
                    : 'border-ash dark:border-ash/20 hover:border-ink dark:hover:border-ivory/40'
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
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">0{index + 1}</span>
                  <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mt-2 mb-2">{service.title}</h3>
                  <p className="text-stone text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-ink dark:text-ivory/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-ash dark:border-ash/20 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg font-bold text-ink dark:text-ivory">{service.pricing}</span>
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
        <div className="bg-ivory dark:bg-ash/5 border-y border-ash dark:border-ash/20 py-16">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">Featured</p>
                  <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory mb-4">{selectedServiceData.title}</h2>
                  <p className="text-stone text-lg mb-6">{selectedServiceData.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-ink dark:text-ivory">Key Features</h3>
                    <ul className="space-y-3">
                      {selectedServiceData.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-ink dark:text-ivory/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link href="/contact" className="hover-magnetic bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase">
                      Get Quote
                    </Link>
                    <button className="border border-ash dark:border-ash/20 text-ink dark:text-ivory px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-paper dark:hover:bg-ash/10 transition-colors">
                      Schedule Demo
                    </button>
                  </div>
                </div>
                
                <div className="bg-ink dark:bg-ivory/5 border border-ash dark:border-ash/20 p-8">
                  <div className="text-center">
                    <DivergenceMark size={48} className="mx-auto mb-4" color="var(--color-vermillion, #C62828)" />
                    <h3 className="font-serif text-xl font-bold text-ivory mb-2">Ready to Get Started?</h3>
                    <p className="text-ivory/60 mb-6">
                      Contact our team to learn more about how {selectedServiceData.title.toLowerCase()} can benefit your organization.
                    </p>
                    <div className="space-y-3">
                      <Link href="/contact" className="block w-full bg-vermillion text-white py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors">
                        Contact Sales
                      </Link>
                      <a href="mailto:sales@NewsTRNT.com" className="block w-full text-ivory/60 hover:text-ivory font-mono text-xs transition-colors">
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

      {/* Testimonials */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Testimonials</p>
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">What Our Clients Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="border border-ash dark:border-ash/20 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-ink dark:bg-ivory/10 flex items-center justify-center mr-4">
                    <span className="font-serif text-sm font-bold text-ivory">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-ink dark:text-ivory">{testimonial.name}</h4>
                    <p className="text-sm text-stone">{testimonial.role}</p>
                    <p className="text-sm text-vermillion">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-stone text-sm italic leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex text-gold mt-4 font-mono text-xs tracking-wider">
                  &#9733; &#9733; &#9733; &#9733; &#9733;
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-ink dark:bg-ivory/5 border-t-2 border-vermillion py-16">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <DivergenceMark size={32} className="mx-auto mb-6" color="var(--color-vermillion, #C62828)" />
            <h2 className="font-serif text-3xl font-bold text-ivory mb-4">
              Ready to Transform Your News Experience?
            </h2>
            <p className="text-xl mb-8 text-ivory/60">
              Join thousands of satisfied customers who trust NewsTRNT for their news and data needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscription" className="hover-magnetic bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase">
                Start Free Trial
              </Link>
              <Link href="/contact" className="border border-ivory/20 text-ivory px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory/10 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
