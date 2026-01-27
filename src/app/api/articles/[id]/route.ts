import { NextRequest, NextResponse } from 'next/server';

// Function to call backend API with proper JWT authentication
async function callBackendAPI(endpoint: string, options: RequestInit = {}) {
  // This Next.js API route should be removed as it conflicts with direct backend calls
  // The frontend should call the backend API directly with JWT tokens
  throw new Error('Use direct backend API calls with JWT tokens instead of Next.js proxy');
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return NextResponse.json(
    { 
      error: 'Route not found',
      message: 'Please use the secure backend API directly with JWT authentication'
    },
    { status: 404 }
  );
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return NextResponse.json(
    { 
      error: 'Route not found',
      message: 'Please use the secure backend API directly with JWT authentication'
    },
    { status: 404 }
  );
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent');
    
    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    // Build backend URL with query parameters
    const backendUrl = `http://localhost:5000/api/articles/admin/${id}${permanent ? `?permanent=${permanent}` : ''}`;
    
    // Forward the request to the backend API
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to delete article' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}