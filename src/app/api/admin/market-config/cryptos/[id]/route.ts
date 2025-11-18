// API route for managing individual cryptocurrency
// PUT: Update cryptocurrency
// DELETE: Delete cryptocurrency

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@backend/config/database';
import { clearConfigCache } from '@/lib/market-config';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    // @ts-ignore
    const updatedCrypto = await prisma.cryptocurrencyConfig.update({
      where: { id },
      data: {
        ...(body.symbol && { symbol: body.symbol }),
        ...(body.name && { name: body.name }),
        ...(body.coinGeckoId && { coinGeckoId: body.coinGeckoId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    // Clear cache after update
    clearConfigCache();

    return NextResponse.json({
      success: true,
      crypto: updatedCrypto,
      message: 'Cryptocurrency updated successfully',
    });
  } catch (error) {
    console.error('Error updating cryptocurrency config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cryptocurrency configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // @ts-ignore
    await prisma.cryptocurrencyConfig.delete({
      where: { id },
    });

    // Clear cache after deletion
    clearConfigCache();

    return NextResponse.json({
      success: true,
      message: 'Cryptocurrency deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting cryptocurrency config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cryptocurrency configuration' },
      { status: 500 }
    );
  }
}
