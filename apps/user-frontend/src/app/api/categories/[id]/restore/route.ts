import { NextRequest, NextResponse } from 'next/server';

import { API_CONFIG } from '@/config/api';
const BACKEND_API_URL = API_CONFIG.baseURL;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    
    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    // Forward the request to the backend API
    const response = await fetch(`${BACKEND_API_URL}/categories/${id}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to restore category' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error restoring category:', error);
    return NextResponse.json(
      { error: 'Failed to restore category' },
      { status: 500 }
    );
  }
}