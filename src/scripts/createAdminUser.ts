import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('3500817Y@g', 10);

    const user = await prisma.user.create({
      data: {
        name: 'Yago',
        email: 'yago@segtrackpr.com.br',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions: {
          users: {
            create: true,
            read: true,
            update: true,
            delete: true
          },
          ocorrencias: {
            create: true,
            read: true,
            update: true,
            delete: true
          }
        },
        active: true
      }
    });

    console.log('Usuário admin criado com sucesso:', user);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 