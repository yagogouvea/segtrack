"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../lib/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
        // Define as permissões como um objeto e converte para JSON string
        const permissions = JSON.stringify({
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
        });
        const user = await db_1.default.user.create({
            data: {
                name: 'Admin',
                email: 'admin@segtrack.com',
                passwordHash: hashedPassword,
                role: 'admin',
                permissions,
                active: true
            }
        });
        console.log('Admin user created:', user);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
    finally {
        await db_1.default.$disconnect();
    }
}
createAdminUser();
