import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// GET /api/users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error });
  }
};

// POST /api/users
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, permissions, active = true } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Nome, email, senha e perfil são obrigatórios.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        permissions,
        active,
        passwordHash: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Usuário criado com sucesso', id: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { name, email, role, permissions, active } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        permissions,
        active,
      },
    });

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  console.log("🧪 Tentando excluir usuário:", userId);

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error: any) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado no banco de dados.' });
    }

    console.error("❌ Erro inesperado ao excluir:", error);
    res.status(500).json({ message: 'Erro ao excluir usuário', error });
  }
};
