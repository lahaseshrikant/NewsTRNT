// middleware.ts
// Next.js middleware for security headers and protection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers to apply to all responses
const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter in browsers
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  
  // HSTS - only in production
  ...(process.env.NODE_ENV === 'production' ? {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  } : {}),
};

// Content Security Policy - dynamically include API URL
const getCSPDirectives = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': ["'self'", "data:", "blob:", "https:", "http:"],
    'connect-src': ["'self'", apiUrl, siteUrl, "https://*.neon.tech", "wss:", "https://api.coingecko.com", "https://finnhub.io", "https://www.alphavantage.co"].filter(Boolean),
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
  };
};

function buildCSP(): string {
  return Object.entries(getCSPDirectives())
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Apply CSP (relaxed in development for HMR)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', buildCSP());
  } else {
    // Development: more permissive CSP for hot reload
    response.headers.set('Content-Security-Policy', 
      "default-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "img-src 'self' data: blob: https: http:; " +
      "connect-src 'self' ws: wss: http: https:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
    );
  }

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Apply to all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
};
