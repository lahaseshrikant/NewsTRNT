import { NextRequest, NextResponse } from 'next/server';

// Function to call backend API with proper JWT authentication
async function callBackendAPI(endpoint: string, options: RequestInit = {}) {
  // This Next.js API route should be removed as it conflicts with direct backend calls
  // The frontend should call the backend API directly with JWT tokens
  throw new Error('Use direct backend API calls with JWT tokens instead of Next.js proxy');
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(
    { 
      error: 'Route not found',
      message: 'Please use the secure backend API directly with JWT authentication'
    },
    { status: 404 }
  );
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(
    { 
      error: 'Route not found',
      message: 'Please use the secure backend API directly with JWT authentication'
    },
    { status: 404 }
  );
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(
    { 
      error: 'Route not found',
      message: 'Please use the secure backend API directly with JWT authentication'
    },
    { status: 404 }
  );
}