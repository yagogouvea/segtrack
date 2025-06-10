import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Validação básica (simula o zod do backend)
function validateUser(data) {
  if (!data.name || typeof data.name !== 'string' || data.name.length < 3) return 'Nome inválido';
  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) return 'Email inválido';
  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) return 'Senha inválida';
  if (!data.role || !['admin', 'user', 'manager', 'operator', 'client'].includes(data.role)) return 'Role inválido';
  return null;
}

const prisma = new PrismaClient();

export const handler = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Validação
    const validationError = validateUser(body);
    if (validationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validationError }),
      };
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email já cadastrado' }),
      };
    }

    // Garantir que permissions seja uma string JSON válida
    let permissionsString;
    if (Array.isArray(body.permissions)) {
      permissionsString = JSON.stringify(body.permissions);
    } else if (typeof body.permissions === 'string') {
      try {
        JSON.parse(body.permissions);
        permissionsString = body.permissions;
      } catch {
        permissionsString = JSON.stringify([body.permissions]);
      }
    } else {
      permissionsString = '[]';
    }

    // Criptografar senha
    const passwordHash = await bcrypt.hash(body.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: body.role,
        permissions: permissionsString,
        active: typeof body.active === 'boolean' ? body.active : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      statusCode: 201,
      body: JSON.stringify(user),
    };
  } catch (error) {
    // Erro de e-mail duplicado (Prisma)
    if (error.code === 'P2002') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email já está em uso' }),
      };
    }
    // Erro de validação (simples)
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }
    // Erro genérico
    console.error('Erro ao criar usuário:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao criar usuário' }),
    };
  } finally {
    await prisma.$disconnect();
  }
};