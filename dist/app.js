"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prisma_1 = require("./lib/prisma");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const fotos_1 = __importDefault(require("./routes/fotos"));
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
// Configuração de segurança
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
// CORS simples e robusto - deve ser o primeiro middleware
app.use((req, res, next) => {
    console.log('[CORS] Origin recebido:', req.get('origin'));
    console.log('[CORS] Method:', req.method);
    const origin = req.get('origin');
    const allowedOrigins = [
        'https://painelsegtrack.com.br',
        'https://www.painelsegtrack.com.br',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173'
    ];
    if (process.env.NODE_ENV === 'development') {
        // Libera geral em desenvolvimento
        res.header('Access-Control-Allow-Origin', origin || '*');
    }
    else if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    // Responder imediatamente para requisições OPTIONS
    if (req.method === 'OPTIONS') {
        console.log('[CORS] Respondendo OPTIONS');
        res.sendStatus(200);
        return;
    }
    console.log('[CORS] Headers aplicados');
    next();
});
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Middleware de log para todas as requisições
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});
console.log('Configurando rotas básicas...');
// Rotas da API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/ocorrencias', ocorrencias_1.default);
app.use('/api/prestadores', prestadores_1.default);
app.use('/api/clientes', clientes_1.default);
app.use('/api/fotos', fotos_1.default);
// Rotas sem prefixo /api para compatibilidade com proxy do Vite
app.use('/auth', authRoutes_1.default);
app.use('/ocorrencias', ocorrencias_1.default);
app.use('/prestadores', prestadores_1.default);
app.use('/clientes', clientes_1.default);
app.use('/fotos', fotos_1.default);
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
// Corrigir endpoint /api/health para testar conexão com o banco
app.get('/api/health', async (req, res) => {
    try {
        // Em desenvolvimento, não testar conexão com banco
        if (process.env.NODE_ENV === 'development') {
            res.status(200).json({
                status: 'ok',
                environment: 'development',
                message: 'API funcionando em modo desenvolvimento',
                timestamp: new Date().toISOString()
            });
            return;
        }
        // Em produção, testar conexão com banco
        if (process.env.DATABASE_URL) {
            await (0, prisma_1.testConnection)();
            res.status(200).json({
                status: 'ok',
                environment: 'production',
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(200).json({
                status: 'ok',
                environment: 'production',
                message: 'API funcionando (sem banco de dados)',
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (err) {
        console.error('Erro no health check:', err);
        res.status(500).json({
            status: 'erro',
            detalhes: (err instanceof Error ? err.message : String(err)),
            timestamp: new Date().toISOString()
        });
    }
});
// Rota /health para compatibilidade com proxy do Vite
app.get('/health', async (req, res) => {
    try {
        // Em desenvolvimento, não testar conexão com banco
        if (process.env.NODE_ENV === 'development') {
            res.status(200).json({
                status: 'ok',
                environment: 'development',
                message: 'API funcionando em modo desenvolvimento',
                timestamp: new Date().toISOString()
            });
            return;
        }
        // Em produção, testar conexão com banco
        if (process.env.DATABASE_URL) {
            await (0, prisma_1.testConnection)();
            res.status(200).json({
                status: 'ok',
                environment: 'production',
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(200).json({
                status: 'ok',
                environment: 'production',
                message: 'API funcionando (sem banco de dados)',
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (err) {
        console.error('Erro no health check:', err);
        res.status(500).json({
            status: 'erro',
            detalhes: (err instanceof Error ? err.message : String(err)),
            timestamp: new Date().toISOString()
        });
    }
});
// Middleware fallback 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
// Error handling
app.use((err, _req, res, _next) => {
    console.error('Erro não tratado:', err);
    // Tratamento específico para erros do Multer
    if (err.name === 'MulterError') {
        console.error('Erro do Multer:', err);
        return res.status(400).json({
            error: 'Erro no upload de arquivo',
            message: err.message,
            code: err.code
        });
    }
    // Tratamento para erros de tipo de arquivo
    if (err.message.includes('Tipo de arquivo inválido')) {
        return res.status(400).json({
            error: 'Tipo de arquivo não permitido',
            message: err.message
        });
    }
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
console.log('Configuração do Express concluída!');
exports.default = app;
