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
// Middlewares
app.use((0, cors_1.default)());
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
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: String(error)
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
