"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const response_1 = require("../../utils/response");
const authenticateToken = async (req, res, next) => {
    try {
        console.log('[auth.middleware] Iniciando autenticação...');
        console.log('[auth.middleware] URL:', req.url);
        console.log('[auth.middleware] Method:', req.method);
        console.log('[auth.middleware] Headers:', req.headers);
        console.log('[auth.middleware] Authorization header:', req.headers.authorization);
        console.log('[auth.middleware] JWT_SECRET:', process.env.JWT_SECRET ? 'PRESENTE' : 'AUSENTE');
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
        console.log('[auth.middleware] Token recebido:', token.substring(0, 20) + '...');
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
        // Garantir que permissions seja sempre um array de strings
        let parsedPermissions = [];
        try {
            if (Array.isArray(user.permissions)) {
                parsedPermissions = user.permissions.filter((p) => typeof p === 'string');
            }
            else if (typeof user.permissions === 'string') {
                const arr = JSON.parse(user.permissions);
                if (Array.isArray(arr)) {
                    parsedPermissions = arr.filter((p) => typeof p === 'string');
                }
            }
        }
        catch (e) {
            console.error('[auth.middleware] Erro ao parsear permissions:', user.permissions, e);
            parsedPermissions = [];
        }
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: parsedPermissions,
        };
        console.log('[auth.middleware] Autenticação concluída com sucesso');
        console.log('[auth.middleware] Usuário final:', req.user);
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
        console.log('[requirePermission] Verificando permissão:', permission);
        console.log('[requirePermission] Usuário:', req.user);
        console.log('[requirePermission] URL:', req.url);
        console.log('[requirePermission] Method:', req.method);
        if (!req.user) {
            console.log('[requirePermission] Usuário não autenticado');
            response_1.sendResponse.unauthorized(res, 'Usuário não autenticado');
            return;
        }
        // Admin tem todas as permissões
        if (req.user.role === 'admin') {
            console.log('[requirePermission] Usuário é admin, permitindo acesso');
            next();
            return;
        }
        const perms = Array.isArray(req.user.permissions)
            ? req.user.permissions
            : typeof req.user.permissions === 'string'
                ? JSON.parse(req.user.permissions)
                : [];
        // LOG DETALHADO DO ARRAY DE PERMISSÕES
        console.log('[requirePermission] Permissões do usuário (array):', perms);
        console.log('[requirePermission] Permissão necessária:', permission);
        if (!perms.includes(permission)) {
            console.log('[requirePermission] Acesso negado - permissão não encontrada');
            response_1.sendResponse.forbidden(res, 'Acesso negado');
            return;
        }
        console.log('[requirePermission] Permissão concedida');
        next();
    };
};
exports.requirePermission = requirePermission;
