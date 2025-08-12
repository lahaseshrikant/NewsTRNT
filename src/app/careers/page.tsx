"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
      description: 'Join our engineering team to build the next generation of AI-powered news platform.',
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
    {
      icon: '🏥',
      title: 'Health & Wellness',
      description: 'Comprehensive health, dental, and vision insurance. Mental health support and wellness programs.'
    },
    {
      icon: '💰',
      title: 'Competitive Compensation',
      description: 'Market-leading salaries, equity packages, and performance-based bonuses.'
    },
    {
      icon: '🏠',
      title: 'Remote-First',
      description: 'Work from anywhere with flexible hours. Home office setup allowance provided.'
    },
    {
      icon: '📚',
      title: 'Learning & Development',
      description: 'Annual learning budget, conference attendance, and internal training programs.'
    },
    {
      icon: '🌴',
      title: 'Time Off',
      description: 'Unlimited PTO policy with encouraged minimum 3 weeks per year.'
    },
    {
      icon: '👥',
      title: 'Team Culture',
      description: 'Collaborative environment with regular team events and retreats.'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-founder',
      bio: 'Former VP of Product at major tech company. Passionate about democratizing news access.',
      avatar: '/api/placeholder/150/150'
    },
    {
      name: 'Marcus Johnson',
      role: 'CTO & Co-founder',
      bio: 'AI researcher with 10+ years experience. Previously led ML teams at Google and OpenAI.',
      avatar: '/api/placeholder/150/150'
    },
    {
      name: 'Elena Rodriguez',
      role: 'VP of Engineering',
      bio: 'Full-stack engineer and tech lead. Expert in scalable systems and team building.',
      avatar: '/api/placeholder/150/150'
    },
    {
      name: 'David Park',
      role: 'Head of Design',
      bio: 'Award-winning designer focused on user experience and accessibility.',
      avatar: '/api/placeholder/150/150'
    }
  ];

  const filteredJobs = selectedDepartment === 'all' 
    ? jobOpenings 
    : jobOpenings.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Join Our Mission
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Help us revolutionize how the world consumes news with AI-powered personalization
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Remote-First Company
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {jobOpenings.length} Open Positions
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Global Team
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Values */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-muted-foreground">What drives us every day</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Mission-Driven</h3>
              <p className="text-muted-foreground">
                We believe in the power of informed citizens and work to make quality news accessible to everyone.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Collaborative</h3>
              <p className="text-muted-foreground">
                We value diverse perspectives and believe the best solutions come from working together.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                We're constantly pushing the boundaries of what's possible with AI and technology.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div className="bg-card border-y border-border py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Open Positions</h2>
              <p className="text-muted-foreground">Find your next opportunity with us</p>
            </div>

            {/* Department Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDepartment === dept.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border text-foreground hover:bg-muted/50'
                  }`}
                >
                  {dept.name} ({dept.count})
                </button>
              ))}
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-background rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          {job.type}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          📍 {job.location}
                        </span>
                        <span className="flex items-center">
                          💰 {job.salary}
                        </span>
                        <span className="flex items-center">
                          📅 Posted {new Date(job.posted).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{job.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">Key Requirements:</h4>
                        <ul className="space-y-1">
                          {job.requirements.slice(0, 2).map((req, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:ml-6">
                      <Link
                        href={`/careers/${job.id}`}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-center"
                      >
                        Apply Now
                      </Link>
                      <button className="border border-border text-foreground px-6 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-foreground mb-2">No positions found</h3>
                <p className="text-muted-foreground">
                  No open positions in {departments.find(d => d.id === selectedDepartment)?.name.toLowerCase()} right now. 
                  Check back soon or view all departments.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Join NewsTRNT?</h2>
            <p className="text-muted-foreground">We take care of our team so they can take care of our mission</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border border-border text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-card border-y border-border py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Meet the Team</h2>
              <p className="text-muted-foreground">The people building the future of news</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={150}
                    height={150}
                    className="rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Hiring Process</h2>
            <p className="text-muted-foreground">What to expect when you apply</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-foreground mb-2">Apply</h3>
              <p className="text-sm text-muted-foreground">Submit your application and resume through our portal</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-foreground mb-2">Screen</h3>
              <p className="text-sm text-muted-foreground">Initial phone/video call with our hiring team</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-foreground mb-2">Interview</h3>
              <p className="text-sm text-muted-foreground">Technical and cultural fit interviews with the team</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-foreground mb-2">Offer</h3>
              <p className="text-sm text-muted-foreground">Final decision and offer discussion</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Shape the Future of News?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Don't see a role that fits? We're always looking for exceptional talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:careers@NewsTRNT.com"
                className="bg-primary-foreground text-primary px-8 py-3 rounded-lg hover:bg-primary-foreground/90 transition-colors font-medium"
              >
                Send Us Your Resume
              </a>
              <Link
                href="/contact"
                className="border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary-foreground hover:text-primary transition-colors font-medium"
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
