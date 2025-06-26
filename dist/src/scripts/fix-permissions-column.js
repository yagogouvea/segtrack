"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/db");
async function fixPermissionsColumn() {
    try {
        // Primeiro, atualiza os registros existentes que têm NULL para '[]'
        await db_1.prisma.$executeRaw `UPDATE User SET permissions = '[]' WHERE permissions IS NULL`;
        // Remove o valor padrão e altera o tipo para TEXT
        await db_1.prisma.$executeRaw `ALTER TABLE User ALTER COLUMN permissions DROP DEFAULT`;
        await db_1.prisma.$executeRaw `ALTER TABLE User MODIFY permissions TEXT NOT NULL`;
        console.log('✅ Coluna permissions atualizada com sucesso');
    }
    catch (error) {
        console.error('❌ Erro ao atualizar coluna permissions:', error);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
fixPermissionsColumn();
//# sourceMappingURL=fix-permissions-column.js.map