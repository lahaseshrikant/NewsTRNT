import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const reqId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  (req as any)._reqId = reqId;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const logBase = `[AUTH ${reqId}]`;
  console.log(logBase, 'Auth header present:', !!authHeader);
  console.log(logBase, 'Token preview:', token ? token.substring(0, 16) + '...' : 'None');

  if (!token) {
    console.log(logBase, 'FAIL reason=missing_token');
    res.status(401).json({ error: 'Access token required', reqId });
    return;
  }

  try {
    // QUICK CLASSIFICATION
    const looksLikeJWT = token.split('.').length === 3; // header.payload.signature
    if (!looksLikeJWT) {
      // Attempt UnifiedAdminAuth base64 token ONLY if it doesn't look like a JWT
      try {
        console.log(logBase, 'Attempt unified decode (not JWT pattern)');
        const decodedToken = Buffer.from(token, 'base64').toString('utf8');
        // Basic safeguard: must start with '{' and end with '}' to be JSON
        if (decodedToken.trim().startsWith('{') && decodedToken.trim().endsWith('}')) {
          const tokenData = JSON.parse(decodedToken);
          console.log(logBase, 'Unified token keys:', Object.keys(tokenData));
          if (tokenData.email && tokenData.role && tokenData.userId && tokenData.sessionId && tokenData.timestamp) {
            const tokenAge = Date.now() - tokenData.timestamp;
            const maxAge = 2 * 60 * 60 * 1000; // 2 hours
            if (tokenAge > maxAge) {
              console.log(logBase, 'FAIL reason=unified_expired ageMs=' + tokenAge);
              res.status(401).json({ error: 'Token expired', reqId });
              return;
            }
            const isAdmin = tokenData.role === 'ADMIN' || tokenData.role === 'SUPER_ADMIN';
            if (!isAdmin) {
              console.log(logBase, 'FAIL reason=unified_not_admin role=' + tokenData.role);
              res.status(403).json({ error: 'Admin access required', reqId });
              return;
            }
            console.log(logBase, 'SUCCESS mode=unified userId=' + tokenData.userId + ' email=' + tokenData.email);
            req.user = { id: tokenData.userId, email: tokenData.email, isAdmin };
            next();
            return;
          }
        } else {
          console.log(logBase, 'Decoded base64 not JSON object – skip unified path');
        }
      } catch (uErr) {
        console.log(logBase, 'Unified decode failed, fallback JWT. err=' + (uErr as Error).message);
      }
    } else {
      console.log(logBase, 'Pattern=JWT skip unified');
    }

    // JWT path
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if this is an admin token (from AdminJWTBridge)
    if (decoded.isAdmin && decoded.email && decoded.id) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        isAdmin: decoded.isAdmin
      };
      console.log(logBase, 'SUCCESS mode=jwt-admin userId=' + decoded.id + ' email=' + decoded.email);
      next();
      return;
    }

    // Fallback: try to fetch user from database (for regular user tokens)
    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, isAdmin: true, isVerified: true }
      });

      if (!user) {
        console.log(logBase, 'FAIL reason=user_not_found userId=' + decoded.userId);
        res.status(401).json({ error: 'User not found', reqId });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      };
    } else {
      console.log(logBase, 'FAIL reason=decoded_missing_userId');
      res.status(401).json({ error: 'Invalid token format', reqId });
      return;
    }

    next();
  } catch (error) {
    console.error(logBase, 'FAIL reason=verification_exception err=', error);
    // DEV FALLBACK: attempt permissive decode of unsigned legacy JWT to avoid blocking admin during migration
    if (process.env.NODE_ENV !== 'production') {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
          const payload: any = JSON.parse(payloadJson);
          if (payload && payload.email && (payload.role || payload.isAdmin)) {
            console.warn(logBase, 'DEV-FALLBACK mode=jwt-unsigned ACCEPTED userId=' + (payload.id || payload.userId));
            req.user = {
              id: payload.id || payload.userId || 'unknown',
              email: payload.email,
              isAdmin: payload.isAdmin === true || ['ADMIN','SUPER_ADMIN'].includes(payload.role)
            };
            next();
            return;
          }
        }
      } catch (fallbackErr) {
        console.warn(logBase, 'DEV-FALLBACK decode failed err=' + (fallbackErr as Error).message);
      }
    }
    res.status(403).json({ error: 'Invalid or expired token', reqId });
    return;
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, isAdmin: true }
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin
        };
      }
    } catch (error) {
      // Silent fail for optional auth
    }
  }

  next();
};
