"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    async login(data) {
        const db = await (0, prisma_1.ensurePrisma)();
        const user = await db.user.findUnique({
            where: { email: data.email }
        });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        const validPassword = await bcryptjs_1.default.compare(data.password, user.passwordHash);
        if (!validPassword) {
            throw new Error('Senha inválida');
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não está definido');
        }
        let permissions;
        try {
            permissions = JSON.parse(user.permissions);
            if (!Array.isArray(permissions)) {
                throw new Error('Formato de permissões inválido');
            }
        }
        catch (_a) {
            permissions = [];
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.name,
            role: user.role,
            permissions
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions
            }
        };
    }
    async verifyToken(token) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não está definido');
        }
        try {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
}
exports.AuthService = AuthService;
