"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const db_1 = __importDefault(require("../lib/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const library_1 = require("@prisma/client/runtime/library");
// Função auxiliar para converter permissões de objeto para array
function permissionsObjectToArray(permissionsObj) {
    const permissions = [];
    // Mapeia as permissões do objeto para o formato de array
    Object.entries(permissionsObj).forEach(([module, actions]) => {
        Object.entries(actions).forEach(([action, enabled]) => {
            if (enabled) {
                if (action === 'read')
                    permissions.push(`view_${module}`);
                else
                    permissions.push(`${action}_${module.slice(0, -1)}`);
            }
        });
    });
    return permissions;
}
// GET /api/users
const getUsers = async (_req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
            },
        });
        // Converte as permissões de volta para array para o frontend
        const formattedUsers = users.map((user) => {
            const permissionsObj = JSON.parse(user.permissions);
            return {
                ...user,
                permissions: permissionsObjectToArray(permissionsObj)
            };
        });
        res.json(formattedUsers);
    }
    catch (error) {
        console.error('Erro ao buscar usuários:', error);
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
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Converte as permissões para JSON string
        const permissionsString = JSON.stringify(permissions || []);
        const newUser = await db_1.default.user.create({
            data: {
                name,
                email,
                role,
                permissions: permissionsString,
                active,
                passwordHash: hashedPassword,
            },
        });
        res.status(201).json({ message: 'Usuário criado com sucesso', id: newUser.id });
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro ao criar usuário', error });
    }
};
exports.createUser = createUser;
// PUT /api/users/:id
const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, password, role, permissions, active } = req.body;
    try {
        console.log('Atualizando usuário:', {
            userId,
            name,
            email,
            role,
            hasPassword: !!password,
            permissions,
            active
        });
        // Verifica se o usuário existe
        const existingUser = await db_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            console.error('Usuário não encontrado:', userId);
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        const updateData = {
            name,
            email,
            role,
            permissions: JSON.stringify(permissions || []),
            active,
        };
        // Se uma nova senha foi fornecida, atualiza a senha
        if (password) {
            console.log('Atualizando senha do usuário');
            updateData.passwordHash = await bcrypt_1.default.hash(password, 10);
        }
        console.log('Dados para atualização:', {
            ...updateData,
            passwordHash: updateData.passwordHash ? '[HASH]' : undefined
        });
        const updatedUser = await db_1.default.user.update({
            where: { id: userId },
            data: updateData,
        });
        console.log('Usuário atualizado com sucesso:', {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role
        });
        // Converte as permissões de volta para array para o frontend
        const permissionsObj = JSON.parse(updatedUser.permissions);
        res.json({
            message: 'Usuário atualizado com sucesso',
            user: {
                ...updatedUser,
                permissions: permissionsObjectToArray(permissionsObj)
            }
        });
    }
    catch (error) {
        console.error('Erro detalhado ao atualizar usuário:', error);
        res.status(500).json({
            message: 'Erro ao atualizar usuário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};
exports.updateUser = updateUser;
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    console.log("🧪 Tentando excluir usuário:", userId);
    try {
        await db_1.default.user.delete({
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
