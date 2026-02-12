"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/DivergenceMark';
import { ArrowRightIcon } from '@/components/icons/EditorialIcons';

const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Reader',
      subtitle: 'The Daily Briefing',
      price: { monthly: 0, yearly: 0 },
      description: 'Stay informed with the essentials',
      features: [
        'Access to daily headlines',
        'Basic personalization',
        'Standard reading experience',
        'Mobile-friendly interface',
        'Basic search',
      ],
      limitations: [
        'Ad-supported experience',
        'Limited daily articles',
        'No offline reading',
      ],
      cta: 'Current Plan',
      popular: false,
    },
    {
      id: 'premium',
      name: 'Correspondent',
      subtitle: 'The Full Picture',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'For readers who demand the complete story',
      features: [
        'Unlimited article access',
        'AI-curated news feed',
        'Ad-free reading',
        'Offline reading & downloads',
        'Breaking news alerts',
        'Deep-dive analysis',
        'Audio summaries',
        'Priority support',
        'Advanced search & filters',
      ],
      limitations: [],
      cta: 'Become a Correspondent',
      popular: true,
    },
    {
      id: 'professional',
      name: 'Editor',
      subtitle: 'The Intelligence Brief',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'Professional-grade news intelligence',
      features: [
        'Everything in Correspondent',
        'Industry-specific feeds',
        'Real-time market data',
        'Expert analysis & reports',
        'Custom news alerts',
        'API access',
        'Analytics dashboard',
        'Dedicated account manager',
        'Custom integrations',
      ],
      limitations: [],
      cta: 'Get Editor Access',
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. Cancel anytime and retain access through your billing period. No questions asked.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'All major credit cards, PayPal, and Apple Pay / Google Pay on mobile.',
    },
    {
      question: 'Is there a student discount?',
      answer: 'Students with a valid .edu email receive 50% off any plan. Contact support to apply.',
    },
    {
      question: 'Can I switch plans?',
      answer: 'Upgrade or downgrade at any time. Changes are prorated to your next billing cycle.',
    },
    {
      question: 'Do you offer refunds?',
      answer: '30-day money-back guarantee on all paid plans. No exceptions.',
    },
  ];

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyTotal = plan.price.monthly * 12;
    return Math.round(monthlyTotal - plan.price.yearly);
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-ash/40">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-stone text-sm hover:text-ink transition-colors mb-8">
              <ArrowRightIcon size={12} className="rotate-180" />
              Back to Headlines
            </Link>

            <DivergenceMark size={32} className="text-vermillion mx-auto mb-6" animated />

            <p className="kicker text-vermillion mb-3">Press Passes</p>
            <h1 className="font-serif text-4xl md:text-5xl text-ink leading-[1.1] mb-4 tracking-tight">
              Choose how you read the world
            </h1>
            <p className="text-stone text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-10">
              Every plan unlocks a different depth of understanding. The further you go, the more you see.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center border border-ash bg-ivory p-1 gap-0.5">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-ink text-ivory'
                    : 'text-stone hover:text-ink'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-ink text-ivory'
                    : 'text-stone hover:text-ink'
                }`}
              >
                Yearly
              </button>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-xs font-mono text-vermillion mt-2">Save up to 17% with annual billing</p>
            )}
          </div>
        </div>
      </header>

      {/* Plans */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border transition-all ${
                  plan.popular
                    ? 'border-ink bg-paper shadow-editorial-lg'
                    : 'border-ash/60 bg-paper hover:border-ink/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6">
                    <span className="font-mono text-[10px] uppercase tracking-widest bg-ink text-ivory px-3 py-1">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="mb-8">
                    <p className="kicker text-stone mb-1">{plan.subtitle}</p>
                    <h3 className="font-serif text-2xl text-ink mb-2">{plan.name}</h3>
                    <p className="text-stone text-sm">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-8 pb-8 border-b border-ash/40">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-4xl text-ink">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span className="text-stone text-sm">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <p className="text-xs font-mono text-vermillion mt-1">
                        Save ${getSavings(plan)} per year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="w-1 h-1 bg-ink rounded-full mt-2 flex-shrink-0" />
                        <span className="text-ink/80 text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <li key={`lim-${index}`} className="flex items-start gap-2.5">
                        <span className="w-1 h-1 bg-stone/40 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-stone/60 text-sm line-through decoration-stone/30">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className={`w-full py-3 text-sm font-medium tracking-wide transition-colors ${
                      plan.id === 'free'
                        ? 'border border-ash text-stone cursor-default'
                        : plan.popular
                        ? 'bg-ink text-ivory hover:bg-ink/90'
                        : 'border border-ink text-ink hover:bg-ink hover:text-ivory'
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
      </section>

      {/* The Promise */}
      <section className="bg-ivory border-y border-ash/40">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="editorial-rule mx-auto mb-8" />
            <h2 className="font-serif text-2xl md:text-3xl text-ink mb-4">
              Our promise to subscribers
            </h2>
            <p className="text-stone text-sm leading-relaxed mb-8 max-w-lg mx-auto">
              Every story we publish is fact-checked, every perspective is considered,
              and every subscriber gets the complete picture — not just the headlines.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-xl mx-auto">
              {[
                { label: 'Independent', desc: 'No corporate agenda' },
                { label: 'Fact-Checked', desc: 'Rigorous verification' },
                { label: 'Complete', desc: 'Every perspective' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-serif text-lg text-ink mb-0.5">{item.label}</p>
                  <p className="text-xs text-stone font-mono">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl text-ink text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-ash/40">
            {faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="py-5 cursor-pointer flex items-center justify-between text-ink hover:text-vermillion transition-colors">
                  <span className="text-sm font-medium pr-4">{faq.question}</span>
                  <span className="text-stone group-open:rotate-45 transition-transform text-lg flex-shrink-0">+</span>
                </summary>
                <div className="pb-5">
                  <p className="text-stone text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <DivergenceMark size={24} className="text-vermillion mx-auto mb-5" />
            <h2 className="font-serif text-2xl text-ivory mb-3">Still deciding?</h2>
            <p className="text-ivory/50 text-sm mb-8">
              Reach out to our team. We&apos;ll help you find the right level of access.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-vermillion text-ivory text-sm font-medium hover:bg-vermillion-dark transition-colors"
              >
                Contact Us
              </Link>
              <a
                href="mailto:press@newstrnt.com"
                className="px-6 py-3 border border-ivory/20 text-ivory/70 text-sm hover:text-ivory hover:border-ivory/40 transition-colors"
              >
                press@newstrnt.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPage;
