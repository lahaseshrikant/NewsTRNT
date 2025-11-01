// Test Market Data API Connectivity
// GET /api/market/test-connectivity

import { NextResponse } from 'next/server';
import { testAPIConnectivity } from '@/lib/real-market-data';

export async function GET() {
  try {
    const results = await testAPIConnectivity();
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      apis: results,
      message: 'API connectivity test completed',
      recommendations: {
        alphaVantage: results.alphaVantage 
          ? 'Connected successfully' 
          : 'Not connected - Add ALPHA_VANTAGE_API_KEY to .env.local',
        finnhub: results.finnhub 
          ? 'Connected successfully' 
          : 'Not connected - Add FINNHUB_API_KEY to .env.local (optional)',
        coingecko: results.coingecko 
          ? 'Connected successfully' 
          : 'Not connected - Check internet connection',
        exchangeRate: results.exchangeRate 
          ? 'Connected successfully' 
          : 'Not connected - Check internet connection',
      },
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to test API connectivity',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
