import { Request } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username?: string;
        fullName?: string;
        isAdmin: boolean;
        isVerified: boolean;
    };
}
export interface JWTPayload {
    id: string;
    email: string;
    username?: string;
    isAdmin: boolean;
    isVerified: boolean;
}
//# sourceMappingURL=auth.d.ts.map