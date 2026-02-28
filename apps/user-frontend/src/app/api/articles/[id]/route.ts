import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/api';

type RouteContext = { params: Promise<{ id: string }> };

const API_URL = API_CONFIG.baseURL;

// User-facing: get a single article by ID (read-only)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const response = await fetch(`${API_URL}/articles/${id}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}