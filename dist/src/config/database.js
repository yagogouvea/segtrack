"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = void 0;
const prisma_1 = require("../lib/prisma");
// Log inicial para debug
console.log('🔄 Iniciando configuração do Prisma...');
// Função para testar a conexão
async function testDatabaseConnection() {
    return (0, prisma_1.testConnection)();
}
exports.testDatabaseConnection = testDatabaseConnection;
exports.default = prisma_1.prisma;
//# sourceMappingURL=database.js.map