"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-ivory dark:bg-ash/10 p-8 border border-ash dark:border-ash/20">
          <DivergenceMark size={48} className="mx-auto mb-4" color="var(--color-vermillion, #C62828)" />
          <h2 className="font-serif text-2xl font-bold text-ink dark:text-ivory mb-4">Message Received</h2>
          <p className="text-stone mb-6">
            Thank you for reaching out. Our editorial team will respond within 24 hours.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-vermillion text-white py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors"
            >
              Send Another Message
            </button>
            <Link
              href="/"
              className="block w-full border border-ash dark:border-ash/20 text-ink dark:text-ivory py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory dark:hover:bg-ash/10 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Header */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
  <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="font-mono text-xs tracking-wider uppercase text-ivory/60 hover:text-ivory mb-4 inline-block">
              &larr; Back to Home
            </Link>
            <h1 className="font-serif text-4xl font-bold text-ivory">Contact the Newsroom</h1>
            <p className="text-ivory/60 mt-2">The Road Not Taken &mdash; Get in touch with the NewsTRNT team</p>
          </div>
        </div>
      </div>

      {/* Content */}
  <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-ivory dark:bg-ash/10 p-8 border border-ash dark:border-ash/20">
              <h2 className="font-serif text-2xl font-bold text-ink dark:text-ivory mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-ink dark:text-ivory placeholder-stone bg-paper dark:bg-ink border border-ash dark:border-ash/20 focus:outline-none focus:border-vermillion transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-ink dark:text-ivory placeholder-stone bg-paper dark:bg-ink border border-ash dark:border-ash/20 focus:outline-none focus:border-vermillion transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-ink dark:text-ivory bg-paper dark:bg-ink border border-ash dark:border-ash/20 focus:outline-none focus:border-vermillion transition-colors"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="press">Press & Media</option>
                    <option value="partnership">Partnership</option>
                    <option value="bug">Report a Bug</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-ink dark:text-ivory placeholder-stone bg-paper dark:bg-ink border border-ash dark:border-ash/20 focus:outline-none focus:border-vermillion transition-colors"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-ink dark:text-ivory placeholder-stone bg-paper dark:bg-ink border border-ash dark:border-ash/20 focus:outline-none focus:border-vermillion transition-colors resize-vertical"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-vermillion text-white py-3 font-mono text-xs tracking-wider uppercase hover:bg-vermillion/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-ivory dark:bg-ash/10 p-8 border border-ash dark:border-ash/20">
                <h2 className="font-serif text-2xl font-bold text-ink dark:text-ivory mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-ink dark:bg-ivory/10 p-3">
                      <svg className="w-6 h-6 text-ivory dark:text-ink" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-ink dark:text-ivory">Email</h3>
                      <p className="text-stone">contact@NewsTRNT.com</p>
                      <p className="text-sm text-stone">We typically respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-ink dark:bg-ivory/10 p-3">
                      <svg className="w-6 h-6 text-ivory dark:text-ink" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-ink dark:text-ivory">Address</h3>
                      <p className="text-stone">
                        NewsTRNT Headquarters<br />
                        123 News Street<br />
                        Media City, MC 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-ink dark:bg-ivory/10 p-3">
                      <svg className="w-6 h-6 text-ivory dark:text-ink" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-ink dark:text-ivory">Phone</h3>
                      <p className="text-stone">+1 (555) 123-4567</p>
                      <p className="text-sm text-stone">Mon-Fri, 9 AM - 6 PM EST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-ivory dark:bg-ash/10 p-8 border border-ash dark:border-ash/20">
                <h2 className="font-serif text-2xl font-bold text-ink dark:text-ivory mb-6">Quick Help</h2>
                
                <div className="space-y-4">
                  <Link
                    href="/about"
                    className="block p-4 hover-row transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-semibold text-ink dark:text-ivory">About NewsTRNT</h3>
                        <p className="text-sm text-stone">Learn more about our mission</p>
                      </div>
                      <svg className="w-5 h-5 text-stone group-hover:text-vermillion transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </Link>

                  <Link
                    href="/terms"
                    className="block p-4 hover-row transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-semibold text-ink dark:text-ivory">Terms of Service</h3>
                        <p className="text-sm text-stone">Our terms and conditions</p>
                      </div>
                      <svg className="w-5 h-5 text-stone group-hover:text-vermillion transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </Link>

                  <Link
                    href="/privacy"
                    className="block p-4 hover-row transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-semibold text-ink dark:text-ivory">Privacy Policy</h3>
                        <p className="text-sm text-stone">How we protect your data</p>
                      </div>
                      <svg className="w-5 h-5 text-stone group-hover:text-vermillion transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
