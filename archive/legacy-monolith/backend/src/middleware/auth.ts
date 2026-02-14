import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
    role?: string;
    permissions?: string[];
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
      // Attempt RBAC/UnifiedAdminAuth base64 token ONLY if it doesn't look like a JWT
      try {
        console.log(logBase, 'Attempt unified decode (not JWT pattern)');
        // Unicode-safe base64 decoding
        const rawDecoded = Buffer.from(token, 'base64').toString('binary');
        const decodedToken = decodeURIComponent(escape(rawDecoded));
        
        // Basic safeguard: must start with '{' and end with '}' to be JSON
        if (decodedToken.trim().startsWith('{') && decodedToken.trim().endsWith('}')) {
          const tokenData = JSON.parse(decodedToken);
          console.log(logBase, 'Unified token keys:', Object.keys(tokenData));
          if (tokenData.email && tokenData.role && tokenData.userId && tokenData.sessionId && tokenData.timestamp) {
            const tokenAge = Date.now() - tokenData.timestamp;
            const maxAge = 8 * 60 * 60 * 1000; // 8 hours (match RBAC session duration)
            if (tokenAge > maxAge) {
              console.log(logBase, 'FAIL reason=unified_expired ageMs=' + tokenAge);
              res.status(401).json({ error: 'Session expired. Please log in again.', reqId });
              return;
            }
            // Accept ALL valid RBAC roles (not just ADMIN and SUPER_ADMIN)
            const validRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'VIEWER'];
            const isValidRole = validRoles.includes(tokenData.role);
            if (!isValidRole) {
              console.log(logBase, 'FAIL reason=invalid_role role=' + tokenData.role);
              res.status(403).json({ error: 'Invalid role. Please contact your administrator.', reqId });
              return;
            }
            // Determine admin level (EDITOR and above can access admin endpoints)
            const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'VIEWER'];
            const isAdmin = adminRoles.includes(tokenData.role);
            
            console.log(logBase, 'SUCCESS mode=unified userId=' + tokenData.userId + ' email=' + tokenData.email + ' role=' + tokenData.role);
            req.user = { 
              id: tokenData.userId, 
              email: tokenData.email, 
              isAdmin,
              role: tokenData.role,
              permissions: tokenData.permissions || []
            };
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
    res.status(403).json({ error: 'Access denied. Please contact your administrator.' });
    return;
  }
  next();
};

// Permission-based middleware for granular RBAC
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    
    // Super Admin has all permissions
    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }
    
    // Check specific permission
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      next();
      return;
    }
    
    // Check wildcard permission
    if (req.user.permissions && req.user.permissions.includes('*')) {
      next();
      return;
    }
    
    res.status(403).json({ 
      error: 'You don\'t have permission to perform this action.',
      requiredPermission: permission
    });
  };
};

// Role-level middleware
export const requireRole = (minRoleLevel: number) => {
  const roleLevels: Record<string, number> = {
    'SUPER_ADMIN': 100,
    'ADMIN': 80,
    'EDITOR': 60,
    'AUTHOR': 40,
    'MODERATOR': 30,
    'VIEWER': 10
  };
  
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    
    const userLevel = roleLevels[req.user.role] || 0;
    if (userLevel < minRoleLevel) {
      res.status(403).json({ 
        error: 'Insufficient access level. Please contact your administrator.',
        requiredLevel: minRoleLevel,
        currentLevel: userLevel
      });
      return;
    }
    
    next();
  };
};

// Convenience middleware for common role checks
export const requireSuperAdmin = requireRole(100);
export const requireAdminRole = requireRole(80);
export const requireEditor = requireRole(60);
export const requireAuthor = requireRole(40);

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
