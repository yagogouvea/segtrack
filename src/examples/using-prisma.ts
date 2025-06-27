import { ensurePrisma } from '@/lib/prisma';
import logger from '@/infrastructure/logger';
import { Prisma } from '@prisma/client';

/**
 * Este arquivo serve como exemplo de como usar o prisma de forma segura
 * após a atualização que adiciona verificação de null.
 * 
 * Principais mudanças:
 * 1. Usar ensurePrisma() ao invés de acessar prisma diretamente
 * 2. Usar o logger ao invés de console.log/error
 * 3. Tratar erros adequadamente
 * 4. Usar os tipos corretos do Prisma
 */

export async function exemploListarUsuarios() {
  try {
    // Obter uma instância garantida do prisma
    const db = await ensurePrisma();
    
    // Usar normalmente
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    return users;
  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    throw error;
  }
}

export async function exemploCriarUsuario(data: { email: string; name: string; passwordHash: string }) {
  try {
    const db = await ensurePrisma();
    
    const userData: Prisma.UserCreateInput = {
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: 'operator',
      permissions: '[]',
      active: true
    };

    const user = await db.user.create({
      data: userData
    });

    return user;
  } catch (error: any) {
    // Exemplo de tratamento específico de erro
    if (error.code === 'P2002') {
      logger.warn('Tentativa de criar usuário com email duplicado:', data.email);
      throw new Error('Email já está em uso');
    }

    logger.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function exemploTransacao() {
  try {
    const db = await ensurePrisma();
    
    // Exemplo de transação
    const result = await db.$transaction(async (tx) => {
      const userData: Prisma.UserCreateInput = {
        email: 'teste@exemplo.com',
        name: 'Teste',
        passwordHash: 'senha_hash_123',
        role: 'operator',
        permissions: '[]',
        active: true
      };

      const user = await tx.user.create({
        data: userData
      });

      // Criar um registro relacionado
      const ocorrenciaData: Prisma.OcorrenciaCreateInput = {
        placa1: 'ABC1234',
        cliente: 'Cliente Teste',
        tipo: 'TESTE',
        status: 'em_andamento',
        criado_em: new Date(),
        atualizado_em: new Date()
      };

      const ocorrencia = await tx.ocorrencia.create({
        data: ocorrenciaData
      });

      return { user, ocorrencia };
    });

    return result;
  } catch (error) {
    logger.error('Erro na transação:', error);
    throw error;
  }
}

export async function exemploQueryRaw() {
  try {
    const db = await ensurePrisma();
    
    // Exemplo de query raw com tipos
    const result = await db.$queryRaw<Array<{ id: number; name: string; total_ocorrencias: number }>>`
      SELECT 
        u.id,
        u.name,
        COUNT(o.id) as total_ocorrencias
      FROM User u
      LEFT JOIN Ocorrencia o ON o.placa1 = u.id
      GROUP BY u.id, u.name
    `;

    return result;
  } catch (error) {
    logger.error('Erro na query raw:', error);
    throw error;
  }
} 