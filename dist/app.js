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
const path_1 = __importDefault(require("path"));
const prisma_1 = require("./lib/prisma");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const prestadoresPublico_1 = __importDefault(require("./routes/prestadoresPublico"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cnpj_1 = __importDefault(require("./routes/cnpj"));
// import veiculosRouter from './routes/veiculos';
const fotos_1 = __importDefault(require("./routes/fotos"));
const routes_1 = __importDefault(require("./api/v1/routes"));
const fs_1 = __importDefault(require("fs"));
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
// Configuração de segurança
app.set('trust proxy', 1); // Corrigido para produção atrás de proxy reverso
// CORS - deve vir antes de qualquer rota
const allowedOrigins = [
    'https://app.painelsegtrack.com.br',
    'http://localhost:5173'
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type']
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Configuração para servir arquivos estáticos da pasta uploads
app.use('/api/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
    maxAge: 0
}));
// Middleware de log para todas as requisições
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    console.log(`🔍 Headers:`, req.headers);
    console.log(`🔍 Query:`, req.query);
    console.log(`🔍 Params:`, req.params);
    next();
});
console.log('Configurando rotas básicas...');
// Rota de teste simples
app.get('/api/test', (req, res) => {
    console.log('[app] Rota de teste acessada');
    res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});
// Rota de teste para ocorrências sem autenticação
app.get('/api/ocorrencias-test', (req, res) => {
    console.log('[app] Rota de teste de ocorrências acessada');
    res.json({ message: 'Rota de ocorrências funcionando!', timestamp: new Date().toISOString() });
});
// Rota de teste para fotos sem autenticação
app.get('/api/fotos-test', (req, res) => {
    console.log('[app] Rota de teste de fotos acessada');
    res.json({ message: 'Rota de fotos funcionando!', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/ocorrencias', ocorrencias_1.default);
app.use('/api/prestadores', prestadores_1.default);
app.use('/api/prestadores-publico', prestadoresPublico_1.default);
app.use('/api/clientes', clientes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/cnpj', cnpj_1.default);
// Removida rota de veículos - não é mais necessária
// app.use('/api/veiculos', veiculosRouter);
app.use('/api/fotos', fotos_1.default);
// Adicionar rotas da API v1
app.use('/api/v1', routes_1.default);
// Rota básica para /api
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'API Segtrack online!' });
});
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
// Endpoint temporário para debug do caminho da pasta uploads
app.get('/api/debug/uploads-path', (req, res) => {
    res.json({ uploadsPath: path_1.default.join(__dirname, '../uploads') });
});
// Endpoint temporário para listar arquivos da pasta uploads
app.get('/api/debug/list-uploads', (req, res) => {
    const uploadsPath = path_1.default.join(__dirname, '../uploads');
    fs_1.default.readdir(uploadsPath, (err, files) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ files });
    });
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
