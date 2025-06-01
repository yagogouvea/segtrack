"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
exports.getPrismaClient = getPrismaClient;
exports.disconnectPrisma = disconnectPrisma;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    log: ['query', 'error', 'warn'],
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
process.on('beforeExit', async () => {
    await disconnectPrisma();
});
exports.default = prisma;
