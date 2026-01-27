// src/app/api/admin/login/route.ts
// Server-side admin login endpoint with rate limiting

import { NextRequest, NextResponse } from 'next/server';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';
import { checkRateLimit } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  // Rate limiting: 5 login attempts per minute per IP
  const identifier = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
  const rateLimit = checkRateLimit(request, { 
    maxRequests: 5, 
    windowMs: 60000,
    identifier: `login:${identifier}`
  });
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many login attempts. Please wait before trying again.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Perform login on server side (where env vars are available)
    const result = UnifiedAdminAuth.login(email, password);

    if (result.success && result.session) {
      // Return session data
      return NextResponse.json({
        success: true,
        session: {
          userId: result.session.userId,
          email: result.session.email,
          role: result.session.role,
          permissions: result.session.permissions,
          loginTime: result.session.loginTime,
          expiresAt: result.session.expiresAt
        },
        sessionId: result.session.sessionId
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Login failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
