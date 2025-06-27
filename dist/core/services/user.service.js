"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    async list() {
        const db = await (0, prisma_1.ensurePrisma)();
        return db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    async findById(id) {
        const db = await (0, prisma_1.ensurePrisma)();
        return db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    async findByEmail(email) {
        const db = await (0, prisma_1.ensurePrisma)();
        return db.user.findUnique({
            where: { email }
        });
    }
    async create(data) {
        const db = await (0, prisma_1.ensurePrisma)();
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        return db.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: hashedPassword,
                role: data.role,
                permissions: JSON.stringify(data.permissions || []),
                active: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    async update(id, data) {
        const db = await (0, prisma_1.ensurePrisma)();
        return db.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                role: data.role,
                permissions: data.permissions ? JSON.stringify(data.permissions) : undefined,
                active: data.active
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    async delete(id) {
        const db = await (0, prisma_1.ensurePrisma)();
        return db.user.delete({
            where: { id }
        });
    }
    async changePassword(id, currentPassword, newPassword) {
        const db = await (0, prisma_1.ensurePrisma)();
        const user = await db.user.findUnique({
            where: { id },
            select: { passwordHash: true }
        });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Senha atual incorreta');
        }
        const newPasswordHash = await bcrypt_1.default.hash(newPassword, 10);
        return db.user.update({
            where: { id },
            data: { passwordHash: newPasswordHash }
        });
    }
    async updatePassword(id, newPassword) {
        const db = await (0, prisma_1.ensurePrisma)();
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        return db.user.update({
            where: { id },
            data: {
                passwordHash: hashedPassword
            }
        });
    }
}
exports.UserService = UserService;
