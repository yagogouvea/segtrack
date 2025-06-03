import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';

interface PrismaUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  permissions: string;
  active: boolean;
}

// Função auxiliar para converter permissões de objeto para array
function permissionsObjectToArray(permissionsObj: any): string[] {
  const permissions: string[] = [];
  
  // Mapeia as permissões do objeto para o formato de array
  Object.entries(permissionsObj).forEach(([module, actions]) => {
    Object.entries(actions as Record<string, boolean>).forEach(([action, enabled]) => {
      if (enabled) {
        if (action === 'read') permissions.push(`view_${module}`);
        else permissions.push(`${action}_${module.slice(0, -1)}`);
      }
    });
  });

  return permissions;
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log('Tentativa de login para:', email);

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
    }) as PrismaUser | null;

    console.log('Resultado da busca do usuário:', {
      found: !!user,
      role: user?.role,
      active: user?.active,
      permissions: user?.permissions
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Usuário desativado. Entre em contato com o administrador.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Resultado da verificação de senha:', { isMatch });

    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    try {
      // Parse as permissões da string JSON
      const permissionsObj = JSON.parse(user.permissions);
      
      console.log('Permissões convertidas:', permissionsObj);

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          role: user.role,
          permissions: permissionsObjectToArray(permissionsObj)
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '12h' }
      );

      console.log('Token gerado com sucesso');

      res.json({ 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: permissionsObjectToArray(permissionsObj)
        }
      });
    } catch (conversionError) {
      console.error('Erro na conversão de permissões:', conversionError);
      throw conversionError;
    }
  } catch (error) {
    console.error("Erro no login:", error);
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

    const permissions = JSON.stringify([
      'view_users',
      'create_user',
      'edit_user',
      'export_pdf',
      'view_finance',
    ]);

    const user = await prisma.user.create({
      data: {
        name: 'Admin SEGTRACK',
        email: 'admin@segtrack.com',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions,
        active: true,
      },
    });

    res.json({ message: 'Usuário admin criado com sucesso', id: user.id });
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    res.status(500).json({ message: 'Erro ao criar admin', error });
  }
};
