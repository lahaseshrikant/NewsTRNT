"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Guide {
  title: string;
  description: string;
  link: string;
  icon: string;
  readTime: string;
}

const FAQ_DATA: FAQItem[] = [
  // Content
  { id: 'c1', question: 'How do I create and publish an article?', answer: 'Go to Content Management → New Article (or press Ctrl+N from the dashboard). Fill in the title, write your content using the rich text editor, add a category and tags, optionally upload a featured image, then click "Publish" or save as "Draft" for later. You can schedule publishing by choosing the "Scheduled" status and picking a date and time.', category: 'content' },
  { id: 'c2', question: 'What content types are supported?', answer: 'The platform supports: News articles, Opinion pieces, Analysis/Deep-dive reports, Reviews, Interviews, and Web Stories. Choose the content type when creating via the dropdown in the article editor. Each type can have its own template and display format on the frontend.', category: 'content' },
  { id: 'c3', question: 'How does the rich text editor work?', answer: 'The editor supports full formatting: headings (H1-H6), bold, italic, underline, strikethrough, bullet/numbered lists, blockquotes, code blocks, links, images, videos, and embeds. Use Ctrl+S to save draft, Ctrl+Enter to publish, and Ctrl+Shift+P to toggle preview mode. Content is saved as HTML and auto-saved every 2 seconds as a local draft.', category: 'content' },
  { id: 'c4', question: 'How do I manage categories and tags?', answer: 'Navigate to Content → Categories to create, edit, or deactivate categories. Each category has a name, slug, description, and optional icon. Tags can be added freely when editing articles — just type and press Enter. Inactive categories won\'t appear in the frontend but articles assigned to them are preserved.', category: 'content' },
  { id: 'c5', question: 'What are Web Stories and how do I create them?', answer: 'Web Stories are short, visually rich, tap-through stories (like Instagram Stories) designed for mobile. Go to Content → Web Stories → Create New Story. Add slides with backgrounds (images/video), text overlays, and CTAs. Stories can be published, drafted, or archived. They\'re great for breaking news or visual storytelling.', category: 'content' },

  // Users
  { id: 'u1', question: 'How do I add new admin users?', answer: 'Go to Access Control → Team. Click "Add Member", enter their email, name, and assign a role. Roles include Super Admin, Admin, Editor, Author, and Subscriber — each with different permission levels. New users receive an email invite. You can also manage users under System → Users for more detailed control.', category: 'users' },
  { id: 'u2', question: 'What are the available user roles and permissions?', answer: 'Super Admin: Full unrestricted access to all features and settings. Admin: Can manage content, users, and most settings but cannot modify system-level configs. Editor: Can create, edit, and publish content, manage categories and tags. Author: Can create and edit their own content but cannot publish. Subscriber: Read-only access to content. Custom permissions can be configured per user.', category: 'users' },
  { id: 'u3', question: 'How do I reset a user\'s password?', answer: 'Go to System → Users, find the user, and click "Edit". You\'ll see a "Reset Password" option. This generates a password reset link sent to their email, or you can set a temporary password directly. For your own password, go to your Profile page and use the Change Password section.', category: 'users' },

  // Analytics
  { id: 'a1', question: 'How do I read the analytics dashboard?', answer: 'The Analytics page shows: Total Users, Total Articles, Published Articles, Categories, Comments, Newsletter Subscribers, and Page Views. The dashboard pulls real-time data from the database. You can filter by date range, compare periods, and drill into specific metrics. Content Analytics shows per-article performance; Traffic Analytics shows visitor patterns.', category: 'analytics' },
  { id: 'a2', question: 'What metrics are tracked?', answer: 'Page views, unique visitors, time on page, bounce rate, scroll depth, article completion rate, social shares, comments, likes, newsletter signups, and traffic sources. Real-time analytics show active readers and trending content. All data is stored in the database and accessible via the Analytics section.', category: 'analytics' },
  { id: 'a3', question: 'How do I export analytics reports?', answer: 'Navigate to Analytics → Export. Choose your date range, select the metrics to include, and export as CSV or PDF. You can also schedule automatic weekly/monthly report emails to your team from the Analytics settings.', category: 'analytics' },

  // System
  { id: 's1', question: 'How do I configure site settings?', answer: 'Go to System → Settings. Here you can update the site name, tagline, logo, favicon, contact info, social media links, and SEO defaults. Changes are saved to the database and reflected immediately on the frontend. System settings also include notification preferences, Slack integrations, and alert thresholds.', category: 'system' },
  { id: 's2', question: 'How do I backup my data?', answer: 'Navigate to System → Backup. You can trigger a manual backup or configure automatic daily/weekly backups. Backups include all articles, user data, categories, comments, settings, and media metadata. Download backups as compressed archives. For database-level backups, use your hosting provider\'s backup tools alongside this.', category: 'system' },
  { id: 's3', question: 'How do I connect external APIs?', answer: 'Go to External APIs under Developer Tools. You can connect news sources (NewsAPI, GNews), AI services (OpenAI GPT, Gemini), social media (Twitter/X, Facebook), payment gateways (Stripe, Razorpay), notification services (Firebase FCM, SendGrid), storage (Cloudinary, AWS S3), and market data providers. Enter your API key for each service to activate.', category: 'system' },
  { id: 's4', question: 'How do I set up newsletters?', answer: 'Go to Newsletter section. Create templates under Newsletter → Templates, manage subscriber lists under Newsletter → Subscribers, and compose campaigns from the main Newsletter page. Configure email delivery settings in System → Settings (Notifications tab). You can segment subscribers and track open/click rates.', category: 'system' },

  // Moderation
  { id: 'm1', question: 'How does content moderation work?', answer: 'The Moderation section provides tools for reviewing comments, handling user reports, and managing spam. Auto-moderation rules can be configured to automatically flag or remove content containing specific keywords. Reported content is queued for manual review. You can approve, reject, or escalate reported items.', category: 'moderation' },
  { id: 'm2', question: 'How do I handle spam?', answer: 'Go to Moderation → Spam. The spam filter automatically catches common spam patterns. You can add custom blacklist words, whitelist trusted domains, and configure spam sensitivity. Flagged items can be reviewed and either confirmed as spam (deleted) or restored. Enable Akismet or similar services for advanced spam protection.', category: 'moderation' },

  // Advertising
  { id: 'ad1', question: 'How do I set up advertising?', answer: 'Navigate to the Advertising section. You can manage ad placements, configure Google AdSense or AdMob integration, review advertising requests from potential partners, and track ad performance. Ad slots can be configured for different positions on the frontend (header, sidebar, in-article, footer).', category: 'advertising' },
];

