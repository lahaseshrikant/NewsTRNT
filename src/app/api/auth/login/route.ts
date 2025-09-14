// src/app/api/auth/login/route.ts - Simple login endpoint
import { NextRequest, NextResponse } from 'next/server';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt authentication using UnifiedAdminAuth
    const result = UnifiedAdminAuth.login(email, password);

    if (result.success && result.session) {
      // Create a basic token for compatibility with existing frontend
      const token = Buffer.from(JSON.stringify({
        email: result.session.email,
        role: result.session.role,
        userId: result.session.userId,
        sessionId: result.session.sessionId,
        loginTime: result.session.loginTime
      })).toString('base64');

      const response = NextResponse.json({
        success: true,
        token,
        user: {
          email: result.session.email,
          isAdmin: result.session.role === 'ADMIN' || result.session.role === 'SUPER_ADMIN',
          isSuperAdmin: result.session.role === 'SUPER_ADMIN'
        }
      });
      
      // Set security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid credentials' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication service unavailable' },
      { status: 500 }
    );
  }
}
