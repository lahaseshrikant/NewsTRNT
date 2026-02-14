/**
 * Market Data Update API
 * Proxies to backend for database operations
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(_request: NextRequest) {
  try {
    // Proxy to backend
    const response = await fetch(`${BACKEND_API_URL}/market/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return NextResponse.json({
      success: false,
      error: 'Backend update endpoint unavailable',
      note: 'Database operations moved to backend API',
    }, { status: 503 });
  } catch (error) {
    console.error('[Market Update] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update market data',
      note: 'Database operations moved to backend API',
    }, { status: 500 });
  }
}
