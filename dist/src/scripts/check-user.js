"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/db");
async function checkUser() {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: {
                email: 'yago@segtrackpr.com.br'
            }
        });
        console.log('Usuário encontrado:', {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            permissions: user?.permissions,
            active: user?.active
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
checkUser();
//# sourceMappingURL=check-user.js.map