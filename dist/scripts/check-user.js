"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function checkUser() {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email: 'yago@segtrackpr.com.br'
            }
        });
        if (!user) {
            console.log('❌ Usuário não encontrado');
            return;
        }
        console.log('✅ Usuário encontrado:', {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            active: user.active
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
checkUser();
