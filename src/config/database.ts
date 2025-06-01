import { PrismaClient } from '@prisma/client';

// Log inicial para debug
console.log('🔄 Iniciando configuração do Prisma...');

// Verifica DATABASE_URL antes de qualquer coisa
if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO CRÍTICO: DATABASE_URL não está definida!');
  process.exit(1);
}

console.log('📡 DATABASE_URL está configurada');

// Configuração do Prisma com retry e logs
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Função para testar a conexão
export async function testDatabaseConnection(): Promise<boolean> {
  console.log('🔄 Testando conexão com o banco de dados...');
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Conexão com o banco estabelecida com sucesso!');
      return true;
    } catch (error: any) {
      console.error(`❌ Tentativa ${attempt}/3 falhou ao conectar com o banco:`);
      console.error(`   Erro: ${error.message}`);
      
      if (error.code) {
        console.error(`   Código: ${error.code}`);
      }
      
      if (attempt < 3) {
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ Todas as tentativas de conexão falharam');
        return false;
      }
    }
  }
  
  return false;
}

// Middleware para adicionar retry em operações do banco
prisma.$use(async (params, next) => {
  const MAX_RETRIES = 3;
  let lastError: any;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await next(params);
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Operação do banco falhou (tentativa ${attempt}/${MAX_RETRIES}):`, {
        operacao: params.action,
        modelo: params.model,
        erro: error.message
      });
      
      if (attempt < MAX_RETRIES) {
        const delay = attempt * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
});

export default prisma; 