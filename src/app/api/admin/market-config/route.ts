// Admin Market Configuration Overview API
// GET /api/admin/market-config
// Returns aggregated market configuration data for indices, cryptocurrencies, commodities, and currency pairs

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@backend/config/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const [indices, cryptocurrencies, commodities, currencyPairs] = await Promise.all([
      prisma.marketIndexConfig.findMany({
        where: includeInactive ? {} : { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.cryptocurrencyConfig.findMany({
        where: includeInactive ? {} : { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.commodityConfig.findMany({
        where: includeInactive ? {} : { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.currencyPairConfig.findMany({
        where: includeInactive ? {} : { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        indices,
        cryptocurrencies,
        commodities,
        currencies: currencyPairs,
      },
      counts: {
        indices: indices.length,
        cryptocurrencies: cryptocurrencies.length,
        commodities: commodities.length,
        currencies: currencyPairs.length,
        total:
          indices.length +
          cryptocurrencies.length +
          commodities.length +
          currencyPairs.length,
      },
    });
  } catch (error) {
    console.error('[Admin Market Config] Failed to fetch configurations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market configurations' },
      { status: 500 },
    );
  }
}
