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
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
// Configuração de segurança
app.set('trust proxy', 1); // Configuração segura para uso atrás de proxy reverso (NGINX)
// CORS simplificado
app.use((0, cors_1.default)({
    origin: ['https://painelsegtrack.com.br'],
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
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
// Rota básica para teste
app.get('/', (_req, res) => {
    res.json({ message: 'API Segtrack - Funcionando!' });
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
