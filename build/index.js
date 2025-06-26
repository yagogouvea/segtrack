"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const veiculos_1 = __importDefault(require("./routes/veiculos"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const relatorios_1 = __importDefault(require("./routes/relatorios"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const prestadoresPublico_1 = __importDefault(require("./routes/prestadoresPublico"));
// Carrega variáveis de ambiente
if (process.env.NODE_ENV !== "production" && fs_1.default.existsSync(".env.local")) {
    dotenv_1.default.config({ path: ".env.local" });
}
else {
    dotenv_1.default.config();
}
const app = (0, express_1.default)();
// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    next();
});
// Configuração do CORS
const corsOptions = {
    origin: ['https://segtrack-frontend-2mhd.vercel.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    maxAge: 86400 // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
// Basic middleware
app.use(express_1.default.json());
// Rota de teste
app.get('/api/test', (_req, res) => {
    res.json({ status: 'ok', message: '🚀 API SEGTRACK funcionando!' });
});
// Servir arquivos estáticos
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/relatorios-pdf', express_1.default.static(path_1.default.join(__dirname, '../relatorios-pdf')));
// Rotas organizadas
app.use('/api/veiculos', veiculos_1.default);
app.use('/api/clientes', clientes_1.default);
app.use('/api/prestadores', prestadores_1.default);
app.use('/api/ocorrencias', ocorrencias_1.default);
app.use('/api/relatorios', relatorios_1.default);
app.use('/api/fotos', fotos_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/public/prestadores', prestadoresPublico_1.default);
// Rota de status
app.get('/api', (_req, res) => {
    res.json({
        status: 'online',
        environment: process.env.NODE_ENV,
        database: process.env.DATABASE_URL ? 'configured' : 'not configured'
    });
});
// Middleware global de tratamento de erro
app.use((err, _req, res, _next) => {
    console.error('❌ Erro capturado:', err);
    res.status(500).json({ error: 'Erro interno no servidor', detalhes: err.message });
});
// Inicialização
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`✅ Servidor rodando em ${HOST}:${PORT}`);
    console.log('Variáveis de ambiente:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'Não configurado');
    console.log('- BASE_URL:', process.env.BASE_URL ? 'Configurado' : 'Não configurado');
});
