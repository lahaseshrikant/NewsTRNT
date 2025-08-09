"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      setIsLoggedIn(!!(authToken && user));
    };

    // Initial check
    checkAuthStatus();
    setMounted(true);

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab login/logout
    window.addEventListener('authStatusChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStatusChanged', handleStorageChange);
    };
  }, []);
  
  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {children}
    </div>;
  }
  
  // Check if current route is admin
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Check if current route is a web story viewer (individual story)
  const isWebStoryViewer = pathname.match(/^\/web-stories\/[^\/]+$/);
  
  // For admin routes and web story viewers, render only children without site header/footer
  if (isAdminRoute || isWebStoryViewer) {
    return <>{children}</>;
  }
  
  // For regular site routes when user is NOT logged in, render without header/footer
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {children}
      </div>
    );
  }
  
  // For regular site routes when user IS logged in, render with header and footer
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
