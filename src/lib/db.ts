// backend/src/lib/db.ts
import { prisma, testConnection as testPrismaConnection } from './prisma';

// Exporta a instância do Prisma
export { prisma };

// Função para testar a conexão
export async function testConnection() {
  return testPrismaConnection();
}

// Função para analisar erros do MySQL
export function analyzeMySQLError(error: any) {
  if (!error) return 'Erro desconhecido';
  
  // Códigos comuns de erro do MySQL
  const errorCodes: { [key: string]: string } = {
    'ER_ACCESS_DENIED_ERROR': 'Acesso negado ao banco de dados',
    'ER_BAD_DB_ERROR': 'Banco de dados não existe',
    'ER_CON_COUNT_ERROR': 'Muitas conexões',
    'ER_DBACCESS_DENIED_ERROR': 'Acesso ao banco negado',
    'ER_HOST_NOT_PRIVILEGED': 'Host não tem privilégios',
    'ER_HOST_IS_BLOCKED': 'Host bloqueado',
    'ER_NO_SUCH_TABLE': 'Tabela não existe',
    'ER_PARSE_ERROR': 'Erro de sintaxe SQL',
    'ER_SERVER_SHUTDOWN': 'Servidor está desligando',
    'ER_TOO_MANY_USER_CONNECTIONS': 'Muitas conexões de usuário',
  };

  if ((error as any)?.code && errorCodes[(error as any)?.code]) {
    return errorCodes[(error as any)?.code];
  }

  return error instanceof Error ? error.message : String(error) || 'Erro desconhecido';
}

// Função para desconectar do banco
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados com sucesso!');
  } catch (error: unknown) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

// Garantir que desconectamos do banco antes de encerrar
process.on('beforeExit', async () => {
  await disconnectPrisma();
});
