import { ensurePrisma } from '@/lib/prisma';

// Log inicial para debug
console.log('🔄 Iniciando configuração do Prisma...');

// Função para testar a conexão
export async function testConnection(): Promise<boolean> {
  try {
    const db = await ensurePrisma();
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error: unknown) {
    console.error('Erro ao testar conexão com o banco:', error);
    return false;
  }
}

// Exportar o cliente Prisma
export default ensurePrisma(); 