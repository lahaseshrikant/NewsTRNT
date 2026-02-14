"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

const CareersPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      department: 'engineering',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      salary: '$120,000 - $180,000',
      description: 'Join our engineering team to build the next generation of smart news platform.',
      requirements: [
        '5+ years of experience with React/Next.js',
        'Strong backend development skills (Node.js, Python)',
        'Experience with PostgreSQL and cloud platforms',
        'Familiarity with AI/ML technologies'
      ],
      posted: '2024-01-10'
    },
    {
      id: 2,
      title: 'AI/ML Engineer',
      department: 'engineering',
      location: 'New York / Remote',
      type: 'Full-time',
      salary: '$140,000 - $200,000',
      description: 'Lead the development of our AI systems for news curation, summarization, and analysis.',
      requirements: [
        'PhD or Masters in AI/ML or related field',
        'Experience with NLP and LLMs',
        'Proficiency in Python, TensorFlow/PyTorch',
        'Experience with production ML systems'
      ],
      posted: '2024-01-08'
    },
    {
      id: 3,
      title: 'Product Manager',
      department: 'product',
      location: 'San Francisco',
      type: 'Full-time',
      salary: '$130,000 - $170,000',
      description: 'Drive product strategy and roadmap for our news platform and AI features.',
      requirements: [
        '3+ years of product management experience',
        'Experience with consumer-facing products',
        'Strong analytical and communication skills',
        'Background in media or AI products preferred'
      ],
      posted: '2024-01-05'
    },
    {
      id: 4,
      title: 'UX/UI Designer',
      department: 'design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$90,000 - $130,000',
      description: 'Create beautiful and intuitive user experiences for our news platform.',
      requirements: [
        '4+ years of UX/UI design experience',
        'Proficiency in Figma and design systems',
        'Experience with mobile and web design',
        'Portfolio demonstrating user-centered design'
      ],
      posted: '2024-01-03'
    },
    {
      id: 5,
      title: 'Data Scientist',
      department: 'data',
      location: 'Remote / Boston',
      type: 'Full-time',
      salary: '$110,000 - $160,000',
      description: 'Analyze user behavior and news trends to improve our AI recommendations.',
      requirements: [
        'Masters in Data Science or related field',
        'Proficiency in Python, SQL, and data visualization',
        'Experience with A/B testing and statistical analysis',
        'Knowledge of recommendation systems'
      ],
      posted: '2024-01-01'
    },
    {
      id: 6,
      title: 'Content Marketing Manager',
      department: 'marketing',
      location: 'Los Angeles',
      type: 'Full-time',
      salary: '$70,000 - $100,000',
      description: 'Lead our content marketing strategy and grow our brand awareness.',
      requirements: [
        '3+ years of content marketing experience',
        'Strong writing and storytelling skills',
        'Experience with SEO and digital marketing',
        'Knowledge of media industry preferred'
      ],
      posted: '2023-12-28'
    }
  ];

  const departments = [
    { id: 'all', name: 'All Departments', count: jobOpenings.length },
    { id: 'engineering', name: 'Engineering', count: jobOpenings.filter(job => job.department === 'engineering').length },
    { id: 'product', name: 'Product', count: jobOpenings.filter(job => job.department === 'product').length },
    { id: 'design', name: 'Design', count: jobOpenings.filter(job => job.department === 'design').length },
    { id: 'data', name: 'Data', count: jobOpenings.filter(job => job.department === 'data').length },
    { id: 'marketing', name: 'Marketing', count: jobOpenings.filter(job => job.department === 'marketing').length }
  ];

  const benefits = [
    { title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision insurance. Mental health support and wellness programs.' },
    { title: 'Competitive Compensation', description: 'Market-leading salaries, equity packages, and performance-based bonuses.' },
    { title: 'Remote-First', description: 'Work from anywhere with flexible hours. Home office setup allowance provided.' },
    { title: 'Learning & Development', description: 'Annual learning budget, conference attendance, and internal training programs.' },
    { title: 'Time Off', description: 'Unlimited PTO policy with encouraged minimum 3 weeks per year.' },
    { title: 'Team Culture', description: 'Collaborative environment with regular team events and retreats.' }
  ];

  const team = [
    { name: 'Sarah Chen', role: 'CEO & Co-founder', bio: 'Former VP of Product at major tech company. Passionate about democratizing news access.', initials: 'SC' },
    { name: 'Marcus Johnson', role: 'CTO & Co-founder', bio: 'AI researcher with 10+ years experience. Previously led ML teams at Google and OpenAI.', initials: 'MJ' },
    { name: 'Elena Rodriguez', role: 'VP of Engineering', bio: 'Full-stack engineer and tech lead. Expert in scalable systems and team building.', initials: 'ER' },
    { name: 'David Park', role: 'Head of Design', bio: 'Award-winning designer focused on user experience and accessibility.', initials: 'DP' }
  ];

  const filteredJobs = selectedDepartment === 'all' 
    ? jobOpenings 
    : jobOpenings.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Hero */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">We&apos;re Hiring</p>
            <h1 className="font-serif text-5xl font-bold text-ivory mb-6">Join Our Mission</h1>
            <p className="text-xl text-ivory/60 mb-8">
              Help us revolutionize how the world consumes news with smart personalization and independent journalism
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-ivory/40 font-mono text-xs uppercase tracking-wider">
              <span>Remote-First</span>
              <span className="w-1 h-1 bg-vermillion"></span>
              <span>{jobOpenings.length} Open Positions</span>
              <span className="w-1 h-1 bg-vermillion"></span>
              <span>Global Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">What Drives Us</p>
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Our Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Mission-Driven', text: 'We believe in the power of informed citizens and work to make quality news accessible to everyone.' },
              { num: '02', title: 'Collaborative', text: 'We value diverse perspectives and believe the best solutions come from working together.' },
              { num: '03', title: 'Innovation', text: 'We\'re constantly pushing the boundaries of what\'s possible with AI and technology.' }
            ].map((value) => (
              <div key={value.num} className="border border-ash dark:border-ash/20 p-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">{value.num}</span>
                <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mt-3 mb-3">{value.title}</h3>
                <p className="text-stone text-sm leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div className="bg-ivory dark:bg-ash/5 border-y border-ash dark:border-ash/20 py-16">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Opportunities</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Open Positions</h2>
            </div>

            {/* Department Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                    selectedDepartment === dept.id
                      ? 'bg-ink dark:bg-ivory text-ivory dark:text-ink'
                      : 'border border-ash dark:border-ash/20 text-stone hover:text-ink dark:hover:text-ivory'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="hover-lift bg-paper dark:bg-ink border border-ash dark:border-ash/20 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory">{job.title}</h3>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-vermillion border border-vermillion/30 px-2 py-1">
                          {job.type}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-stone font-mono text-xs mb-3">
                        <span>{job.location}</span>
                        <span>{job.salary}</span>
                        <span>Posted {new Date(job.posted).toLocaleDateString()}</span>
                      </div>
                      
                      <p className="text-stone mb-4">{job.description}</p>
                      
                      <div className="space-y-1">
                        <h4 className="font-mono text-xs uppercase tracking-wider text-ink dark:text-ivory">Key Requirements</h4>
                        <ul className="space-y-1">
                          {job.requirements.slice(0, 2).map((req, index) => (
                            <li key={index} className="text-sm text-stone flex items-start">
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
                      <button className="border border-ash dark:border-ash/20 text-ink dark:text-ivory px-6 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory dark:hover:bg-ash/10 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-stone/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mb-2">No positions found</h3>
                <p className="text-stone">
                  No open positions in {departments.find(d => d.id === selectedDepartment)?.name.toLowerCase()} right now. 
                  Check back soon or view all departments.
                </p>
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
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Why Join NewsTRNT?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="border border-ash dark:border-ash/20 p-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">0{index + 1}</span>
                <h3 className="font-serif text-lg font-bold text-ink dark:text-ivory mt-2 mb-2">{benefit.title}</h3>
                <p className="text-stone text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-ivory dark:bg-ash/5 border-y border-ash dark:border-ash/20 py-16">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Leadership</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Meet the Team</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-ink dark:bg-ivory/10 flex items-center justify-center mx-auto mb-4">
                    <span className="font-serif text-xl font-bold text-ivory dark:text-ivory/80">{member.initials}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink dark:text-ivory mb-1">{member.name}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-vermillion mb-2">{member.role}</p>
                  <p className="text-sm text-stone">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hiring Process */}
      <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Process</p>
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">Our Hiring Process</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Apply', desc: 'Submit your application and resume through our portal' },
              { step: '02', title: 'Screen', desc: 'Initial phone/video call with our hiring team' },
              { step: '03', title: 'Interview', desc: 'Technical and cultural fit interviews with the team' },
              { step: '04', title: 'Offer', desc: 'Final decision and offer discussion' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-ink dark:bg-ivory/10 flex items-center justify-center font-mono text-sm font-bold text-ivory mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif font-bold text-ink dark:text-ivory mb-2">{item.title}</h3>
                <p className="text-sm text-stone">{item.desc}</p>
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
              Ready to Shape the Future of News?
            </h2>
            <p className="text-xl mb-8 text-ivory/60">
              Don&apos;t see a role that fits? We&apos;re always looking for exceptional talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:careers@NewsTRNT.com"
                className="hover-magnetic bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase"
              >
                Send Us Your Resume
              </a>
              <Link
                href="/contact"
                className="border border-ivory/20 text-ivory px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory/10 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
