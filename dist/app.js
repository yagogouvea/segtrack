"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const db_1 = require("./lib/db");
const authMiddleware_1 = require("./middleware/authMiddleware");
const cors_1 = require("./middleware/cors");
const security_1 = require("./config/security");
const dataSanitizer_1 = require("./middleware/dataSanitizer");
// Importando rotas
const prestadoresPublico_1 = __importDefault(require("./routes/prestadoresPublico"));
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
const app = (0, express_1.default)();
// Configurações de segurança
(0, security_1.configureSecurityMiddleware)(app);
// CORS configuration
app.use(cors_1.corsMiddleware);
// Basic middleware
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Aplicar sanitização de dados para todas as respostas
app.use((0, dataSanitizer_1.sanitizeResponseData)());
// Rotas públicas (com dados limitados)
app.use('/api/prestadores/publico', prestadoresPublico_1.default);
// Rotas protegidas (requerem autenticação)
app.use('/api/protected', authMiddleware_1.authenticateToken, protectedRoutes_1.default);
// Health check endpoint (versão segura)
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
});
// Request logging middleware (versão segura)
app.use((req, _res, next) => {
    const sanitizedUrl = req.url.replace(/[<>]/g, '');
    const sanitizedMethod = req.method.replace(/[<>]/g, '');
    console.log(`${new Date().toISOString()} - ${sanitizedMethod} ${sanitizedUrl}`);
    next();
});
// Global error handler (versão segura)
app.use((err, _req, res, _next) => {
    console.error('Erro:', {
        name: err.name,
        message: err.message.replace(/[<>]/g, ''),
        timestamp: new Date().toISOString()
    });
    if (err instanceof zod_1.z.ZodError) {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: err.errors.map(e => ({
                message: e.message.replace(/[<>]/g, ''),
                path: e.path
            }))
        });
    }
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development'
            ? err.message.replace(/[<>]/g, '')
            : undefined
    });
});
// Test database connection on startup
(0, db_1.testConnection)().catch(error => {
    console.error('Erro ao conectar com o banco de dados:', {
        message: error.message.replace(/[<>]/g, ''),
        timestamp: new Date().toISOString()
    });
});
exports.default = app;
