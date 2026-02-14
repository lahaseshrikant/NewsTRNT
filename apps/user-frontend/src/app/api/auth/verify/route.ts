// src/app/api/auth/verify/route.ts - Token verification proxy
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const res = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization')
          ? { Authorization: request.headers.get('Authorization')! }
          : {}),
        ...(request.headers.get('X-CSRF-Token')
          ? { 'X-CSRF-Token': request.headers.get('X-CSRF-Token')! }
          : {}),
      },
      body,
    });

    const data = await res.json();

    const response = NextResponse.json(data, { status: res.status });
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    return response;
  } catch (error) {
    console.error('Verify API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
