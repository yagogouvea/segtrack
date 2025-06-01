"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
exports.getPrismaClient = getPrismaClient;
exports.disconnectPrisma = disconnectPrisma;
// backend/src/lib/db.ts
const client_1 = require("@prisma/client");
// Configuração do Prisma com retry e logs
const prisma = new client_1.PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
});
// Função para testar a conexão com o banco de dados
async function testConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        return true;
    }
    catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
        return false;
    }
}
// Função para garantir que temos uma única instância do Prisma
function getPrismaClient() {
    return prisma;
}
// Função para fechar a conexão com o banco de dados
async function disconnectPrisma() {
    try {
        await prisma.$disconnect();
        console.log('✅ Desconectado do banco de dados com sucesso!');
    }
    catch (error) {
        console.error('❌ Erro ao desconectar do banco de dados:', error);
    }
}
// Middleware para adicionar retry na conexão
prisma.$use(async (params, next) => {
    const MAX_RETRIES = 3;
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            return await next(params);
        }
        catch (error) {
            retries++;
            if (retries === MAX_RETRIES) {
                throw error;
            }
            console.log(`Tentativa ${retries} de ${MAX_RETRIES} falhou. Tentando novamente...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Espera exponencial
        }
    }
});
// Gerenciamento de conexão global
process.on('beforeExit', async () => {
    await disconnectPrisma();
});
exports.default = prisma;
