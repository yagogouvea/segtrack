"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    permissions: true,
                    active: true
                }
            });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json(user);
        }
        catch (error) {
            console.error('Erro ao buscar usuário atual:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário atual' });
        }
    }
    async updateCurrentUser(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const { name, email } = req.body;
            const user = await prisma_1.prisma.user.update({
                where: { id: req.user.id },
                data: { name, email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    permissions: true,
                    active: true
                }
            });
            res.json(user);
        }
        catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }
    async updatePassword(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const { currentPassword, newPassword } = req.body;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.id }
            });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            const validPassword = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!validPassword) {
                return res.status(400).json({ error: 'Senha atual incorreta' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            await prisma_1.prisma.user.update({
                where: { id: req.user.id },
                data: { passwordHash: hashedPassword }
            });
            res.json({ message: 'Senha atualizada com sucesso' });
        }
        catch (error) {
            console.error('Erro ao atualizar senha:', error);
            res.status(500).json({ error: 'Erro ao atualizar senha' });
        }
    }
    async list(req, res) {
        try {
            const users = await prisma_1.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    permissions: true,
                    active: true
                }
            });
            res.json(users);
        }
        catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }
    async create(req, res) {
        try {
            const data = req.body;
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    passwordHash: hashedPassword,
                    role: data.role,
                    permissions: data.permissions,
                    active: true
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    permissions: true,
                    active: true
                }
            });
            res.status(201).json(user);
        }
        catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    permissions: true,
                    active: true
                }
            });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json(user);
        }
        catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const user = await prisma_1.prisma.user.update({
                where: { id },
                data: {
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    permissions: data.permissions,
                    active: data.active
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    permissions: true,
                    active: true
                }
            });
            res.json(user);
        }
        catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.user.delete({
                where: { id }
            });
            res.status(204).send();
        }
        catch (error) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map