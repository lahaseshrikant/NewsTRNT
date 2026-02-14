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

/**
 * JWT-only authentication for user-backend.
 * No RBAC/base64 tokens — those belong to admin-backend.
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, isAdmin: true },
      });

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };
    } else if (decoded.id && decoded.email) {
      // Fallback: admin JWT bridge tokens (read-only context)
      req.user = {
        id: decoded.id,
        email: decoded.email,
        isAdmin: decoded.isAdmin || false,
      };
    } else {
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
};

/**
 * Optional auth — attaches user if token is present, continues regardless.
 */
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
        select: { id: true, email: true, isAdmin: true },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
        };
      }
    } catch {
      // Silent fail for optional auth
    }
  }

  next();
};
