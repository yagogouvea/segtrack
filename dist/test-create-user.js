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
        console.log('Criando usuário de teste...');
        // Verifica se o usuário já existe
        const existingUser = await db_1.default.user.findUnique({
            where: { email: 'yago@segtrackpr.com.br' }
        });
        if (existingUser) {
            console.log('Usuário já existe, atualizando senha...');
            const hashedPassword = await bcrypt_1.default.hash('123456', 10);
            await db_1.default.user.update({
                where: { email: 'yago@segtrackpr.com.br' },
                data: {
                    passwordHash: hashedPassword,
                    active: true,
                    role: 'admin'
                }
            });
            console.log('Senha atualizada com sucesso!');
            return;
        }
        // Cria novo usuário
        const hashedPassword = await bcrypt_1.default.hash('test123', 10);
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
        const user = await db_1.default.user.create({
            data: {
                name: 'Test User',
                email: 'test@example.com',
                passwordHash: hashedPassword,
                role: 'user',
                permissions,
                active: true
            }
        });
        console.log('Test user created:', user);
    }
    catch (error) {
        console.error('Error creating test user:', error);
    }
    finally {
        await db_1.default.$disconnect();
    }
}
createTestUser();
