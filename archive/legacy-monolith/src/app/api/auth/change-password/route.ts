// src/app/api/auth/change-password/route.ts - Password change endpoint
import { NextRequest, NextResponse } from 'next/server';
import SecureAuth from '@/lib/secure-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Get user from authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token to get user ID (simplified)
    // In production, properly decode the token
    const sessionId = request.headers.get('X-Session-ID') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    const authResult = SecureAuth.verifyAuth(token, sessionId, csrfToken);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Change password
    const result = await SecureAuth.changePassword(
      authResult.user.id,
      currentPassword,
      newPassword
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { success: false, error: 'Password change failed' },
      { status: 500 }
    );
  }
}
