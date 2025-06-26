import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const prisma = new PrismaClient();
  try {
    const name = 'Administrador SEGTRACK';
    const email = 'admin@segtrack.com.br';
    const password = 'segtrack123';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'admin',
        permissions: [],
        active: true,
      },
    });
    console.log('Usuário criado:', user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 