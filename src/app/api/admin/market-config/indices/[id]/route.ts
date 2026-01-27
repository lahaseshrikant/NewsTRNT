// API route for managing individual market index
// Proxies to backend API

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-middleware';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const auth = verifyAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_API_URL}/admin/market-config/indices/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Backend endpoint not available' },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
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
  context: RouteContext
) {
  const auth = verifyAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    const response = await fetch(
      `${BACKEND_API_URL}/admin/market-config/indices/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Backend endpoint not available' },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('Error deleting market index config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete index configuration' },
      { status: 500 }
    );
  }
}
