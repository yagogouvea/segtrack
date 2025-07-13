import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL não está definida no arquivo .env');
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };

// Função auxiliar para testar a conexão
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao banco de dados com sucesso!");
  } catch (error: unknown) {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
    throw error;
  }
}

// Função para desconectar o Prisma
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Função para garantir que o prisma está disponível
export async function ensurePrisma(): Promise<PrismaClient> {
  if (!prisma) {
    console.error('[Prisma] Cliente não está disponível');
    throw new Error('Prisma client não está disponível. Verifique se DATABASE_URL está definida no .env');
  }

  try {
    // Testa a conexão
    await prisma.$queryRaw`SELECT 1`;
    console.log('[Prisma] Conexão com o banco de dados está ativa');
    return prisma;
  } catch (error: unknown) {
    console.error('[Prisma] Erro ao verificar conexão:', {
      error,
      message: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Erro desconhecido',
      stack: error instanceof Error ? error instanceof Error ? error.stack : undefined : undefined
    });
    throw new Error('Erro de conexão com o banco de dados');
  }
}

// Middleware para retry em operações do banco
prisma?.$use(async (params, next) => {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // 1 segundo
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await next(params);
    } catch (error: unknown) {
      lastError = error;
      console.error(`❌ Operação do banco falhou (tentativa ${attempt}/${MAX_RETRIES}):`, {
        operacao: params.action,
        modelo: params.model,
        erro: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
        codigo: (error as any)?.code
      });

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt - 1);
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
});

// Garantir que desconectamos do banco antes de encerrar
process.on('beforeExit', async () => {
  await disconnectPrisma();
});

export const prismaEnv = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
