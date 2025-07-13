import { Request, Response } from 'express';
import { ensurePrisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

type UserRole = 'admin' | 'manager' | 'operator' | 'client';

// Interface para campos opcionais de atualização
type UserUpdateFields = Partial<{
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}>;

// Interface para campos obrigatórios de atualização
interface RequiredUpdateFields {
  permissions: string;
}

// Schema para validação de usuário
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']),
  permissions: z.array(z.string()).or(z.string()),
  active: z.boolean().default(true)
});

// Schema para validação de atualização de usuário
const userUpdateSchema = userSchema.partial().omit({ password: true });

// Schema para validação de senha
const passwordUpdateSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

// GET /api/users
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await ensurePrisma();
    const users = await db.user.findMany({
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
  } catch (error: unknown) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// Buscar usuário específico
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const db = await ensurePrisma();
    const user = await db.user.findUnique({
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
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json(user);
  } catch (error: unknown) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// POST /api/users
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = userSchema.parse(req.body);
    const db = await ensurePrisma();
    
    // Verificar se o email já existe
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

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

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, 10),
        role: data.role as UserRole,
        permissions: permissionsString,
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

    res.status(201).json(user);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const data = userUpdateSchema.parse(req.body);
    const db = await ensurePrisma();

    // Se email foi fornecido, verificar se já existe
    if (data.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: data.email,
          NOT: { id }
        }
      });

      if (existingUser) {
        res.status(400).json({ error: 'Email já cadastrado por outro usuário' });
        return;
      }
    }

    // Buscar usuário atual para manter as permissões existentes
    const currentUser = await db.user.findUnique({
      where: { id },
      select: { permissions: true }
    });

    if (!currentUser) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Determinar as novas permissões
    const newPermissions: string[] = Array.isArray(data.permissions) ? 
      data.permissions : 
      JSON.parse(data.permissions as string);

    // Preparar campos obrigatórios para atualização
    const requiredFields: RequiredUpdateFields = {
      permissions: JSON.stringify(newPermissions)
    };

    // Preparar campos opcionais para atualização
    const optionalFields: UserUpdateFields = {};
    if (data.name) optionalFields.name = data.name;
    if (data.email) optionalFields.email = data.email;
    if (data.role) optionalFields.role = data.role as UserRole;
    if (typeof data.active === 'boolean') optionalFields.active = data.active;

    // Atualizar usuário
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...optionalFields,
        ...requiredFields,
        updatedAt: new Date()
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

    res.json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// PATCH /api/users/:id/password
export const updateUserPassword = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const data = passwordUpdateSchema.parse(req.body);
    const db = await ensurePrisma();

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await db.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha' });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const db = await ensurePrisma();
    await db.user.delete({
      where: { id }
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error: unknown) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
};
