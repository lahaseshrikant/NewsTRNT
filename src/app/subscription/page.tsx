"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for casual news readers',
      features: [
        'Access to basic news articles',
        'Limited personalization',
        'Standard reading experience',
        'Mobile-friendly interface',
        'Basic search functionality'
      ],
      limitations: [
        'Ads included',
        'Limited article access per day',
        'No offline reading',
        'No premium content'
      ],
      cta: 'Current Plan',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'Enhanced experience for news enthusiasts',
      features: [
        'Unlimited article access',
        'Advanced AI personalization',
        'Ad-free reading experience',
        'Offline reading & downloads',
        'Breaking news alerts',
        'Premium content & analysis',
        'Audio article summaries',
        'Priority customer support',
        'Dark mode & themes',
        'Advanced search & filters'
      ],
      limitations: [],
      cta: 'Upgrade to Premium',
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'For professionals who need comprehensive news intelligence',
      features: [
        'Everything in Premium',
        'Smart news insights',
        'Industry-specific feeds',
        'Real-time market data',
        'Expert analysis & reports',
        'Custom news alerts',
        'API access for developers',
        'White-label options',
        'Advanced analytics dashboard',
        'Priority feature requests',
        'Dedicated account manager',
        'Custom integrations'
      ],
      limitations: [],
      cta: 'Go Professional',
      popular: false
    }
  ];

  const features = [
    {
      icon: '🎯',
      title: 'Smart Personalization',
      description: 'Our intelligent system learns your preferences to deliver perfectly curated news content.'
    },
    {
      icon: '⚡',
      title: 'Real-Time Updates',
      description: 'Get breaking news alerts and real-time updates on stories that matter to you.'
    },
    {
      icon: '📱',
      title: 'Multi-Platform Access',
      description: 'Seamless reading experience across all your devices with cloud synchronization.'
    },
    {
      icon: '🔍',
      title: 'Advanced Search',
      description: 'Powerful search capabilities with filters, tags, and intelligent recommendations.'
    },
    {
      icon: '📊',
      title: 'Analytics & Insights',
      description: 'Track your reading habits and discover new topics based on your interests.'
    },
    {
      icon: '🎯',
      title: 'Fact-Checking',
      description: 'Rigorous fact-checking and source verification for reliable information.'
    }
  ];

  const faqs = [
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to premium features until the end of your billing period.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay/Google Pay for mobile users.'
    },
    {
      question: 'Is there a student discount available?',
      answer: 'Yes! Students with a valid .edu email address can get 50% off any premium plan. Contact our support team to apply the discount.'
    },
    {
      question: 'Can I switch between plans?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us for a full refund.'
    }
  ];

  const getSavingsPercentage = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
  <div className="container mx-auto py-12">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/" className="text-primary hover:text-primary/80 mb-6 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Choose Your NewsTRNT Plan
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Get personalized news that matches your interests with our smart news platform
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-card border border-border rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save {getSavingsPercentage()}%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
  <div className="container mx-auto py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 transition-all hover:shadow-lg ${
                  plan.popular
                    ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-foreground">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span className="text-muted-foreground">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>

                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <div className="text-sm text-green-600 mb-4">
                        Save ${(plan.price.monthly * 12) - plan.price.yearly} annually
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-foreground text-sm">{feature}</span>
                      </div>
                    ))}

                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-muted-foreground text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.id === 'free'
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-background border border-border text-foreground hover:bg-muted/50'
                    }`}
                    disabled={plan.id === 'free'}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-card border-y border-border py-16">
  <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Choose NewsTRNT Premium?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the future of news consumption with our advanced smart features
                designed to keep you informed and engaged.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
  <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center text-primary font-bold">
                  SJ
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-foreground">Sarah Johnson</div>
                  <div className="text-sm text-muted-foreground">Financial Analyst</div>
                </div>
              </div>
              <p className="text-muted-foreground text-justify">
                "NewsTRNT's AI personalization is incredible. It surfaces exactly the financial 
                and tech news I need for my work, saving me hours of searching through multiple sources."
              </p>
              <div className="flex text-yellow-400 mt-4">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center text-primary font-bold">
                  MR
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-foreground">Michael Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Entrepreneur</div>
                </div>
              </div>
              <p className="text-muted-foreground text-justify">
                "The professional plan's market insights and industry feeds are game-changers. 
                It's like having a personal news analyst working 24/7 for my business."
              </p>
              <div className="flex text-yellow-400 mt-4">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-card border-y border-border py-16">
  <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-background rounded-lg border border-border">
                  <summary className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                    <span className="font-semibold text-foreground">{faq.question}</span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground text-justify">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
  <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 border border-primary/20">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Need Help Choosing?</h3>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Sales
              </Link>
              <a
                href="mailto:sales@newstrnt.com"
                className="bg-background text-foreground border border-border px-6 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
