"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPrisma = exports.testConnection = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
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
exports.prisma = global.prisma || prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
// Middleware para retry em operações do banco
exports.prisma.$use(async (params, next) => {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 1000; // 1 segundo
    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await next(params);
        }
        catch (error) {
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
async function testConnection() {
    try {
        await exports.prisma.$connect();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        return true;
    }
    catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
        return false;
    }
}
exports.testConnection = testConnection;
// Função para desconectar do banco de dados
async function disconnectPrisma() {
    try {
        await exports.prisma.$disconnect();
        console.log('✅ Desconectado do banco de dados com sucesso!');
    }
    catch (error) {
        console.error('❌ Erro ao desconectar do banco de dados:', error);
    }
}
exports.disconnectPrisma = disconnectPrisma;
// Garantir que desconectamos do banco antes de encerrar
process.on('beforeExit', async () => {
    await disconnectPrisma();
});
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map