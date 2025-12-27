// Debug endpoint to check market data
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@backend/config/database';

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
    // Get all indices from database
    const indices = await prisma.marketIndex.findMany({
      select: {
        symbol: true,
        name: true,
        country: true,
        value: true,
      },
      orderBy: { symbol: 'asc' },
    });

    // Group by country
    const byCountry: Record<string, typeof indices> = {};
    for (const idx of indices) {
      const country = idx.country || 'UNKNOWN';
      if (!byCountry[country]) {
        byCountry[country] = [];
      }
      byCountry[country].push(idx);
    }

    return NextResponse.json({
      success: true,
      totalIndices: indices.length,
      byCountry: Object.entries(byCountry).map(([country, items]) => ({
        country,
        count: items.length,
        symbols: items.map(i => i.symbol),
      })),
      allSymbols: indices.map(i => i.symbol),
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
    const indices = await prisma.marketIndex.findMany({
      where: { country: 'UNKNOWN' },
      select: { id: true, symbol: true },
    });

    let updated = 0;
    const updates: { symbol: string; country: string }[] = [];

    for (const idx of indices) {
      const country = SYMBOL_TO_COUNTRY[idx.symbol];
      if (country) {
        await prisma.marketIndex.update({
          where: { id: idx.id },
          data: { country },
        });
        updated++;
        updates.push({ symbol: idx.symbol, country });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed country codes for ${updated} indices`,
      updates,
    });
  } catch (error) {
    console.error('[Debug API] Error fixing countries:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
