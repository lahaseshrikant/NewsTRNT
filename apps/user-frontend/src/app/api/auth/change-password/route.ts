// src/app/api/auth/change-password/route.ts - Proxies to user-backend
import { NextRequest, NextResponse } from 'next/server';

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL.replace(/\/api\/?$/, '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization') || '';

    const res = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Change password proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Password change failed' },
      { status: 500 }
    );
  }
}
