// src/app/api/admin/simple-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import SimpleAdminAuth from '@/lib/simple-admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === 'login') {
      const result = SimpleAdminAuth.login(email, password);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Admin login successful',
          admin: {
            email: result.session?.email,
            isAdmin: result.session?.isAdmin,
            isSuperAdmin: result.session?.isSuperAdmin
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
      const { isAuthenticated, session } = SimpleAdminAuth.isAuthenticated();
      
      return NextResponse.json({
        success: true,
        isAuthenticated,
        admin: isAuthenticated ? {
          email: session?.email,
          isAdmin: session?.isAdmin,
          isSuperAdmin: session?.isSuperAdmin
        } : null
      });
    }

    if (action === 'logout') {
      SimpleAdminAuth.logout();
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
    const { isAuthenticated, session } = SimpleAdminAuth.isAuthenticated();
    
    return NextResponse.json({
      success: true,
      isAuthenticated,
      admin: isAuthenticated ? {
        email: session?.email,
        isAdmin: session?.isAdmin,
        isSuperAdmin: session?.isSuperAdmin
      } : null
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
