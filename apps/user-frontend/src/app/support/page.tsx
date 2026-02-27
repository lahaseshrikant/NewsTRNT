"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';
import { CoffeeIcon, BreakingIcon, RocketIcon, TrophyIcon, PenIcon, ShieldIcon, WrenchIcon } from '@/components/icons/EditorialIcons';

const SupportPage: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const oneTimeTiers = [
    { id: 'coffee', label: 'Buy us a chai', amount: '₹99', emoji: <CoffeeIcon size={30} /> },
    { id: 'meal', label: 'Fund a story', amount: '₹499', emoji: <BreakingIcon size={30} /> },
    { id: 'boost', label: 'Sponsor a week', amount: '₹1,999', emoji: <RocketIcon size={30} /> },
    { id: 'champion', label: 'Champion the cause', amount: '₹4,999', emoji: <TrophyIcon size={30} /> },
  ];

  const monthlyTiers = [
    {
      id: 'supporter',
      name: 'Supporter',
      price: '₹149',
      period: '/month',
      description: 'Help keep independent journalism alive.',
      perks: [
        'Ad-free reading experience',
        'Supporter badge on profile',
        'Monthly behind-the-scenes newsletter',
      ],
    },
    {
      id: 'patron',
      name: 'Patron',
      price: '₹499',
      period: '/month',
      description: 'Fuel investigative reporting and deep dives.',
      featured: true,
      perks: [
        'Everything in Supporter',
        'Early access to long-form articles',
        'Patron badge + name on supporters wall',
        'Quarterly AMA with editorial team',
        'Priority story suggestions',
      ],
    },
    {
      id: 'champion',
      name: 'Champion',
      price: '₹1,499',
      period: '/month',
      description: 'Be a pillar of the movement for truth in journalism.',
      perks: [
        'Everything in Patron',
        'Champion badge on profile',
        'Your name/brand featured on homepage',
        'Direct line to the editorial team',
        'Annual impact report',
        'Exclusive editorial roundtable invites',
      ],
    },
  ];

  const impactStats = [
    { label: 'Stories published', value: 'Every story matters' },
    { label: 'No corporate funding', value: 'Reader-supported' },
    { label: 'Built in India', value: 'For the world' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-card border border-border border-b-2 border-vermillion overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#1a1210] to-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-vermillion/8 rounded-full filter blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/6 rounded-full filter blur-[120px]" />

        <div className="relative container mx-auto py-20 text-center">
          <DivergenceMark size={48} className="mx-auto mb-6" color="var(--color-vermillion, #C62828)" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-vermillion mb-4">Support Independent Journalism</p>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
            The Road Less Traveled Needs Your Support
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-8">
            NewsTRNT is reader-funded. No corporate sponsors. No hidden agendas. 
            Every rupee you contribute goes directly toward sourcing, reporting, and delivering the truth.
          </p>
          <div className="flex items-center justify-center gap-8">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-sm font-semibold text-white/80">{stat.value}</p>
                <p className="text-[10px] text-white/35 font-mono uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* One-Time Support */}
      <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">One-Time</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Make a Quick Contribution</h2>
            <p className="text-muted-foreground">Pick an amount, or enter your own. Every contribution counts.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {oneTimeTiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => { setSelectedTier(tier.id); setCustomAmount(''); }}
                className={`group relative p-6 border text-center transition-all duration-200 ${
                  selectedTier === tier.id
                    ? 'border-vermillion bg-vermillion/5 dark:bg-vermillion/10'
                    : 'border-border hover:border-vermillion/50'
                }`}
              >
                <span className="text-3xl block mb-2">{tier.emoji}</span>
                <span className="font-serif text-lg font-bold text-foreground block">{tier.amount}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mt-1">{tier.label}</span>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex items-center gap-4 max-w-md mx-auto mb-8">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">₹</span>
              <input
                type="number"
                min="1"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedTier(null); }}
                className="w-full pl-8 pr-4 py-3 text-foreground bg-background border border-border focus:outline-none focus:border-vermillion font-mono text-sm transition-colors"
              />
            </div>
            <button className="bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors whitespace-nowrap">
              Contribute
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Secure payment via UPI, credit/debit card, or net banking. Tax receipts available.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="container mx-auto">
        <hr className="border-border" />
      </div>

      {/* Monthly Sponsorship Tiers */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Monthly Sponsorship</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Become a Recurring Sponsor</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Consistent support powers consistent journalism. Choose a tier that fits you and join our community of truth-seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monthlyTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative border p-8 transition-all duration-200 ${
                  tier.featured
                    ? 'border-vermillion bg-vermillion/5 dark:bg-vermillion/10 scale-[1.02]'
                    : 'border-border hover:border-vermillion/50'
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-vermillion text-white px-4 py-1 font-mono text-[10px] uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-serif text-3xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-foreground">
                      <svg className="w-4 h-4 text-vermillion mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 font-mono text-xs tracking-wider uppercase transition-colors ${
                    tier.featured
                      ? 'bg-vermillion text-white hover:bg-vermillion/90'
                      : 'border border-border text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  Start Sponsoring
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Support Section */}
      <div className="bg-muted/50 border-y border-border py-16">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Why It Matters</p>
              <h2 className="font-serif text-3xl font-bold text-foreground">Where Your Money Goes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <PenIcon size={36} />,
                  title: 'Original Reporting',
                  desc: 'Fund investigative journalism and on-the-ground reporting that mainstream media ignores.',
                },
                {
                  icon: <ShieldIcon size={36} />,
                  title: 'No Ads, No Bias',
                  desc: 'Your support helps us stay ad-free and editorially independent. No corporate strings attached.',
                },
                {
                  icon: <WrenchIcon size={36} />,
                  title: 'Better Platform',
                  desc: 'Invest in infrastructure — faster load times, better reading experience, new features for you.',
                },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <span className="text-4xl block mb-4">{item.icon}</span>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Wall */}
      <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Community</p>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Our Supporters Wall</h2>
          <p className="text-muted-foreground mb-8">Join the growing list of readers who believe in independent journalism.</p>

          <div className="bg-muted/50 border border-border p-12 mb-8">
            <p className="text-muted-foreground italic">Be the first to join our supporters wall. Your name could appear here.</p>
          </div>
        </div>
      </div>

      {/* Corporate Sponsorship CTA */}
      <div className="bg-ink border-t-2 border-vermillion py-16">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <DivergenceMark size={32} className="mx-auto mb-6" color="var(--color-vermillion, #C62828)" />
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              Corporate Sponsorship & Partnerships
            </h2>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Want to align your brand with fearless, independent journalism? 
              We offer custom partnership opportunities for organizations that share our values.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:partnerships@newstrnt.com"
                className="bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors"
              >
                Discuss Partnership
              </a>
              <Link
                href="/advertise"
                className="border border-white/20 text-white px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-white/10 transition-colors"
              >
                Advertising Opportunities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
