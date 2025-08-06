"use client";

import React from 'react';
import Image from 'next/image';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Editor-in-Chief',
      bio: 'Award-winning journalist with 15+ years experience in digital media.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Michael Chen',
      role: 'Technology Director',
      bio: 'Former Google engineer specializing in AI and machine learning.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Data Science Lead',
      bio: 'PhD in Computer Science, expert in natural language processing.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'James Wilson',
      role: 'Product Manager',
      bio: 'Product strategist with experience at leading news organizations.',
      image: '/api/placeholder/300/300'
    }
  ];

  const values = [
    {
      title: 'Accuracy',
      description: 'We prioritize factual reporting and verify all information through multiple sources.',
      icon: '✓'
    },
    {
      title: 'Transparency',
      description: 'Our AI algorithms and editorial processes are open and explainable.',
      icon: '👁️'
    },
    {
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to deliver news in new and engaging ways.',
      icon: '🚀'
    },
    {
      title: 'Diversity',
      description: 'We ensure diverse perspectives and voices are represented in our coverage.',
      icon: '🌍'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About NewsNerve
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Revolutionizing how you discover, consume, and interact with news through artificial intelligence.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-200">
              <span>Founded in 2024</span>
              <span>•</span>
              <span>100,000+ Daily Readers</span>
              <span>•</span>
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-xl text-muted-foreground">
                To democratize access to quality journalism through intelligent technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Intelligent News Curation
                </h3>
                <p className="text-muted-foreground mb-6">
                  NewsNerve uses advanced AI algorithms to analyze thousands of news sources, 
                  identify the most important stories, and personalize them based on your interests. 
                  Our platform ensures you never miss what matters to you while discovering new 
                  perspectives and topics.
                </p>
                <p className="text-muted-foreground">
                  We believe that everyone deserves access to accurate, timely, and relevant news. 
                  Our AI doesn't replace human judgment—it enhances it, helping our editorial team 
                  deliver better journalism faster.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-8 border border-border">
                <div className="text-center">
                  <div className="text-4xl mb-4">🧠</div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">AI-Powered Insights</h4>
                  <p className="text-muted-foreground text-sm">
                    Advanced machine learning algorithms analyze global news patterns to surface 
                    the most relevant stories for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-card rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border">
                  <div className="text-3xl mb-4">{value.icon}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">
                Experienced journalists and technologists working together
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Technology</h2>
              <p className="text-xl text-muted-foreground">
                Cutting-edge AI and machine learning powering the future of news
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Natural Language Processing</h3>
                <p className="text-muted-foreground text-sm">
                  Advanced NLP algorithms understand context, sentiment, and relevance in news articles.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Real-time Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor global news trends and breaking stories as they happen worldwide.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Personalization Engine</h3>
                <p className="text-muted-foreground text-sm">
                  Machine learning models that adapt to your reading habits and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Join the Future of News
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Experience personalized, AI-curated news that adapts to your interests and keeps you informed.
            </p>
            <div className="space-x-4">
              <button className="bg-primary-foreground text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-foreground/90 transition-colors">
                Get Started Free
              </button>
              <button className="border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-foreground hover:text-primary transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
