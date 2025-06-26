import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ensurePrisma } from '../lib/prisma';

interface PrismaUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  permissions: string;
  active: boolean;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar corpo da requisição
    const { email, password, senha } = req.body;
    const userPassword = password || senha;
    if (!email || !userPassword) {
      res.status(400).json({ message: 'Email e password são obrigatórios' });
      return;
    }

    // --- INÍCIO AUTENTICAÇÃO REAL ---
    const db = await ensurePrisma();
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Usuário não encontrado' });
      return;
    }
    if (!user.active) {
      res.status(403).json({ message: 'Usuário inativo' });
      return;
    }
    const validPassword = await bcrypt.compare(userPassword, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ message: 'Senha incorreta' });
      return;
    }
    let permissions: string[] = [];
    try {
      permissions = user.permissions ? JSON.parse(user.permissions) : [];
    } catch {
      permissions = [];
    }
    const token = jwt.sign(
      {
        sub: user.id,
        nome: user.name,
        email: user.email,
        role: user.role,
        permissions: permissions
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '12h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: permissions,
        active: user.active
      }
    });
    // --- FIM AUTENTICAÇÃO REAL ---
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: 'Erro interno no login' });
  }
};

export const seedAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await ensurePrisma();
    const existing = await db.user.findUnique({
      where: { email: 'admin@segtrack.com' },
    });

    if (existing) {
      res.status(400).json({ message: 'Usuário já existe' });
      return;
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    const permissions = [
      'create:user',
      'read:user',
      'update:user',
      'delete:user',
      'create:ocorrencia',
      'read:ocorrencia',
      'update:ocorrencia',
      'delete:ocorrencia',
      'read:dashboard',
      'read:relatorio',
      'create:foto',
      'read:foto',
      'update:foto',
      'delete:foto',
      'upload:foto'
    ];

    const user = await db.user.create({
      data: {
        name: 'Admin SEGTRACK',
        email: 'admin@segtrack.com',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions: JSON.stringify(permissions),
        active: true,
      },
    });

    res.json({ message: 'Usuário admin criado com sucesso', id: user.id });
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    res.status(500).json({ message: 'Erro ao criar admin', error });
  }
};
