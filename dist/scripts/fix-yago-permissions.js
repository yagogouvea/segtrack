"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function fixYagoPermissions() {
    try {
        // Define admin permissions in the correct object format
        const adminPermissions = {
            users: {
                read: true,
                create: true,
                update: true,
                delete: true
            },
            ocorrencias: {
                read: true,
                create: true,
                update: true,
                delete: true
            },
            dashboard: {
                read: true
            },
            prestadores: {
                read: true,
                create: true,
                update: true,
                delete: true
            },
            relatorios: {
                read: true,
                create: true,
                update: true,
                delete: true
            },
            clientes: {
                read: true,
                create: true,
                update: true,
                delete: true
            }
        };
        // Update Yago's permissions
        const updatedUser = await prisma_1.prisma.user.update({
            where: {
                email: 'yago@segtrackpr.com.br'
            },
            data: {
                role: 'admin',
                permissions: JSON.stringify(adminPermissions)
            }
        });
        console.log('✅ Permissões do usuário Yago atualizadas com sucesso:', {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            permissions: JSON.parse(updatedUser.permissions)
        });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar permissões do Yago:', error);
        throw error;
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
fixYagoPermissions()
    .catch(console.error);
