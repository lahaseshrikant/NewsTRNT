// src/app/api/auth/logout/route.ts - Secure logout endpoint
import { NextRequest, NextResponse } from 'next/server';
import SecureAuth from '@/lib/secure-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (sessionId) {
      SecureAuth.logout(sessionId);
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
