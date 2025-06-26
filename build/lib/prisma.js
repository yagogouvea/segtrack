"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Conectado ao banco de dados com sucesso!");
    }
    catch (error) {
        console.error("❌ Erro ao conectar com o banco de dados:", error);
        process.exit(1); // Encerra o processo para evitar deploy com app quebrada
    }
}
testConnection();
exports.default = prisma;
