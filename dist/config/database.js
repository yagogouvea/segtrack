"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
const prisma_1 = require("../lib/prisma");
// Log inicial para debug
console.log('🔄 Iniciando configuração do Prisma...');
// Função para testar a conexão
async function testConnection() {
    try {
        const db = (0, prisma_1.ensurePrisma)();
        await db.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('Erro ao testar conexão com o banco:', error);
        return false;
    }
}
// Exportar o cliente Prisma
exports.default = (0, prisma_1.ensurePrisma)();
