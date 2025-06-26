"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSecurityMiddleware = configureSecurityMiddleware;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function configureSecurityMiddleware(app) {
    // Configuração básica do Helmet
    app.use((0, helmet_1.default)());
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // limite de 100 requisições por IP
        message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
        standardHeaders: true,
        legacyHeaders: false,
        // Usar X-Forwarded-For como identificador
        keyGenerator: (req) => {
            const xForwardedFor = req.get('x-forwarded-for');
            const realIp = req.get('x-real-ip');
            return xForwardedFor || realIp || req.ip || 'unknown';
        }
    });
    // Rate limiting específico para autenticação
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 60 * 1000, // 1 hora
        max: 5, // 5 tentativas
        message: 'Muitas tentativas de login. Conta temporariamente bloqueada.',
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            const xForwardedFor = req.get('x-forwarded-for');
            const realIp = req.get('x-real-ip');
            return xForwardedFor || realIp || req.ip || 'unknown';
        }
    });
    // Aplicar rate limiting
    app.use(limiter);
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    // Desabilitar o header X-Powered-By
    app.disable('x-powered-by');
}
