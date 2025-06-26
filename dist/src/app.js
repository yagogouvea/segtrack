"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prisma_1 = require("./lib/prisma");
const security_1 = require("./infrastructure/middleware/security");
const logger_1 = require("./infrastructure/middleware/logger");
const cors_2 = __importDefault(require("./infrastructure/config/cors"));
const routes_1 = __importDefault(require("./api/v1/routes"));
const logger_2 = __importDefault(require("./infrastructure/logger"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const app = (0, express_1.default)();
// Configurar trust proxy para Cloud Run/Load Balancer
app.set('trust proxy', 1);
// Configurações de segurança básicas
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);
// Configurações de segurança adicionais
(0, security_1.configureSecurityMiddleware)(app);
// CORS configurado
app.use((0, cors_1.default)(cors_2.default));
// Limite de payload
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Middleware de timeout
const timeout = 30000; // 30 segundos
app.use((req, res, next) => {
    res.setTimeout(timeout, () => {
        logger_2.default.error('Request timeout:', {
            method: req.method,
            url: req.url,
            timeout: timeout,
            ip: req.ip,
            realIp: req.get('x-real-ip'),
            forwardedFor: req.get('x-forwarded-for')
        });
        res.status(408).json({ error: 'Request timeout' });
    });
    next();
});
// Middleware de logging
app.use(logger_1.requestLogger);
// Documentação Swagger
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
// Rotas da API v1
app.use('/api/v1', routes_1.default);
// Health check endpoint
app.get('/health', async (_req, res) => {
    try {
        await (0, prisma_1.testConnection)();
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });
    }
    catch (error) {
        logger_2.default.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
});
// Error handling
app.use((err, req, res, _next) => {
    logger_2.default.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Gerenciamento de processo
process.on('SIGTERM', async () => {
    logger_2.default.info('Recebido sinal SIGTERM, iniciando shutdown graceful...');
    await (0, prisma_1.disconnectPrisma)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_2.default.info('Recebido sinal SIGINT, iniciando shutdown graceful...');
    await (0, prisma_1.disconnectPrisma)();
    process.exit(0);
});
// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    logger_2.default.fatal('Erro não capturado:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    (0, prisma_1.disconnectPrisma)().finally(() => {
        process.exit(1);
    });
});
process.on('unhandledRejection', (reason) => {
    logger_2.default.error('Promise rejeitada não tratada:', {
        reason,
        stack: reason instanceof Error ? reason.stack : undefined,
        timestamp: new Date().toISOString()
    });
});
// Monitoramento de memória
const MB = 1024 * 1024;
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    logger_2.default.info('Uso de memória:', {
        rss: `${Math.round(memoryUsage.rss / MB)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / MB)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / MB)}MB`,
        external: `${Math.round(memoryUsage.external / MB)}MB`
    });
}, 60000); // Log a cada minuto
exports.default = app;
//# sourceMappingURL=app.js.map