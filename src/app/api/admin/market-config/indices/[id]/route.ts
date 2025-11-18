// API route for managing individual market index
// PUT: Update index
// DELETE: Delete index

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
    const updatedIndex = await prisma.marketIndexConfig.update({
      where: { id },
      data: {
        ...(body.symbol && { symbol: body.symbol }),
        ...(body.name && { name: body.name }),
        ...(body.country && { country: body.country }),
        ...(body.region && { region: body.region }),
        ...(body.exchange && { exchange: body.exchange }),
        ...(body.currency && { currency: body.currency }),
        ...(body.timezone && { timezone: body.timezone }),
        ...(body.marketHours && { marketHours: body.marketHours }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isGlobal !== undefined && { isGlobal: body.isGlobal }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    // Clear cache after update
    clearConfigCache();

    return NextResponse.json({
      success: true,
      index: updatedIndex,
      message: 'Index updated successfully',
    });
  } catch (error) {
    console.error('Error updating market index config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update index configuration' },
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
    await prisma.marketIndexConfig.delete({
      where: { id },
    });

    // Clear cache after deletion
    clearConfigCache();

    return NextResponse.json({
      success: true,
      message: 'Index deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting market index config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete index configuration' },
      { status: 500 }
    );
  }
}
