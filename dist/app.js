"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const prisma_1 = require("./lib/prisma");
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
// Configuração de segurança
app.set('trust proxy', false); // Desabilita trust proxy para evitar bypass de IP
// Configuração do CORS
const allowedOrigins = [
    'http://segtrackprontaresposta.com.br',
    'https://segtrackprontaresposta.com.br',
    'http://www.segtrackprontaresposta.com.br',
    'https://www.segtrackprontaresposta.com.br'
];
if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requisições sem origin (como mobile apps ou ferramentas de API)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        }
        else {
            console.warn(`Origem bloqueada pelo CORS: ${origin}`);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Outros middlewares
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
console.log('Configurando rotas básicas...');
// Rota básica para teste
app.get('/', (_req, res) => {
    res.json({ message: 'API Segtrack - Funcionando!' });
});
// Health check endpoint
app.get('/api/health', async (_req, res) => {
    try {
        await (0, prisma_1.testConnection)();
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    }
    catch (error) {
        console.error('Health check falhou:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: String(error),
            timestamp: new Date().toISOString()
        });
    }
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
