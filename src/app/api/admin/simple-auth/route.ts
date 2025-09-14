// src/app/api/admin/simple-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === 'login') {
      const result = UnifiedAdminAuth.login(email, password);
      
      if (result.success && result.session) {
        return NextResponse.json({
          success: true,
          message: 'Admin login successful',
          admin: {
            email: result.session.email,
            isAdmin: result.session.role === 'ADMIN' || result.session.role === 'SUPER_ADMIN',
            isSuperAdmin: result.session.role === 'SUPER_ADMIN'
          }
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        );
      }
    }

    if (action === 'verify') {
      const { isAuthenticated, session } = UnifiedAdminAuth.isAuthenticated();
      
      return NextResponse.json({
        success: true,
        isAuthenticated,
        admin: isAuthenticated && session ? {
          email: session.email,
          isAdmin: session.role === 'ADMIN' || session.role === 'SUPER_ADMIN',
          isSuperAdmin: session.role === 'SUPER_ADMIN'
        } : null
      });
    }

    if (action === 'logout') {
      UnifiedAdminAuth.logout();
      return NextResponse.json({
        success: true,
        message: 'Admin logout successful'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Simple admin auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { isAuthenticated, session } = UnifiedAdminAuth.isAuthenticated();
    
    return NextResponse.json({
      success: true,
      isAuthenticated,
      admin: isAuthenticated && session ? {
        email: session.email,
        isAdmin: session.role === 'ADMIN' || session.role === 'SUPER_ADMIN',
        isSuperAdmin: session.role === 'SUPER_ADMIN'
      } : null
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
