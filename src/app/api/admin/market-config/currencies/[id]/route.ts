// API route for managing individual currency pair
// PUT: Update currency pair
// DELETE: Delete currency pair

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

    // Normalize and validate payload
    const updateData: any = {};
    
    if (body.pair) updateData.pair = body.pair;
    if (body.name) updateData.name = body.name;
    if (body.base) updateData.base = body.base.toUpperCase();
    if (body.quote) updateData.quote = body.quote.toUpperCase();
    if (body.type) updateData.type = body.type;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.sortOrder !== undefined && body.sortOrder !== null && !Number.isNaN(Number(body.sortOrder))) {
      updateData.sortOrder = Number(body.sortOrder);
    }

    // @ts-ignore
    const updatedPair = await prisma.currencyPairConfig.update({
      where: { id },
      data: updateData,
    });

    // Clear cache after update
    clearConfigCache();

    return NextResponse.json({
      success: true,
      pair: updatedPair,
      message: 'Currency pair updated successfully',
    });
  } catch (error) {
    console.error('Error updating currency pair config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update currency pair configuration' },
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
    await prisma.currencyPairConfig.delete({
      where: { id },
    });

    // Clear cache after deletion
    clearConfigCache();

    return NextResponse.json({
      success: true,
      message: 'Currency pair deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting currency pair config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete currency pair configuration' },
      { status: 500 }
    );
  }
}
