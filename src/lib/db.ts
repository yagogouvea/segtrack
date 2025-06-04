// backend/src/lib/db.ts
import { PrismaClient } from '@prisma/client';
import dns from 'dns';
import net from 'net';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);
const MAX_CONNECTION_ATTEMPTS = 10;
const BASE_DELAY = 1000; // 1 segundo

// Configuração do Prisma com retry e logs
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ],
});

// Log de todas as queries para debug
prisma.$on('query', (e) => {
  console.log('Query:', e);
});

let isConnected = false;
let lastError: Error | null = null;
let connectionAttempts = 0;

// Função para testar conectividade com o host
async function testHostConnectivity(host: string, port: number): Promise<string> {
  try {
    const socket = new net.Socket();
    
    const connectPromise = new Promise((resolve, reject) => {
      socket.connect(port, host, () => {
        socket.end();
        resolve(true);
      });
      
      socket.on('error', (err) => {
        reject(err);
      });
    });
    
    await connectPromise;
    return 'Host acessível';
  } catch (error: any) {
    return `Erro ao conectar: ${error.message}`;
  }
}

// Função para extrair informações da DATABASE_URL
function parseDatabaseUrl(url: string): { host: string; port: number } | null {
  try {
    const matches = url.match(/mysql:\/\/[^@]+@([^:]+):(\d+)\//);
    if (matches) {
      return {
        host: matches[1],
        port: parseInt(matches[2], 10)
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Função para diagnóstico de rede
async function performNetworkDiagnostics(): Promise<object> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return { error: 'DATABASE_URL não definida' };
  }

  const dbInfo = parseDatabaseUrl(url);
  if (!dbInfo) {
    return { error: 'Não foi possível extrair informações da DATABASE_URL' };
  }

  try {
    const { host, port } = dbInfo;
    
    // DNS lookup
    const dnsResult = await dnsLookup(host);
    
    // Teste de conectividade
    const connectivityResult = await testHostConnectivity(host, port);
    
    return {
      host,
      port,
      ip: dnsResult.address,
      family: `IPv${dnsResult.family}`,
      connectivity: connectivityResult
    };
  } catch (error: any) {
    return {
      error: 'Erro no diagnóstico de rede',
      details: error.message
    };
  }
}

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
    case 'PROTOCOL_CONNECTION_LOST':
      return 'Conexão perdida com o servidor MySQL.';
    case 'ECONNRESET':
      return 'Conexão resetada pelo servidor.';
    case 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR':
      return 'Erro fatal na conexão MySQL.';
    default:
      return `Erro desconhecido (${errorCode}): ${error.message}`;
  }
}

// Função para testar a conexão com o banco de dados
export async function testConnection(): Promise<void> {
  try {
    connectionAttempts++;
    console.log(`\n🔄 Iniciando tentativa de conexão #${connectionAttempts}`);
    
    // Verifica se atingiu o número máximo de tentativas
    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
      throw new Error(`Número máximo de tentativas (${MAX_CONNECTION_ATTEMPTS}) excedido.`);
    }
    
    // Diagnóstico de rede
    console.log('🔍 Realizando diagnóstico de rede...');
    const diagnostics = await performNetworkDiagnostics();
    console.log('📊 Resultado do diagnóstico:', diagnostics);
    
    // Tenta conectar
    console.log('🔌 Iniciando conexão com o banco...');
    await prisma.$connect();
    
    // Testa a conexão com queries simples
    console.log('🔍 Testando queries...');
    const [timeResult, versionResult] = await Promise.all([
      prisma.$queryRaw`SELECT NOW() as server_time`,
      prisma.$queryRaw`SELECT VERSION() as version`
    ]);
    
    console.log('✅ Conexão estabelecida com sucesso:', {
      serverTime: timeResult,
      mysqlVersion: versionResult,
      attempt: connectionAttempts
    });
    
    isConnected = true;
    lastError = null;
  } catch (error: any) {
    isConnected = false;
    lastError = error;
    
    const errorAnalysis = analyzeMySQLError(error);
    
    console.error('\n❌ Erro de conexão:', {
      attempt: connectionAttempts,
      errorMessage: error.message,
      errorCode: error.code,
      errorNumber: error.number,
      analysis: errorAnalysis,
      stack: error.stack?.split('\n')
    });

    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error(`\n⛔ Limite de ${MAX_CONNECTION_ATTEMPTS} tentativas atingido. Reinicie o servidor.`);
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
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      if (!isConnected) {
        console.log('\n⚠️ Conexão não estabelecida, tentando reconectar...');
        await testConnection();
      }

      return await next(params);
    } catch (error: any) {
      retries++;
      isConnected = false;
      lastError = error;
      
      const errorAnalysis = analyzeMySQLError(error);
      console.error(`\n❌ Erro na operação (tentativa ${retries}/${MAX_RETRIES}):`, {
        operation: params.action,
        model: params.model,
        errorMessage: error.message,
        errorCode: error.code,
        analysis: errorAnalysis
      });
      
      if (retries === MAX_RETRIES) throw error;
      
      const delay = BASE_DELAY * Math.pow(2, retries - 1);
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
