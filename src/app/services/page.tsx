"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ServicesPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState('ai-curation');

  const services = [
    {
      id: 'ai-curation',
      title: 'AI News Curation',
      description: 'Advanced artificial intelligence algorithms that personalize your news feed based on your interests, reading patterns, and preferences.',
      icon: '🤖',
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
      icon: '🚨',
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
      icon: '💻',
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
      icon: '📊',
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
      icon: '🏢',
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
      title: 'AI Content Creation',
      description: 'Automated content generation, summarization, and translation services powered by advanced language models.',
      icon: '✍️',
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
      quote: 'NewsTRNT\'s API has transformed how we deliver news to our customers. The AI curation is incredibly accurate.',
      avatar: '/api/placeholder/100/100'
    },
    {
      name: 'Michael Zhang',
      company: 'Global News Network',
      role: 'Head of Technology',
      quote: 'The white-label solution allowed us to launch our news platform in just 6 weeks. Exceptional service.',
      avatar: '/api/placeholder/100/100'
    },
    {
      name: 'Dr. Emily Rodriguez',
      company: 'Research Institute',
      role: 'Data Scientist',
      quote: 'The analytics platform provides insights we never had before. Essential for our media research projects.',
      avatar: '/api/placeholder/100/100'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              NewsTRNT Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Powerful AI-driven news solutions for individuals, businesses, and developers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Get Started
              </Link>
              <Link
                href="/developers"
                className="bg-background border border-border text-foreground px-8 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium"
              >
                View API Docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our comprehensive suite of news and AI-powered services designed to meet your specific needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-card rounded-lg border transition-all hover:shadow-lg cursor-pointer ${
                  selectedService === service.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                } ${service.popular ? 'relative' : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">{service.pricing}</span>
                      <button className="text-primary hover:text-primary/80 font-medium text-sm">
                        Learn More →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Service Detail */}
      <div className="bg-card border-y border-border py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {services.map((service) => (
              selectedService === service.id && (
                <div key={service.id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="text-5xl mb-6">{service.icon}</div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">{service.title}</h2>
                    <p className="text-muted-foreground mb-6 text-lg">{service.description}</p>
                    
                    <div className="space-y-4 mb-8">
                      <h3 className="text-xl font-semibold text-foreground">Key Features:</h3>
                      <ul className="space-y-3">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex gap-4">
                      <Link
                        href="/contact"
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      >
                        Get Quote
                      </Link>
                      <button className="border border-border text-foreground px-6 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium">
                        Schedule Demo
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">{service.icon}</div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Ready to Get Started?</h3>
                      <p className="text-muted-foreground mb-6">
                        Contact our team to learn more about how {service.title.toLowerCase()} can benefit your organization.
                      </p>
                      <div className="space-y-3">
                        <Link
                          href="/contact"
                          className="block w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          Contact Sales
                        </Link>
                        <a
                          href="mailto:sales@NewsTRNT.com"
                          className="block w-full text-primary hover:text-primary/80 font-medium"
                        >
                          sales@NewsTRNT.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground">
              Trusted by leading organizations worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-primary">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-justify italic">"{testimonial.quote}"</p>
                <div className="flex text-yellow-400 mt-4">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your News Experience?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Join thousands of satisfied customers who trust NewsTRNT for their news and data needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/subscription"
                className="bg-primary-foreground text-primary px-8 py-3 rounded-lg hover:bg-primary-foreground/90 transition-colors font-medium"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary-foreground hover:text-primary transition-colors font-medium"
              >
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
