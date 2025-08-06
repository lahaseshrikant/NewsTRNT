"use client";

import React from 'react';
import Link from 'next/link';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="text-primary hover:text-primary/80 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground mt-2">Last updated: August 2, 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-sm p-8 border border-border">
          <div className="prose prose-lg max-w-none prose-gray dark:prose-invert">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  By accessing and using NewsNerve ("the Service"), you accept and agree to be bound by the terms and 
                  provision of this agreement. These Terms of Service ("Terms") govern your use of our website, mobile 
                  applications, and related services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  NewsNerve is an AI-powered news aggregation platform that provides users with personalized news content, 
                  breaking news alerts, and comprehensive coverage across multiple categories including politics, technology, 
                  business, sports, entertainment, health, science, and world news.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">
                  To access certain features of the Service, you may be required to create an account. You agree to:
                </p>
                <ul className="text-muted-foreground space-y-2 ml-6">
                  <li className="leading-relaxed">• Provide accurate and complete information when creating your account</li>
                  <li className="leading-relaxed">• Maintain the security of your password and account</li>
                  <li className="leading-relaxed">• Accept responsibility for all activities that occur under your account</li>
                  <li className="leading-relaxed">• Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">4. User Conduct</h2>
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="text-muted-foreground space-y-2 ml-6">
                  <li className="leading-relaxed">• Violate any applicable laws or regulations</li>
                  <li className="leading-relaxed">• Transmit any harmful, threatening, abusive, or defamatory content</li>
                  <li className="leading-relaxed">• Infringe upon the intellectual property rights of others</li>
                  <li className="leading-relaxed">• Attempt to gain unauthorized access to our systems</li>
                  <li className="leading-relaxed">• Distribute spam, malware, or other malicious content</li>
                  <li className="leading-relaxed">• Interfere with the proper functioning of the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">5. Content and Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">
                  The Service contains content owned by NewsNerve, our users, and third parties. This includes:
                </p>
                <ul className="text-muted-foreground space-y-2 ml-6">
                  <li className="leading-relaxed">• News articles and content from various sources</li>
                  <li className="leading-relaxed">• User-generated content including comments and interactions</li>
                  <li className="leading-relaxed">• Our proprietary technology, algorithms, and software</li>
                  <li className="leading-relaxed">• Trademarks, logos, and branding materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">6. Privacy and Data Use</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  Your privacy is important to us. Our collection and use of personal information is governed by our 
                  Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you 
                  consent to the collection and use of information as described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">7. Subscription and Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">
                  Some features of the Service may require payment. For premium subscriptions:
                </p>
                <ul className="text-muted-foreground space-y-2 ml-6">
                  <li className="leading-relaxed">• Subscription fees are billed in advance on a recurring basis</li>
                  <li className="leading-relaxed">• You may cancel your subscription at any time</li>
                  <li className="leading-relaxed">• Refunds are provided according to our refund policy</li>
                  <li className="leading-relaxed">• Prices may change with 30 days notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">8. Disclaimers</h2>
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">
                  The Service is provided "as is" without warranties of any kind. We disclaim all warranties, 
                  express or implied, including but not limited to:
                </p>
                <ul className="text-muted-foreground space-y-2 ml-6">
                  <li className="leading-relaxed">• The accuracy, completeness, or reliability of content</li>
                  <li className="leading-relaxed">• The availability or uninterrupted operation of the Service</li>
                  <li className="leading-relaxed">• The fitness for a particular purpose</li>
                  <li className="leading-relaxed">• Non-infringement of third-party rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">9. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  To the maximum extent permitted by law, NewsNerve shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                  or other intangible losses resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">10. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  You agree to indemnify and hold harmless NewsNerve, its officers, directors, employees, and agents 
                  from any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including 
                  attorney's fees) arising from your use of the Service or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">11. Termination</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                  for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, 
                  or for any other reason.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">12. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], 
                  without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">13. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  We reserve the right to modify these Terms at any time. We will notify users of any material 
                  changes via email or through the Service. Your continued use of the Service after such 
                  modifications constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">14. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <div className="space-y-2">
                    <p className="text-foreground"><strong>Email:</strong> legal@newsnerve.com</p>
                    <p className="text-foreground"><strong>Address:</strong> NewsNerve Legal Department<br />
                    123 News Street<br />
                    Media City, MC 12345</p>
                    <p className="text-foreground"><strong>Phone:</strong> +1 (555) 123-4567</p>
                  </div>
                </div>
              </section>

              <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary">
                  <strong>Note:</strong> These terms are effective as of the last updated date shown above. 
                  Please review these terms regularly as they may change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
