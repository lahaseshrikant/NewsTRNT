import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Route not found',
      message: 'Please use the secure backend API directly with JWT authentication'
    },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Route not found',
      message: 'Please use the secure backend API directly with JWT authentication'
    },
    { status: 404 }
  );
}