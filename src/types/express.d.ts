import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { AuthUser } from '../infrastructure/middleware/auth.middleware';

type UserRole = 'admin' | 'manager' | 'operator' | 'client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        permissions: string[];
      }
    }
  }
}

export {}; 