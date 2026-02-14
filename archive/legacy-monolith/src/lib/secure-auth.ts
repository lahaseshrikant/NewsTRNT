// Secure Authentication Module
// Handles JWT token verification and password operations
// WARNING: This runs server-side only (API routes)
// JWT_SECRET is NOT accessible in browser/client components

import * as crypto from 'crypto';

// Get JWT secret - MUST be set in environment
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (typeof window === 'undefined') {
      throw new Error('JWT_SECRET environment variable must be set!');
    }
    // Client-side: JWT operations should happen server-side only
    return '';
  }
  return secret;
}

const SECRET = getJWTSecret();

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  isAdmin?: boolean;
}

interface JWTPayload {
  userId: string;
  email?: string;
  role?: string;
  iat: number;
  exp: number;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Simple JWT implementation (Edge-runtime compatible)
 * For production with complex needs, consider using jose library
 */
class SecureAuth {
  private static readonly TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Create HMAC signature
   */
  private static createSignature(data: string): string {
    return crypto
      .createHmac('sha256', SECRET)
      .update(data)
      .digest('base64url');
  }

  /**
   * Generate JWT token
   */
  static generateToken(user: User): string {
    // Runtime check: Enforce JWT_SECRET in production when actually generating tokens
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + Math.floor(this.TOKEN_EXPIRY / 1000)
    };

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.createSignature(`${headerB64}.${payloadB64}`);

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  /**
   * Verify JWT token and extract user data
   */
  static verifyAuth(token: string, sessionId?: string, csrfToken?: string): AuthResult {
    try {
      if (!token) {
        return { success: false, error: 'No token provided' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { success: false, error: 'Invalid token format' };
      }

      const [headerB64, payloadB64, signature] = parts;

      // Verify signature
      const expectedSignature = this.createSignature(`${headerB64}.${payloadB64}`);
      
      // Timing-safe comparison
      const signatureBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);
      
      if (signatureBuffer.length !== expectedBuffer.length) {
        return { success: false, error: 'Invalid token signature' };
      }
      
      if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return { success: false, error: 'Invalid token signature' };
      }

      // Decode payload
      const payload: JWTPayload = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString('utf8')
      );

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { success: false, error: 'Token expired' };
      }

      // Optional: Validate session ID if provided
      if (sessionId) {
        // In production, verify session exists in database/Redis
        console.log('Session validation:', sessionId);
      }

      // Optional: Validate CSRF token if provided
      if (csrfToken) {
        // In production, verify CSRF token matches
        console.log('CSRF validation:', csrfToken);
      }

      return {
        success: true,
        user: {
          id: payload.userId,
          email: payload.email || '',
          role: payload.role || 'user',
          isAdmin: payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN'
        }
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: 'Token verification failed' };
    }
  }

  /**
   * Request password change via backend API
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Password change failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Password change service unavailable' };
    }
  }

  /**
   * Logout and invalidate session
   */
  static logout(sessionId?: string): { success: boolean } {
    // In production, invalidate the session in database/Redis
    if (sessionId) {
      console.log('Invalidating session:', sessionId);
      // TODO: Add to blacklist or delete from session store
    }
    
    return { success: true };
  }

  /**
   * Refresh token
   */
  static refreshToken(currentToken: string): { success: boolean; token?: string; error?: string } {
    const result = this.verifyAuth(currentToken);
    
    if (!result.success || !result.user) {
      return { success: false, error: result.error };
    }

    const newToken = this.generateToken(result.user);
    return { success: true, token: newToken };
  }

  /**
   * Hash password using PBKDF2
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512')
      .toString('hex');
    
    return { hash, salt: actualSalt };
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const result = this.hashPassword(password, salt);
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(result.hash),
        Buffer.from(hash)
      );
    } catch {
      return false;
    }
  }
}

export default SecureAuth;
