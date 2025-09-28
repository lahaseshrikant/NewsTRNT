import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: { id: string };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');
    
    // Forward the request to the backend API
    const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to update category' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent');
    
    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');
    
    // Build backend URL with query parameters
    const backendUrl = `http://localhost:5000/api/categories/${id}${permanent ? `?permanent=${permanent}` : ''}`;
    
    // Forward the request to the backend API
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to delete category' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}