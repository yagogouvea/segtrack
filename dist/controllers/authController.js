"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const login = async (req, res) => {
    try {
        // Validar corpo da requisição
        const { email, password, senha } = req.body;
        const userPassword = password || senha;
        if (!email || !userPassword) {
            res.status(400).json({ message: 'Email e password são obrigatórios' });
            return;
        }
        // --- INÍCIO AUTENTICAÇÃO REAL ---
        const db = await (0, prisma_1.ensurePrisma)();
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Usuário não encontrado' });
            return;
        }
        if (!user.active) {
            res.status(403).json({ message: 'Usuário inativo' });
            return;
        }
        const validPassword = await bcrypt_1.default.compare(userPassword, user.passwordHash);
        if (!validPassword) {
            res.status(401).json({ message: 'Senha incorreta' });
            return;
        }
        let permissions = [];
        try {
            permissions = user.permissions ? JSON.parse(user.permissions) : [];
        }
        catch (_a) {
            permissions = [];
        }
        const token = jsonwebtoken_1.default.sign({
            sub: user.id,
            nome: user.name,
            email: user.email,
            role: user.role,
            permissions: permissions
        }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '12h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: permissions,
                active: user.active
            }
        });
        // --- FIM AUTENTICAÇÃO REAL ---
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Erro interno no login' });
    }
};
exports.login = login;
const seedAdmin = async (_req, res) => {
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        const existing = await db.user.findUnique({
            where: { email: 'admin@segtrack.com' },
        });
        if (existing) {
            res.status(400).json({ message: 'Usuário já existe' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash('123456', 10);
        const permissions = [
            'create:user',
            'read:user',
            'update:user',
            'delete:user',
            'create:ocorrencia',
            'read:ocorrencia',
            'update:ocorrencia',
            'delete:ocorrencia',
            'read:dashboard',
            'read:relatorio',
            'create:foto',
            'read:foto',
            'update:foto',
            'delete:foto',
            'upload:foto'
        ];
        const user = await db.user.create({
            data: {
                name: 'Admin SEGTRACK',
                email: 'admin@segtrack.com',
                passwordHash: hashedPassword,
                role: 'admin',
                permissions: JSON.stringify(permissions),
                active: true,
            },
        });
        res.json({ message: 'Usuário admin criado com sucesso', id: user.id });
    }
    catch (error) {
        console.error("Erro ao criar admin:", error);
        res.status(500).json({ message: 'Erro ao criar admin', error });
    }
};
exports.seedAdmin = seedAdmin;
