import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Criando usuário de teste...');
    
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'yago@segtrackpr.com.br' }
    });

    if (existingUser) {
      console.log('Usuário já existe, atualizando senha...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      await prisma.user.update({
        where: { email: 'yago@segtrackpr.com.br' },
        data: {
          passwordHash: hashedPassword,
          active: true,
          role: 'admin'
        }
      });
      
      console.log('Senha atualizada com sucesso!');
      return;
    }

    // Cria novo usuário
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Yago',
        email: 'yago@segtrackpr.com.br',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions: [
          'view_users',
          'create_user',
          'edit_user',
          'delete_user',
          'view_ocorrencias',
          'create_ocorrencia',
          'edit_ocorrencia',
          'delete_ocorrencia'
        ],
        active: true
      }
    });

    console.log('Usuário criado com sucesso:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 