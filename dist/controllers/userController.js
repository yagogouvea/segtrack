"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
// GET /api/users
const getUsers = async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
};
exports.getUsers = getUsers;
// POST /api/users
const createUser = async (req, res) => {
    const { name, email, password, role, permissions, active = true } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Nome, email, senha e perfil são obrigatórios.' });
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                role,
                permissions,
                active,
                passwordHash: hashedPassword,
            },
        });
        res.status(201).json({ message: 'Usuário criado com sucesso', id: newUser.id });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário', error });
    }
};
exports.createUser = createUser;
// PUT /api/users/:id
const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, role, permissions, active } = req.body;
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                role,
                permissions,
                active,
            },
        });
        res.json({ message: 'Usuário atualizado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
};
exports.updateUser = updateUser;
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    console.log("🧪 Tentando excluir usuário:", userId);
    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        res.json({ message: 'Usuário excluído com sucesso' });
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: 'Usuário não encontrado no banco de dados.' });
        }
        console.error("❌ Erro inesperado ao excluir:", error);
        res.status(500).json({ message: 'Erro ao excluir usuário', error });
    }
};
exports.deleteUser = deleteUser;
