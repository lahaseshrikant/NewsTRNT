// Debug endpoint to check market data
import { NextRequest, NextResponse } from 'next/server';
// Database access moved to backend - this is a debug endpoint

// Symbol to country mapping (Yahoo format symbols)
const SYMBOL_TO_COUNTRY: Record<string, string> = {
  // Americas
  '^GSPC': 'US', '^DJI': 'US', '^IXIC': 'US', '^RUT': 'US', '^VIX': 'US',
  '^GSPTSE': 'CA', '^TSXV': 'CA',
  '^BVSP': 'BR',
  '^MXX': 'MX',
  '^MERV': 'AR',
  '^IPSA': 'CL',
  // Europe
  '^FTSE': 'GB', '^FTMC': 'GB',
  '^GDAXI': 'DE', '^MDAX': 'DE',
  '^FCHI': 'FR',
  '^FTSEMIB': 'IT',
  '^IBEX': 'ES',
  '^AEX': 'NL',
  '^SSMI': 'CH',
  '^BFX': 'BE',
  '^OMX': 'SE', '^OMXS30': 'SE',
  '^OSEBX': 'NO',
  '^OMXC20': 'DK',
  '^IMOEX': 'RU', '^RTS': 'RU',
  '^WIG20': 'PL',
  '^STOXX50E': 'EU', '^STOXX': 'EU',
  // Asia
  '^N225': 'JP', '^TOPIX': 'JP',
  '^SSE': 'CN', '^SZSE': 'CN', '^CSI300': 'CN',
  '^HSI': 'HK', '^HSCEI': 'HK',
  '^NSEI': 'IN', '^BSESN': 'IN', '^NSEBANK': 'IN',
  '^KS11': 'KR', '^KQ11': 'KR',
  '^TWII': 'TW',
  '^STI': 'SG',
  '^KLSE': 'MY',
  '^SET': 'TH',
  '^JKSE': 'ID',
  // Middle East & Africa
  '^TASI': 'SA',
  '^QSI': 'QA',
  '^ADI': 'AE', '^DFMGI': 'AE',
  '^TA35': 'IL', '^TA125': 'IL',
  '^EGX30': 'EG',
  '^J203': 'ZA',
  '^NGS30': 'NG',
  // Oceania
  '^AXJO': 'AU', '^AORD': 'AU',
  '^NZ50': 'NZ',
  // European smaller
  '^PSI20': 'PT',
  '^ATX': 'AT',
  '^OMXH25': 'FI',
};

export async function GET(request: NextRequest) {
  try {
    // Database access moved to backend
    // Return info about available debug endpoints
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint - database access moved to backend',
      note: 'Use backend API for database queries',
      totalIndices: 0,
      byCountry: [],
      allSymbols: [],
    });
  } catch (error) {
    console.error('[Debug API] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Fix country codes for existing indices
export async function POST(request: NextRequest) {
  try {
    // Database access moved to backend
    return NextResponse.json({
      success: false,
      message: 'Database operations moved to backend API',
      note: 'Use backend API /api/admin/market-config for updates',
      updates: [],
    });
  } catch (error) {
    console.error('[Debug API] Error fixing countries:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
