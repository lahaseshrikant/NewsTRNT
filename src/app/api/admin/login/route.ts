// src/app/api/admin/login/route.ts
// Server-side admin login endpoint with rate limiting and RBAC support

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/api-middleware';
import * as crypto from 'crypto';
import { UserRole, ROLES, Permission } from '@/config/rbac';

// Extended user type with role configuration
interface AdminUserConfig {
  id: string;
  email: string;
  role: UserRole;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

// Environment-based admin users (in production, use database)
// Format: ROLE_EMAIL, ROLE_PASSWORD for each role level
function getConfiguredAdmins(): AdminUserConfig[] {
  const admins: AdminUserConfig[] = [];
  
  // Super Admin
  if (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
    admins.push({
      id: 'super-admin-001',
      email: process.env.SUPER_ADMIN_EMAIL.toLowerCase(),
      role: 'SUPER_ADMIN',
      username: 'superadmin',
      displayName: 'Super Administrator'
    });
  }
  
  // Admin (using existing ADMIN_EMAIL)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    admins.push({
      id: 'admin-001',
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      role: 'ADMIN',
      username: 'admin',
      displayName: 'Administrator'
    });
  }
  
  // Editor (optional - add EDITOR_EMAIL to .env.local if needed)
  if (process.env.EDITOR_EMAIL && process.env.EDITOR_PASSWORD) {
    admins.push({
      id: 'editor-001',
      email: process.env.EDITOR_EMAIL.toLowerCase(),
      role: 'EDITOR',
      username: 'editor',
      displayName: 'Senior Editor'
    });
  }
  
  // Author (optional - add AUTHOR_EMAIL to .env.local if needed)
  if (process.env.AUTHOR_EMAIL && process.env.AUTHOR_PASSWORD) {
    admins.push({
      id: 'author-001',
      email: process.env.AUTHOR_EMAIL.toLowerCase(),
      role: 'AUTHOR',
      username: 'author',
      displayName: 'Content Author'
    });
  }
  
  // Moderator (optional - add MODERATOR_EMAIL to .env.local if needed)
  if (process.env.MODERATOR_EMAIL && process.env.MODERATOR_PASSWORD) {
    admins.push({
      id: 'moderator-001',
      email: process.env.MODERATOR_EMAIL.toLowerCase(),
      role: 'MODERATOR',
      username: 'moderator',
      displayName: 'Community Moderator'
    });
  }
  
  // Viewer (optional - add VIEWER_EMAIL to .env.local if needed)
  if (process.env.VIEWER_EMAIL && process.env.VIEWER_PASSWORD) {
    admins.push({
      id: 'viewer-001',
      email: process.env.VIEWER_EMAIL.toLowerCase(),
      role: 'VIEWER',
      username: 'viewer',
      displayName: 'Analytics Viewer'
    });
  }
  
  return admins;
}

// Get password for a role
function getPasswordForRole(role: UserRole): string | undefined {
  const envMap: Record<UserRole, string> = {
    'SUPER_ADMIN': 'SUPER_ADMIN_PASSWORD',
    'ADMIN': 'ADMIN_PASSWORD',
    'EDITOR': 'EDITOR_PASSWORD',
    'AUTHOR': 'AUTHOR_PASSWORD',
    'MODERATOR': 'MODERATOR_PASSWORD',
    'VIEWER': 'VIEWER_PASSWORD'
  };
  return process.env[envMap[role]];
}

export async function POST(request: NextRequest) {
  // Rate limiting: 5 login attempts per minute per IP
  const identifier = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
  const rateLimit = checkRateLimit(request, { 
    maxRequests: 5, 
    windowMs: 60000,
    identifier: `login:${identifier}`
  });
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many login attempts. Please wait before trying again.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Get configured admins
    const configuredAdmins = getConfiguredAdmins();
    
    // Find matching user
    const matchedUser = configuredAdmins.find(admin => admin.email === normalizedEmail);
    
    if (!matchedUser) {
      // Constant time delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const expectedPassword = getPasswordForRole(matchedUser.role);
    if (!expectedPassword || password !== expectedPassword) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get role configuration
    const roleConfig = ROLES[matchedUser.role];
    if (!roleConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid role configuration' },
        { status: 500 }
      );
    }

    // Create enhanced session with RBAC data
    const now = Date.now();
    const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
    
    const session = {
      userId: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      username: matchedUser.username,
      displayName: matchedUser.displayName,
      avatarUrl: matchedUser.avatarUrl,
      permissions: roleConfig.permissions as Permission[],
      roleLevel: roleConfig.level,
      roleDisplayName: roleConfig.displayName,
      roleIcon: roleConfig.icon,
      roleColor: roleConfig.color,
      roleBgColor: roleConfig.bgColor,
      dashboardPath: roleConfig.dashboardPath,
      canManageRoles: roleConfig.canManageRoles,
      loginTime: now,
      expiresAt: now + sessionDuration,
      sessionId: crypto.randomBytes(32).toString('hex'),
      timestamp: now,
      lastActivity: now
    };

    // Log successful login (for audit trail)
    console.log(`[AUTH] Login successful: ${matchedUser.email} (${matchedUser.role}) at ${new Date().toISOString()}`);

    // Generate a base64 token for API authorization that matches backend expectations
    const tokenPayload = {
      userId: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      isAdmin: true,
      sessionId: session.sessionId,
      timestamp: now,
      permissions: roleConfig.permissions
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return NextResponse.json({
      success: true,
      session,
      sessionId: session.sessionId,
      token, // Token for API calls
      redirectTo: roleConfig.dashboardPath
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
