import { Request, Response } from 'express';
import prisma from '../lib/db';
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z } from 'zod';
import type { User, Prisma } from '@prisma/client';

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

// Interface para campos opcionais de atualização
type UserUpdateFields = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

// Interface para campos obrigatórios de atualização
interface RequiredUpdateFields {
  permissions: string;
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

// Schema para validação de usuário
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'user']),
  permissions: z.array(z.string()).or(z.string()),
  active: z.boolean().default(true),
});

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
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// Buscar usuário específico
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// POST /api/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const data = userSchema.parse(req.body);
    
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    // Garantir que permissions seja uma string JSON válida
    let permissionsString: string;
    if (Array.isArray(data.permissions)) {
      permissionsString = JSON.stringify(data.permissions);
    } else if (typeof data.permissions === 'string') {
      // Verificar se já é um JSON válido
      try {
        JSON.parse(data.permissions);
        permissionsString = data.permissions;
      } catch {
        // Se não for JSON válido, converter para array e depois para JSON
        permissionsString = JSON.stringify([data.permissions]);
      }
    } else {
      permissionsString = '[]';
    }

    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash,
        permissions: permissionsString
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

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const data = userSchema.partial().parse(req.body);

    // Se email foi fornecido, verificar se já existe
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado por outro usuário' });
      }
    }

    // Hash da senha se fornecida
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    // Buscar usuário atual para manter as permissões existentes
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { permissions: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Determinar as novas permissões
    const newPermissions: string = data.permissions 
      ? Array.isArray(data.permissions)
        ? JSON.stringify(data.permissions)
        : typeof data.permissions === 'string'
          ? (() => {
              try {
                JSON.parse(data.permissions);
                return data.permissions;
              } catch {
                return JSON.stringify([data.permissions]);
              }
            })()
          : JSON.stringify([])
      : currentUser.permissions || JSON.stringify([]);

    // Atualizar primeiro os campos obrigatórios
    const requiredFields: RequiredUpdateFields = {
      permissions: newPermissions
    };

    await prisma.user.update({
      where: { id },
      data: requiredFields
    });

    // Preparar campos opcionais para atualização
    const optionalFields: UserUpdateFields = {};

    if (data.name) optionalFields.name = data.name;
    if (data.email) optionalFields.email = data.email;
    if (data.role) optionalFields.role = data.role;
    if (data.active !== undefined) optionalFields.active = data.active;
    if (typeof passwordHash === 'string') optionalFields.passwordHash = passwordHash;

    // Atualizar campos opcionais se houver algum
    if (Object.keys(optionalFields).length > 0) {
      await prisma.user.update({
        where: { id },
        data: optionalFields as Prisma.UserUpdateInput
      });
    }

    // Buscar e retornar o usuário atualizado
    const updatedUser = await prisma.user.findUnique({
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

    if (!updatedUser) {
      throw new Error('Usuário não encontrado após atualização');
    }

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};
