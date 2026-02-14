import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') || 'false';
    const includeInactive = searchParams.get('includeInactive') || 'false';
    
    // Build query string for backend API
    const queryParams = new URLSearchParams({
      includeStats,
      includeInactive,
    });
    
    // Fetch categories from backend API
    const response = await fetch(`${BACKEND_API_URL}/categories?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend returns categories directly, not wrapped in a 'categories' property
    const categories = Array.isArray(data) ? data : [];
    
    return NextResponse.json({
      categories: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories from backend:', error);
    
    // Fallback to static categories with UUID-like IDs if backend is unavailable
    const fallbackCategories = [
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Technology', slug: 'technology', color: '#3182CE' },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Business', slug: 'business', color: '#059669' },
      { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Science', slug: 'science', color: '#7C3AED' },
      { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Politics', slug: 'politics', color: '#DC2626' },
      { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Sports', slug: 'sports', color: '#EA580C' },
      { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Health', slug: 'health', color: '#DB2777' },
      { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Environment', slug: 'environment', color: '#10B981' },
      { id: '550e8400-e29b-41d4-a716-446655440008', name: 'Entertainment', slug: 'entertainment', color: '#F59E0B' }
    ];

    return NextResponse.json({
      categories: fallbackCategories,
      total: fallbackCategories.length
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');
    
    // Forward the request to the backend API
    const response = await fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to create category' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}