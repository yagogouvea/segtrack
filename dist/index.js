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
const cors_config_1 = __importDefault(require("./config/cors.config"));
const veiculos_1 = __importDefault(require("./routes/veiculos"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const relatorios_1 = __importDefault(require("./routes/relatorios"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const prestadoresPublico_1 = __importDefault(require("./routes/prestadoresPublico"));
// Log inicial para debug da inicialização
console.log(`
🚀 Iniciando aplicação...
📝 NODE_ENV: ${process.env.NODE_ENV || 'não definido'}
📡 PORT: ${process.env.PORT || '8080 (padrão)'}
`);
// Carrega variáveis de ambiente ANTES de qualquer outra operação
if (process.env.NODE_ENV !== "production" && fs_1.default.existsSync(".env.local")) {
    console.log('📄 Carregando variáveis de .env.local');
    dotenv_1.default.config({ path: ".env.local" });
}
else {
    console.log('📄 Carregando variáveis de .env');
    dotenv_1.default.config();
}
// Criação do app Express
console.log('🔧 Configurando Express...');
const app = (0, express_1.default)();
// Aplicar CORS antes de qualquer middleware ou rota
app.use((0, cors_1.default)(cors_config_1.default));
// Log de todas as requisições
app.use((_req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${_req.method} ${_req.url}`);
    if (process.env.NODE_ENV === 'development') {
        console.log('Request Headers:', _req.headers);
        console.log('Origin:', _req.headers.origin);
    }
    next();
});
// Root endpoint para verificar CORS
app.get('/', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'API is running',
        cors: 'enabled',
        timestamp: new Date().toISOString()
    });
});
// Middleware básico
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configurar rotas
app.use('/api/veiculos', veiculos_1.default);
app.use('/api/clientes', clientes_1.default);
app.use('/api/ocorrencias', ocorrencias_1.default);
app.use('/api/fotos', fotos_1.default);
app.use('/api/relatorios', relatorios_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/prestadores-publico', prestadoresPublico_1.default);
// Servir arquivos estáticos do diretório de uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Iniciar o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`
🚀 Servidor rodando na porta ${PORT}
📝 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}
  `);
});
exports.default = app;
