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
app.set('trust proxy', false); // Desabilita trust proxy para evitar bypass de IP
// Configuração do CORS
const allowedOrigins = [
    'http://painelsegtrack.com.br',
    'https://painelsegtrack.com.br',
    'http://www.painelsegtrack.com.br',
    'https://www.painelsegtrack.com.br',
    'http://localhost:3000',
    'http://localhost:5173'
];
// Middleware CORS com log detalhado
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Permitir requisições sem origin (como mobile apps ou ferramentas de API)
        if (!origin) {
            console.log('Requisição sem origin permitida');
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            console.log(`Origin permitida: ${origin}`);
            callback(null, true);
        }
        else {
            console.warn(`Origin bloqueada: ${origin}`);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // Cache preflight por 24 horas
}));
// Outros middlewares
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Middleware de log para todas as requisições
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});
console.log('Configurando rotas básicas...');
// Rota básica para teste
app.get('/', (_req, res) => {
    res.json({ message: 'API Segtrack - Funcionando!' });
});
// Health check endpoint
app.use('/api/health', health_1.default);
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
