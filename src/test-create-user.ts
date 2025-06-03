import prisma from './lib/db';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUser() {
  try {
    const email = 'yago@segtrackpr.com.br';
    const password = '123456';
    console.log('Criando/atualizando usuário:', email);
    
    // Define as permissões como array e converte para JSON string
    const permissions = JSON.stringify([
      'view_users',
      'create_user',
      'edit_user',
      'delete_user',
      'view_ocorrencias',
      'create_ocorrencia',
      'edit_ocorrencia',
      'delete_ocorrencia'
    ]);

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      console.log('Usuário já existe, atualizando...');
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name: 'Yago',
          passwordHash: hashedPassword,
          active: true,
          role: 'admin',
          permissions
        }
      });
      
      console.log('Usuário atualizado com sucesso:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      console.log('Criando novo usuário...');
      
      const newUser = await prisma.user.create({
        data: {
          name: 'Yago',
          email,
          passwordHash: hashedPassword,
          role: 'admin',
          permissions,
          active: true
        }
      });

      console.log('Usuário criado com sucesso:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });
    }

  } catch (error) {
    console.error('Erro ao criar/atualizar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 