type UserRole = 'admin' | 'manager' | 'operator' | 'client';

export interface CreateUserDTO {
  name: string;
  password: string;
  role: UserRole;
  permissions?: string[];
  active?: boolean;
} 