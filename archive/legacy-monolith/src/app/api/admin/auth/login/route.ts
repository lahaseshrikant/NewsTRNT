import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Server-side admin authentication
 * Environment variables are NOT exposed to client
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Get admin credentials from server-side env vars (NOT exposed to client)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    let matchedUser: any = null;

    // Check Super Admin
    if (superAdminEmail && normalizedEmail === superAdminEmail.toLowerCase()) {
      if (password === superAdminPassword) {
        matchedUser = {
          id: 'super-admin',
          email: superAdminEmail,
          role: 'SUPER_ADMIN',
          username: 'SuperAdmin'
        };
      }
    }
    // Check Regular Admin
    else if (adminEmail && normalizedEmail === adminEmail.toLowerCase()) {
      if (password === adminPassword) {
        matchedUser = {
          id: 'admin',
          email: adminEmail,
          role: 'ADMIN',
          username: 'Admin'
        };
      }
    }

    if (!matchedUser) {
      // Constant time delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Create session
    const now = Date.now();
    const session = {
      userId: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      username: matchedUser.username,
      permissions: matchedUser.role === 'SUPER_ADMIN' 
        ? ['*'] // All permissions
        : ['content.read', 'content.write', 'content.delete', 'content.publish'],
      loginTime: now,
      expiresAt: now + (2 * 60 * 60 * 1000), // 2 hours
      sessionId: crypto.randomBytes(32).toString('hex'),
      timestamp: now
    };

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
