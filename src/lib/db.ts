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
const MAX_CONNECTION_ATTEMPTS = 10;

// Função para analisar erros específicos do MySQL
function analyzeMySQLError(error: any): string {
  const errorCode = error.code || '';
  const errorNumber = error.number || '';
  
  switch (errorCode) {
    case 'ECONNREFUSED':
      return 'Conexão recusada. Verifique se o banco de dados está rodando e acessível.';
    case 'ER_ACCESS_DENIED_ERROR':
      return 'Acesso negado. Verifique as credenciais do banco de dados.';
    case 'ETIMEDOUT':
      return 'Timeout na conexão. Verifique a rede e as regras de firewall.';
    case 'ER_BAD_DB_ERROR':
      return 'Banco de dados não existe. Verifique o nome do banco na URL.';
    case 'ENOTFOUND':
      return 'Host não encontrado. Verifique o endereço do servidor.';
    default:
      return `Erro desconhecido: ${error.message}`;
  }
}

// Função para testar a conexão com o banco de dados
export async function testConnection(): Promise<void> {
  try {
    connectionAttempts++;
    console.log(`🔄 Tentativa de conexão #${connectionAttempts}`);
    
    // Verifica se atingiu o número máximo de tentativas
    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
      throw new Error(`Número máximo de tentativas (${MAX_CONNECTION_ATTEMPTS}) excedido. Reinicie o servidor.`);
    }
    
    // Verifica variáveis de ambiente
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está definida');
    }

    // Log da URL do banco (sem senha)
    const dbUrlParts = process.env.DATABASE_URL.split('@');
    if (dbUrlParts.length > 1) {
      const safeUrl = `mysql://<credentials>@${dbUrlParts[1]}`;
      console.log('🔌 Tentando conectar ao banco:', safeUrl);
    }

    // Tenta conectar
    await prisma.$connect();
    
    // Testa a conexão com queries simples
    const [timeResult, versionResult] = await Promise.all([
      prisma.$queryRaw`SELECT NOW() as server_time`,
      prisma.$queryRaw`SELECT VERSION() as version`
    ]);
    
    console.log('✅ Teste de conexão bem sucedido:', {
      serverTime: timeResult,
      mysqlVersion: versionResult
    });
    
    isConnected = true;
    lastError = null;
    console.log(`✅ Conexão com o banco de dados estabelecida com sucesso (tentativa #${connectionAttempts})`);
  } catch (error: any) {
    isConnected = false;
    lastError = error;
    
    const errorAnalysis = analyzeMySQLError(error);
    
    // Log detalhado do erro
    console.error('❌ Erro ao conectar com o banco de dados:', {
      attempt: connectionAttempts,
      errorMessage: error.message,
      errorCode: error.code,
      errorNumber: error.number,
      errorType: error.name,
      analysis: errorAnalysis,
      stack: error.stack
    });

    // Se atingiu o limite de tentativas, para de tentar
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error(`⛔ Número máximo de tentativas (${MAX_CONNECTION_ATTEMPTS}) atingido. Necessário reiniciar o servidor.`);
    }

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
      type: lastError.name,
      analysis: analyzeMySQLError(lastError)
    } : null,
    attempts: connectionAttempts,
    maxAttempts: MAX_CONNECTION_ATTEMPTS
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
      
      const errorAnalysis = analyzeMySQLError(error);
      
      const errorDetails = {
        operation: params.action,
        model: params.model,
        errorMessage: error.message,
        errorCode: error.code,
        errorNumber: error.number,
        errorType: error.name,
        analysis: errorAnalysis,
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
    analysis: reason instanceof Error ? analyzeMySQLError(reason) : 'Erro desconhecido',
    stack: reason instanceof Error ? reason.stack : undefined
  });
  isConnected = false;
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', {
    error: error.message,
    analysis: analyzeMySQLError(error),
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
    analysis: analyzeMySQLError(error),
    stack: error.stack
  });
});

export default prisma;
