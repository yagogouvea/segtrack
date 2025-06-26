import { ensurePrisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    const db = await ensurePrisma();
    const user = await db.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Senha inválida');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está definido');
    }

    let permissions: string[];
    try {
      permissions = JSON.parse(user.permissions as string);
      if (!Array.isArray(permissions)) {
        throw new Error('Formato de permissões inválido');
      }
    } catch {
      permissions = [];
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
        permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions
      }
    };
  }

  async verifyToken(token: string): Promise<boolean> {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está definido');
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }
} 