"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';
import { ArrowRightIcon } from '@/components/icons/EditorialIcons';

const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Reader',
      subtitle: 'The Daily Briefing',
      price: { monthly: 0, yearly: 0 },
      currency: '₹',
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
      price: { monthly: 199, yearly: 1999 },
      currency: '₹',
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
      price: { monthly: 499, yearly: 4999 },
      currency: '₹',
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

  // Exam-prep focused subscription for Indian competitive exams
  const examPrepPlans = [
    {
      id: 'upsc',
      name: 'UPSC Current Affairs',
      price: { monthly: 149, yearly: 1499 },
      currency: '₹',
      description: 'Daily current affairs curated for UPSC Civil Services aspirants',
      features: [
        'Daily UPSC-relevant current affairs digest',
        'Weekly compilations & monthly roundups',
        'Topic-wise categorization (Polity, Economy, IR, Science etc.)',
        'PIB, Yojana & Kurukshetra summaries',
        'Previous year question mapping',
        'Prelims & Mains oriented analysis',
      ],
    },
    {
      id: 'banking',
      name: 'Banking & SSC',
      price: { monthly: 99, yearly: 999 },
      currency: '₹',
      description: 'Targeted news coverage for Banking, SSC & Railway exam aspirants',
      features: [
        'Banking & financial current affairs',
        'Government schemes & policies digest',
        'Monthly static GK updates',
        'Appointment & awards tracker',
        'Budget & economic survey highlights',
        'Quick revision flashcards',
      ],
    },
    {
      id: 'state-psc',
      name: 'State PSC',
      price: { monthly: 129, yearly: 1299 },
      currency: '₹',
      description: 'State-level current affairs for BPSC, UPPSC, MPPSC & more',
      features: [
        'State-specific current affairs',
        'National & international news analysis',
        'State government schemes tracker',
        'Bilingual summaries (Hindi & English)',
        'District-wise important events',
        'Interview preparation resources',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. Cancel anytime and retain access through your billing period. No questions asked.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept UPI, all major credit/debit cards, net banking, and digital wallets.',
    },
    {
      question: 'Is there a student discount?',
      answer: 'Students with a valid .edu or .ac.in email receive 50% off any plan. Contact support to apply.',
    },
    {
      question: 'Can I switch plans?',
      answer: 'Upgrade or downgrade at any time. Changes are prorated to your next billing cycle.',
    },
    {
      question: 'Can I combine exam-prep with a regular plan?',
      answer: 'Yes! Combo discounts are available when you pair any exam-prep plan with Correspondent or Editor. Contact us for details.',
    },
    {
      question: 'Do you offer refunds?',
      answer: '7-day money-back guarantee on all paid plans. No exceptions.',
    },
  ];

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyTotal = plan.price.monthly * 12;
    return Math.round(monthlyTotal - plan.price.yearly);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors mb-8">
              <ArrowRightIcon size={12} className="rotate-180" />
              Back to Headlines
            </Link>

            <DivergenceMark size={32} className="text-vermillion mx-auto mb-6" animated />

            <p className="kicker text-vermillion mb-3">Press Passes</p>
            <h1 className="font-serif text-4xl md:text-5xl text-ink leading-[1.1] mb-4 tracking-tight">
              Choose how you read the world
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-10">
              Every plan unlocks a different depth of understanding. The further you go, the more you see.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center border border-border bg-muted p-1 gap-0.5">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
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
                    ? 'border-ink bg-background shadow-editorial-lg'
                    : 'border-border bg-background hover:border-foreground/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6">
                    <span className="font-mono text-[10px] uppercase tracking-widest bg-ink text-white px-3 py-1">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="mb-8">
                    <p className="kicker text-muted-foreground mb-1">{plan.subtitle}</p>
                    <h3 className="font-serif text-2xl text-ink mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-8 pb-8 border-b border-border">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-4xl text-ink">
                        {plan.currency}{plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span className="text-muted-foreground text-sm">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <p className="text-xs font-mono text-vermillion mt-1">
                        Save {plan.currency}{getSavings(plan)} per year
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
                        ? 'border border-border text-muted-foreground cursor-default'
                        : plan.popular
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'border border-foreground text-foreground hover:bg-foreground hover:text-background'
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

      {/* Exam Prep Plans */}
      <section className="bg-muted border-y border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3 block">For Aspirants</span>
              <h2 className="font-serif text-2xl md:text-3xl text-ink mb-3">
                Exam Prep Current Affairs
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                Curated current affairs packages designed specifically for Indian competitive exam aspirants.
                Stay ahead of your syllabus with daily digests and analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {examPrepPlans.map((plan) => (
                <div key={plan.id} className="border border-border bg-background p-8 hover:border-foreground/30 transition-all">
                  <h3 className="font-serif text-xl text-ink mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-border">
                    <span className="font-serif text-3xl text-ink">
                      {plan.currency}{plan.price[billingCycle]}
                    </span>
                    <span className="text-muted-foreground text-sm">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1 h-1 bg-vermillion rounded-full mt-2 flex-shrink-0" />
                        <span className="text-ink/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full py-3 text-sm font-medium tracking-wide border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors">
                    Subscribe
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground text-xs font-mono">
                All exam-prep plans include access to our daily news feed. Combo discounts available.{' '}
                <Link href="/contact" className="text-vermillion hover:text-vermillion/80 transition-colors">
                  Contact us
                </Link>{' '}
                for institutional pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Promise */}
      <section className="bg-muted border-y border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="editorial-rule mx-auto mb-8" />
            <h2 className="font-serif text-2xl md:text-3xl text-ink mb-4">
              Our promise to subscribers
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-lg mx-auto">
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
                  <p className="text-xs text-muted-foreground font-mono">{item.desc}</p>
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
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg flex-shrink-0">+</span>
                </summary>
                <div className="pb-5">
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
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
            <h2 className="font-serif text-2xl text-white mb-3">Still deciding?</h2>
            <p className="text-white/50 text-sm mb-8">
              Reach out to our team. We&apos;ll help you find the right level of access.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-vermillion text-white text-sm font-medium hover:bg-vermillion-dark transition-colors"
              >
                Contact Us
              </Link>
              <a
                href="mailto:press@newstrnt.com"
                className="px-6 py-3 border border-white/20 text-white/70 text-sm hover:text-white hover:border-white/40 transition-colors"
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
