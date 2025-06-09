"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSecurityMiddleware = configureSecurityMiddleware;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function configureSecurityMiddleware(app) {
    // Helmet para headers de segurança
    app.use((0, helmet_1.default)());
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // limite por IP
        message: 'Muitas requisições deste IP, tente novamente mais tarde.',
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use(limiter);
    // Desabilitar X-Powered-By
    app.disable('x-powered-by');
    // Configurações adicionais de segurança
    app.use(helmet_1.default.noSniff());
    app.use(helmet_1.default.xssFilter());
    app.use(helmet_1.default.hidePoweredBy());
    app.use(helmet_1.default.frameguard({ action: 'deny' }));
}