const GUIDES: { section: string; icon: string; items: Guide[] }[] = [
  {
    section: 'Getting Started',
    icon: '🚀',
    items: [
      { title: 'Dashboard Overview', description: 'Understand the admin dashboard stats, navigation, and quick actions', link: '/', icon: '📊', readTime: '3 min' },
      { title: 'Creating Your First Article', description: 'Step-by-step guide from writing to publishing your content', link: '/content/new', icon: '✍️', readTime: '5 min' },
      { title: 'Managing Your Profile', description: 'Update your name, password, and account security settings', link: '/profile', icon: '👤', readTime: '2 min' },
    ]
  },
  {
    section: 'Content Management',
    icon: '📝',
    items: [
      { title: 'Working with Categories & Tags', description: 'Organize content with hierarchical categories and flexible tagging', link: '/content/categories', icon: '🏷️', readTime: '4 min' },
      { title: 'Creating Web Stories', description: 'Build mobile-first visual stories with slides, animations, and media', link: '/content/web-stories', icon: '📱', readTime: '6 min' },
      { title: 'Content Workflow & Scheduling', description: 'Draft, review, schedule, and publish content with team collaboration', link: '/content/workflow', icon: '📅', readTime: '5 min' },
      { title: 'Media Library Management', description: 'Upload, organize, and optimize images and files', link: '/media', icon: '🖼️', readTime: '3 min' },
    ]
  },
  {
    section: 'User & Access Control',
    icon: '🔐',
    items: [
      { title: 'Roles & Permissions', description: 'Configure role-based access control for your team', link: '/access', icon: '🛡️', readTime: '5 min' },
      { title: 'Team Management', description: 'Add, manage, and audit team member accounts', link: '/access/team', icon: '👥', readTime: '4 min' },
      { title: 'Audit Logs', description: 'Track all admin actions, login history, and security events', link: '/access/audit', icon: '📋', readTime: '3 min' },
    ]
  },
  {
    section: 'Analytics & Performance',
    icon: '📈',
    items: [
      { title: 'Reading Analytics', description: 'Understand traffic, engagement, and content performance metrics', link: '/analytics', icon: '📊', readTime: '6 min' },
      { title: 'Real-time Monitoring', description: 'See who\'s reading what right now with live analytics', link: '/analytics/realtime', icon: '⚡', readTime: '3 min' },
      { title: 'Exporting Reports', description: 'Generate and download analytics reports for stakeholders', link: '/analytics/export', icon: '📤', readTime: '3 min' },
    ]
  },
  {
    section: 'System & Configuration',
    icon: '⚙️',
    items: [
      { title: 'Site Configuration', description: 'Customize site name, logo, SEO defaults, and feature toggles', link: '/config', icon: '🔧', readTime: '5 min' },
      { title: 'External API Setup', description: 'Connect news feeds, AI services, and third-party integrations', link: '/external-apis', icon: '🔌', readTime: '8 min' },
      { title: 'System Backup & Recovery', description: 'Configure automated backups and restore from snapshots', link: '/system/backup', icon: '💾', readTime: '4 min' },
      { title: 'Debug & Diagnostics', description: 'Check service health, auth state, and environment configuration', link: '/debug', icon: '🏥', readTime: '3 min' },
    ]
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: '📚' },
  { id: 'content', label: 'Content', icon: '📝' },
  { id: 'users', label: 'Users & Access', icon: '👥' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'system', label: 'System', icon: '⚙️' },
  { id: 'moderation', label: 'Moderation', icon: '🛡️' },
  { id: 'advertising', label: 'Advertising', icon: '📢' },
];

