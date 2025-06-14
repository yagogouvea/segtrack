"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const response_1 = require("../../utils/response");
const json_1 = require("../../utils/json");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            response_1.sendResponse.unauthorized(res, 'Token não fornecido');
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            response_1.sendResponse.unauthorized(res, 'Token inválido');
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
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
            response_1.sendResponse.unauthorized(res, 'Usuário não encontrado');
            return;
        }
        if (!user.active) {
            response_1.sendResponse.unauthorized(res, 'Usuário inativo');
            return;
        }
        const permissions = json_1.jsonUtils.parse(user.permissions);
        if (!Array.isArray(permissions)) {
            response_1.sendResponse.error(res, new Error('Formato de permissões inválido'));
            return;
        }
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: Array.isArray(user.permissions)
                ? user.permissions
                : typeof user.permissions === 'string'
                    ? JSON.parse(user.permissions)
                    : [],
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            response_1.sendResponse.unauthorized(res, 'Token inválido');
            return;
        }
        response_1.sendResponse.error(res, error);
    }
};
exports.authenticateToken = authenticateToken;
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            response_1.sendResponse.unauthorized(res, 'Usuário não autenticado');
            return;
        }
        // Admin tem todas as permissões
        if (req.user.role === 'admin') {
            next();
            return;
        }
        const perms = Array.isArray(req.user.permissions)
            ? req.user.permissions
            : typeof req.user.permissions === 'string'
                ? JSON.parse(req.user.permissions)
                : [];
        if (!perms.includes(permission)) {
            response_1.sendResponse.forbidden(res, 'Acesso negado');
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
