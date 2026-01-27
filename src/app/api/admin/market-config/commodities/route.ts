// API route for managing commodities configuration
// Proxies to backend API

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-middleware';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
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

    const response = await fetch(
      `${BACKEND_API_URL}/admin/market-config/commodities?includeInactive=${includeInactive}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        commodities: [],
        count: 0,
        note: 'Backend endpoint not available'
      });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('Error fetching commodities config:', error);
    return NextResponse.json({
      success: true,
      commodities: [],
      count: 0,
      note: 'Backend unavailable'
    });
  }
}

export async function POST(request: NextRequest) {
  const auth = verifyAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_API_URL}/admin/market-config/commodities`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Backend endpoint not available' },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('Error creating commodity config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create commodity configuration' },
      { status: 500 }
    );
  }
}
