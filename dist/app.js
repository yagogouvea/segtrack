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
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const cors_2 = __importDefault(require("./infrastructure/config/cors"));
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
// Configuração de segurança
app.set('trust proxy', 1); // Corrigido para produção atrás de proxy reverso
// CORS configurado
app.use((0, cors_1.default)(cors_2.default));
// Middleware personalizado para forçar headers de CORS corretos
app.use((req, res, next) => {
    const origin = req.get('origin');
    console.log('🔍 Middleware CORS - Origin:', origin);
    // Permitir todas as origens temporariamente
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    // Responder imediatamente para requisições OPTIONS
    if (req.method === 'OPTIONS') {
        console.log('🔄 CORS - Respondendo OPTIONS preflight');
        res.status(200).end();
        return;
    }
    next();
});
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Middleware de log para todas as requisições
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});
console.log('Configurando rotas básicas...');
// Outras rotas podem ser adicionadas aqui, ex:
// router.use('/ocorrencias', ocorrenciasRoutes);
// router.use('/veiculos', veiculosRoutes);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/ocorrencias', ocorrencias_1.default);
app.use('/api/prestadores', prestadores_1.default);
app.use('/api/clientes', clientes_1.default);
// Rota básica para teste
app.get('/', (_req, res) => {
    res.json({ message: 'API Segtrack - Funcionando!' });
});
// Adicionar express-rate-limit
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Manter apenas a rota direta /api/health
app.get('/api/health', async (req, res) => {
    try {
        await (0, prisma_1.testConnection)();
        res.status(200).json({ status: 'ok' });
    }
    catch (err) {
        console.error('Erro no health check:', err);
        res.status(500).json({ status: 'erro', detalhes: (err instanceof Error ? err.message : String(err)) });
    }
});
// Middleware fallback 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
// Error handling
app.use((err, _req, res, _next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
console.log('Configuração do Express concluída!');
exports.default = app;
