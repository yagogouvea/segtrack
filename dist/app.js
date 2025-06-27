"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const health_1 = __importDefault(require("./routes/health"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const path_1 = __importDefault(require("path"));
console.log('[APP] DATABASE_URL:', process.env.DATABASE_URL ? 'definida' : 'NÃO definida');
if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL.replace(/\/\/.*:.*@/, '//USER:***@');
    console.log('[APP] DATABASE_URL (parcial):', url);
}
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
// Configuração de segurança
app.set('trust proxy', 1); // Corrigido para produção atrás de proxy reverso
// CORS configurado
const corsOptions = {
    origin: ['https://painelsegtrack.com.br', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Adicionado: Servir arquivos estáticos da pasta uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Middleware de log para todas as requisições
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});
console.log('Configurando rotas básicas...');
// Router global
const express_2 = require("express");
const router = (0, express_2.Router)();
// Health check endpoint
router.get('/health', (_req, res) => {
    res.status(200).json({ message: 'API SEGTRACK funcionando corretamente!' });
});
// Outras rotas podem ser adicionadas aqui, ex:
// router.use('/ocorrencias', ocorrenciasRoutes);
// router.use('/veiculos', veiculosRoutes);
app.use('/api', health_1.default);
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
