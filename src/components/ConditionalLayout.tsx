"use client";

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current route is admin
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Check if current route is a web story viewer (individual story)
  const isWebStoryViewer = pathname.match(/^\/web-stories\/[^\/]+$/);
  
  // For admin routes and web story viewers, render only children without site header/footer
  if (isAdminRoute || isWebStoryViewer) {
    return <>{children}</>;
  }
  
  // For regular site routes, render with header and footer
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
