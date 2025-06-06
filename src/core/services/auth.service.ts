import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LoginData {
  email: string;
  password: string;
}

interface TokenData {
  userId: string;
  role: string;
  email: string;
  permissions: string[];
}

export class AuthService {
  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
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
      throw new Error('Usuário desativado');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Senha incorreta');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '12h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenData;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user?.active) {
        throw new Error('Usuário inválido ou inativo');
      }

      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
} 