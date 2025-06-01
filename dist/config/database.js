"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Configuração do Prisma com retry e logs
const prisma = new client_1.PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});
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
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
    }
});
exports.default = prisma;
