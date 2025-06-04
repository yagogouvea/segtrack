// backend/src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Configuração do Prisma com retry e logs
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty'
});

let isConnected = false;

// Função para testar a conexão com o banco de dados
export async function testConnection(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    throw error;
  }
}

// Função para garantir que temos uma única instância do Prisma
export function getPrismaClient() {
  return prisma;
}

// Função para verificar o estado da conexão
export function getConnectionStatus() {
  return isConnected;
}

// Função para fechar a conexão com o banco de dados
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    isConnected = false;
    console.log('✅ Desconectado do banco de dados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

// Middleware para adicionar retry na conexão
prisma.$use(async (params, next) => {
  const MAX_RETRIES = 3;
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // Se não estiver conectado, tenta reconectar
      if (!isConnected) {
        console.log('⚠️ Conexão não estabelecida, tentando reconectar...');
        await testConnection();
      }

      const result = await next(params);
      if (retries > 0) {
        console.log(`✅ Operação bem-sucedida após ${retries} tentativas`);
      }
      return result;
    } catch (error: any) {
      retries++;
      isConnected = false; // Marca como desconectado em caso de erro
      
      console.error(`❌ Erro na tentativa ${retries}/${MAX_RETRIES}:`, {
        operation: params.action,
        model: params.model,
        error: error.message,
        stack: error.stack
      });
      
      if (retries === MAX_RETRIES) {
        throw error;
      }
      
      const delay = 1000 * Math.pow(2, retries - 1); // Backoff exponencial
      console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
});

// Gerenciamento de conexão global
process.on('beforeExit', async () => {
  await disconnectPrisma();
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', {
    promise,
    reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
  isConnected = false; // Marca como desconectado em caso de erro não tratado
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', {
    error,
    stack: error.stack
  });
  isConnected = false; // Marca como desconectado em caso de exceção não tratada
});

// Tenta estabelecer a conexão inicial
testConnection().catch(error => {
  console.error('❌ Erro na conexão inicial com o banco de dados:', error);
});

export default prisma;
