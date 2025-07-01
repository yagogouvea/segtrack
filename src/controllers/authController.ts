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

    // Validar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido no ambiente');
      res.status(500).json({ message: 'Erro de configuração do servidor' });
      return;
    }

    console.log('Tentativa de login para:', email);

    try {
      const db = await ensurePrisma();
      const user = await db.user.findUnique({ 
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
        active: user?.active
      });

      if (!user) {
        res.status(401).json({ message: 'Usuário não encontrado' });
        return;
      }

      if (!user.active) {
        res.status(403).json({ message: 'Usuário desativado. Entre em contato com o administrador.' });
        return;
      }

      const isMatch = await bcrypt.compare(userPassword, user.passwordHash);
      console.log('Resultado da verificação de senha:', { isMatch });

      if (!isMatch) {
        res.status(401).json({ message: 'Senha incorreta' });
        return;
      }

      try {
        let permissions: string[];
        try {
          if (Array.isArray(user.permissions)) {
            permissions = user.permissions;
          } else if (typeof user.permissions === 'string') {
            permissions = JSON.parse(user.permissions);
          } else {
            throw new Error('Formato de permissões inválido');
          }
          if (!Array.isArray(permissions)) {
            throw new Error('Formato de permissões inválido');
          }
        } catch (parseError) {
          console.error('Erro ao converter permissões:', parseError);
          res.status(500).json({ message: 'Erro ao processar permissões do usuário' });
          return;
        }
        
        console.log('Permissões do usuário:', permissions);

        const token = jwt.sign(
          {
            sub: user.id,
            nome: user.name,
            email: user.email,
            role: user.role,
            permissions: permissions
          },
          process.env.JWT_SECRET,
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
            permissions: permissions
          }
        });
      } catch (conversionError) {
        console.error('Erro na conversão de permissões:', conversionError);
        res.status(500).json({ message: 'Erro ao processar permissões' });
      }
    } catch (dbError) {
      console.error('Erro ao buscar usuário:', dbError);
      res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
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
