"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../utils/auth");
const validation_1 = require("../utils/validation");
const logger_1 = __importDefault(require("../infrastructure/logger"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const AppError_1 = require("../shared/errors/AppError");
class UserController {
    async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.sub }, // Usando sub em vez de id
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
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar usuário atual:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário atual' });
        }
    }
    async updateCurrentUser(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }
            const { name, email } = req.body;
            const user = await prisma_1.prisma.user.update({
                where: { id: req.user.sub }, // Usando sub em vez de id
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
            logger_1.default.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }
    async updatePassword(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: req.user.sub } // Usando sub em vez de id
            });
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            const validPassword = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!validPassword) {
                res.status(400).json({ error: 'Senha atual incorreta' });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            await prisma_1.prisma.user.update({
                where: { id: req.user.sub }, // Usando sub em vez de id
                data: { passwordHash: hashedPassword }
            });
            res.json({ message: 'Senha atualizada com sucesso' });
        }
        catch (error) {
            logger_1.default.error('Erro ao atualizar senha:', error);
            res.status(500).json({ error: 'Erro ao atualizar senha' });
        }
    }
    async list(_req, res) {
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
            logger_1.default.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }
    async create(req, res) {
        var _a;
        try {
            const data = req.body;
            // Validação dos campos obrigatórios
            if (!data.name || !data.email || !data.password || !data.role) {
                throw new AppError_1.AppError('Campos obrigatórios faltando: name, email, password, role', 400);
            }
            // Validação e conversão do role
            if (!Object.values(client_1.UserRole).includes(data.role)) {
                throw new AppError_1.AppError('Role inválido', 400);
            }
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    passwordHash: hashedPassword,
                    role: data.role,
                    permissions: data.permissions ? JSON.stringify(data.permissions) : '[]',
                    active: (_a = data.active) !== null && _a !== void 0 ? _a : true
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
            if (error instanceof AppError_1.AppError) {
                res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
                return;
            }
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
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar usuário:', error);
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
                    permissions: data.permissions ? JSON.stringify(data.permissions) : undefined,
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
            if (error instanceof AppError_1.AppError) {
                res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
                return;
            }
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
            logger_1.default.error('Erro ao deletar usuário:', error);
            res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }
    async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const db = await (0, prisma_1.ensurePrisma)();
            const user = await db.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    permissions: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar usuário:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    }
    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const db = await (0, prisma_1.ensurePrisma)();
            const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
            const user = await db.user.update({
                where: { id: userId },
                data: updateData
            });
            res.json(user);
        }
        catch (error) {
            logger_1.default.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }
    async getUserProfile(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
            if (!userId) {
                res.status(401).json({ error: 'Usuário não autenticado' });
                return;
            }
            const db = await (0, prisma_1.ensurePrisma)();
            const user = await db.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    permissions: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            // Atualizar último acesso
            await db.user.update({
                where: { id: userId },
                data: { updatedAt: new Date() }
            });
            res.json(user);
        }
        catch (error) {
            logger_1.default.error('Erro ao buscar perfil do usuário:', error);
            res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
        }
    }
    async getAllUsers(_req, res) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            const users = await db.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    permissions: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            res.json(users);
        }
        catch (error) {
            logger_1.default.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }
    async createUser(req, res) {
        try {
            const { email, passwordHash, name, role, permissions } = req.body;
            // Validação dos dados
            const validationError = (0, validation_1.validateUserData)({ email, passwordHash, name, role });
            if (validationError) {
                res.status(400).json({ error: validationError });
                return;
            }
            const db = await (0, prisma_1.ensurePrisma)();
            const userData = {
                email,
                name,
                passwordHash: await (0, auth_1.hashPassword)(passwordHash),
                role,
                permissions: permissions || '[]',
                active: true
            };
            const user = await db.user.create({
                data: userData
            });
            // Remove senha do objeto retornado
            const { passwordHash: _ } = user, userWithoutPassword = __rest(user, ["passwordHash"]);
            res.status(201).json(userWithoutPassword);
        }
        catch (error) {
            logger_1.default.error('Erro ao criar usuário:', error);
            if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
                res.status(400).json({ error: 'Email já está em uso' });
            }
            else {
                res.status(500).json({ error: 'Erro ao criar usuário' });
            }
        }
    }
    async resetPassword(req, res) {
        try {
            const userId = req.params.id;
            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 6) {
                res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
                return;
            }
            const db = await (0, prisma_1.ensurePrisma)();
            const user = await db.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
            await db.user.update({
                where: { id: userId },
                data: {
                    passwordHash: hashedPassword,
                    updatedAt: new Date()
                }
            });
            res.json({ message: 'Senha atualizada com sucesso' });
        }
        catch (error) {
            logger_1.default.error('Erro ao resetar senha:', error);
            res.status(500).json({ error: 'Erro ao resetar senha' });
        }
    }
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const db = await (0, prisma_1.ensurePrisma)();
            await db.user.delete({
                where: { id: userId }
            });
            res.json({ message: 'Usuário excluído com sucesso' });
        }
        catch (error) {
            logger_1.default.error('Erro ao excluir usuário:', error);
            res.status(500).json({ error: 'Erro ao excluir usuário' });
        }
    }
}
exports.UserController = UserController;
