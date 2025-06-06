import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
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

export const prisma = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Middleware para retry em operações do banco
prisma.$use(async (params, next) => {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // 1 segundo
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await next(params);
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Operação do banco falhou (tentativa ${attempt}/${MAX_RETRIES}):`, {
        operacao: params.action,
        modelo: params.model,
        erro: error.message,
        codigo: error.code
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

// Função para desconectar do banco de dados
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

// Garantir que desconectamos do banco antes de encerrar
process.on('beforeExit', async () => {
  await disconnectPrisma();
});

export default prisma;
