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
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
            select: {
                id: true,
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
            throw new Error('Usuário desativado');
        }
        const isValidPassword = await bcryptjs_1.default.compare(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Senha incorreta');
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
            email: user.email,
            permissions: user.permissions
        }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '12h' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                permissions: user.permissions
            }
        };
    }
    async validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId }
            });
            if (!user?.active) {
                throw new Error('Usuário inválido ou inativo');
            }
            return decoded;
        }
        catch (error) {
            throw new Error('Token inválido');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map