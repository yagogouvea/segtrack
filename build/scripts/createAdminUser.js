"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt_1.default.hash('3500817Y@g', 10);
        const user = await prisma.user.create({
            data: {
                name: 'Yago',
                email: 'yago@segtrackpr.com.br',
                passwordHash: hashedPassword,
                role: 'admin',
                permissions: {
                    users: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    },
                    ocorrencias: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    }
                },
                active: true
            }
        });
        console.log('Usuário admin criado com sucesso:', user);
    }
    catch (error) {
        console.error('Erro ao criar usuário admin:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createAdminUser();
