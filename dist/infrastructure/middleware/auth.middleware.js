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
        console.log('[auth.middleware] Iniciando autenticação...');
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('[auth.middleware] Token não fornecido');
            response_1.sendResponse.unauthorized(res, 'Token não fornecido');
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('[auth.middleware] Token inválido (formato)');
            response_1.sendResponse.unauthorized(res, 'Token inválido');
            return;
        }
        console.log('[auth.middleware] Verificando token JWT...');
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('[auth.middleware] Token decodificado:', decoded);
        // Extrair userId do token (sub ou id)
        const userId = decoded.sub || decoded.id;
        if (!userId) {
            console.error('[auth.middleware] Token JWT malformado ou sem id/sub:', decoded);
            response_1.sendResponse.unauthorized(res, 'Token JWT malformado ou sem id/sub');
            return;
        }
        console.log('[auth.middleware] Buscando usuário no banco:', userId);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
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
            console.log('[auth.middleware] Usuário não encontrado:', userId);
            response_1.sendResponse.unauthorized(res, 'Usuário não encontrado');
            return;
        }
        if (!user.active) {
            console.log('[auth.middleware] Usuário inativo:', userId);
            response_1.sendResponse.unauthorized(res, 'Usuário inativo');
            return;
        }
        console.log('[auth.middleware] Usuário encontrado:', user);
        const permissions = json_1.jsonUtils.parse(user.permissions);
        if (!Array.isArray(permissions)) {
            console.error('[auth.middleware] Formato de permissões inválido:', user.permissions);
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
        console.log('[auth.middleware] Autenticação concluída com sucesso');
        next();
    }
    catch (error) {
        console.error('[auth.middleware] Erro na autenticação:', error);
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
