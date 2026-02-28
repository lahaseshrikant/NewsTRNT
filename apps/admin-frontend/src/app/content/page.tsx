"use client";

import React from'react';
import Link from'next/link';
import {
 PlusIcon, DocumentTextIcon, PhotoIcon, ChartBarIcon,
} from'@/components/icons/AdminIcons';

/* ─── Section Link ─── */
function SectionCard({ href, icon: Icon, title, desc, count }: {
 href: string; icon: React.FC<{ className?: string }>; title: string; desc: string; count?: string;
}) {
 return (
 <Link
 href={href}
 className="group bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] p-5 transition-all duration-200 hover:shadow-sm hover:shadow-black/[0.04] dark:hover:shadow-black/[0.2] hover:-translate-y-0.5 hover:border-[rgb(var(--primary))/0.2]"
 >
 <div className="flex items-start gap-4">
 <div className="p-2.5 rounded-lg bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] group-hover:bg-[rgb(var(--primary))/0.1] group-hover:text-[rgb(var(--primary))] transition-colors">
 <Icon className="w-5 h-5" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors">{title}</h3>
 {count && (
 <span className="text-xs font-medium text-[rgb(var(--muted-foreground))] bg-[rgb(var(--muted))] px-2 py-0.5 rounded-full">{count}</span>
 )}
 </div>
 <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 leading-relaxed">{desc}</p>
 </div>
 </div>
 </Link>
 );
}

/* ─── Page ─── */
export default function ContentPage() {
 const quickLinks = [
 { href:'/content/new', icon: PlusIcon, label:'New Article' },
 { href:'/content/articles', icon: DocumentTextIcon, label:'Articles' },
 { href:'/content/drafts', icon: DocumentTextIcon, label:'Drafts' },
 { href:'/content/categories', icon: DocumentTextIcon, label:'Categories' },
 { href:'/content/tags', icon: DocumentTextIcon, label:'Tags' },
 { href:'/media', icon: PhotoIcon, label:'Media' },
 ];

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] tracking-tight">Content Management</h1>
 <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
 Create, organize, and manage all your platform content.
 </p>
 </div>
 <Link
 href="/content/new"
 className="inline-flex items-center gap-1.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
 >
 <PlusIcon className="w-4 h-4" />
 New Article
 </Link>
 </div>

 {/* Quick Navigation */}
 <div className="flex flex-wrap gap-2">
 {quickLinks.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--primary))/0.3] transition-colors"
 >
 <link.icon className="w-3.5 h-3.5" />
 {link.label}
 </Link>
 ))}
 </div>

 {/* Content Sections */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 <SectionCard
 href="/content/articles"
 icon={DocumentTextIcon}
 title="Articles"
 desc="Browse, edit, and publish your news articles and blog posts."
 />
 <SectionCard
 href="/content/web-stories"
 icon={PhotoIcon}
 title="Web Stories"
 desc="Create immersive visual stories optimized for mobile readers."
 />
 <SectionCard
 href="/content/categories"
 icon={DocumentTextIcon}
 title="Categories"
 desc="Organize your content hierarchy with categories and subcategories."
 />
 <SectionCard
 href="/content/tags"
 icon={DocumentTextIcon}
 title="Tags"
 desc="Manage tags for better content discovery and SEO."
 />
 <SectionCard
 href="/content/calendar"
 icon={DocumentTextIcon}
 title="Editorial Calendar"
 desc="Plan and schedule content across your publishing timeline."
 />
 <SectionCard
 href="/content/workflow"
 icon={DocumentTextIcon}
 title="Workflow"
 desc="Track content through review, approval, and publishing stages."
 />
 <SectionCard
 href="/content/drafts"
 icon={DocumentTextIcon}
 title="Drafts"
 desc="In-progress articles awaiting review or publication."
 />
 <SectionCard
 href="/media"
 icon={PhotoIcon}
 title="Media Library"
 desc="Upload and manage images, videos, and other assets."
 />
 <SectionCard
 href="/content/trash"
 icon={DocumentTextIcon}
 title="Trash"
 desc="View and restore recently deleted content."
 />
 <SectionCard
 href="/content/navigation"
 icon={DocumentTextIcon}
 title="Navigation"
 desc="Configure site menus, headers, and footer navigation."
 />
 <SectionCard
 href="/analytics/content"
 icon={ChartBarIcon}
 title="Content Analytics"
 desc="Monitor article performance, engagement, and trends."
 />
 </div>
 </div>
 );
}
