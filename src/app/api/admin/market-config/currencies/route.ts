// API route for managing currency pair configuration
// GET: Fetch all currency pairs
// POST: Create new currency pair

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@backend/config/database';
import { clearConfigCache } from '@/lib/market-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const type = searchParams.get('type');

    const where: any = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }
    
    if (type) {
      where.type = type;
    }

    // @ts-ignore
    const pairs = await prisma.currencyPairConfig.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      pairs,
      count: pairs.length,
    });
  } catch (error) {
    console.error('Error fetching currency pair config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch currency pair configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.pair || !body.name || !body.base || !body.quote) {
      return NextResponse.json(
        { success: false, error: 'pair, name, base, and quote are required' },
        { status: 400 }
      );
    }

    // @ts-ignore
    const newPair = await prisma.currencyPairConfig.create({
      data: {
        pair: body.pair,
        name: body.name,
        base: body.base.toUpperCase(),
        quote: body.quote.toUpperCase(),
        type: body.type || 'major',
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    // Clear cache after update
    clearConfigCache();

    return NextResponse.json({
      success: true,
      pair: newPair,
      message: 'Currency pair created successfully',
    });
  } catch (error) {
    console.error('Error creating currency pair config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create currency pair configuration' },
      { status: 500 }
    );
  }
}
