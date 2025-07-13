import { prisma } from './lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    console.log('URL do banco:', process.env.DATABASE_URL);
    
    // Tenta fazer uma query simples
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Conexão bem sucedida!', result);
    
    // Tenta buscar um usuário
    const userCount = await prisma.user.count();
    console.log('Número de usuários no banco:', userCount);
    
  } catch (error: unknown) {
    console.error('Erro ao conectar com o banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 