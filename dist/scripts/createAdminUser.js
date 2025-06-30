"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
        // Define as permissões no novo formato
        const permissions = [
            'create:user',
            'read:user',
            'update:user',
            'delete:user',
            'create:client',
            'read:client',
            'update:client',
            'delete:client',
            'create:ocorrencia',
            'read:ocorrencia',
            'update:ocorrencia',
            'delete:ocorrencia',
            'create:prestador',
            'read:prestador',
            'update:prestador',
            'delete:prestador',
            'create:relatorio',
            'read:relatorio',
            'update:relatorio',
            'delete:relatorio',
            'create:contrato',
            'read:contrato',
            'update:contrato',
            'delete:contrato',
            'read:dashboard',
            'upload:foto',
            'create:foto',
            'read:foto',
            'update:foto',
            'delete:foto'
        ];
        const user = await db_1.prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@segtrack.com',
                passwordHash: hashedPassword,
                role: 'admin',
                permissions: JSON.stringify(permissions),
                active: true
            }
        });
        console.log('Admin user created:', user);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
createAdminUser();
