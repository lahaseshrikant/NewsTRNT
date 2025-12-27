// Test Market Data API Connectivity
// GET /api/market/test-connectivity

import { NextResponse } from 'next/server';
import { testAPIConnectivity } from '@/lib/real-market-data';

export async function GET() {
  try {
    const { statuses, errors } = await testAPIConnectivity();
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      apis: statuses,
      errors,
      message: 'API connectivity test completed',
      recommendations: {
        alphaVantage: statuses.alphaVantage 
          ? 'Connected successfully' 
          : errors.alphaVantage
            ? `Alpha Vantage error: ${errors.alphaVantage}`
            : 'Not connected - Add ALPHA_VANTAGE_API_KEY to .env.local',
        finnhub: statuses.finnhub 
          ? 'Connected successfully' 
          : errors.finnhub
            ? `Finnhub error: ${errors.finnhub}`
            : 'Not connected - Add FINNHUB_API_KEY to .env.local (optional)',
        coingecko: statuses.coingecko 
          ? 'Connected successfully' 
          : errors.coingecko
            ? `CoinGecko error: ${errors.coingecko}`
            : 'Not connected - Check internet connection',
        exchangeRate: statuses.exchangeRate 
          ? 'Connected successfully' 
          : errors.exchangeRate
            ? `Exchange Rate error: ${errors.exchangeRate}`
            : 'Not connected - Check internet connection',
        marketstack: statuses.marketstack
          ? 'Connected successfully'
          : errors.marketstack
            ? `MarketStack error: ${errors.marketstack}`
            : 'Not connected - Add MARKETSTACK_API_KEY to .env.local (optional fallback)',
        twelveData: statuses.twelveData
          ? 'Connected successfully'
          : errors.twelveData
            ? `TwelveData error: ${errors.twelveData}`
            : 'Not connected - Add TWELVE_DATA_API_KEY to .env.local (optional intraday provider)',
        fmp: statuses.fmp
          ? 'Connected successfully'
          : errors.fmp
            ? `FMP error: ${errors.fmp}`
            : 'Not connected - Add FMP_API_KEY to .env.local (optional fundamentals provider)',
        tradingview: statuses.tradingview
          ? 'Latest TradingView snapshot found'
          : errors.tradingview
            ? `TradingView fallback issue: ${errors.tradingview}`
            : 'No snapshot detected - run the TradingView scraper to enable fallback data',
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
