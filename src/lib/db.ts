// backend/src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Configuração do Prisma com retry e logs
const prisma = new PrismaClient({
  log: ['error', 'warn', 'info', 'query'],
  errorFormat: 'pretty'
});

let isConnected = false;
let lastError: Error | null = null;
let connectionAttempts = 0;

// Função para testar a conexão com o banco de dados
export async function testConnection(): Promise<void> {
  try {
    connectionAttempts++;
    console.log(`🔄 Tentativa de conexão #${connectionAttempts}`);
    
    // Verifica variáveis de ambiente
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está definida');
    }

    // Tenta conectar
    await prisma.$connect();
    
    // Testa a conexão com uma query simples
    const result = await prisma.$queryRaw`SELECT NOW() as server_time`;
    console.log('✅ Teste de conexão bem sucedido:', result);
    
    isConnected = true;
    lastError = null;
    console.log(`✅ Conexão com o banco de dados estabelecida com sucesso (tentativa #${connectionAttempts})`);
  } catch (error: any) {
    isConnected = false;
    lastError = error;
    
    // Log detalhado do erro
    console.error('❌ Erro ao conectar com o banco de dados:', {
      attempt: connectionAttempts,
      errorMessage: error.message,
      errorCode: error.code,
      errorType: error.name,
      stack: error.stack,
      // Remove senha da URL antes de logar
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')
    });

    throw error;
  }
}

// Função para garantir que temos uma única instância do Prisma
export function getPrismaClient() {
  return prisma;
}

// Função para obter o status detalhado da conexão
export function getConnectionStatus() {
  return {
    isConnected,
    lastError: lastError ? {
      message: lastError.message,
      code: (lastError as any).code,
      type: lastError.name
    } : null,
    attempts: connectionAttempts
  };
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
  const BASE_DELAY = 1000; // 1 segundo
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
      isConnected = false;
      lastError = error;
      
      const errorDetails = {
        operation: params.action,
        model: params.model,
        errorMessage: error.message,
        errorCode: error.code,
        errorType: error.name,
        attempt: retries,
        maxRetries: MAX_RETRIES
      };
      
      console.error(`❌ Erro na tentativa ${retries}/${MAX_RETRIES}:`, errorDetails);
      
      if (retries === MAX_RETRIES) {
        throw error;
      }
      
      const delay = BASE_DELAY * Math.pow(2, retries - 1); // Backoff exponencial
      console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
});

// Gerenciamento de conexão global
process.on('beforeExit', async () => {
  if (isConnected) {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados antes de encerrar');
  }
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', {
    reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
  isConnected = false;
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });
  isConnected = false;
});

// Tenta estabelecer a conexão inicial
testConnection().catch(error => {
  console.error('❌ Erro na conexão inicial com o banco de dados:', {
    message: error.message,
    code: error.code,
    type: error.name,
    stack: error.stack
  });
});

export default prisma;
