import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { AuthUser } from '../middleware/authMiddleware';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {}; 