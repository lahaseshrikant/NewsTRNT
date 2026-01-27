// Admin Market Configuration Overview API
// GET /api/admin/market-config
// Proxies to backend API for market configuration data

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-middleware';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const auth = verifyAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Proxy to backend API
    const response = await fetch(
      `${BACKEND_API_URL}/admin/market-config?includeInactive=${includeInactive}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      // Return mock data for development if backend doesn't have this endpoint yet
      return NextResponse.json({
        success: true,
        data: {
          indices: [],
          cryptocurrencies: [],
          commodities: [],
          currencies: [],
        },
        counts: {
          indices: 0,
          cryptocurrencies: 0,
          commodities: 0,
          currencies: 0,
          total: 0,
        },
        note: 'Backend market-config endpoint not available'
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Admin Market Config] Failed to fetch configurations:', error);
    // Return empty config if backend is unavailable
    return NextResponse.json({
      success: true,
      data: {
        indices: [],
        cryptocurrencies: [],
        commodities: [],
        currencies: [],
      },
      counts: {
        indices: 0,
        cryptocurrencies: 0,
        commodities: 0,
        currencies: 0,
        total: 0,
      },
      note: 'Backend unavailable - using empty config'
    });
  }
}
