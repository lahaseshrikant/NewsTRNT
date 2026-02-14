// Express middleware utilities for admin-backend
// Rate limiting, input validation, and request helpers

import { Request, Response, NextFunction } from 'express';

// ── Rate Limiting (in-memory, per-IP) ────────────────────────────────────────

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Express rate-limiting middleware factory
 */
export function rateLimit(options: { maxRequests?: number; windowMs?: number } = {}) {
  const { maxRequests = 100, windowMs = 60_000 } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now - record.windowStart > windowMs) {
      rateLimitStore.set(ip, { count: 1, windowStart: now });
      res.setHeader('X-RateLimit-Remaining', String(maxRequests - 1));
      next();
      return;
    }

    record.count += 1;

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.windowStart + windowMs - now) / 1000);
      res.status(429).json({
        error: 'Too many requests',
        retryAfter,
      });
      return;
    }

    res.setHeader('X-RateLimit-Remaining', String(maxRequests - record.count));
    next();
  };
}

// ── Input Sanitization ───────────────────────────────────────────────────────

/**
 * Strip HTML tags from a string to prevent XSS
 */
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Express middleware that sanitizes all string fields in req.body
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = sanitize(value);
      }
    }
  }
  next();
}

// ── Request Helpers ──────────────────────────────────────────────────────────

/**
 * Parse pagination params from query string, with safe defaults
 */
export function parsePagination(query: Record<string, any>): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

/**
 * Wrap async route handlers so Express catches thrown errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
