"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = void 0;
exports.authenticateToken = authenticateToken;
// import { prisma } from '../../lib/prisma'; // Comentando para evitar erro quando DATABASE_URL não está definida
const response_1 = require("../../utils/response");
function authenticateToken(req, res, next) {
    next();
}
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