const SHORTCUTS = [
  { keys: 'Ctrl + N', action: 'New Article' },
  { keys: 'Ctrl + S', action: 'Save Draft' },
  { keys: 'Ctrl + Enter', action: 'Publish Article' },
  { keys: 'Ctrl + Shift + P', action: 'Toggle Preview' },
  { keys: 'Ctrl + Shift + S', action: 'Split View' },
  { keys: 'Ctrl + /', action: 'Global Search' },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch = !searchTerm || faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Help Center</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Guides, FAQs, and keyboard shortcuts for the NewsTRNT Admin Panel
        </p>
        <div className="relative max-w-lg mx-auto mt-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {[
          { label: 'New Article', href: '/content/new', icon: '✍️' },
          { label: 'Analytics', href: '/analytics', icon: '📊' },
          { label: 'Users', href: '/users', icon: '👥' },
          { label: 'Settings', href: '/system/settings', icon: '⚙️' },
          { label: 'API Test', href: '/api-test', icon: '🧪' },
          { label: 'Debug', href: '/debug', icon: '🏥' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:bg-muted/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-6 space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Browse Topics</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <span>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Keyboard Shortcuts</h3>
              <div className="space-y-2">
                {SHORTCUTS.map(s => (
                  <div key={s.keys} className="flex items-center justify-between text-xs">
                    <kbd className="px-2 py-0.5 bg-muted border border-border rounded font-mono text-muted-foreground">{s.keys}</kbd>
                    <span className="text-muted-foreground">{s.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* User Guides */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">User Guides</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Step-by-step guides for every feature</p>
            </div>
            <div className="p-6 space-y-8">
              {GUIDES.map(section => (
                <div key={section.section}>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <span>{section.icon}</span> {section.section}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.items.map(guide => (
                      <Link
                        key={guide.link}
                        href={guide.link}
                        className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted/40 hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
                      >
                        <span className="text-xl mt-0.5">{guide.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{guide.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{guide.description}</p>
                          <span className="text-[11px] text-muted-foreground mt-1 inline-block">{guide.readTime} read</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{filteredFAQs.length} questions</p>
            </div>
            <div className="divide-y divide-border">
              {filteredFAQs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <span className="text-3xl block mb-2">🔍</span>
                  <p>No results found for &ldquo;{searchTerm}&rdquo;</p>
                </div>
              ) : (
                filteredFAQs.map(faq => (
                  <div key={faq.id}>
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-medium text-foreground text-sm pr-4">{faq.question}</span>
                      <span className={`text-muted-foreground shrink-0 transition-transform duration-200 ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-border rounded-2xl p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">Still need help?</h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Contact the development team or check the debug tools for system diagnostics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:support@newstrnt.com"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Email Support
              </a>
              <Link
                href="/debug"
                className="px-5 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                System Diagnostics
              </Link>
              <Link
                href="/api-test"
                className="px-5 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                API Health
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
