// Market Data API - Currencies Endpoint (proxy to user-backend)
// GET /api/market/currencies

import { NextRequest, NextResponse } from 'next/server';

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const url = `${API_URL}/market/currencies${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[Currencies API] Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 },
    );
  }
}
