// API route for managing cryptocurrency configuration
// GET: Fetch all cryptocurrencies
// POST: Create new cryptocurrency

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@backend/config/database';
import { clearConfigCache } from '@/lib/market-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = includeInactive ? {} : { isActive: true };

    // @ts-ignore
    const cryptos = await prisma.cryptocurrencyConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      cryptos,
      count: cryptos.length,
    });
  } catch (error) {
    console.error('Error fetching cryptocurrency config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cryptocurrency configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // @ts-ignore
    const newCrypto = await prisma.cryptocurrencyConfig.create({
      data: {
        symbol: body.symbol,
        name: body.name,
        coinGeckoId: body.coinGeckoId,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    // Clear cache after update
    clearConfigCache();

    return NextResponse.json({
      success: true,
      crypto: newCrypto,
      message: 'Cryptocurrency created successfully',
    });
  } catch (error) {
    console.error('Error creating cryptocurrency config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cryptocurrency configuration' },
      { status: 500 }
    );
  }
}
