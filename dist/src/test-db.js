"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./lib/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function testConnection() {
    try {
        console.log('Tentando conectar ao banco de dados...');
        console.log('URL do banco:', process.env.DATABASE_URL);
        // Tenta fazer uma query simples
        const result = await prisma_1.prisma.$queryRaw `SELECT 1`;
        console.log('Conexão bem sucedida!', result);
        // Tenta buscar um usuário
        const userCount = await prisma_1.prisma.user.count();
        console.log('Número de usuários no banco:', userCount);
    }
    catch (error) {
        console.error('Erro ao conectar com o banco:', error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
testConnection();
//# sourceMappingURL=test-db.js.map