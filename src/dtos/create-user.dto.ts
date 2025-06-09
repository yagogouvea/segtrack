import { UserRole } from '@prisma/client';

export interface CreateUserDTO {
  name: string;
  password: string;
  role: UserRole;
  permissions?: string[];
  active?: boolean;
} 