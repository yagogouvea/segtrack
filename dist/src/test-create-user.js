"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./lib/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function createTestUser() {
    try {
        const email = 'yago@segtrackpr.com.br';
        const password = '123456';
        console.log('Criando/atualizando usuário:', email);
        // Define as permissões no novo formato
        const permissions = [
            'create:user',
            'read:user',
            'update:user',
            'delete:user',
            'create:ocorrencia',
            'read:ocorrencia',
            'update:ocorrencia',
            'delete:ocorrencia',
            'read:dashboard',
            'read:relatorio',
            'create:foto',
            'read:foto',
            'update:foto',
            'delete:foto',
            'upload:foto'
        ];
        // Verifica se o usuário já existe
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email }
        });
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        if (existingUser) {
            console.log('Usuário já existe, atualizando...');
            const updatedUser = await db_1.prisma.user.update({
                where: { email },
                data: {
                    name: 'Yago',
                    passwordHash: hashedPassword,
                    active: true,
                    role: 'admin',
                    permissions: JSON.stringify(permissions)
                }
            });
            console.log('Usuário atualizado com sucesso:', {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role
            });
        }
        else {
            console.log('Criando novo usuário...');
            const newUser = await db_1.prisma.user.create({
                data: {
                    name: 'Yago',
                    email,
                    passwordHash: hashedPassword,
                    role: 'admin',
                    permissions: JSON.stringify(permissions),
                    active: true
                }
            });
            console.log('Usuário criado com sucesso:', {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            });
        }
    }
    catch (error) {
        console.error('Erro ao criar/atualizar usuário:', error);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
createTestUser();
//# sourceMappingURL=test-create-user.js.map