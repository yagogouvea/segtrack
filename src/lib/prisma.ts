import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
});

// Função para testar a conexão com o banco de dados
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

// Função para garantir que temos uma única instância do Prisma
export function getPrismaClient() {
  return prisma;
}

// Função para fechar a conexão com o banco de dados
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

process.on('beforeExit', async () => {
  await disconnectPrisma();
});

export default prisma;
