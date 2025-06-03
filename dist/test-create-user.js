"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./lib/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function createTestUser() {
    try {
        const email = 'yago@segtrackpr.com.br';
        const password = '123456';
        console.log('Criando/atualizando usuário:', email);
        // Define as permissões como array e converte para JSON string
        const permissions = JSON.stringify([
            'view_users',
            'create_user',
            'edit_user',
            'delete_user',
            'view_ocorrencias',
            'create_ocorrencia',
            'edit_ocorrencia',
            'delete_ocorrencia'
        ]);
        // Verifica se o usuário já existe
        const existingUser = await db_1.default.user.findUnique({
            where: { email }
        });
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        if (existingUser) {
            console.log('Usuário já existe, atualizando...');
            const updatedUser = await db_1.default.user.update({
                where: { email },
                data: {
                    name: 'Yago',
                    passwordHash: hashedPassword,
                    active: true,
                    role: 'admin',
                    permissions
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
            const newUser = await db_1.default.user.create({
                data: {
                    name: 'Yago',
                    email,
                    passwordHash: hashedPassword,
                    role: 'admin',
                    permissions,
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
        await db_1.default.$disconnect();
    }
}
createTestUser();
