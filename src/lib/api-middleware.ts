// src/lib/api-middleware.ts
// Server-side middleware utilities for Next.js API routes

import { NextRequest, NextResponse } from 'next/server';
import UnifiedAdminAuth from './unified-admin-auth';
import Security from './security';

// Session storage keys (must match UnifiedAdminGuard.tsx)
const SESSION_STORAGE_KEY = 'admin_session';
const SESSION_ID_KEY = 'admin_session_id';

export interface AuthenticatedRequest extends NextRequest {
  admin?: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

/**
 * Verify admin session from request headers/cookies
 */
export function verifyAdminAuth(request: NextRequest): {
  isAuthenticated: boolean;
  session?: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  };
  error?: string;
} {
  try {
    // Get session ID from header or cookie
    const sessionId = request.headers.get('x-session-id') || 
                      request.cookies.get(SESSION_ID_KEY)?.value;
    
    if (!sessionId) {
      return { isAuthenticated: false, error: 'No session provided' };
    }

    // Validate session using UnifiedAdminAuth
    const result = UnifiedAdminAuth.validateSession(sessionId);
    
    if (result.valid && result.session) {
      return {
        isAuthenticated: true,
        session: {
          userId: result.session.userId,
          email: result.session.email,
          role: result.session.role,
          permissions: [...result.session.permissions]
        }
      };
    }

    return { isAuthenticated: false, error: result.error || 'Invalid session' };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { isAuthenticated: false, error: 'Authentication error' };
  }
}

/**
 * Middleware wrapper to require admin authentication
 */
export function withAdminAuth(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options?: { requiredPermission?: string; requireSuperAdmin?: boolean }
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const auth = verifyAdminAuth(request);

    if (!auth.isAuthenticated || !auth.session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Check for super admin requirement
    if (options?.requireSuperAdmin && auth.session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Super admin access required' },
        { status: 403 }
      );
    }

    // Check for specific permission
    if (options?.requiredPermission && !auth.session.permissions.includes(options.requiredPermission)) {
      return NextResponse.json(
        { error: 'Forbidden', message: `Missing permission: ${options.requiredPermission}` },
        { status: 403 }
      );
    }

    // Add admin info to request (via header for downstream use)
    const modifiedRequest = request;
    
    return handler(modifiedRequest, context);
  };
}

/**
 * Rate limiting middleware
 */
export function checkRateLimit(
  request: NextRequest,
  options: { maxRequests?: number; windowMs?: number; identifier?: string } = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { maxRequests = 100, windowMs = 60000 } = options;
  
  // Get identifier (IP or custom)
  const identifier = options.identifier || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
  
  return Security.checkRateLimit(identifier, maxRequests, windowMs);
}

/**
 * Middleware wrapper with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: { maxRequests?: number; windowMs?: number } = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const rateLimit = checkRateLimit(request, options);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too Many Requests', 
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt)
          }
        }
      );
    }

    const response = await handler(request, context);
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set('X-RateLimit-Reset', String(rateLimit.resetAt));
    
    return response;
  };
}

/**
 * Combined middleware: auth + rate limit
 */
export function withAuthAndRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    requiredPermission?: string;
    requireSuperAdmin?: boolean;
    maxRequests?: number;
    windowMs?: number;
  } = {}
) {
  return withRateLimit(
    withAdminAuth(handler, {
      requiredPermission: options.requiredPermission,
      requireSuperAdmin: options.requireSuperAdmin
    }),
    { maxRequests: options.maxRequests, windowMs: options.windowMs }
  );
}

/**
 * Validate and sanitize input
 */
export function validateInput<T>(
  data: unknown,
  schema: { [K in keyof T]: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'optional' }
): { valid: boolean; data?: T; errors?: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid input data'] };
  }

  const errors: string[] = [];
  const validated: Partial<T> = {};
  const input = data as Record<string, unknown>;

  for (const [key, type] of Object.entries(schema)) {
    const value = input[key];

    if (type === 'optional') {
      if (value !== undefined) {
        validated[key as keyof T] = Security.sanitizeInput(String(value)) as T[keyof T];
      }
      continue;
    }

    if (value === undefined || value === null) {
      errors.push(`${key} is required`);
      continue;
    }

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${key} must be a string`);
        } else {
          validated[key as keyof T] = Security.sanitizeInput(value) as T[keyof T];
        }
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`${key} must be a number`);
        } else {
          validated[key as keyof T] = Number(value) as T[keyof T];
        }
        break;
      case 'boolean':
        validated[key as keyof T] = Boolean(value) as T[keyof T];
        break;
      case 'email':
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${key} must be a valid email`);
        } else {
          validated[key as keyof T] = Security.sanitizeInput(value.toLowerCase()) as T[keyof T];
        }
        break;
      case 'url':
        try {
          new URL(String(value));
          validated[key as keyof T] = Security.sanitizeInput(String(value)) as T[keyof T];
        } catch {
          errors.push(`${key} must be a valid URL`);
        }
        break;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: validated as T };
}
