import { Request, Response } from 'express';
import prisma from '../lib/db';
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

    // Converte as permissões de volta para array para o frontend
    const formattedUsers = users.map(user => ({
      ...user,
      permissions: JSON.parse(user.permissions as string)
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
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

    // Converte as permissões para JSON string
    const permissionsString = JSON.stringify(permissions || []);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        permissions: permissionsString,
        active,
        passwordHash: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Usuário criado com sucesso', id: newUser.id });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário', error });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { name, email, password, role, permissions, active } = req.body;

  try {
    console.log('Atualizando usuário:', {
      userId,
      name,
      email,
      role,
      hasPassword: !!password,
      permissions,
      active
    });

    // Verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      console.error('Usuário não encontrado:', userId);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const updateData: any = {
      name,
      email,
      role,
      permissions: JSON.stringify(permissions || []),
      active,
    };

    // Se uma nova senha foi fornecida, atualiza a senha
    if (password) {
      console.log('Atualizando senha do usuário');
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    console.log('Dados para atualização:', {
      ...updateData,
      passwordHash: updateData.passwordHash ? '[HASH]' : undefined
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log('Usuário atualizado com sucesso:', {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role
    });

    res.json({ 
      message: 'Usuário atualizado com sucesso',
      user: {
        ...updatedUser,
        permissions: JSON.parse(updatedUser.permissions as string)
      }
    });
  } catch (error) {
    console.error('Erro detalhado ao atualizar usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar usuário', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
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
