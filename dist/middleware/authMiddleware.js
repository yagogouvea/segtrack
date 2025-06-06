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
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET não configurado');
            return res.status(500).json({ error: 'Internal server error' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const requirePermission = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (req.user.role !== requiredRole && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
//# sourceMappingURL=authMiddleware.js.map