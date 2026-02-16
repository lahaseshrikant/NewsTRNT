/**
 * Market Data Health Check API
 * Returns health status (proxies to backend for database checks)
 */

import { NextResponse } from 'next/server';

import { API_CONFIG } from '@/config/api';
const BACKEND_API_URL = API_CONFIG.baseURL;

export async function GET() {
  try {
    // Try to proxy to backend health check
    const response = await fetch(`${BACKEND_API_URL}/market/health`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    // Return basic health info if backend unavailable
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overall: {
        status: 'unknown',
        message: 'Backend health check unavailable - using frontend stub',
      },
      data: {
        marketIndices: { count: 0, health: { status: 'unknown', message: 'Backend unavailable' } },
        cryptocurrencies: { count: 0, health: { status: 'unknown', message: 'Backend unavailable' } },
        currencies: { count: 0, health: { status: 'unknown', message: 'Backend unavailable' } },
        commodities: { count: 0, health: { status: 'unknown', message: 'Backend unavailable' } },
      },
      endpoints: {
        health: '/api/market/health',
        ingest: '/api/market/ingest',
        update: '/api/market/update',
        country: '/api/market/country',
        crypto: '/api/market/crypto',
        currencies: '/api/market/currencies',
        commodities: '/api/market/commodities',
      },
      note: 'Database health checks moved to backend API',
    });
  } catch (error) {
    console.error('[Market Health] Error:', error);
    return NextResponse.json({
      success: false,
      status: 'unknown',
      error: 'Backend unavailable',
      note: 'Database health checks moved to backend API',
      timestamp: new Date().toISOString(),
    });
  }
}
