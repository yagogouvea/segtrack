import { prisma, testConnection } from '../lib/prisma';

// Log inicial para debug
console.log('🔄 Iniciando configuração do Prisma...');

// Função para testar a conexão
export async function testDatabaseConnection(): Promise<boolean> {
  return testConnection();
}

export default prisma; 