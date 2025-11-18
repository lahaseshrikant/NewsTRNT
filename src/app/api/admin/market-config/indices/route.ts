// API route for managing market indices configuration
// GET: Fetch all indices
// POST: Create new index

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@backend/config/database';
import { clearConfigCache } from '@/lib/market-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = includeInactive ? {} : { isActive: true };

    // @ts-ignore
    const indices = await prisma.marketIndexConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      indices,
      count: indices.length,
    });
  } catch (error) {
    console.error('Error fetching market indices config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch indices configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // @ts-ignore
    const newIndex = await prisma.marketIndexConfig.create({
      data: {
        symbol: body.symbol,
        name: body.name,
        country: body.country,
        region: body.region || [],
        exchange: body.exchange,
        currency: body.currency,
        timezone: body.timezone,
        marketHours: body.marketHours || { open: '09:30', close: '16:00' },
        isActive: body.isActive ?? true,
        isGlobal: body.isGlobal ?? false,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    // Clear cache after update
    clearConfigCache();

    return NextResponse.json({
      success: true,
      index: newIndex,
      message: 'Index created successfully',
    });
  } catch (error) {
    console.error('Error creating market index config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create index configuration' },
      { status: 500 }
    );
  }
}
