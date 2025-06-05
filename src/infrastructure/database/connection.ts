import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty'
});

export async function testConnection(): Promise<void> {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    throw error;
  }
}

export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco:', error);
    throw error;
  }
}

export default prisma; 