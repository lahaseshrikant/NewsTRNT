// Market Data Auto-Update Control API
// POST /api/market/auto-update - Start/stop/status

import { NextRequest, NextResponse } from 'next/server';
import { 
  startMarketDataUpdates, 
  stopMarketDataUpdates, 
  getServiceStatus,
  updateIntervals,
  runTradingViewScrapeNow,
} from '@/lib/market-auto-update';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, intervals } = body;

    switch (action) {
      case 'start':
        startMarketDataUpdates();
        return NextResponse.json({ 
          success: true, 
          message: 'Auto-update service started',
          status: getServiceStatus()
        });

      case 'stop':
        stopMarketDataUpdates();
        return NextResponse.json({ 
          success: true, 
          message: 'Auto-update service stopped',
          status: getServiceStatus()
        });

      case 'status':
        return NextResponse.json({ 
          success: true,
          status: getServiceStatus()
        });

      case 'update-intervals':
        if (!intervals) {
          return NextResponse.json(
            { error: 'Intervals object required' },
            { status: 400 }
          );
        }
        updateIntervals(intervals);
        return NextResponse.json({ 
          success: true, 
          message: 'Intervals updated. Restart service to apply changes.',
          status: getServiceStatus()
        });

      case 'run-tradingview-scraper':
        try {
          const result = await runTradingViewScrapeNow();
          return NextResponse.json({
            success: true,
            message: 'TradingView fallback refreshed',
            result,
            status: getServiceStatus(),
          });
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to refresh TradingView fallback',
            },
            { status: 500 },
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, status, or update-intervals' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auto-update control error:', error);
    return NextResponse.json(
      { error: 'Failed to control auto-update service' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = getServiceStatus();
    return NextResponse.json({
      success: true,
      status: status,
      info: {
        description: 'Market data is automatically updated in the background'
      }
    });
  } catch (error) {
    console.error('Failed to get auto-update status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get service status',
        status: {
          isRunning: false,
          intervals: { crypto: '0s', indices: '0s', currencies: '0s', commodities: '0s' },
          intervalsMinutes: { crypto: 0, indices: 0, currencies: 0, commodities: 0 }
        }
      },
      { status: 500 }
    );
  }
}
