import { Prisma } from '@prisma/client';

type UserRole = 'admin' | 'manager' | 'operator' | 'client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        permissions: Prisma.JsonValue;
      }
    }
  }
} 