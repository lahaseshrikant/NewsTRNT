// src/app/api/auth/me/route.ts - Get current user endpoint
import { NextRequest, NextResponse } from 'next/server';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      // Decode the token (it's just base64 encoded user info)
      const userData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Verify the user is still authenticated
      const { isAuthenticated, session } = UnifiedAdminAuth.isAuthenticated();
      
      if (!isAuthenticated || !session || session.email !== userData.email) {
        return NextResponse.json(
          { success: false, error: 'Token expired or invalid' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          email: session.email,
          isAdmin: session.role === 'ADMIN' || session.role === 'SUPER_ADMIN',
          isSuperAdmin: session.role === 'SUPER_ADMIN'
        }
      });
    } catch (decodeError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication verification failed' },
      { status: 500 }
    );
  }
}
