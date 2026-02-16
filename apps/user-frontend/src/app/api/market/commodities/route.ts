// Market Data API - Commodities Endpoint (proxy to user-backend)
// GET /api/market/commodities

import { NextRequest, NextResponse } from 'next/server';

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const url = `${API_URL}/market/commodities${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[Commodities API] Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commodities' },
      { status: 500 }
    );
  }
}
