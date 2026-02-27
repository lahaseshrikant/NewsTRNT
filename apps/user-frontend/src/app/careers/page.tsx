"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

const CareersPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const jobOpenings: {
    id: number;
    title: string;
    department: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    requirements: string[];
    posted: string;
  }[] = [];

  const departments = [
    { id: 'all', name: 'All Departments', count: jobOpenings.length },
  ];

  const benefits = [
    { title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision insurance. Mental health support and wellness programs.' },
    { title: 'Competitive Compensation', description: 'Market-leading salaries, equity packages, and performance-based bonuses.' },
    { title: 'Remote-First', description: 'Work from anywhere with flexible hours. Home office setup allowance provided.' },
    { title: 'Learning & Development', description: 'Annual learning budget, conference attendance, and internal training programs.' },
    { title: 'Time Off', description: 'Unlimited PTO policy with encouraged minimum 3 weeks per year.' },
    { title: 'Team Culture', description: 'Collaborative environment with regular team events and retreats.' }
  ];

  const team: { name: string; role: string; bio: string; initials: string }[] = [];

  const filteredJobs = selectedDepartment === 'all' 
    ? jobOpenings 
    : jobOpenings.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="hero-careers border-b-2 border-vermillion">
        <div className="relative z-10 container mx-auto py-16">
          <div className="max-w-4xl mx-auto text-center">
            <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-70 mb-3 block">We&apos;re Hiring</span>
            <h1 className="font-serif text-5xl font-bold mb-6">Join Our Mission</h1>
            <p className="text-xl opacity-60 mb-8">
              Help us revolutionize how the world consumes news with smart personalization and independent journalism
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm opacity-40 font-mono text-xs uppercase tracking-wider">
              <span>Remote-First</span>
              <span className="w-1 h-1 bg-vermillion"></span>
              <span>{jobOpenings.length} Open Positions</span>
              <span className="w-1 h-1 bg-vermillion"></span>
              <span>Global Team</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">What Drives Us</p>
            <h2 className="font-serif text-3xl font-bold text-foreground">Our Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Mission-Driven', text: 'We believe in the power of informed citizens and work to make quality news accessible to everyone.' },
              { num: '02', title: 'Collaborative', text: 'We value diverse perspectives and believe the best solutions come from working together.' },
              { num: '03', title: 'Innovation', text: 'We\'re constantly pushing the boundaries of what\'s possible with AI and technology.' }
            ].map((value) => (
              <div key={value.num} className="border border-border p-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{value.num}</span>
                <h3 className="font-serif text-xl font-bold text-foreground mt-3 mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div className="bg-muted/50 border-y border-border py-16">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Opportunities</p>
              <h2 className="font-serif text-3xl font-bold text-foreground">Open Positions</h2>
            </div>

            {/* Department Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                    selectedDepartment === dept.id
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="hover-lift bg-card border border-border p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-serif text-xl font-bold text-foreground">{job.title}</h3>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-vermillion border border-vermillion/30 px-2 py-1">
                          {job.type}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono text-xs mb-3">
                        <span>{job.location}</span>
                        <span>{job.salary}</span>
                        <span>Posted {new Date(job.posted).toLocaleDateString()}</span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{job.description}</p>
                      
                      <div className="space-y-1">
                        <h4 className="font-mono text-xs uppercase tracking-wider text-foreground">Key Requirements</h4>
                        <ul className="space-y-1">
                          {job.requirements.slice(0, 2).map((req, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <span className="text-vermillion mr-2">&mdash;</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:ml-6">
                      <Link
                        href={`/careers/${job.id}`}
                        className="hover-magnetic bg-vermillion text-white px-6 py-3 font-mono text-xs tracking-wider uppercase text-center"
                      >
                        Apply Now
                      </Link>
                      <button className="border border-border text-foreground px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-muted/50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">No open positions right now</h3>
                <p className="text-muted-foreground mb-4">
                  We&apos;re a small, growing team. New roles will be posted here as we expand.
                </p>
                <a href="mailto:careers@newstrnt.com" className="text-vermillion hover:underline font-mono text-xs uppercase tracking-wider">
                  Send your resume &rarr;
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Benefits</p>
            <h2 className="font-serif text-3xl font-bold text-foreground">Why Join NewsTRNT?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="border border-border p-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">0{index + 1}</span>
                <h3 className="font-serif text-lg font-bold text-foreground mt-2 mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      {team.length > 0 && (
      <div className="bg-muted/50 border-y border-border py-16">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Leadership</p>
              <h2 className="font-serif text-3xl font-bold text-foreground">Meet the Team</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-primary flex items-center justify-center mx-auto mb-4">
                    <span className="font-serif text-xl font-bold text-primary-foreground">{member.initials}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-vermillion mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Hiring Process */}
      <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Process</p>
            <h2 className="font-serif text-3xl font-bold text-foreground">Our Hiring Process</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Apply', desc: 'Submit your application and resume through our portal' },
              { step: '02', title: 'Screen', desc: 'Initial phone/video call with our hiring team' },
              { step: '03', title: 'Interview', desc: 'Technical and cultural fit interviews with the team' },
              { step: '04', title: 'Offer', desc: 'Final decision and offer discussion' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-sm font-bold text-primary-foreground mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="hero-careers border-t-2 border-vermillion py-16">
        <div className="relative z-10 container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <DivergenceMark size={32} className="mx-auto mb-6" color="var(--color-vermillion, #C62828)" />
            <h2 className="font-serif text-3xl font-bold mb-4">
              Ready to Shape the Future of News?
            </h2>
            <p className="text-xl mb-8 opacity-60">
              Don&apos;t see a role that fits? We&apos;re always looking for exceptional talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:careers@NewsTRNT.com"
                className="hover-magnetic bg-primary text-primary-foreground px-8 py-3 font-mono text-xs tracking-wider uppercase"
              >
                Send Us Your Resume
              </a>
              <Link
                href="/contact"
                className="border border-current/20 px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-current/10 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;
