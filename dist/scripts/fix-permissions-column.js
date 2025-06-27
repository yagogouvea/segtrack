"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function fixPermissionsColumn() {
    const db = await (0, prisma_1.ensurePrisma)();
    try {
        // Primeiro, atualiza os registros existentes que têm NULL para '[]'
        await db.$executeRaw `UPDATE User SET permissions = '[]' WHERE permissions IS NULL`;
        // Remove o valor padrão e altera o tipo para TEXT
        await db.$executeRaw `ALTER TABLE User ALTER COLUMN permissions DROP DEFAULT`;
        await db.$executeRaw `ALTER TABLE User MODIFY permissions TEXT NOT NULL`;
        console.log('✅ Coluna permissions atualizada com sucesso');
    }
    catch (error) {
        console.error('❌ Erro ao atualizar coluna permissions:', error);
    }
    finally {
        await db.$disconnect();
    }
}
exports.default = fixPermissionsColumn;
