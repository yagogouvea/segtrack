import { User } from '@prisma/client';
import { AuthUser } from '../../infrastructure/middleware/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: User | AuthUser;
    }
  }
} 