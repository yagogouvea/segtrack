"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.testConnection = testConnection;
exports.analyzeMySQLError = analyzeMySQLError;
exports.disconnectPrisma = disconnectPrisma;
// backend/src/lib/db.ts
const prisma_1 = require("./prisma");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
// Função para testar a conexão
async function testConnection() {
    return (0, prisma_1.testConnection)();
}
// Função para analisar erros do MySQL
function analyzeMySQLError(error) {
    if (!error)
        return 'Erro desconhecido';
    // Códigos comuns de erro do MySQL
    const errorCodes = {
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
    if ((error === null || error === void 0 ? void 0 : error.code) && errorCodes[error === null || error === void 0 ? void 0 : error.code]) {
        return errorCodes[error === null || error === void 0 ? void 0 : error.code];
    }
    return error instanceof Error ? error.message : String(error) || 'Erro desconhecido';
}
// Função para desconectar do banco
async function disconnectPrisma() {
    try {
        await prisma_1.prisma.$disconnect();
        console.log('✅ Desconectado do banco de dados com sucesso!');
    }
    catch (error) {
        console.error('❌ Erro ao desconectar do banco de dados:', error);
    }
}
// Garantir que desconectamos do banco antes de encerrar
process.on('beforeExit', async () => {
    await disconnectPrisma();
});
