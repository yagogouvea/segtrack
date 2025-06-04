"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado. Configure esta variável de ambiente antes de iniciar o servidor.');
}
const JWT_SECRET = process.env.JWT_SECRET;
// Rate limiting para falhas de autenticação
const failedAuthAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos
const checkRateLimit = (ip) => {
    const now = Date.now();
    const attempts = failedAuthAttempts.get(ip);
    if (attempts) {
        if (now - attempts.firstAttempt > BLOCK_DURATION) {
            failedAuthAttempts.delete(ip);
            return true;
        }
        return attempts.count < MAX_FAILED_ATTEMPTS;
    }
    return true;
};
const recordFailedAttempt = (ip) => {
    const now = Date.now();
    const attempts = failedAuthAttempts.get(ip);
    if (attempts) {
        attempts.count++;
    }
    else {
        failedAuthAttempts.set(ip, { count: 1, firstAttempt: now });
    }
};
const authenticateToken = (req, res, next) => {
    const ip = req.ip || '';
    if (!checkRateLimit(ip)) {
        return res.status(429).json({
            error: 'Muitas tentativas de autenticação. Tente novamente mais tarde.'
        });
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        recordFailedAttempt(ip);
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Verificar idade do token
        if (user.iat && Date.now() - user.iat * 1000 > 24 * 60 * 60 * 1000) {
            return res.status(401).json({ error: 'Token expirado' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        recordFailedAttempt(ip);
        return res.status(403).json({ error: 'Token inválido' });
    }
};
exports.authenticateToken = authenticateToken;
const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        try {
            const userPermissions = Array.isArray(req.user.permissions)
                ? req.user.permissions
                : JSON.parse(req.user.permissions || '[]');
            if (!userPermissions.includes(requiredPermission)) {
                // Se o usuário é admin, permite acesso
                if (req.user.role === 'admin') {
                    return next();
                }
                return res.status(403).json({ error: 'Permissão negada' });
            }
            next();
        }
        catch (error) {
            console.error('Erro ao verificar permissões:', error);
            return res.status(500).json({ error: 'Erro ao verificar permissões' });
        }
    };
};
exports.requirePermission = requirePermission;
