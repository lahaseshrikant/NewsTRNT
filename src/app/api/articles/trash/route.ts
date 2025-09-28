import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'deletedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query string for backend API
    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    if (category) queryParams.set('category', category);
    if (search) queryParams.set('search', search);
    
    // Forward the request to the backend API
    const response = await fetch(`http://localhost:5000/api/articles/admin/trash?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to fetch deleted articles' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching deleted articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted articles' },
      { status: 500 }
    );
  }
}