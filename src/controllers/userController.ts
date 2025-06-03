import { Request, Response } from 'express';
import prisma from '../lib/db';
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  active: boolean;
}

interface PermissionsObject {
  [key: string]: {
    [key: string]: boolean;
  };
}

// Função auxiliar para converter permissões de objeto para array
function permissionsObjectToArray(permissionsObj: PermissionsObject): string[] {
  const permissions: string[] = [];
  
  // Mapeia as permissões do objeto para o formato de array
  Object.entries(permissionsObj).forEach(([module, actions]) => {
    Object.entries(actions).forEach(([action, enabled]) => {
      if (enabled) {
        if (action === 'read') permissions.push(`view_${module}`);
        else if (module.endsWith('s')) {
          permissions.push(`${action}_${module.slice(0, -1)}`);
        } else {
          permissions.push(`${action}_${module}`);
        }
      }
    });
  });

  return permissions;
}

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
    const formattedUsers = users.map((user: UserWithPermissions) => {
      let permissions: string[] = [];
      try {
        const permissionsObj = JSON.parse(user.permissions) as PermissionsObject;
        permissions = user.role === 'admin' 
          ? Object.keys(permissionsObj).reduce((acc: string[], module) => {
              const actions = permissionsObj[module];
              Object.keys(actions).forEach(action => {
                if (action === 'read') acc.push(`view_${module}`);
                else if (module.endsWith('s')) {
                  acc.push(`${action}_${module.slice(0, -1)}`);
                } else {
                  acc.push(`${action}_${module}`);
                }
              });
              return acc;
            }, [])
          : permissionsObjectToArray(permissionsObj);
      } catch (e) {
        console.error('Erro ao converter permissões:', e);
      }

      return {
        ...user,
        permissions
      };
    });

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

    // Se for admin, garante todas as permissões
    const permissionsToSave: PermissionsObject = role === 'admin' ? {
      users: { read: true, create: true, update: true, delete: true },
      ocorrencias: { read: true, create: true, update: true, delete: true },
      dashboard: { read: true },
      prestadores: { read: true, create: true, update: true, delete: true },
      relatorios: { read: true, create: true, update: true, delete: true },
      clientes: { read: true, create: true, update: true, delete: true },
      financeiro: { read: true }
    } : permissions;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        permissions: JSON.stringify(permissionsToSave),
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

    // Se for admin, garante todas as permissões
    const permissionsToSave: PermissionsObject = role === 'admin' ? {
      users: { read: true, create: true, update: true, delete: true },
      ocorrencias: { read: true, create: true, update: true, delete: true },
      dashboard: { read: true },
      prestadores: { read: true, create: true, update: true, delete: true },
      relatorios: { read: true, create: true, update: true, delete: true },
      clientes: { read: true, create: true, update: true, delete: true },
      financeiro: { read: true }
    } : permissions;

    const updateData: any = {
      name,
      email,
      role,
      permissions: JSON.stringify(permissionsToSave),
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

    // Converte as permissões de volta para array para o frontend
    const permissionsObj = JSON.parse(updatedUser.permissions) as PermissionsObject;
    const formattedPermissions = role === 'admin'
      ? Object.keys(permissionsObj).reduce((acc: string[], module) => {
          const actions = permissionsObj[module];
          Object.keys(actions).forEach(action => {
            if (action === 'read') acc.push(`view_${module}`);
            else if (module.endsWith('s')) {
              acc.push(`${action}_${module.slice(0, -1)}`);
            } else {
              acc.push(`${action}_${module}`);
            }
          });
          return acc;
        }, [])
      : permissionsObjectToArray(permissionsObj);
    
    res.json({ 
      message: 'Usuário atualizado com sucesso',
      user: {
        ...updatedUser,
        permissions: formattedPermissions
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário', error });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ message: 'Usuário não encontrado' });
    } else {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ message: 'Erro ao excluir usuário', error });
    }
  }
};
