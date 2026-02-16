// Market Data API - Country Endpoint (proxy to user-backend)
// GET /api/market/country/[country]

import { NextRequest, NextResponse } from 'next/server';

import { API_CONFIG } from '@/config/api';
const API_URL = API_CONFIG.baseURL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params;
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const url = `${API_URL}/market/by-country/${country}${qs ? `?${qs}` : ''}`;

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
    console.error('[Country Market API] Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data for country' },
      { status: 500 }
    );
  }
}
