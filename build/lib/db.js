"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// backend/src/lib/db.ts
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function testConnection() {
    try {
        await exports.prisma.$connect();
        console.log("✅ Conectado ao banco de dados com sucesso!");
    }
    catch (error) {
        console.error("❌ Erro ao conectar com o banco de dados:", error);
        process.exit(1);
    }
}
testConnection();
