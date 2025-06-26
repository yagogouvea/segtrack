import { ensurePrisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';

type UserRole = 'admin' | 'manager' | 'operator' | 'client';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions?: string[];
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  permissions?: string[];
  active?: boolean;
}

export class UserService {
  async list() {
    const db = await ensurePrisma();
    return db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findById(id: string) {
    const db = await ensurePrisma();
    return db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findByEmail(email: string) {
    const db = await ensurePrisma();
    return db.user.findUnique({
      where: { email }
    });
  }

  async create(data: CreateUserData) {
    const db = await ensurePrisma();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        permissions: JSON.stringify(data.permissions || []),
        active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async update(id: string, data: UpdateUserData) {
    const db = await ensurePrisma();
    return db.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        permissions: data.permissions ? JSON.stringify(data.permissions) : undefined,
        active: data.active
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async delete(id: string) {
    const db = await ensurePrisma();
    return db.user.delete({
      where: { id }
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const db = await ensurePrisma();
    const user = await db.user.findUnique({
      where: { id },
      select: { passwordHash: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    return db.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash }
    });
  }

  async updatePassword(id: string, newPassword: string) {
    const db = await ensurePrisma();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return db.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword
      }
    });
  }
} 