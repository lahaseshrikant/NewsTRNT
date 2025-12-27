// API route for managing individual commodity
// PUT: Update commodity
// DELETE: Delete commodity

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
    const updatedCommodity = await prisma.commodityConfig.update({
      where: { id },
      data: {
        ...(body.symbol && { symbol: body.symbol }),
        ...(body.name && { name: body.name }),
        ...(body.category && { category: body.category }),
        ...(body.unit && { unit: body.unit }),
        ...(body.currency && { currency: body.currency }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    // Clear cache after update
    clearConfigCache();

    return NextResponse.json({
      success: true,
      commodity: updatedCommodity,
      message: 'Commodity updated successfully',
    });
  } catch (error) {
    console.error('Error updating commodity config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update commodity configuration' },
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
    await prisma.commodityConfig.delete({
      where: { id },
    });

    // Clear cache after deletion
    clearConfigCache();

    return NextResponse.json({
      success: true,
      message: 'Commodity deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting commodity config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete commodity configuration' },
      { status: 500 }
    );
  }
}
