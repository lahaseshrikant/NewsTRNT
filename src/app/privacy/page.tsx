"use client";

import React from 'react';
import Link from 'next/link';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="text-primary hover:text-primary/80 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground mt-2">Last updated: August 2, 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-sm p-8 border border-border">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <p className="text-lg text-foreground leading-relaxed text-justify">
                  At NewsTRNT, we respect your privacy and are committed to protecting your personal data. This Privacy Policy 
                  explains how we collect, use, and protect your information when you use our services.
                </p>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">1. Information We Collect</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Personal Information</h3>
                  <p className="text-muted-foreground leading-relaxed text-justify mb-4">We may collect the following personal information:</p>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed"><strong>Account Information:</strong> Name, email address, username, password</li>
                    <li className="leading-relaxed"><strong>Profile Information:</strong> Bio, interests, reading preferences</li>
                    <li className="leading-relaxed"><strong>Contact Information:</strong> Email for newsletters and notifications</li>
                    <li className="leading-relaxed"><strong>Payment Information:</strong> Credit card details for premium subscriptions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Usage Information</h3>
                  <p className="text-muted-foreground leading-relaxed text-justify mb-4">We automatically collect information about how you use our service:</p>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed"><strong>Reading Activity:</strong> Articles read, time spent reading, interactions</li>
                    <li className="leading-relaxed"><strong>Device Information:</strong> IP address, browser type, operating system</li>
                    <li className="leading-relaxed"><strong>Analytics Data:</strong> Page views, click patterns, feature usage</li>
                    <li className="leading-relaxed"><strong>Location Data:</strong> General location for content personalization</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">2. How We Use Your Information</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Service Provision</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed">• Provide personalized news recommendations</li>
                    <li className="leading-relaxed">• Maintain and improve our AI algorithms</li>
                    <li className="leading-relaxed">• Send breaking news alerts and newsletters</li>
                    <li className="leading-relaxed">• Process payments for premium features</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Communication</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed">• Send service-related notifications</li>
                    <li className="leading-relaxed">• Respond to customer support inquiries</li>
                    <li className="leading-relaxed">• Share important updates about our service</li>
                    <li className="leading-relaxed">• Marketing communications (with your consent)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Analytics and Improvement</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed">• Analyze usage patterns to improve our service</li>
                    <li className="leading-relaxed">• Conduct research and development</li>
                    <li className="leading-relaxed">• Monitor for security threats</li>
                    <li className="leading-relaxed">• Ensure platform performance and reliability</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">3. Information Sharing</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify mb-6">We do not sell your personal information. We may share your information in these situations:</p>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Service Providers</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed">• Cloud hosting providers (AWS, Google Cloud)</li>
                    <li className="leading-relaxed">• Payment processors (Stripe, PayPal)</li>
                    <li className="leading-relaxed">• Email service providers (SendGrid, Mailchimp)</li>
                    <li className="leading-relaxed">• Analytics services (Google Analytics)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Legal Requirements</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed">• Comply with legal obligations</li>
                    <li className="leading-relaxed">• Respond to lawful requests from authorities</li>
                    <li className="leading-relaxed">• Protect rights, property, or safety</li>
                    <li className="leading-relaxed">• Enforce our Terms of Service</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">4. Data Security</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">We implement appropriate security measures to protect your information:</p>
                <ul className="text-muted-foreground space-y-2 ml-6">
                  <li className="leading-relaxed"><strong>Encryption:</strong> Data in transit and at rest is encrypted</li>
                  <li className="leading-relaxed"><strong>Access Controls:</strong> Limited access to personal data</li>
                  <li className="leading-relaxed"><strong>Regular Audits:</strong> Security assessments and updates</li>
                  <li className="leading-relaxed"><strong>Secure Infrastructure:</strong> Industry-standard security practices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">5. Data Retention</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">We retain your information for as long as necessary to:</p>
                <ul className="text-muted-foreground space-y-2 ml-6">
                  <li className="leading-relaxed">• Provide our services to you</li>
                  <li className="leading-relaxed">• Comply with legal obligations</li>
                  <li className="leading-relaxed">• Resolve disputes and enforce agreements</li>
                  <li className="leading-relaxed">• Improve our services</li>
                </ul>

                <p className="text-muted-foreground leading-relaxed text-justify mt-4">You can request deletion of your account and associated data at any time.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">6. Your Rights and Choices</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Account Management</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed"><strong>Access:</strong> View and download your personal data</li>
                    <li className="leading-relaxed"><strong>Update:</strong> Modify your profile and preferences</li>
                    <li className="leading-relaxed"><strong>Delete:</strong> Request deletion of your account</li>
                    <li className="leading-relaxed"><strong>Export:</strong> Download your data in a portable format</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Communication Preferences</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed">• Unsubscribe from newsletters</li>
                    <li className="leading-relaxed">• Disable push notifications</li>
                    <li className="leading-relaxed">• Opt out of marketing communications</li>
                    <li className="leading-relaxed">• Manage breaking news alerts</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Privacy Controls</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li className="leading-relaxed">• Disable personalization features</li>
                    <li className="leading-relaxed">• Limit data collection</li>
                    <li className="leading-relaxed">• Control profile visibility</li>
                    <li className="leading-relaxed">• Manage cookie preferences</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">7. Cookies and Tracking</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">We use cookies and similar technologies to:</p>
                <ul className="text-muted-foreground space-y-2 ml-6">
                  <li className="leading-relaxed">• Remember your preferences and settings</li>
                  <li className="leading-relaxed">• Analyze website traffic and usage</li>
                  <li className="leading-relaxed">• Provide personalized content</li>
                  <li className="leading-relaxed">• Improve website performance</li>
                </ul>

                <p className="text-muted-foreground leading-relaxed text-justify mt-4">You can control cookie settings through your browser preferences.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">8. Third-Party Services</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify">
                  Our service may contain links to third-party websites and integrate with external services. 
                  This Privacy Policy does not apply to these third parties. We encourage you to review their 
                  privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">9. Children's Privacy</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If we become aware that we have collected personal 
                  information from a child under 13, we will take steps to delete such information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">10. International Data Transfers</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your data in accordance with this 
                  Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">11. Changes to This Policy</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify">
                  We may update this Privacy Policy from time to time. We will notify you of any material 
                  changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">12. Contact Us</h2>
                
                <p className="text-muted-foreground leading-relaxed text-justify mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <div className="space-y-2">
                    <p className="text-foreground"><strong>Email:</strong> privacy@NewsTRNT.com</p>
                    <p className="text-foreground"><strong>Data Protection Officer:</strong> dpo@NewsTRNT.com</p>
                    <p className="text-foreground"><strong>Address:</strong> NewsTRNT Privacy Team<br />
                    123 News Street<br />
                    Media City, MC 12345</p>
                  </div>
                </div>
              </section>

              <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="text-primary font-semibold mb-2">Your Data, Your Control</h3>
                <p className="text-sm text-primary/80 leading-relaxed">
                  We believe you should have control over your personal data. Visit your account settings to 
                  manage your privacy preferences, download your data, or delete your account at any time.
                </p>
                <Link href="/settings" className="inline-block mt-2 text-primary hover:text-primary/80 font-medium">
                  Manage Privacy Settings →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
