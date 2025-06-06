"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserPassword = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const db_1 = require("../lib/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
// Schema para validação de usuário
const userSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['admin', 'user']),
    permissions: zod_1.z.array(zod_1.z.string()).or(zod_1.z.string()),
    active: zod_1.z.boolean().default(true)
});
// Schema para validação de atualização de usuário
const userUpdateSchema = userSchema.partial().omit({ password: true });
// Schema para validação de senha
const passwordUpdateSchema = zod_1.z.object({
    password: zod_1.z.string().min(6),
    confirmPassword: zod_1.z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
});
// GET /api/users
const getUsers = async (_req, res) => {
    try {
        const users = await db_1.prisma.user.findMany({
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
        res.json(users);
    }
    catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};
exports.getUsers = getUsers;
// Buscar usuário específico
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await db_1.prisma.user.findUnique({
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
        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};
exports.getUser = getUser;
// POST /api/users
const createUser = async (req, res) => {
    try {
        const data = userSchema.parse(req.body);
        // Verificar se o email já existe
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            res.status(400).json({ error: 'Email já cadastrado' });
            return;
        }
        // Garantir que permissions seja uma string JSON válida
        let permissionsString;
        if (Array.isArray(data.permissions)) {
            permissionsString = JSON.stringify(data.permissions);
        }
        else if (typeof data.permissions === 'string') {
            // Verificar se já é um JSON válido
            try {
                JSON.parse(data.permissions);
                permissionsString = data.permissions;
            }
            catch {
                // Se não for JSON válido, converter para array e depois para JSON
                permissionsString = JSON.stringify([data.permissions]);
            }
        }
        else {
            permissionsString = '[]';
        }
        const user = await db_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: await bcrypt_1.default.hash(data.password, 10),
                role: data.role,
                permissions: permissionsString,
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
        res.status(201).json(user);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            return;
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};
exports.createUser = createUser;
// PUT /api/users/:id
const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const data = userUpdateSchema.parse(req.body);
        // Se email foi fornecido, verificar se já existe
        if (data.email) {
            const existingUser = await db_1.prisma.user.findFirst({
                where: {
                    email: data.email,
                    NOT: { id }
                }
            });
            if (existingUser) {
                res.status(400).json({ error: 'Email já cadastrado por outro usuário' });
                return;
            }
        }
        // Buscar usuário atual para manter as permissões existentes
        const currentUser = await db_1.prisma.user.findUnique({
            where: { id },
            select: { permissions: true }
        });
        if (!currentUser) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        // Determinar as novas permissões
        const newPermissions = data.permissions
            ? Array.isArray(data.permissions)
                ? JSON.stringify(data.permissions)
                : typeof data.permissions === 'string'
                    ? (() => {
                        try {
                            JSON.parse(data.permissions);
                            return data.permissions;
                        }
                        catch {
                            return JSON.stringify([data.permissions]);
                        }
                    })()
                    : JSON.stringify([])
            : currentUser.permissions || JSON.stringify([]);
        // Preparar campos obrigatórios para atualização
        const requiredFields = {
            permissions: newPermissions
        };
        // Atualizar primeiro os campos obrigatórios
        await db_1.prisma.user.update({
            where: { id },
            data: requiredFields
        });
        // Preparar campos opcionais para atualização
        const optionalFields = {};
        if (data.name)
            optionalFields.name = data.name;
        if (data.email)
            optionalFields.email = data.email;
        if (data.role)
            optionalFields.role = data.role;
        if (data.active !== undefined)
            optionalFields.active = data.active;
        // Atualizar campos opcionais se houver algum
        if (Object.keys(optionalFields).length > 0) {
            await db_1.prisma.user.update({
                where: { id },
                data: optionalFields
            });
        }
        // Buscar e retornar o usuário atualizado
        const updatedUser = await db_1.prisma.user.findUnique({
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
        if (!updatedUser) {
            res.status(500).json({ error: 'Usuário não encontrado após atualização' });
            return;
        }
        res.json(updatedUser);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            return;
        }
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
exports.updateUser = updateUser;
// PUT /api/users/:id/password
const updateUserPassword = async (req, res) => {
    const { id } = req.params;
    try {
        const data = passwordUpdateSchema.parse(req.body);
        // Verificar se o usuário existe
        const user = await db_1.prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        // Atualizar a senha
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        await db_1.prisma.user.update({
            where: { id },
            data: { passwordHash }
        });
        res.json({ message: 'Senha atualizada com sucesso' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            return;
        }
        console.error('Erro ao atualizar senha:', error);
        res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
};
exports.updateUserPassword = updateUserPassword;
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db_1.prisma.user.delete({
            where: { id }
        });
        res.json({ message: 'Usuário deletado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map