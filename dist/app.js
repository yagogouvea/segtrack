"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const prestador_js_1 = __importDefault(require("./routes/prestador.js"));
// import veiculosRouter from './routes/veiculos';
const fotos_1 = __importDefault(require("./routes/fotos"));
const routes_1 = __importDefault(require("./api/v1/routes"));
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
const prestadorProtectedRoutes_1 = __importDefault(require("./routes/prestadorProtectedRoutes"));
const rastreamentoRoutes_1 = __importDefault(require("./routes/rastreamentoRoutes"));
const auth_middleware_1 = require("./infrastructure/middleware/auth.middleware");
const fs_1 = __importDefault(require("fs"));
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
// Configuração de segurança
app.set('trust proxy', 1); // Corrigido para produção atrás de proxy reverso
// CORS - deve vir antes de qualquer rota
const allowedOrigins = [
    'https://app.painelsegtrack.com.br',
    'https://cliente.painelsegtrack.com.br',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8080',
    'https://prestador.painelsegtrack.com.br', // front antigo
    'https://prestadores.painelsegtrack.com.br', // novo domínio
    'https://painel-prestador.painelsegtrack.com.br', // domínio específico do painel
    'https://prestador.painelsegtrack.com.br' // domínio alternativo
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
    maxAge: 0,
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));
// Middleware de log para todas as requisições (ANTES das rotas do frontend)
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    console.log(`🔍 Headers:`, req.headers);
    console.log(`🔍 Query:`, req.query);
    console.log(`🔍 Params:`, req.params);
    next();
});
// Servir arquivos estáticos do build do React
app.use(express_1.default.static(path_1.default.join(__dirname, '../../cliente-segtrack/build')));
// Todas as rotas que não começam com /api devem servir o index.html do React
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../cliente-segtrack/build', 'index.html'));
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
// Rota pública para resumo de prestadores (usado no formulário de ocorrências)
app.get('/api/prestadores/resumo', async (req, res) => {
    try {
        const { ensurePrisma } = await Promise.resolve().then(() => __importStar(require('./lib/prisma')));
        const db = await ensurePrisma();
        if (!db) {
            return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
        }
        const prestadores = await db.prestador.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true
            },
            where: {
                aprovado: true // Apenas prestadores aprovados
            },
            orderBy: {
                nome: 'asc'
            }
        });
        res.json(prestadores);
    }
    catch (error) {
        console.error('Erro ao buscar prestadores resumo:', error);
        res.status(500).json({ error: 'Erro ao buscar prestadores' });
    }
});
// Rota pública para buscar ocorrências de prestadores (similar à rota de clientes)
app.get('/api/prestador/ocorrencias/:prestadorId', async (req, res) => {
    try {
        const { prestadorId } = req.params;
        console.log(`[app] Buscando ocorrências para prestador: ${prestadorId}`);
        const { ensurePrisma } = await Promise.resolve().then(() => __importStar(require('./lib/prisma')));
        const db = await ensurePrisma();
        if (!db) {
            console.error('[app] Erro: Instância do Prisma não disponível');
            return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
        }
        // Buscar prestador primeiro para validar
        const prestador = await db.prestador.findFirst({
            where: {
                OR: [
                    { id: Number(prestadorId) },
                    { nome: prestadorId }
                ]
            }
        });
        if (!prestador) {
            console.log(`[app] Prestador não encontrado: ${prestadorId}`);
            return res.status(404).json({ error: 'Prestador não encontrado' });
        }
        console.log(`[app] Prestador encontrado: ${prestador.nome} (ID: ${prestador.id})`);
        // Buscar ocorrências vinculadas ao prestador
        const ocorrencias = await db.ocorrencia.findMany({
            where: {
                prestador: prestador.nome,
                status: {
                    in: ['em_andamento', 'aguardando']
                }
            },
            include: {
                fotos: true
            },
            orderBy: {
                criado_em: 'desc'
            }
        });
        console.log(`[app] Ocorrências encontradas: ${ocorrencias.length}`);
        res.json({
            prestador: {
                id: prestador.id,
                nome: prestador.nome,
                email: prestador.email
            },
            ocorrencias: ocorrencias,
            total: ocorrencias.length
        });
    }
    catch (error) {
        console.error('[app] Erro ao buscar ocorrências do prestador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
app.use('/api/prestadores', auth_middleware_1.authenticateToken, prestadores_1.default);
app.use('/api/prestadores-publico', prestadoresPublico_1.default);
app.use('/api/clientes', clientes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/cnpj', cnpj_1.default);
app.use('/api/prestador', prestador_js_1.default);
// Removida rota de veículos - não é mais necessária
// app.use('/api/veiculos', veiculosRouter);
app.use('/api/fotos', fotos_1.default);
// Adicionar rotas da API v1
app.use('/api/v1', routes_1.default);
// Adicionar rotas protegidas para clientes
app.use('/api/protected', protectedRoutes_1.default);
// Adicionar rotas protegidas para prestadores
app.use('/api/protected-prestador', prestadorProtectedRoutes_1.default);
// Adicionar rotas de rastreamento
app.use('/api/rastreamento', rastreamentoRoutes_1.default);
// Rota de teste temporária para debug (movida para antes do router)
app.get('/api/protected-prestador/test', (req, res) => {
    console.log('[app] Rota de teste protegida-prestador acessada');
    res.json({ message: 'Rota protegida-prestador funcionando!', timestamp: new Date().toISOString() });
});
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
// Middleware fallback 404 (apenas para rotas de API)
app.use('/api', (req, res) => {
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
