import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: Prisma.JsonValue;
  };
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET;

  constructor() {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET não está definida. Configure a variável de ambiente JWT_SECRET.');
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        permissions: true,
        active: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.active) {
      throw new Error('Usuário inativo');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Senha inválida');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não definido');
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      secret,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    };
  }
} 