"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../lib/db"); // Usa instância compartilhada
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
        }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.json({ token });
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Erro interno no login', error });
    }
};
exports.login = login;
const seedAdmin = async (_req, res) => {
    try {
        const existing = await db_1.prisma.user.findUnique({
            where: { email: 'admin@segtrack.com' },
        });
        if (existing) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }
        const hashedPassword = await bcrypt_1.default.hash('123456', 10);
        const user = await db_1.prisma.user.create({
            data: {
                name: 'Admin SEGTRACK',
                email: 'admin@segtrack.com',
                passwordHash: hashedPassword,
                role: 'admin',
                permissions: [
                    'view_users',
                    'create_user',
                    'edit_user',
                    'export_pdf',
                    'view_finance',
                ],
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
