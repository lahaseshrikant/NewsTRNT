/**
 * Market Data Ingestion API
 * Proxies to backend for database operations
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy to backend
    const response = await fetch(`${BACKEND_API_URL}/market/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return NextResponse.json({
      success: false,
      error: 'Backend ingestion endpoint unavailable',
      note: 'Database operations moved to backend API',
    }, { status: 503 });
  } catch (error) {
    console.error('[Market Ingest] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to ingest market data',
      note: 'Database operations moved to backend API',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Proxy to backend for stats
    const response = await fetch(`${BACKEND_API_URL}/market/ingest/stats`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return NextResponse.json({
      success: true,
      note: 'Database stats moved to backend API',
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
      },
      recentRuns: [],
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      note: 'Backend unavailable - stats moved to backend API',
      stats: { totalRuns: 0, successfulRuns: 0, failedRuns: 0 },
      recentRuns: [],
    });
  }
}
