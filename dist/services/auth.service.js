"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET;
        if (!this.JWT_SECRET) {
            throw new Error('JWT_SECRET não está definida. Configure a variável de ambiente JWT_SECRET.');
        }
    }
    async login(email, password) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                passwordHash: true,
                role: true,
                permissions: true,
                active: true
            }
        });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        if (!user.active) {
            throw new Error('Usuário inativo');
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Senha inválida');
        }
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET não definido');
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }, secret, { expiresIn: '24h' });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions
            }
        };
    }
}
exports.AuthService = AuthService;
