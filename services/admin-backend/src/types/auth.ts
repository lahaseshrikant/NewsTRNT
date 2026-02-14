import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
    role?: string;
    permissions?: string[];
  };
}

export interface RBACTokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  timestamp: number;
  permissions?: string[];
}
