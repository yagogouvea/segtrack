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
        return prisma_1.prisma.user.findMany({
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
        return prisma_1.prisma.user.findUnique({
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
    async create(data) {
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const permissionsString = data.permissions ? JSON.stringify(data.permissions) : '[]';
        return prisma_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: hashedPassword,
                role: data.role,
                permissions: permissionsString,
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
        return prisma_1.prisma.user.update({
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
        return prisma_1.prisma.user.delete({
            where: { id }
        });
    }
    async changePassword(id, currentPassword, newPassword) {
        const user = await prisma_1.prisma.user.findUnique({
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
        return prisma_1.prisma.user.update({
            where: { id },
            data: { passwordHash: newPasswordHash }
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map