"use client";

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: 'Cookie Policy' }]} className="mb-4" />
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Cookie Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              How NewsTRNT uses cookies to enhance your experience
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          
          {/* Cookie Consent Banner Info */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="text-2xl">🍪</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Cookie Preferences</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You can manage your cookie preferences at any time using our cookie settings.
                </p>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm">
                  Manage Cookie Settings
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                understanding how you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    🔧 Essential Cookies
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    These cookies are necessary for the website to function properly and cannot be disabled.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Authentication and security</li>
                    <li>Website functionality and navigation</li>
                    <li>Load balancing and performance</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    📊 Analytics Cookies
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Help us understand how visitors interact with our website by collecting anonymous information.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Page views and user interactions</li>
                    <li>Traffic sources and user demographics</li>
                    <li>Performance metrics and error tracking</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    🎯 Personalization Cookies
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Allow us to personalize your experience and remember your preferences.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>News category preferences</li>
                    <li>Reading history and saved articles</li>
                    <li>Theme and layout preferences</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    📢 Marketing Cookies
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Used to deliver relevant advertisements and track campaign performance.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Targeted advertising</li>
                    <li>Social media integration</li>
                    <li>Campaign effectiveness measurement</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may also use third-party services that set their own cookies:
              </p>
              <div className="bg-muted/30 rounded-lg p-6">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-foreground"><strong>Google Analytics</strong> - For website analytics and performance monitoring</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-foreground"><strong>Social Media Platforms</strong> - For social sharing and authentication</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-foreground"><strong>Content Delivery Networks</strong> - For faster content delivery</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Managing Your Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have several options for managing cookies:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Browser Settings</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Configure cookie settings directly in your browser preferences.
                  </p>
                  <div className="space-y-2 text-sm">
                    <Link href="https://support.google.com/chrome/answer/95647" 
                          className="block text-primary hover:text-primary/80">
                      Chrome Cookie Settings →
                    </Link>
                    <Link href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" 
                          className="block text-primary hover:text-primary/80">
                      Firefox Cookie Settings →
                    </Link>
                    <Link href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" 
                          className="block text-primary hover:text-primary/80">
                      Safari Cookie Settings →
                    </Link>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">NewsTRNT Settings</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Manage your cookie preferences directly on our platform.
                  </p>
                  <div className="space-y-3">
                    <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors text-sm">
                      Cookie Preferences
                    </button>
                    <Link href="/privacy" 
                          className="block text-center text-primary hover:text-primary/80 text-sm">
                      Privacy Settings →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Cookie Retention</h2>
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Session Cookies</h3>
                    <p className="text-muted-foreground text-sm">
                      Deleted when you close your browser
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Persistent Cookies</h3>
                    <p className="text-muted-foreground text-sm">
                      Stored for up to 2 years or until manually deleted
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or applicable laws. We will notify you of any material changes by posting the updated 
                policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about our Cookie Policy, please contact us:
              </p>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Email</h3>
                    <Link href="mailto:privacy@NewsTRNT.com" 
                          className="text-primary hover:text-primary/80">
                      privacy@NewsTRNT.com
                    </Link>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Support</h3>
                    <Link href="/contact" 
                          className="text-primary hover:text-primary/80">
                      Contact Support →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <div className="text-center py-8 border-t border-border mt-12">
              <p className="text-muted-foreground text-sm">
                Last updated: August 3, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
