"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerformanceMonitor from "@/components/PerformanceMonitor";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Stable layout with fixed minimum height to prevent CLS
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <PerformanceMonitor />
        {children}
      </div>
    );
  }
  
  // Check if current route is admin
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Check if current route is a web story viewer (individual story)
  const isWebStoryViewer = pathname.match(/^\/web-stories\/[^\/]+$/);
  
  // For admin routes and web story viewers, render only children without site header/footer
  if (isAdminRoute || isWebStoryViewer) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <PerformanceMonitor />
        {children}
      </div>
    );
  }
  
  // For all regular site routes, render with header and footer (regardless of login status)
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <PerformanceMonitor />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
