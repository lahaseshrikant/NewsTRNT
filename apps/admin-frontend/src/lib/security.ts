// Security Manager Module
// Handles CSRF tokens, input sanitization, and security utilities

import * as crypto from 'crypto';

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

export class SecurityManager {
  private static readonly CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
  private static readonly CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

  /**
   * Generate a cryptographically secure CSRF token
   */
  static generateCSRFToken(sessionId?: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const key = sessionId || 'default';
    
    // Store token with expiration
    csrfTokens.set(key, {
      token,
      expires: Date.now() + this.CSRF_TOKEN_EXPIRY
    });

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();

    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string, sessionId?: string): boolean {
    if (!token) return false;

    const key = sessionId || 'default';
    const stored = csrfTokens.get(key);

    if (!stored) return false;
    if (Date.now() > stored.expires) {
      csrfTokens.delete(key);
      return false;
    }

    // Timing-safe comparison
    try {
      return crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(stored.token)
      );
    } catch {
      return false;
    }
  }

  /**
   * Clean up expired tokens
   */
  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [key, value] of csrfTokens.entries()) {
      if (now > value.expires) {
        csrfTokens.delete(key);
      }
    }
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#96;');
  }

  /**
   * Sanitize HTML content (allows safe tags)
   */
  static sanitizeHTML(input: string): string {
    if (!input) return '';
    
    // Remove script tags and event handlers
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, 'data-blocked:');
  }

  /**
   * Generate a secure fingerprint from data
   */
  static generateFingerprint(data: string, salt?: string): string {
    const actualSalt = salt || this.CSRF_SECRET;
    return crypto
      .createHmac('sha256', actualSalt)
      .update(data)
      .digest('hex');
  }

  /**
   * Validate request origin
   */
  static validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
    if (!origin) return false;
    return allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2);
        return origin.endsWith(domain) || origin === `https://${domain}` || origin === `http://${domain}`;
      }
      return origin === allowed;
    });
  }

  /**
   * Rate limiting check (simple in-memory implementation)
   */
  private static rateLimitStore = new Map<string, { count: number; resetAt: number }>();
  
  static checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = this.rateLimitStore.get(identifier);

    if (!record || now > record.resetAt) {
      // New window
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetAt: now + windowMs
      });
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count++;
    return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
  }

  /**
   * Generate secure random string
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash sensitive data (one-way)
   */
  static hashData(data: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    return crypto
      .pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512')
      .toString('hex');
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Password must be at least 8 characters');

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Add special characters');

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score--;
      feedback.push('Avoid repeated characters');
    }

    if (/^(password|123456|qwerty)/i.test(password)) {
      score = 0;
      feedback.push('Password is too common');
    }

    return {
      valid: score >= 4 && password.length >= 8,
      score: Math.max(0, Math.min(score, 7)),
      feedback
    };
  }
}

export default SecurityManager;

