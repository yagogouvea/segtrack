import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '12h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no login', error });
  }
};

export const seedAdmin = async (_req: Request, res: Response) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@segtrack.com' },
    });

    if (existing) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await prisma.user.create({
      data: {
        name: 'Admin SEGTRACK',
        email: 'admin@segtrack.com',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions: [
          'view_users',
          'create_user',
          'edit_user',
          'export_pdf',
          'view_finance',
        ],
        active: true,
      },
    });

    res.json({ message: 'Usuário admin criado com sucesso', id: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar admin', error });
  }
};
