// src/app/api/auth/verify/route.ts - Token verification endpoint
import { NextRequest, NextResponse } from 'next/server';
import SecureAuth from '@/lib/secure-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, sessionId, csrfToken } = body;

    // Verify CSRF token from header
    const headerCsrfToken = request.headers.get('X-CSRF-Token');
    if (headerCsrfToken !== csrfToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Verify authentication
    const result = SecureAuth.verifyAuth(token, sessionId, csrfToken);

    if (result.success) {
      const response = NextResponse.json(result);
      
      // Set security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');

      return response;
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
