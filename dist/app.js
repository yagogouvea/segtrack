"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./lib/db");
const authMiddleware_1 = require("./middleware/authMiddleware");
const security_1 = require("./config/security");
const dataSanitizer_1 = require("./middleware/dataSanitizer");
const cors_config_1 = require("./config/cors.config");
// Importando rotas
const prestadoresPublico_1 = __importDefault(require("./routes/prestadoresPublico"));
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
const app = (0, express_1.default)();
// Configurações de segurança
(0, security_1.configureSecurityMiddleware)(app);
// Aplicar CORS antes de qualquer outro middleware
app.use(cors_config_1.corsOptions);
// Basic middleware
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Rotas públicas
app.use('/api/prestadores-publico', prestadoresPublico_1.default);
// Rotas protegidas
app.use('/api', authMiddleware_1.authenticateToken, (0, dataSanitizer_1.sanitizeResponseData)(), protectedRoutes_1.default);
// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
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
// Test database connection on startup
(0, db_1.testConnection)().catch(error => {
    console.error('Erro ao conectar com o banco de dados:', {
        message: error.message.replace(/[<>]/g, ''),
        timestamp: new Date().toISOString()
    });
});
exports.default = app;
