// API route for managing commodity configuration
// GET: Fetch all commodities
// POST: Create new commodity

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@backend/config/database';
import { clearConfigCache } from '@/lib/market-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const category = searchParams.get('category');

    const where: any = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }
    
    if (category) {
      where.category = category;
    }

    // @ts-ignore
    const commodities = await prisma.commodityConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      commodities,
      count: commodities.length,
    });
  } catch (error) {
    console.error('Error fetching commodity config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commodity configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // @ts-ignore
    const newCommodity = await prisma.commodityConfig.create({
      data: {
        symbol: body.symbol,
        name: body.name,
        category: body.category,
        unit: body.unit,
        currency: body.currency || 'USD',
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    // Clear cache after update
    clearConfigCache();

    return NextResponse.json({
      success: true,
      commodity: newCommodity,
      message: 'Commodity created successfully',
    });
  } catch (error) {
    console.error('Error creating commodity config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create commodity configuration' },
      { status: 500 }
    );
  }
}
